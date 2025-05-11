// utils/FileError.js
class FileError extends Error {
    constructor(message, code = 'VALIDATION_ERROR', details = null) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

module.exports = FileError;
