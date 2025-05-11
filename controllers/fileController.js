// controllers/fileController.js
const { storage } = require('../config/firebase');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

class FileError extends Error {
    constructor(message, code = 'VALIDATION_ERROR', details = null) {
        super(message);
        this.name = 'FileError';
        this.code = code;
        this.details = details;
    }
}

// List of allowed MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
];

/**
 * @desc    Upload a file to Firebase Storage
 * @route   POST /api/files/upload
 * @access  Private
 */
const uploadFile = async (req, res) => {
    try {
        const userId = req.user.uid;        if (!req.file) {
            throw new FileError('No file uploaded');
        }

        // Check file size first
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            throw new FileError(
                'File too large',
                'FILE_TOO_LARGE',
                {
                    maxSize: '5MB',
                    receivedSize: `${Math.round(req.file.size / 1024 / 1024 * 10) / 10}MB`
                }
            );
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
            throw new FileError(
                'Invalid file type',
                'INVALID_FILE_TYPE',
                {
                    allowedTypes: ALLOWED_MIME_TYPES,
                    receivedType: req.file.mimetype
                }
            );
        }
        
        // Check file extension
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
          if (!supportedExtensions.includes(fileExtension)) {
            throw new FileError(
                'Invalid file extension',
                'INVALID_FILE_EXTENSION',
                {
                    allowedExtensions: supportedExtensions,
                    receivedExtension: fileExtension
                }
            );
        }

        // Generate a unique filename
        const fileName = `${uuidv4()}.${fileExtension}`;
        
        // Create a reference to the file in Firebase Storage
        const fileRef = storage.file(`uploads/${userId}/${fileName}`);

        // Upload the file to Firebase Storage
        await fileRef.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
                metadata: {
                    originalName: req.file.originalname,
                    uploadedBy: userId,
                    uploadedAt: new Date().toISOString()
                }
            }
        });

        // Get the public URL
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500' // Long expiry for demonstration
        });

        res.status(201).json({
            message: 'File uploaded successfully.',
            file: {
                originalName: req.file.originalname,
                fileName: fileName,
                contentType: req.file.mimetype,
                size: req.file.size,
                url: url
            }
        });    } catch (error) {
        console.error('Error uploading file:', error);
        
        if (error instanceof FileError) {            return res.status(400).json({ 
                error: error.message,
                code: error.code,
                ...(error.details && { details: error.details })
            });
        }
        
        res.status(500).json({ error: 'Failed to upload file.', details: error.message });
    }
};

/**
 * @desc    Delete a file from Firebase Storage
 * @route   DELETE /api/files/:fileName
 * @access  Private
 */
const deleteFile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { fileName } = req.params;

        // Create a reference to the file
        const fileRef = storage.file(`uploads/${userId}/${fileName}`);

        // Check if file exists
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ error: 'File not found.' });
        }

        // Delete the file
        await fileRef.delete();

        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file.', details: error.message });
    }
};

/**
 * @desc    Get a list of files for a user
 * @route   GET /api/files
 * @access  Private
 */
const listFiles = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // List files in user's directory
        const [files] = await storage.getFiles({
            prefix: `uploads/${userId}/`
        });

        // Get signed URLs and metadata for each file
        const fileDetails = await Promise.all(files.map(async (file) => {
            const [metadata] = await file.getMetadata();
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            return {
                fileName: file.name.split('/').pop(),
                originalName: metadata.metadata.originalName || file.name,
                contentType: metadata.contentType,
                size: metadata.size,
                uploadedAt: metadata.metadata.uploadedAt,
                url: url
            };
        }));

        res.status(200).json(fileDetails);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Failed to list files.', details: error.message });
    }
};

module.exports = {
    uploadFile,
    deleteFile,
    listFiles
};
