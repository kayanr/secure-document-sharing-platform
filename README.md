# Secure Document Sharing Platform

A full-stack web application for securely uploading, managing, and sharing documents with role-based access control and JWT authentication.

## Overview

Users can register, log in, upload documents, and share them with other users. Access is controlled by role — regular users manage their own documents, while admins have visibility across the platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5.12, Spring Security 6 |
| Frontend | React 18, Vite, Axios |
| Database | MySQL 8 |
| Auth | JWT (JSON Web Tokens) |
| ORM | Spring Data JPA / Hibernate |

## Features

- User registration and login with JWT authentication
- Document upload, download, and deletion
- Document sharing between users
- Role-based access control (USER / ADMIN)
- Admin dashboard for platform-wide visibility

## Architecture

3-tier architecture: React frontend → Spring Boot REST API → MySQL database.

The backend follows a layered pattern: Controllers handle HTTP, Services contain business logic, Repositories handle database access.

## Status

| Phase | Feature | Status |
|---|---|---|
| Phase 3 | JWT Authentication | ✅ Complete |
| Phase 4 | Document CRUD | ✅ Complete |
| Phase 5 | Role-Based Access Control | ✅ Complete |
| Frontend | Auth, documents, admin dashboard | ✅ Complete |
| Phase 6 | Document Sharing — backend API | ✅ Complete |
| Frontend | Share modal, Shared With Me page | ✅ Complete |
| Next | Automated tests | 🔲 Pending |

---

## Local Setup

### Prerequisites
- Java 21
- Node.js 18+
- Docker (for MySQL)

### 1. Start the database
```bash
docker run --name securedoc-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=securedoc_db \
  -e MYSQL_USER=your_user \
  -e MYSQL_PASSWORD=yourpassword \
  -p 3306:3306 \
  -d mysql:8
```

### 2. Set environment variables
Add these to `~/.bashrc` (or export them in your terminal):
```bash
export DB_PASSWORD=yourpassword      # must match MYSQL_PASSWORD above
export JWT_SECRET=your-secret        # generate with: openssl rand -hex 32
```

### 3. Run the backend
```bash
cd backend
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`.
Swagger UI available at `http://localhost:8080/swagger-ui/index.html`.

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

---

## API Endpoints

### Auth (public)

**Register**
```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Your Name","email":"you@example.com","password":"yourpassword"}'
```
Response: `201 Created` — `{"token": "eyJ..."}`

**Login**
```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```
Response: `200 OK` — `{"token": "eyJ..."}`

### All other endpoints (protected)
Include the token from login in every request:
```bash
TOKEN="eyJ..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/documents
```
Returns `401` if token is missing or invalid.

---

### Documents (protected)

**Upload a document**
```bash
curl -s -X POST http://localhost:8080/api/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```
Response: `201 Created` — document metadata JSON

**List your documents**
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/documents
```
Response: `200 OK` — array of document metadata

**Download a document**
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/documents/{id}/download \
  -o downloaded-file.pdf
```
Response: `200 OK` — file bytes

**Delete a document**
```bash
curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/documents/{id}
```
Response: `204 No Content`

> Only the document owner can download or delete. Non-owner access returns `403 Forbidden`.

---

### Admin endpoints (ADMIN role only)

**List all documents on the platform**
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/admin/documents
```
Response: `200 OK` — array of all documents regardless of owner

**Delete any document**
```bash
curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/admin/documents/{id}
```
Response: `204 No Content`

> USER role accessing admin endpoints returns `403 Forbidden`.
> To promote a user to ADMIN: `UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'user@example.com';`

---

### Sharing endpoints (protected)

**Share a document with another user**
```bash
curl -s -X POST http://localhost:8080/api/documents/{id}/share \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"other@example.com"}'
```
Response: `201 Created`

> Returns `400` if sharing with yourself or the document is already shared with that user.
> Returns `403` if you are not the document owner.

**List documents shared with me**
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/documents/shared-with-me
```
Response: `200 OK` — array of document metadata shared with the logged-in user

**Revoke a share**
```bash
curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/documents/{id}/share/{recipientId}
```
Response: `204 No Content`

> Only the document owner can revoke. `{recipientId}` is the user ID of the person the document was shared with.
