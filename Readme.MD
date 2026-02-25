# TaskFlow — Full-Stack Task Manager

A secure, full-stack task management application built with Node.js/Express backend and Next.js frontend. Features JWT authentication, AES encryption, and a professional dark UI.

---

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT (HTTP-only cookies)
- bcrypt (password hashing)
- CryptoJS AES (description encryption)
- express-validator, Helmet, CORS, express-rate-limit

**Frontend**
- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript

---

## Features

- User registration and login with JWT stored in HTTP-only cookies
- bcrypt password hashing
- AES encryption on task descriptions (stored encrypted in MongoDB, returned as plain text)
- Full CRUD for tasks (Create, Read, Update, Delete)
- Users can only access their own tasks
- Pagination, filter by status, search by title
- Protected frontend routes (redirects to /login if not authenticated)
- Input validation and structured error handling
- Rate limiting, security headers (Helmet), CORS

---

## Project Structure

```
TaskManager/
├── server/                          # Backend (Node.js + Express)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Logout
│   │   └── taskController.js        # CRUD + pagination + AES encryption
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT cookie verification
│   │   └── validate.js              # express-validator error handler
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Task.js                  # Task schema
│   ├── routes/
│   │   ├── authRoutes.js            # /api/v1/auth
│   │   └── taskRoutes.js            # /api/v1/tasks
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── .env                         # Environment variables
│   ├── app.js                       # Express app setup
│   └── server.js                    # Entry point
│
├── client/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── login/page.tsx           # Login page
│   │   ├── register/page.tsx        # Register page
│   │   ├── dashboard/page.tsx       # Task dashboard
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Root redirect
│   ├── lib/
│   │   └── api.ts                   # Fetch wrapper
│   ├── proxy.ts                     # Protected route middleware
│   └── next.config.ts               # Next.js config
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- npm

### 1. Clone the repository

```bash
git clone https://github.com/sumitjhk/primetradeai.git
cd TaskManager
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
PORT=8000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
AES_SECRET=your_aes_encryption_key
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:8000`

### 3. Setup the Frontend

```bash
cd client
npm install
```

Create a `.env.local` file in the `client/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

### Auth Routes — `/api/v1/auth`

| Method | Endpoint    | Description       | Auth Required |
|--------|-------------|-------------------|---------------|
| POST   | /register   | Register new user | No            |
| POST   | /login      | Login user        | No            |
| POST   | /logout     | Logout user       | Yes           |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login request body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Task Routes — `/api/v1/tasks`

| Method | Endpoint   | Description         | Auth Required |
|--------|------------|---------------------|---------------|
| GET    | /          | Get all tasks       | Yes           |
| POST   | /          | Create a task       | Yes           |
| GET    | /:id       | Get task by ID      | Yes           |
| PUT    | /:id       | Update a task       | Yes           |
| DELETE | /:id       | Delete a task       | Yes           |

**Query parameters for GET /tasks:**

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| page      | number | Page number (default: 1)             |
| limit     | number | Results per page (default: 10)       |
| status    | string | Filter: pending, in-progress, completed |
| search    | string | Search by task title                 |

**Example:**
```
GET /api/v1/tasks?page=1&limit=10&status=pending&search=meeting
```

**Task request body:**
```json
{
  "title": "My Task",
  "description": "Task description (will be AES encrypted)",
  "status": "pending"
}
```

**Task status values:** `pending` | `in-progress` | `completed`

---

## Security Implementation

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT stored in HTTP-only cookies (not accessible via JS) |
| Password hashing | bcrypt with salt rounds |
| Data encryption | AES encryption on task description field via CryptoJS |
| Input validation | express-validator on all routes |
| Rate limiting | 100 requests per 15 minutes per IP |
| Security headers | Helmet.js |
| CORS | Restricted to frontend origin with credentials |
| Authorization | Users can only read/modify their own tasks |

---

## Environment Variables

### Server `.env`

| Variable   | Description                        |
|------------|------------------------------------|
| PORT       | Server port (default: 8000)        |
| NODE_ENV   | development or production          |
| MONGO_URI  | MongoDB Atlas connection string    |
| JWT_SECRET | Secret key for signing JWT tokens  |
| JWT_EXPIRE | Token expiry (e.g. 7d)             |
| CLIENT_URL | Frontend URL for CORS              |
| AES_SECRET | Secret key for AES encryption      |

### Client `.env.local`

| Variable              | Description         |
|-----------------------|---------------------|
| NEXT_PUBLIC_API_URL   | Backend API base URL |

---

## Screenshots

### Login Page
Dark themed login with email/password fields and form validation.

### Dashboard
Stats bar showing total, pending, in-progress, and completed task counts. Task grid with search, status filter, pagination, and create/edit/delete actions.

