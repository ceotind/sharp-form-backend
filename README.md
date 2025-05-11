# Sharp Form Backend

A backend service for managing forms and responses using Express.js and Firebase.

## Setup

1. Clone the repository
```bash
git clone https://github.com/ceotind/sharp-form-backend.git
cd sharp-form-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase credentials:
   - Go to your Firebase Console
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Create a `.env` file based on `.env.template`
   - Copy the values from your Firebase service account key into the `.env` file

4. Start the server
```bash
npm start
```

## Environment Variables

Copy `.env.template` to `.env` and fill in your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
```

## API Endpoints

### Forms
- `POST /api/forms` - Create a new form
- `GET /api/forms` - List all forms
- `GET /api/forms/:formId` - Get a specific form
- `PUT /api/forms/:formId` - Update a form
- `DELETE /api/forms/:formId` - Delete a form

### Responses
- `POST /api/forms/:formId/responses` - Submit a response to a form
- `GET /api/forms/:formId/responses` - Get all responses for a form (owner only)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Sign in with Google

## Testing

```bash
npm test
```

## Development

For local development, you can use the test files:
- `test-request.js` - Test form creation
- `test-response.js` - Test submitting responses
- `test-get-responses.js` - Test retrieving responses
