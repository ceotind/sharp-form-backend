// routes/test.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadLimiter, validateFileMetadata } = require('../middleware/fileMiddleware');
const { uploadFile, deleteFile, listFiles } = require('../controllers/fileController');

// Configure multer for memory storage (files will be buffered)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file extension first
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error(
                `Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed. ` +
                `Received: ${fileExtension}`
            ));
        }

        // Then check MIME type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error(
                `Invalid file type. Received MIME type: ${file.mimetype}. ` +
                `File extension and MIME type must match allowed formats.`
            ));
        }

        cb(null, true);
    }
});

// Add error handling middleware for multer
const handleUpload = (req, res, next) => {
    // Check content length before processing
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > 5 * 1024 * 1024) {
        return res.status(400).json({
            error: 'File too large',
            code: 'FILE_TOO_LARGE',
            details: {
                maxSize: '5MB',
                receivedSize: `${Math.round(contentLength / 1024 / 1024 * 10) / 10}MB`
            }
        });
    }

    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    return res.status(400).json({
                        error: 'File too large',
                        code: 'FILE_TOO_LARGE',
                        details: {
                            maxSize: '5MB',
                            receivedSize: `${Math.round((req.headers['content-length'] || 0) / 1024 / 1024 * 10) / 10}MB`
                        }
                    });
                case 'LIMIT_UNEXPECTED_FILE':
                    return res.status(400).json({
                        error: 'No file field named "file" in the request',
                        code: 'INVALID_FIELD_NAME'
                    });
                default:
                    return res.status(400).json({
                        error: err.message || 'Upload error',
                        code: 'UPLOAD_ERROR'
                    });
            }
        } else if (err) {
            // Handle custom errors from fileFilter
            const errMessage = err.message || 'Invalid file';
            const isExtensionError = errMessage.includes('extension');
            return res.status(400).json({
                error: errMessage,
                code: isExtensionError ? 'INVALID_FILE_EXTENSION' : 'INVALID_FILE_TYPE'
            });
        }

        // Additional validation after successful upload
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                code: 'NO_FILE'
            });
        }

        // Add test user ID
        req.user = { uid: 'test-user-id' };
        next();
    });
};

// Test routes without authentication for running tests
router.post('/upload', uploadLimiter, handleUpload, validateFileMetadata, uploadFile);
router.delete('/:fileName', (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
}, deleteFile);
router.get('/', (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
}, listFiles);

module.exports = router;
