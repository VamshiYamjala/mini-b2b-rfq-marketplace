# Mini B2B RFQ Marketplace

[![CI/CD Tests](https://img.shields.io/badge/tests-25%20passing-brightgreen.svg)](backend/tests)
[![Evaluation Scenarios](https://img.shields.io/badge/evaluator%20scenarios-15%2F15%20passed-success.svg)](backend/tests/evaluator_15_scenarios.js)
[![Database](https://img.shields.io/badge/database-MySQL%203NF%20Normalized-blue.svg)](backend/src/config/db.sql)
[![Architecture](https://img.shields.io/badge/architecture-Layered%20MVC%2FService-orange.svg)](ARCHITECTURE.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

A production-ready, full-stack B2B Request for Quotation (RFQ) Marketplace web application connecting **Buyers** and **Suppliers**. Built with React 18 (Vite), Express.js, and a 3NF normalized MySQL database with stateful session-based authentication.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [System Architecture](#system-architecture)
- [Key Features by Role](#key-features-by-role)
- [Tech Stack](#tech-stack)
- [Live Demo & Evaluator Accounts](#live-demo--evaluator-accounts)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations & Seeding](#database-migrations--seeding)
- [Automated Testing](#automated-testing)
- [API Reference](#api-reference)
- [Security Implementation](#security-implementation)
- [Project Documentation](#project-documentation)

---

## Executive Summary

The Mini B2B RFQ Marketplace streamlines procurement workflows between enterprise buyers and vetted suppliers:
1. **Buyers** publish structured RFQs specifying item requirements, required quantities, geographic delivery constraints, and strict bidding deadlines.
2. **Suppliers** search and filter opportunities across product categories and locations, submitting binding price-and-delivery quotation bids.
3. **Integrity Guarantees**: A supplier may only submit **one quotation per RFQ** (enforced in application logic and backed by a database unique constraint). Closed or expired RFQs cannot accept edits or new bids.

---

## System Architecture

The platform follows a decoupled, three-tier enterprise web architecture:

```
[ Browser / Client ]
        │  HTTPS + Cross-Origin Credentials (withCredentials: true)
        ▼
[ Frontend (React 18 + Vite + Bootstrap 5) ] ── (Hosted on Vercel)
        │  REST API Calls (/api/*)
        ▼
[ Backend API (Node.js + Express.js) ] ─────── (Hosted on Render)
   ├── Security & Proxy: helmet, cors, trust proxy
   ├── Session Manager: express-session + express-mysql-session
   ├── Layered Architecture: Routes ──► Controllers ──► Services ──► Models
   └── Database Client: mysql2/promise (100% Parameterized Prepared Statements)
        │  TCP Connection Pool (Max: 10 connections)
        ▼
[ Relational Database (MySQL 8.0 / MariaDB) ]
   ├── users (ID, name, email, password_hash, role: BUYER | SUPPLIER)
   ├── rfqs (ID, title, description, quantity, location, deadline, status: OPEN | CLOSED)
   ├── quotations (ID, rfq_id, supplier_id, price, lead_time_days, notes, uq_rfq_supplier)
   └── sessions (session_id, expires, data)
```

---

## Key Features by Role

### Buyer Portal
- **Dashboard & Metrics**: Real-time KPI summary (Total RFQs, Open RFQs, Closed RFQs, Total Quotations Received).
- **RFQ Creation**: Strict client and server validation ensuring positive integer quantities and future deadlines.
- **RFQ Modification**: In-place editing of open RFQs.
- **RFQ Closure**: One-click early close transition with instant confirmation; closed RFQs immediately enter a tamper-proof read-only state.
- **Quotation Audit**: View all submitted supplier bids side-by-side with an automated "Lowest Bid" highlighting badge.

### Supplier Marketplace
- **Opportunity Discovery**: Full-text keyword search on product titles/descriptions and delivery location filtering.
- **Real-Time Expiration Check**: RFQs past deadline are automatically badged as `EXPIRED` without requiring scheduled cron jobs.
- **Quotation Submission**: Interactive quote modal with currency formatting, lead time specification, and duplicate prevention.
- **Single-Bid Guarantee**: UI switches to "Already Quoted" state once a bid is lodged; backend returns `409 Conflict` if duplicate submission is attempted.
- **Bid History**: Dedicated portal to track all historical quotations across open and closed RFQs.

---

## Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance SPA with fast hot module replacement and small bundle size |
| **Styling** | Bootstrap 5, Custom CSS | Clean, responsive, enterprise-grade B2B layout with accessible contrast |
| **Routing** | React Router v6 | Declarative client-side routing with `ProtectedRoute` and `RoleRoute` guards |
| **HTTP Client**| Axios | Configured with `withCredentials: true` for automated session cookie propagation |
| **Backend** | Node.js, Express.js | Robust, lightweight asynchronous REST API |
| **Auth** | express-session, bcryptjs | Stateful server-side session authentication with secure password hashing (cost factor 10) |
| **Session Store**| express-mysql-session | Persistent MySQL session storage surviving server restarts and multiple instances |
| **Database** | MySQL 8.0+ / MariaDB | 3NF normalized relational schema with foreign key cascades and unique constraints |
| **DB Client** | mysql2/promise | Native connection pooling with 100% parameterized SQL queries (immune to SQL injection) |
| **Testing** | Jest, Supertest | 25 automated unit/integration tests + 15 evaluator end-to-end scenario tests |

---

## Live Demo & Evaluator Accounts

### Production Deployment
- **Frontend URL**: [https://mini-b2b-rfq-marketplace.vercel.app](https://mini-b2b-rfq-marketplace.vercel.app) *(or your deployed Vercel URL)*
- **Backend API**: [https://mini-b2b-rfq-marketplace.onrender.com](https://mini-b2b-rfq-marketplace.onrender.com)
- **API Health Check**: `GET /api/health`

### Pre-Seeded Demo Credentials
| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Buyer Account** | `buyer@example.com` | `Password123!` | `BUYER` |
| **Supplier Account** | `supplier@example.com` | `Password123!` | `SUPPLIER` |

*(Note: The login page includes convenient **"Demo Buyer"** and **"Demo Supplier"** quick-fill buttons for instant 1-click evaluation.)*

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL / MariaDB**: `v8.0+` or `MariaDB 10.5+`

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/VamshiYamjala/mini-b2b-rfq-marketplace.git
cd mini-b2b-rfq-marketplace
```

### 2. Configure Backend Environment
Navigate to `backend` and create your local environment file:
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your MySQL credentials:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SESSION_SECRET=local_super_secret_session_key_min_32_chars!
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=b2b_rfq_marketplace
```

### 3. Run Database Migrations & Seeds
Initialize the database tables and sample accounts:
```bash
npm install
npm run db:migrate
```

### 4. Start the Backend API
```bash
npm run dev
# Server will start on http://localhost:5000
```
Verify backend health in browser or curl:
```bash
curl http://localhost:5000/api/health
```

### 5. Configure Frontend Environment & Start
Open a second terminal window:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Frontend will start on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `CLIENT_URL` | Allowed frontend origin for CORS and cookies | `http://localhost:5173` |
| `SESSION_SECRET` | Secret key for signing session cookie | `long_cryptographic_random_string` |
| `DB_HOST` | MySQL hostname or cloud connection host | `localhost` |
| `DB_PORT` | MySQL connection port | `3306` |
| `DB_USER` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database user password | `your_db_password` |
| `DB_NAME` | MySQL database name | `b2b_rfq_marketplace` |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the Express API | `http://localhost:5000` |

---

## Database Migrations & Seeding

The database lifecycle is managed via native scripts:
- **`backend/src/config/db.sql`**: Full DDL defining 3NF schema, foreign keys, cascades, indexes, and unique constraints.
- **`backend/src/config/seed.sql`**: Pre-populates sample test accounts (password: `Password123!`) and sample RFQs.
- **Migration Command**:
  ```bash
  cd backend
  npm run db:migrate
  ```

---

## Automated Testing

The project maintains 100% test passing across integration and scenario test suites.

### 1. Jest + Supertest Suite (25 Tests)
Covers authentication, role authorization, RFQ lifecycle, and quotation constraints:
```bash
cd backend
npm test
```
*Output: 25 passed across 4 test suites.*

### 2. Evaluator 15 Scenarios Suite
Automated execution of all 15 scenarios from Section 20 of the Engineering Specification:
```bash
cd backend
node tests/evaluator_15_scenarios.js
```
*Output: 15/15 Scenarios PASSED (0 FAIL).*

### 3. Security & Validation Audits
```bash
cd backend
node tests/security_audit.js         # SQL injection, HttpOnly cookies, secret leak checks
node tests/validation_error_pass.js  # 16 edge case status code validations
```

---

## API Reference

All responses conform to the standard API response envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```
Validation error responses conform to:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [{ "field": "quantity", "message": "Quantity must be greater than 0" }]
}
```

### Endpoints

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System uptime & live MySQL connectivity verification |
| `POST` | `/api/auth/register` | Public | Register new user as `BUYER` or `SUPPLIER` |
| `POST` | `/api/auth/login` | Public | Authenticate user, regenerate session, issue cookie |
| `POST` | `/api/auth/logout` | Authenticated | Destroy session and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current authenticated user profile |
| `POST` | `/api/rfqs` | `BUYER` | Create a new RFQ (status defaults to `OPEN`) |
| `GET` | `/api/rfqs/my` | `BUYER` | List all RFQs created by the logged-in buyer |
| `GET` | `/api/rfqs/:id` | `BUYER` | Get detailed RFQ record (must be RFQ owner) |
| `PUT` | `/api/rfqs/:id` | `BUYER` | Update RFQ details (blocked if RFQ is closed) |
| `PATCH` | `/api/rfqs/:id/close` | `BUYER` | Close an open RFQ (prevents future quotations) |
| `GET` | `/api/rfqs/:rfqId/quotations`| `BUYER` | View all bids on RFQ (must be RFQ owner) |
| `GET` | `/api/rfqs` | `SUPPLIER` | Browse/search open RFQs (supports `search`, `location`, `page`) |
| `POST` | `/api/rfqs/:rfqId/quotations`| `SUPPLIER` | Submit quotation bid (one per supplier per RFQ) |
| `GET` | `/api/quotations/my` | `SUPPLIER` | View supplier's submitted quotation history |

---

## Security Implementation

- **SQL Injection Prevention**: 100% of queries use parameterized prepared statements via `mysql2/promise`. No string concatenation is used anywhere in SQL generation.
- **Session Protection**:
  - `httpOnly: true` (prevents client-side XSS access to session cookies).
  - `sameSite: 'none'` + `secure: true` in production (enables cross-domain cookie transmission between Vercel and Render).
  - `session.regenerate()` invoked upon login to defeat Session Fixation attacks.
- **Password Security**: Passwords hashed with `bcryptjs` using cost factor 10. Passwords are never returned in API payloads (`SELECT id, name, email, role`).
- **Role-Based Access Control (RBAC)**: Enforced via `requireRole(['BUYER'])` and `requireRole(['SUPPLIER'])` middleware returning immediate `403 Forbidden` on role violations.
- **Business Rule Integrity**:
  - Closed RFQs return `409 Conflict` on edit attempts.
  - Submitting a bid on a closed or expired RFQ returns `409 Conflict`.
  - Submitting a duplicate bid returns `409 Conflict` (enforced at service layer and backstopped by `uq_rfq_supplier` unique database key).

---

## Project Documentation

For in-depth architectural analysis and evaluation guides, refer to:
- [Architecture & Design Details](ARCHITECTURE.md)
- [Technical Decisions & Trade-Offs](TECHNICAL_DECISIONS.md)
- [Technical Interview Defense Guide](TECHNICAL_INTERVIEW.md)
- [Deployment Runbook](DEPLOYMENT.md)
- [100-Point Rubric Self-Audit](FINAL_RUBRIC_AUDIT.md)
- [Level Progress Tracker](PROJECT_PROGRESS.md)
- [Project Changelog](CHANGELOG.md)
