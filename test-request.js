const https = require('https');
const http = require('http');
require('dotenv').config();

// Check for auth token
const authToken = process.env.TEST_AUTH_TOKEN;
if (!authToken) {
  console.error('Please set TEST_AUTH_TOKEN in your .env file');
  process.exit(1);
}

const data = JSON.stringify({
  name: "Test Survey",
  description: "Test description",
  elements: [
    { id: "q234341", type: "shortAnswer", label: "Dilshad", required: true }
  ],
  isPublished: true
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/forms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',    'Content-Length': data.length,
    'Authorization': `Bearer ${authToken}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
