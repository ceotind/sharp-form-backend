const request = require('supertest');
const app = require('../app');

describe('Forms API', () => {
    let authToken;
    let formId;

    const testForm = {
        name: 'Test Form',
        description: 'A test form for API testing',
        elements: [
            {
                type: 'text',
                label: 'Full Name',
                required: true
            },
            {
                type: 'file',
                label: 'Profile Picture',
                required: false,
                acceptedTypes: ['image/jpeg', 'image/png']
            }
        ],
        isPublished: true
    };

    beforeAll(async () => {
        // Note: In a real test, you would get a real auth token
        // For testing purposes, we're using a mock token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ idToken: 'mock-id-token' });
        
        authToken = loginResponse.body.token;
    });

    it('should create a new form', async () => {
        const response = await request(app)
            .post('/api/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testForm);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(testForm.name);
        expect(response.body.description).toBe(testForm.description);
        expect(response.body.elements).toHaveLength(2);
        expect(response.body.isPublished).toBe(true);

        formId = response.body.id;
    });

    it('should list all forms', async () => {
        const response = await request(app)
            .get('/api/forms')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('elements');
        expect(response.body[0]).toHaveProperty('isPublished');
        expect(response.body[0]).toHaveProperty('createdAt');
        expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('should get a specific form', async () => {
        const response = await request(app)
            .get(`/api/forms/${formId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', formId);
        expect(response.body.name).toBe(testForm.name);
        expect(response.body.description).toBe(testForm.description);
    });

    it('should update a form', async () => {
        const updatedForm = {
            ...testForm,
            name: 'Updated Test Form',
            description: 'Updated test form description'
        };

        const response = await request(app)
            .put(`/api/forms/${formId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedForm);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updatedForm.name);
        expect(response.body.description).toBe(updatedForm.description);
    });

    it('should delete a form', async () => {
        const response = await request(app)
            .delete(`/api/forms/${formId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);

        // Verify the form is deleted
        const getResponse = await request(app)
            .get(`/api/forms/${formId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(404);
    });
});