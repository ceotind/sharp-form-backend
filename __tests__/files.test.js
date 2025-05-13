const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs').promises;

describe('Files API', () => {
    let authToken;
    let uploadedFileName;

    beforeAll(async () => {
        // Get auth token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ idToken: 'mock-id-token' });
        
        authToken = loginResponse.body.token;

        // Create a test file
        await fs.writeFile(
            path.join(__dirname, 'test-upload.txt'),
            'Test file content for upload'
        );
    });

    it('should upload a file', async () => {
        const response = await request(app)
            .post('/api/files/upload')
            .set('Authorization', `Bearer ${authToken}`)
            .attach('file', path.join(__dirname, 'test-upload.txt'));

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('fileName');
        expect(response.body).toHaveProperty('fileUrl');
        expect(response.body).toHaveProperty('contentType', 'text/plain');

        uploadedFileName = response.body.fileName;
    });

    it('should list files', async () => {
        const response = await request(app)
            .get('/api/files')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('fileName');
        expect(response.body[0]).toHaveProperty('fileUrl');
        expect(response.body[0]).toHaveProperty('contentType');
    });

    it('should delete a file', async () => {
        const response = await request(app)
            .delete(`/api/files/${uploadedFileName}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);

        // Verify file is deleted
        const listResponse = await request(app)
            .get('/api/files')
            .set('Authorization', `Bearer ${authToken}`);

        expect(listResponse.body.find(f => f.fileName === uploadedFileName)).toBeUndefined();
    });

    it('should reject file upload without auth', async () => {
        const response = await request(app)
            .post('/api/files/upload')
            .attach('file', path.join(__dirname, 'test-upload.txt'));

        expect(response.status).toBe(401);
    });

    afterAll(async () => {
        // Clean up test file
        try {
            await fs.unlink(path.join(__dirname, 'test-upload.txt'));
        } catch (error) {
            // Ignore if file doesn't exist
        }
    });
});