// routes/forms.js
const express = require('express');
const router = express.Router();
const responseRoutes = require('./responses'); // Add this line

// Import form controller functions
const {
  listUserForms,
  createForm,
  getFormById,
  updateForm,
  deleteForm
} = require('../controllers/formController'); // Adjust path as necessary

// Import authentication middleware
const verifyFirebaseToken = require('../middleware/authMiddleware'); // Adjust path as necessary

// --- Form Routes ---
// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`[Forms Route] ${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// Mount responses routes
router.use('/:formId/responses', responseRoutes);

// Apply authentication middleware for protected routes
router.use(verifyFirebaseToken);

// Protected routes below this line

/**
 * @route   GET /api/forms
 * @desc    List all forms for the authenticated user
 * @access  Private
 */
router.get('/', listUserForms);

/**
 * @route   POST /api/forms
 * @desc    Create a new form
 * @access  Private
 */
router.post('/', createForm);

/**
 * @route   GET /api/forms/:formId
 * @desc    Get a specific form by its ID
 * @access  Private (owner or if form is public - controller handles logic)
 */
router.get('/:formId', getFormById);

/**
 * @route   PUT /api/forms/:formId
 * @desc    Update an existing form
 * @access  Private (owner only)
 */
router.put('/:formId', updateForm);

/**
 * @route   DELETE /api/forms/:formId
 * @desc    Delete a form
 * @access  Private (owner only)
 */
router.delete('/:formId', deleteForm);

// Debug route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Forms router is working' });
});

module.exports = router;
