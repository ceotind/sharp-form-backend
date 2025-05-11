// middleware/fileUploadLimiter.js
const rateLimit = require('express-rate-limit');
const FileError = require('../utils/FileError');

// Create a limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many file uploads from this IP, please try again after 15 minutes',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// Additional file validation middleware
const validateFileContent = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        // Basic file signature validation
        const signatures = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/webp': [0x52, 0x49, 0x46, 0x46],
            'application/pdf': [0x25, 0x50, 0x44, 0x46]
        };

        const buffer = req.file.buffer;
        const mime = req.file.mimetype;

        // If we have a signature for this type, validate it
        if (signatures[mime]) {
            const signature = signatures[mime];
            const valid = signature.every((byte, index) => buffer[index] === byte);
            
            if (!valid) {
                throw new FileError(
                    'File content does not match its extension',
                    'INVALID_FILE_CONTENT',
                    {
                        expectedType: mime,
                        reason: 'File signature mismatch'
                    }
                );
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Validate file count in request
const validateFileCount = (req, res, next) => {
    if (req.files && Object.keys(req.files).length > 1) {
        return next(new FileError(
            'Only one file can be uploaded at a time',
            'TOO_MANY_FILES',
            { maxFiles: 1 }
        ));
    }
    next();
};

module.exports = {
    uploadLimiter,
    validateFileContent,
    validateFileCount
};