---

## Postman Testing Guide

### Setup

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Make sure your backend is running at `http://localhost:8000`
3. In Postman, go to **Settings → General** and make sure **"Automatically follow redirects"** is ON
4. Cookies are handled automatically by Postman — after login, the `token` cookie will be sent on all subsequent requests

---

### 1. Register a New User

```
Method:   POST
URL:      http://localhost:8000/api/v1/auth/register
Headers:  Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

---

### 2. Login

```
Method:   POST
URL:      http://localhost:8000/api/v1/auth/login
Headers:  Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

> After login, Postman automatically stores the `token` HTTP-only cookie. All subsequent requests will send it automatically.

**Wrong credentials (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Create a Task

```
Method:   POST
URL:      http://localhost:8000/api/v1/tasks
Headers:  Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "title": "My First Task",
  "description": "This description will be AES encrypted in MongoDB",
  "status": "pending"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "...",
    "title": "My First Task",
    "description": "This description will be AES encrypted in MongoDB",
    "status": "pending",
    "owner": "...",
    "createdAt": "2026-02-26T00:00:00.000Z"
  }
}
```

> Note: The description is returned as plain text but stored as `U2FsdGVkX1+...` (AES encrypted) in MongoDB.

---

### 4. Get All Tasks

```
Method:   GET
URL:      http://localhost:8000/api/v1/tasks
```

**With query parameters:**

| URL | Description |
|-----|-------------|
| `/api/v1/tasks` | All tasks (page 1, limit 10) |
| `/api/v1/tasks?page=2&limit=5` | Page 2, 5 per page |
| `/api/v1/tasks?status=pending` | Only pending tasks |
| `/api/v1/tasks?status=in-progress` | Only in-progress tasks |
| `/api/v1/tasks?status=completed` | Only completed tasks |
| `/api/v1/tasks?search=meeting` | Tasks with "meeting" in title |
| `/api/v1/tasks?page=1&limit=5&status=pending&search=task` | Combined filters |

**Expected Response (200):**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "total": 2,
    "page": 1,
    "pages": 1,
    "limit": 10
  },
  "tasks": [
    {
      "_id": "...",
      "title": "My First Task",
      "description": "Decrypted description text",
      "status": "pending",
      "owner": "...",
      "createdAt": "2026-02-26T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Single Task

```
Method:   GET
URL:      http://localhost:8000/api/v1/tasks/:id
```

Replace `:id` with an actual task ID from the Get All Tasks response.

**Example:**
```
GET http://localhost:8000/api/v1/tasks/699f3ad48dea4be898f38726
```

**Expected Response (200):**
```json
{
  "success": true,
  "task": {
    "_id": "699f3ad48dea4be898f38726",
    "title": "My First Task",
    "description": "Decrypted description text",
    "status": "pending",
    "owner": "...",
    "createdAt": "2026-02-26T00:00:00.000Z"
  }
}
```

**Not found (404):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### 6. Update a Task

```
Method:   PUT
URL:      http://localhost:8000/api/v1/tasks/:id
Headers:  Content-Type: application/json
```

**Body (raw → JSON) — send only fields you want to update:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "...",
    "title": "Updated Task Title",
    "description": "Updated description",
    "status": "in-progress",
    "owner": "...",
    "updatedAt": "2026-02-26T00:00:00.000Z"
  }
}
```

**Unauthorized (403) — trying to edit someone else's task:**
```json
{
  "success": false,
  "message": "Not authorized to update this task"
}
```

---

### 7. Delete a Task

```
Method:   DELETE
URL:      http://localhost:8000/api/v1/tasks/:id
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### 8. Logout

```
Method:   POST
URL:      http://localhost:8000/api/v1/auth/logout
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

> After logout, the `token` cookie is cleared. Any subsequent task requests will return 401 Unauthorized.

---

### Validation Error Tests

Use these to verify express-validator is working:

**Missing name on register:**
```json
{ "email": "test@gmail.com", "password": "test123" }
```

**Invalid email format:**
```json
{ "name": "Test", "email": "notanemail", "password": "test123" }
```

**Password too short (less than 6 chars):**
```json
{ "name": "Test", "email": "test@gmail.com", "password": "abc" }
```

**Empty task title:**
```json
{ "title": "", "description": "some description" }
```

All should return:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "fieldname", "message": "Error message here" }
  ]
}
```

---

### HTTP Status Code Reference

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (register, create task) |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | No token / invalid token |
| 403 | Forbidden | Authenticated but not your resource |
| 404 | Not Found | Task or route doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded (100 req/15 min) |
| 500 | Server Error | Unexpected backend error |

---

## License

MIT