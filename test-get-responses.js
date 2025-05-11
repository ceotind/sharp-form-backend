const http = require('http');
require('dotenv').config();

// Form ID and auth token from environment variables
const formId = process.env.TEST_FORM_ID;
const authToken = process.env.TEST_AUTH_TOKEN;

if (!formId || !authToken) {
  console.error('Please set TEST_FORM_ID and TEST_AUTH_TOKEN in your .env file');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/forms/${formId}/responses`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}` // Required for viewing responses
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Responses:', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
