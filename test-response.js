const http = require('http');

// Form ID from the form we just created
const formId = 'xo7Y7B8flj4CR7WL77vf';

const data = JSON.stringify({
  answers: {
    "q234341": "John Doe" // This matches the question ID from the form we created
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/forms/${formId}/responses`, // Note the path format for submitting responses
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
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
