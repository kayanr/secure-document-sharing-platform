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
| Phase 4 | Document CRUD | 🔲 Not started |
| Phase 5 | Role-Based Access Control | 🔲 Not started |
| Phase 6 | Document Sharing | 🔲 Not started |

---

## Local Setup

### Prerequisites
- Java 21
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
curl -s -H "Authorization: Bearer eyJ..." http://localhost:8080/api/documents
```
Returns `401` if token is missing or invalid.
