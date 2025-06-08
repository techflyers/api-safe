# API Key Management System

A full-stack application for managing API keys across different providers. Built with Node.js, Express, MongoDB, React, and TypeScript.

“Unlock simplicity. Secure your keys.”

* Centralized Key Vault – Keep all your provider keys in one secure place  
* One-Click Provisioning – Add new keys instantly via a clean, minimal UI

Perfect for users and devs who want security without the headaches.

## Features

- User authentication (signup/login)
- API key management
- Support for multiple providers (OpenAI, Google Gemini, Groq, OpenRouter, GitAzure, Anthropic)
- Search and filter API keys
- Secure key storage
- Modern Material-UI interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Locally

1. Clone the repository:
```bash
git clone https://github.com/techflyers/api-safe.git
cd api-safe
```

3. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/api-handler <REPLACE WITH YOURS>
JWT_SECRET=your_jwt_secret_here
```

## Running the Application

1. Start the MongoDB server

2. Start the backend server:
```bash
npm run dev
```

3. Change the server location to localhost:
```bash
cd client
find . -type f -exec sed -i 's|http://localhost:5000|https://apisafegui-techflyervp.ladeapp.com|g' {} +
```
Or do manually in Dashboard.tsx and AuthContext.tsx

3. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Security

- Passwords are hashed using bcrypt
- JWT authentication
- API keys are stored securely
- Protected routes using authentication middleware
  
## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### API Keys
- GET `/api/keys` - Get all API keys for authenticated user
- GET `/api/keys/:keyName` - Get specific API key by name
- POST `/api/keys` - Create new API key
- PUT `/api/keys/:keyName` - Update API key
- DELETE `/api/keys/:keyName` - Delete API key

## Example: Using curl for Authentication

Okay, based on the provided instructions, here's how you can use curl to register, log in, and get your user details.

**Step 1: Register a User**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123"
  }' \
  http://localhost:5000/api/auth/register
```

**Step 2: Login to Get a Token**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }' \
  http://localhost:5000/api/auth/login
```

**Step 3: Get User Details**
Replace YOUR_TOKEN_HERE with the token from the login response.
```bash
TOKEN="YOUR_TOKEN_HERE"
curl -X GET \
  -H "x-auth-token: $TOKEN" \
  http://localhost:5000/api/auth/me
```

## License

MIT
