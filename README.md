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

In active development.
