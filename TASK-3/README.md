# AuthSecure — Secure Authentication System

AuthSecure is a MERN-stack authentication project developed as part of the WeIntern Week 2, Task 3 assignment. It demonstrates user registration, password hashing, login authentication, JWT-based authorization, and protected routes.

## Features

- User registration with username, email, and password
- Password hashing using bcrypt
- Login with credential validation
- JWT-based authentication
- Protected user profile endpoint
- Input validation and error handling
- Logout by clearing the stored authentication token
- React-based user interface
- MongoDB database integration

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv

## Project Structure

```text
TASK-3/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or local MongoDB installation
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate to the project folder:

```bash
cd weIntern_week2/TASK-3
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the example values with your own credentials. Never upload your `.env` file or expose your database credentials or JWT secret.

### 3. Start the Backend

```bash
npm run dev
```

The backend should run at `http://localhost:5000` if port 5000 is available.

### 4. Start the Frontend

Open a second terminal from the `TASK-3` folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal by Vite.

## API Endpoints

Base URL: `http://localhost:5000/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate an existing user |
| GET | `/me` | Access the authenticated user's profile |

### Protected Route

The `/me` endpoint requires a valid JWT in the request header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Security Notes

- Passwords are hashed using bcrypt before being stored.
- Passwords are not returned in API responses.
- JWTs are verified before protected resources are accessed.
- Invalid credentials and invalid or expired tokens are rejected.
- Environment variables are used for sensitive configuration.
- The current logout implementation clears the token stored in the browser. A copied JWT may remain usable until it expires; this is not server-side token revocation.

## Testing Checklist

Test these scenarios using Postman and the frontend:

1. Register a new user.
2. Confirm that the user is stored in MongoDB.
3. Log in using valid credentials.
4. Test login with incorrect credentials.
5. Access `/me` with a valid JWT.
6. Attempt to access `/me` without a token.
7. Log out and confirm that the frontend returns to the login screen.

## Learning Outcomes

- REST API development
- Password hashing and authentication
- JWT-based authorization
- Protected routes
- React and Express integration
- MongoDB database operations
- Environment-variable configuration

## Author

Developed as part of the **WeIntern Week 2 — Task 3** assignment.
