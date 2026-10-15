# CampusHire — MERN Placement Management System

A role-based Placement Management System built with MongoDB, Express.js, React and Node.js.

## Roles

- Student: maintain profile, view eligible placement drives, apply, track application status.
- Company: create placement drives and view applicants.
- Admin: view placement drives/applicants and update application status.

## Project structure

```text
placement-management-mern/
  backend/
    models/
    middleware/
    routes/
    scripts/
    server.js
  frontend/
    src/
      components/
      App.jsx
      api.js
      main.jsx
      index.css
```

## Requirements

- Node.js 18+
- MongoDB local server or MongoDB Atlas
- npm

## 1. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.

Start backend:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Create the first Admin account:

```bash
node scripts/createAdmin.js admin@example.com "StrongAdminPassword123" "Placement Admin"
```

## 2. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Start:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Core API

### Authentication

`POST /api/auth/register`

```json
{
  "name": "Dhanushree",
  "email": "student@example.com",
  "password": "StrongPassword123",
  "role": "Student"
}
```

`POST /api/auth/login`

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123"
}
```

### Student

`GET /api/students/profile`

`PUT /api/students/profile`

`POST /api/applications/:jobId`

`GET /api/applications/my`

### Company

`POST /api/jobs`

`GET /api/jobs/company/my-jobs`

`GET /api/jobs/:id/applicants`

### Admin

`GET /api/jobs/:id/applicants`

`PATCH /api/applications/:id/status`

```json
{
  "status": "Shortlisted"
}
```

## Important production notes

This is a complete core-feature implementation suitable as a portfolio project, but "production-ready" in a real company would require additional operational controls such as HTTPS/TLS, secret management, refresh-token/session strategy, email verification/password reset, audit logging, stronger request validation, automated tests, monitoring, backups, object storage for resumes, and a deployment pipeline.

Do not commit `.env` files or JWT secrets to Git.
