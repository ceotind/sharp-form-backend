# Sharp Form Backend

A robust and secure backend service for managing dynamic forms and responses, built with Express.js and Firebase. This service provides a complete solution for creating, managing, and collecting responses to forms with file upload capabilities.

## 📚 API Quick Reference

### Authentication
- Register: `POST /api/auth/register` - Create new account with email/password
- Login: `POST /api/auth/login` - Login with Firebase ID token
- Google Sign-in: `POST /api/auth/google` - Sign in with Google

### Forms
- Create Form: `POST /api/forms` - Create a new form
- List Forms: `GET /api/forms` - Get all your forms
- Get Form: `GET /api/forms/:formId` - Get a specific form
- Update Form: `PUT /api/forms/:formId` - Update a form
- Delete Form: `DELETE /api/forms/:formId` - Delete a form

### Form Responses
- Submit Response: `POST /api/forms/:formId/responses` - Submit an answer to a form
- Get Responses: `GET /api/forms/:formId/responses` - Get all responses for a form

### File Management
- Upload File: `POST /api/files/upload` - Upload a file (max 5MB)
- List Files: `GET /api/files` - List your uploaded files
- Delete File: `DELETE /api/files/:fileName` - Delete a file

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

## 🔌 Detailed API Guide

### Authentication

#### Creating a New Account
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123",
    "displayName": "John Doe"
}
```
- Creates a new user account
- All fields are required
- Password must be at least 8 characters
- Returns user ID and email on success

#### Logging In
```http
POST /api/auth/login
Content-Type: application/json

{
    "idToken": "firebase-id-token"
}
```
- Use your Firebase ID token to log in
- Token is obtained after Firebase email/password authentication
- Returns user profile and session token

#### Google Sign-In
```http
POST /api/auth/google
Content-Type: application/json

{
    "idToken": "google-oauth-token"
}
```
- Sign in with your Google account
- Get the ID token from Google OAuth flow
- Returns user profile with Google information

### Managing Forms

#### Creating a New Form
```http
POST /api/forms
Authorization: Bearer your-auth-token
Content-Type: application/json

{
    "name": "Customer Feedback",
    "description": "Please share your experience with our service",
    "elements": [
        {
            "type": "text",
            "label": "Full Name",
            "required": true
        },
        {
            "type": "email",
            "label": "Email Address",
            "required": true
        },
        {
            "type": "file",
            "label": "Upload Receipt",
            "required": false,
            "acceptedTypes": ["image/jpeg", "image/png", "application/pdf"]
        }
    ],
    "isPublished": true
}
```
- Requires authentication
- `name` and `description` describe your form
- `elements` define form fields:
  - `text`: Text input
  - `email`: Email input
  - `number`: Numeric input
  - `file`: File upload
  - Add `required: true` for mandatory fields
- Set `isPublished: true` to make the form active

#### Getting Your Forms
```http
GET /api/forms
Authorization: Bearer your-auth-token
```
- Lists all forms you've created
- Shows form details, elements, and publish status
- Includes creation and last update timestamps

#### Viewing a Specific Form
```http
GET /api/forms/form123
Authorization: Bearer your-auth-token  # Required for private forms
```
- Get detailed information about one form
- Public forms don't require authentication
- Returns form structure and elements

#### Updating a Form
```http
PUT /api/forms/form123
Authorization: Bearer your-auth-token
Content-Type: application/json

{
    "name": "Updated Form Name",
    "description": "Updated description",
    "elements": [...],
    "isPublished": true
}
```
- Update any form properties
- Use same structure as form creation
- Only form owner can update

#### Deleting a Form
```http
DELETE /api/forms/form123
Authorization: Bearer your-auth-token
```
- Permanently removes the form
- Also deletes associated responses
- Only form owner can delete

### Working with Form Responses

#### Submitting a Response
```http
POST /api/forms/form123/responses
Content-Type: application/json

{
    "answers": {
        "fullName": "John Smith",
        "emailAddress": "john@example.com",
        "uploadedReceipt": {
            "fileUrl": "https://storage.example.com/files/receipt.pdf",
            "fileName": "receipt.pdf",
            "contentType": "application/pdf"
        }
    }
}
```
- Submit answers to a form
- Match answer keys to form element labels
- For file uploads, include file details after uploading
- No authentication required for public forms

#### Getting Form Responses
```http
GET /api/forms/form123/responses
Authorization: Bearer your-auth-token
```
- Get all responses for your form
- Only form owner can access responses
- Returns array of all submissions

### Managing Files

#### Uploading Files
```http
POST /api/files/upload
Authorization: Bearer your-auth-token
Content-Type: multipart/form-data

file=@path/to/local/file.jpg
```
- Upload files up to 5MB
- Supported formats:
  - Images: jpg, jpeg, png, webp
  - Documents: pdf, doc, docx
  - Spreadsheets: xls, xlsx
  - Text: txt
- Returns file URL and details for form submission

#### Viewing Your Files
```http
GET /api/files
Authorization: Bearer your-auth-token
```
- List all your uploaded files
- Shows file names, URLs, and types
- Only shows your own files

#### Removing Files
```http
DELETE /api/files/receipt.pdf
Authorization: Bearer your-auth-token
```
- Delete a specific file
- Use the file name from upload response
- Only owner can delete their files

## 📁 File Management Guidelines

### File Types and Limits
- **Images** 
  - Formats: jpg, jpeg, png, webp
  - Best for: User photos, receipts, screenshots
  
- **Documents** 
  - Formats: pdf, doc, docx
  - Best for: Reports, contracts, documentation
  
- **Spreadsheets** 
  - Formats: xls, xlsx
  - Best for: Data tables, financial records
  
- **Text Files** 
  - Format: txt
  - Best for: Simple text content, logs

### Important File Rules
- **Size Limit**: Keep files under 5MB
- **Upload Frequency**: Maximum 10 uploads every 15 minutes
- **Storage Duration**: Files are automatically deleted after 30 days
- **Security**: All files are scanned for viruses and validated

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
