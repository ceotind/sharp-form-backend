// routes/responses.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // To access params from parent router
const { saveFormResponse, getFormResponses } = require('../controllers/responseController');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`[Responses Route] ${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        params: req.params
    });
    next();
});

/**
 * @route   POST /api/forms/:formId/responses
 * @desc    Submit a new response for a form
 * @access  Public
 */
router.post('/', saveFormResponse);

/**
 * @route   GET /api/forms/:formId/responses
 * @desc    Get all responses for a form (owner only)
 * @access  Private
 */
router.get('/', verifyFirebaseToken, getFormResponses);

module.exports = router;
