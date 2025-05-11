const { db, auth } = require('../config/firebase');
const request = require('supertest');
const app = require('../app');

let server;

beforeAll(async () => {
  server = app.listen(0);
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 500));
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await db.terminate();
  await auth.app.delete();
});

module.exports = { request, app };