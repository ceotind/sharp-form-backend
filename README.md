# Sharp Form Backend

A robust and secure backend service for managing dynamic forms and responses, built with Express.js and Firebase. This service provides a complete solution for creating, managing, and collecting responses to forms with file upload capabilities.

## 🚀 Features

- 🔐 Secure Authentication (Email/Password and Google Sign-in)
- 📝 Dynamic Form Creation and Management
- 📊 Response Collection and Management
- 📁 File Upload Support (with automatic cleanup)
- 🔒 Role-based Access Control
- ⚡ Rate Limiting
- 📱 Cross-Platform Support

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase Account
- Firebase Admin SDK credentials
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sharp-form-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
PORT=3001
NODE_ENV=development

# Firebase Configuration
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

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## 🔌 API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ "email": "string", "password": "string", "displayName": "string" }`
- **Response**: `201 Created`
```json
{
  "message": "User registered successfully.",
  "uid": "string",
  "email": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ "idToken": "string" }`
- **Response**: `200 OK`
```json
{
  "message": "User logged in successfully.",
  "user": {
    "uid": "string",
    "email": "string",
    "name": "string",
    "picture": "string"
  }
}
```

#### Google Sign-In
- **POST** `/api/auth/google`
- **Body**: `{ "idToken": "string" }`
- **Response**: `200 OK`
```json
{
  "message": "Google Sign-In successful.",
  "user": {
    "uid": "string",
    "email": "string",
    "displayName": "string",
    "photoURL": "string"
  }
}
```

### Forms

#### Create Form
- **POST** `/api/forms`
- **Auth**: Required
- **Body**: 
```json
{
  "name": "string",
  "description": "string",
  "elements": [
    {
      "type": "string",
      "label": "string",
      "required": boolean,
      "acceptedTypes": ["string"] // Required for file type
    }
  ],
  "isPublished": boolean
}
```
- **Response**: `201 Created`

#### List Forms
- **GET** `/api/forms`
- **Auth**: Required
- **Response**: `200 OK`
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "elements": [],
    "isPublished": boolean,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

#### Get Form
- **GET** `/api/forms/:formId`
- **Auth**: Required for private forms
- **Response**: `200 OK`

#### Update Form
- **PUT** `/api/forms/:formId`
- **Auth**: Required
- **Body**: Same as Create Form
- **Response**: `200 OK`

#### Delete Form
- **DELETE** `/api/forms/:formId`
- **Auth**: Required
- **Response**: `200 OK`

### Responses

#### Submit Response
- **POST** `/api/forms/:formId/responses`
- **Body**: 
```json
{
  "answers": {
    "questionId": "answer",
    "fileQuestionId": {
      "fileUrl": "string",
      "fileName": "string",
      "contentType": "string"
    }
  }
}
```
- **Response**: `201 Created`

#### Get Responses
- **GET** `/api/forms/:formId/responses`
- **Auth**: Required (form owner only)
- **Response**: `200 OK`

### Files

#### Upload File
- **POST** `/api/files/upload`
- **Auth**: Required
- **Body**: `multipart/form-data`
- **File Limits**: 
  - Max size: 5MB
  - Types: jpg, jpeg, png, webp, pdf, doc, docx, xls, xlsx, txt
- **Response**: `200 OK`

#### List Files
- **GET** `/api/files`
- **Auth**: Required
- **Response**: `200 OK`

#### Delete File
- **DELETE** `/api/files/:fileName`
- **Auth**: Required
- **Response**: `200 OK`

## 📁 File Management

### Supported File Types
- **Images**: jpg, jpeg, png, webp
- **Documents**: pdf, doc, docx
- **Spreadsheets**: xls, xlsx
- **Text**: txt

### File Upload Rules
- Maximum file size: 5MB
- Rate limit: 10 uploads per 15 minutes per user
- Auto-cleanup: Files older than 30 days
- Secure file validation

## 🔒 Security Features

- Firebase Authentication
- Request Rate Limiting
- File Type Validation
- Automatic File Cleanup
- Role-Based Access Control
- Input Validation
- Error Handling

## 🏗️ Project Structure

```
├── app.js              # Application entry point
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Data models
├── routes/            # API routes
├── services/          # Business logic
└── utils/             # Utility functions
```

## ⚠️ Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

Common error response format:
```json
{
  "error": "Error message",
  "details": "Detailed error description",
  "code": "ERROR_CODE" // Optional
}
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, email support@example.com or create an issue in the repository.
