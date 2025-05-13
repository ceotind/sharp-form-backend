const request = require('supertest');
const app = require('../app');

describe('Responses API', () => {
    let authToken;
    let formId;

    const testForm = {
        name: 'Response Test Form',
        description: 'A form for testing responses',
        elements: [
            {
                type: 'text',
                label: 'Full Name',
                required: true
            },
            {
                type: 'file',
                label: 'Document',
                required: false,
                acceptedTypes: ['application/pdf']
            }
        ],
        isPublished: true
    };

    const testResponse = {
        answers: {
            'fullName': 'John Doe',
            'document': {
                fileUrl: 'https://example.com/files/test.pdf',
                fileName: 'test.pdf',
                contentType: 'application/pdf'
            }
        }
    };

    beforeAll(async () => {
        // Get auth token first
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ idToken: 'mock-id-token' });
        
        authToken = loginResponse.body.token;

        // Create a test form
        const formResponse = await request(app)
            .post('/api/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testForm);

        formId = formResponse.body.id;
    });

    it('should submit a response to a form', async () => {
        const response = await request(app)
            .post(`/api/forms/${formId}/responses`)
            .send(testResponse);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('formId', formId);
        expect(response.body).toHaveProperty('answers');
        expect(response.body.answers).toEqual(testResponse.answers);
    });

    it('should get responses for a form', async () => {
        const response = await request(app)
            .get(`/api/forms/${formId}/responses`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('formId');
        expect(response.body[0]).toHaveProperty('answers');
        expect(response.body[0].answers).toEqual(testResponse.answers);
    });

    it('should reject response submission for invalid form ID', async () => {
        const response = await request(app)
            .post('/api/forms/invalid-id/responses')
            .send(testResponse);

        expect(response.status).toBe(404);
    });

    it('should reject unauthorized access to form responses', async () => {
        const response = await request(app)
            .get(`/api/forms/${formId}/responses`);

        expect(response.status).toBe(401);
    });

    afterAll(async () => {
        // Clean up - delete the test form
        await request(app)
            .delete(`/api/forms/${formId}`)
            .set('Authorization', `Bearer ${authToken}`);
    });
});