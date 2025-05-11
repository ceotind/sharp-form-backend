// controllers/formController.js

// Import Firebase admin SDK, specifically the 'db' (Firestore) and 'storage' (if handling file uploads directly here)
const { db, storage } = require('../config/firebase'); // Adjust path as necessary
const { FieldValue } = require('firebase-admin/firestore'); // For atomic counters or array operations

// --- Form Controller Functions ---

/**
 * @desc    List all forms belonging to the logged-in user.
 * @route   GET /api/forms
 * @access  Private (requires token verification)
 */
const listUserForms = async (req, res) => {
  try {
    // req.user.uid is attached by the verifyFirebaseToken middleware
    const userId = req.user.uid;

    const formsSnapshot = await db.collection('forms')
                                  .where('ownerId', '==', userId)
                                  .orderBy('createdAt', 'desc') // Optional: order by creation date
                                  .get();

    if (formsSnapshot.empty) {
      return res.status(200).json([]); // Return empty array if no forms found
    }

    const forms = formsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(forms);
  } catch (error) {
    console.error('Error listing user forms:', error);
    res.status(500).json({ error: 'Failed to retrieve forms.', details: error.message });
  }
};

/**
 * @desc    Create a new form.
 * @route   POST /api/forms
 * @access  Private
 */
const createForm = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description, elements, slug, isPublished } = req.body;

    // Basic validation
    if (!name || !Array.isArray(elements)) {
      return res.status(400).json({ error: 'Form name and elements array are required.' });
    }

    // Validate elements (basic example, can be more thorough)
    if (elements.some(el => !el.type || !el.label)) {
        return res.status(400).json({ error: 'Each form element must have a type and a label.' });
    }

    const newFormData = {
      ownerId: userId,
      name,
      description: description || '',
      elements, // Array of question objects
      slug: slug || null, // Optional, consider generating if not provided or ensuring uniqueness
      isPublished: typeof isPublished === 'boolean' ? isPublished : false,
      responsesCount: 0,
      createdAt: FieldValue.serverTimestamp(), // Use server timestamp for creation
      updatedAt: FieldValue.serverTimestamp(), // Use server timestamp for update
    };

    const formRef = await db.collection('forms').add(newFormData);

    res.status(201).json({
      message: 'Form created successfully.',
      formId: formRef.id,
      data: { id: formRef.id, ...newFormData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } // Approximate client-side timestamp
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form.', details: error.message });
  }
};

/**
 * @desc    Retrieve a single form by its ID.
 * @route   GET /api/forms/:formId
 * @access  Private (owner) or Public (if form is published and no sensitive data is exposed directly)
 * For simplicity, this example restricts to owner or checks a simple 'isPublished' flag.
 */
const getFormById = async (req, res) => {
  try {
    const userId = req.user.uid; // For owner check
    const { formId } = req.params;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required.' });
    }

    const formRef = db.collection('forms').doc(formId);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const formData = formDoc.data();

    // Authorization: Check if the user is the owner OR if the form is published
    // More complex logic might be needed for truly public forms (e.g., if they can be filled by anyone)
    if (formData.ownerId !== userId && !formData.isPublished) {
      // If not owner and not published, deny access.
      // If it's published, anyone with the link (and a valid token if middleware is applied to all routes) can view.
      // For a truly public view (no token needed), this route would need separate handling or no auth middleware.
      return res.status(403).json({ error: 'Forbidden. You do not have access to this form or it is not public.' });
    }
    
    // If it's a public published form and the requester is not the owner,
    // you might want to strip ownerId or other sensitive fields before sending.
    // For this example, we send the full form data if access is granted.

    res.status(200).json({ id: formDoc.id, ...formData });
  } catch (error) {
    console.error('Error retrieving form:', error);
    res.status(500).json({ error: 'Failed to retrieve form.', details: error.message });
  }
};

/**
 * @desc    Update an existing form.
 * @route   PUT /api/forms/:formId
 * @access  Private (owner only)
 */
const updateForm = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { formId } = req.params;
    const { name, description, elements, slug, isPublished } = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required.' });
    }

    const formRef = db.collection('forms').doc(formId);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Authorization: Check if the user is the owner
    if (formDoc.data().ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You can only update your own forms.' });
    }

    // Prepare update data - only include fields that are provided in the request
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (elements !== undefined) {
        if (!Array.isArray(elements) || elements.some(el => !el.type || !el.label)) {
             return res.status(400).json({ error: 'Invalid elements structure. Each element must have a type and a label.' });
        }
        updateData.elements = elements;
    }
    if (slug !== undefined) updateData.slug = slug; // Consider uniqueness validation for slug
    if (typeof isPublished === 'boolean') updateData.isPublished = isPublished;
    updateData.updatedAt = FieldValue.serverTimestamp(); // Always update the timestamp

    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
        return res.status(400).json({ error: 'No fields to update were provided.'});
    }

    await formRef.update(updateData);

    res.status(200).json({
      message: 'Form updated successfully.',
      formId: formId,
      updatedFields: Object.keys(updateData)
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form.', details: error.message });
  }
};

/**
 * @desc    Delete a form.
 * @route   DELETE /api/forms/:formId
 * @access  Private (owner only)
 * @note    Also consider deleting associated responses and uploaded files if any.
 */
const deleteForm = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { formId } = req.params;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required.' });
    }

    const formRef = db.collection('forms').doc(formId);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Authorization: Check if the user is the owner
    if (formDoc.data().ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You can only delete your own forms.' });
    }

    // TODO: Implement deletion of associated responses from a 'form_responses' collection
    // Example:
    // const responsesQuery = db.collection('form_responses').where('formId', '==', formId);
    // const responsesSnapshot = await responsesQuery.get();
    // const batch = db.batch();
    // responsesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();
    // console.log(`Deleted ${responsesSnapshot.size} associated responses.`);

    // TODO: Implement deletion of associated files from Firebase Storage if your forms support file uploads.
    // This would involve listing files in a specific path (e.g., `forms/${formId}/`) and deleting them.

    await formRef.delete();

    res.status(200).json({ message: 'Form deleted successfully.', formId: formId });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form.', details: error.message });
  }
};

module.exports = {
  listUserForms,
  createForm,
  getFormById,
  updateForm,
  deleteForm,
};
