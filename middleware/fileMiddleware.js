const rateLimit = require('express-rate-limit');
const { storage } = require('../config/firebase');

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many file uploads',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
                windowMs: '15 minutes',
                maxUploads: 10,
                nextUploadAllowed: new Date(req.rateLimit.resetTime).toISOString()
            }
        });
    },
    keyGenerator: (req) => req.user?.uid || req.ip, // Rate limit by user ID if available, otherwise by IP
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to clean up old files (files older than 30 days)
const cleanupOldFiles = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // List files in user's directory
        const [files] = await storage.getFiles({
            prefix: `uploads/${userId}/`
        });

        // Delete files older than 30 days
        await Promise.all(files.map(async (file) => {
            try {
                const [metadata] = await file.getMetadata();
                const uploadedAt = new Date(metadata.metadata.uploadedAt);

                if (uploadedAt < thirtyDaysAgo) {
                    await file.delete();
                    console.log(`Cleaned up old file: ${file.name}`);
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
            }
        }));

        next();
    } catch (error) {
        console.error('Error in file cleanup:', error);
        next(); // Continue even if cleanup fails
    }
};

// Middleware to validate file metadata (MIME type, magic numbers, etc.)
const validateFileMetadata = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    // Map of file signatures (magic numbers) and extensions to validate file types
    const FILE_TYPES = {
        // Images
        'image/jpeg': {
            signatures: [
                [0xFF, 0xD8, 0xFF],
                [0xFF, 0xD8, 0xFF, 0xE0],
                [0xFF, 0xD8, 0xFF, 0xE1]
            ],
            extensions: ['jpg', 'jpeg']
        },
        'image/png': {
            signatures: [[0x89, 0x50, 0x4E, 0x47]],
            extensions: ['png']
        },
        'image/webp': {
            signatures: [[0x52, 0x49, 0x46, 0x46]],
            extensions: ['webp']
        },
        // PDFs
        'application/pdf': {
            signatures: [[0x25, 0x50, 0x44, 0x46]],
            extensions: ['pdf']
        },
        // Office documents
        'application/msword': {
            signatures: [[0xD0, 0xCF, 0x11, 0xE0]],
            extensions: ['doc']
        },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            signatures: [[0x50, 0x4B, 0x03, 0x04]],
            extensions: ['docx']
        },
        'application/vnd.ms-excel': {
            signatures: [[0xD0, 0xCF, 0x11, 0xE0]],
            extensions: ['xls']
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            signatures: [[0x50, 0x4B, 0x03, 0x04]],
            extensions: ['xlsx']
        }
    };

    const buffer = req.file.buffer;
    const declaredType = req.file.mimetype;
    const extension = req.file.originalname.split('.').pop().toLowerCase();
    const fileType = FILE_TYPES[declaredType];    // Handle text files separately
    if (declaredType === 'text/plain') {
        // Verify extension
        if (extension !== 'txt') {
            return res.status(400).json({
                error: 'Invalid file extension for text file',
                code: 'INVALID_FILE_EXTENSION',
                details: {
                    expectedExtension: 'txt',
                    receivedExtension: extension
                }
            });
        }

        // Basic validation for text files (check if content is printable)
        const isPrintable = buffer.every(byte => 
            byte >= 0x20 && byte <= 0x7E || // printable ASCII
            byte === 0x0A || // newline
            byte === 0x0D || // carriage return
            byte === 0x09    // tab
        );

        if (!isPrintable) {
            return res.status(400).json({
                error: 'Invalid text file content',
                code: 'INVALID_FILE_CONTENT',
                details: { 
                    mimeType: declaredType,
                    reason: 'File contains non-printable characters'
                }
            });
        }

        return next();
    }

    // Validate other file types
    if (!fileType) {
        return res.status(400).json({
            error: 'Unsupported file type',
            code: 'INVALID_FILE_TYPE',
            details: {
                receivedType: declaredType,
                supportedTypes: Object.keys(FILE_TYPES)
            }
        });
    }

    // Verify extension
    if (!fileType.extensions.includes(extension)) {
        return res.status(400).json({
            error: 'File extension does not match content type',
            code: 'INVALID_FILE_EXTENSION',
            details: {
                expectedExtensions: fileType.extensions,
                receivedExtension: extension,
                mimeType: declaredType
            }
        });
    }

    // Check file signature (magic numbers)
    const isValidType = fileType.signatures.some(signature =>
        signature.every((byte, index) => buffer[index] === byte)
    );

    if (!isValidType) {
        return res.status(400).json({
            error: 'File content does not match its extension',
            code: 'INVALID_FILE_CONTENT',
            details: {
                declaredType,
                extension,
                suggestion: 'The file appears to be corrupted or its extension has been changed'
            }
        });
    }

    next();
};

module.exports = {
    uploadLimiter,
    cleanupOldFiles,
    validateFileMetadata
};
