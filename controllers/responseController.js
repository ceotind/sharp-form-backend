// controllers/responseController.js
const { db } = require('../config/firebase');

/**
 * @desc    Save a new form response
 * @route   POST /api/forms/:formId/responses
 * @access  Public (if form is published)
 */
const saveFormResponse = async (req, res) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;
        
        // Verify form exists and is published
        const formRef = db.collection('forms').doc(formId);
        const formDoc = await formRef.get();

        if (!formDoc.exists) {
            return res.status(404).json({ error: 'Form not found.' });
        }

        const formData = formDoc.data();
        if (!formData.isPublished) {
            return res.status(403).json({ error: 'This form is not accepting responses.' });
        }

        // Validate that all required questions have answers
        const requiredQuestions = formData.elements.filter(el => el.required).map(el => el.id);
        const answeredQuestions = Object.keys(answers);
        
        const missingAnswers = requiredQuestions.filter(q => !answeredQuestions.includes(q));
        if (missingAnswers.length > 0) {
            return res.status(400).json({
                error: 'Missing required answers',
                missingQuestions: missingAnswers
            });
        }

        // Create the response document
        const responseData = {
            answers,
            timestamp: Date.now(),
            formId,
            respondentId: req.user?.uid || null, // Store user ID if authenticated
            respondentEmail: req.user?.email || null // Store email if authenticated
        };

        // Save the response in a subcollection
        const responseRef = await formRef.collection('responses').add(responseData);

        // Increment the responses count on the form document
        await formRef.update({
            responsesCount: (formData.responsesCount || 0) + 1
        });

        res.status(201).json({
            message: 'Response recorded successfully.',
            responseId: responseRef.id
        });
    } catch (error) {
        console.error('Error saving form response:', error);
        res.status(500).json({ error: 'Failed to save response.', details: error.message });
    }
};

/**
 * @desc    Get all responses for a form
 * @route   GET /api/forms/:formId/responses
 * @access  Private (form owner only)
 */
const getFormResponses = async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.user.uid; // From auth middleware

        // Verify form exists and user owns it
        const formRef = db.collection('forms').doc(formId);
        const formDoc = await formRef.get();

        if (!formDoc.exists) {
            return res.status(404).json({ error: 'Form not found.' });
        }

        const formData = formDoc.data();
        if (formData.ownerId !== userId) {
            return res.status(403).json({ error: 'Access denied. You can only view responses to your own forms.' });
        }

        // Get all responses
        const responsesSnapshot = await formRef.collection('responses').orderBy('timestamp', 'desc').get();

        const responses = responsesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: new Date(doc.data().timestamp).toISOString() // Convert timestamp to ISO string
        }));

        res.status(200).json(responses);
    } catch (error) {
        console.error('Error retrieving form responses:', error);
        res.status(500).json({ error: 'Failed to retrieve responses.', details: error.message });
    }
};

module.exports = {
    saveFormResponse,
    getFormResponses
};
