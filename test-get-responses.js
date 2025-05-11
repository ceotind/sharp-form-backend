const http = require('http');

// Form ID from the form we created earlier
const formId = 'xo7Y7B8flj4CR7WL77vf';

// Auth token from the form owner (same token we used to create the form)
const authToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5MWYxNWRlZTg0OTUzNjZjOTgyZTA1MTMzYmNhOGYyNDg5ZWFjNzIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2hhcnBmb3JtLTY5YjA5IiwiYXVkIjoic2hhcnBmb3JtLTY5YjA5IiwiYXV0aF90aW1lIjoxNzQ2OTUzMjAzLCJ1c2VyX2lkIjoiZjU4cVlacE1Pa2QwVDdIWFRTeTI3MWFyRHlPMiIsInN1YiI6ImY1OHFZWnBNT2tkMFQ3SFhUU3kyNzFhckR5TzIiLCJpYXQiOjE3NDY5NTMyNDQsImV4cCI6MTc0Njk1Njg0NCwiZW1haWwiOiJzYWdhckB5YWhvby5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsic2FnYXJAeWFob28uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.XYT2IyWfItOOs8eylXA8D3p35OR_ygLa0JImUNiN3KNanlJr-jbrBets8XlWrD91Oo_aHra1mbSYuqm-GePtb_M45lHQmIDkTC0YHXzPZIG7lGAddXj0IZ4tU0F_QVJabu3B4I2zj7M7p3UZuZqS-nFWa7tFwpU2aXiZEAmlrPxg3xuEgJmgHh7kHOhzWpcvakvqPb7j4fEBMUvwgZXxAuKMmZJxstc7PPS2oiYlwRLHqIZjbp65Fn5N3pP9B5l5vlNyNMmN5vBGuewkyvB_l3jk6aLAbdLhj4F86Fq4jsDp9-BfK5dn7vFALsbfzYuAIxBZnFztTfnjnLIR_7Sm7Q';

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
