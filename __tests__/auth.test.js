const request = require('supertest');
const app = require('../app');

describe('Authentication API', () => {
    let userIdToken;

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'testpass123',
                displayName: 'Test User'
            });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully.');
        expect(response.body).toHaveProperty('uid');
        expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should login with idToken', async () => {
        // Note: In a real test, you would need to get a real Firebase ID token
        // For testing purposes, we're assuming the API will validate the token
        const response = await request(app)
            .post('/api/auth/login')
            .send({ idToken: 'mock-id-token' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User logged in successfully.');
        expect(response.body.user).toHaveProperty('uid');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('picture');

        userIdToken = response.body.token;
    });

    it('should handle invalid login token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ idToken: 'invalid-token' });
        
        expect(response.status).toBe(401);
    });

    it('should authenticate with Google Sign-In', async () => {
        const response = await request(app)
            .post('/api/auth/google')
            .send({ idToken: 'mock-google-id-token' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Google Sign-In successful.');
        expect(response.body.user).toHaveProperty('uid');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('displayName');
        expect(response.body.user).toHaveProperty('photoURL');
    });

    it('should handle invalid Google Sign-In token', async () => {
        const response = await request(app)
            .post('/api/auth/google')
            .send({ idToken: 'invalid-google-token' });
        
        expect(response.status).toBe(401);
    });
});