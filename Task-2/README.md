# StaffSync — Employee Management System

StaffSync is a full-stack MERN application designed to manage employee records through a clean, responsive dashboard.

## Features

- Add new employees
- View employee records
- Edit employee information
- Delete employee records
- Search and sort employees
- Dashboard with employee statistics
- Responsive user interface
- MongoDB Atlas cloud database integration

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- Mongoose

**Database**
- MongoDB Atlas

## Project Structure

```text
StaffSync/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

Install Node.js and npm. You will also need a MongoDB Atlas database or another MongoDB connection.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd StaffSync
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Replace the placeholder with your MongoDB connection string. Never publish your real database credentials.

Start the backend:

```bash
npm start
```

If your backend does not have a `start` script, use the command configured in your `backend/package.json`, such as `node server.js`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Get employee records |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Add an employee |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

## Environment Variables

Keep your database connection string in `backend/.env`. Do not commit `.env` or expose database passwords.

## Future Improvements

- User authentication and authorization
- Employee profile photos
- Pagination and advanced filters
- Online deployment

## Author

Developed as a full-stack web development project to practise the MERN stack and CRUD operations.
