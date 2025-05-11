const { request, app } = require('./setup');
const { auth } = require('../config/firebase');

describe('Specific User Registration', () => {
  const specificUser = {
    email: "jjasdasdjs@gmail.com",
    password: "Dilshad@123",
    displayName: "Dilshad Akhtar"
  };
  
  let userId;

  afterAll(async () => {
    // Re-enable user deletion to clean up after tests
    if (userId) {
      try {
        await auth.deleteUser(userId);
        console.log('Test user deleted successfully');
      } catch (error) {
        console.log('User cleanup not needed');
      }
    }
  });

  it('should register the specific user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(specificUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('uid');
    expect(response.body).toHaveProperty('email', specificUser.email);
    userId = response.body.uid;
    
    console.log('Created user ID:', userId);

    // Verify user exists in Firebase
    const userRecord = await auth.getUser(userId);
    expect(userRecord.email).toBe(specificUser.email);
    expect(userRecord.displayName).toBe(specificUser.displayName);
    
    console.log('User verified in Firebase:', userRecord.toJSON());
  });

  it('should be able to login with created user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: specificUser.email,
        password: specificUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', specificUser.email);
    console.log('Login successful:', response.body);
  });
});