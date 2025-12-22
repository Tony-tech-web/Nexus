# Nexus - Enterprise Inventory & Order Management System

## Overview

Nexus is a robust, production-ready system for managing inventory levels and processing customer orders. It demonstrates a high level of code quality, focusing on modularity, security, and developer experience.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Security**: JWT (Access/Refresh Tokens), BCrypt, RBAC, Helmet, CORS, Zod
- **Frontend**: React, Vite, Tailwind CSS, Lucide (icons)
- **DevOps**: Clean architecture ready for Dockerization

## Getting Started

### Prerequisites

- Node.js (v20+)

### Installation

1. Install dependencies for both backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Running the Project

To run both servers effectively, use two terminal windows:

**Terminal 1: Backend API**

```bash
cd backend
npm run dev
```

_Running on `http://localhost:3001`_

**Terminal 2: Frontend Dashboard**

```bash
cd frontend
npm run dev
```

_Running on `http://localhost:5173`_

## Architecture

The system follows a clean, layered architecture:

- **Controllers**: Handle HTTP-specific logic.
- **Services**: Contain the core business logic.
- **Prisma DAL**: Manages database interactions.
- **Middleware**: Handles cross-cutting concerns (Auth, Error handling).

## API Documentation (Summary)

- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Authenticate and receive tokens.
- `GET /api/inventory`: List all products (Authenticated).
- `POST /api/orders`: Create a new order (Staff/Admin).

## What I Learned / Demonstrates

- Implementation of complex database transactions (Order items deduction).
- Secure JWT implementation with role-based access control.
- Modern CSS-in-JS design patterns with Tailwind.
- Type-safe development across the full stack.

---

_Created as a professional portfolio project by [Antigravity]._
