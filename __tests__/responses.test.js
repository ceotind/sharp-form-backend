// __tests__/responses.test.js
const { request, app } = require('./setup');
const { auth, db } = require('../config/firebase');
const { testUser } = require('./testData');

describe('Form Response Endpoints', () => {
    let authToken;
    let userId;
    let formId;

    beforeAll(async () => {
        // Create a test user
        try {
            const userRecord = await auth.createUser({
                email: testUser.email,
                password: testUser.password,
                displayName: testUser.displayName
            });
            userId = userRecord.uid;

            // Create a custom token and get an ID token
            const customToken = await auth.createCustomToken(userId);
            // Since we can't directly sign in with the Firebase client SDK in tests,
            // we'll create a token with the necessary claims for testing
            authToken = await auth.createCustomToken(userId);

            // Create a test form
            const formData = {
                ownerId: userId,
                name: 'Test Form',
                description: 'A form for testing responses',
                elements: [
                    { id: 'q1', type: 'shortAnswer', label: 'Name', required: true },
                    { id: 'q2', type: 'paragraph', label: 'Comments', required: false }
                ],
                isPublished: true,
                responsesCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const formRef = await db.collection('forms').add(formData);
            formId = formRef.id;
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    afterAll(async () => {
        // Cleanup: Delete test user and form
        try {
            if (userId) await auth.deleteUser(userId);
            if (formId) await db.collection('forms').doc(formId).delete();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    describe('POST /:formId/responses', () => {
        it('should save a valid form response', async () => {
            const response = await request(app)
                .post(`/api/forms/${formId}/responses`)
                .send({
                    answers: {
                        q1: 'John Doe',
                        q2: 'Great survey!'
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('responseId');
            expect(response.body.message).toBe('Response recorded successfully.');
        });

        it('should reject response for unpublished form', async () => {
            // Update form to unpublished
            await db.collection('forms').doc(formId).update({ isPublished: false });

            const response = await request(app)
                .post(`/api/forms/${formId}/responses`)
                .send({
                    answers: {
                        q1: 'Jane Doe',
                        q2: 'Test comment'
                    }
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('This form is not accepting responses.');

            // Reset form to published for other tests
            await db.collection('forms').doc(formId).update({ isPublished: true });
        });

        it('should reject response missing required answers', async () => {
            const response = await request(app)
                .post(`/api/forms/${formId}/responses`)
                .send({
                    answers: {
                        q2: 'Missing required name field'
                    }
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('missingQuestions');
            expect(response.body.missingQuestions).toContain('q1');
        });
    });

    describe('GET /:formId/responses', () => {
        it('should deny access without authentication', async () => {
            const response = await request(app)
                .get(`/api/forms/${formId}/responses`);

            expect(response.status).toBe(401);
        });

        it('should allow owner to view responses', async () => {
            const response = await request(app)
                .get(`/api/forms/${formId}/responses`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
