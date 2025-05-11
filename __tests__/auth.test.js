const { request, app } = require('./setup');
const { auth } = require('../config/firebase');
const { testUser } = require('./testData');

describe('Authentication Endpoints', () => {
  let userId;

  afterAll(async () => {
    if (userId) {
      try {
        await auth.deleteUser(userId);
      } catch (error) {
        console.log('User cleanup not needed');
      }
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uid');
      expect(response.body).toHaveProperty('email', testUser.email);
      userId = response.body.uid;
    });

    it('should fail to register with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // Wait a bit to ensure Firebase has processed the registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uid');
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should fail to login with incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});