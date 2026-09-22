# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Buyer RFQ management endpoints: GET /api/rfqs/my, GET /api/rfqs/:id, PUT /api/rfqs/:id, PATCH /api/rfqs/:id/close (Level 6)
- Service-layer and database-layer ownership validation ensuring buyers can only view, edit, and close their own RFQs
- Enforced business rules: closed RFQs are read-only (409 on edit), double-close prevention (409 on close)
- Quotation count aggregation in /api/rfqs/my response
- Buyer RFQ creation endpoint POST /api/rfqs with strict BUYER role authorization (Level 5)
- Server-side validation for RFQs (product name, description, quantity > 0, delivery location, future deadline)
- RfqModel with parameterized SQL queries and relational join for buyer metadata
- Role-based authorization middleware (requireRole) enforcing strict role access (Level 4)
- Automated authorization matrix tests verifying 403 Forbidden on role mismatch and 401 on unauthenticated access
- Session-based authentication with express-session and MySQL persistent store (Level 3)
- Bcrypt password hashing (cost factor 10) and session fixation protection via session.regenerate()
- Endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- Registration and login validators with comprehensive field checks and multi-error responses
- requireAuth middleware protecting session-authenticated endpoints
- Express backend foundation with configuration loader and validation (Level 2)
- Centralized database connection pool via mysql2/promise
- Standard API response helpers (ok, fail) conforming to spec Section 11 envelope
- Async handler wrapper and centralized error handling middleware
- Public /api/health endpoint verifying live MySQL connectivity and uptime
- MySQL relational schema with 3NF normalized tables: users, rfqs, quotations, and sessions (Level 1)
- Strict foreign keys, unique constraints (uq_rfq_supplier), check constraints, and performance indexes
- Seed script with sample buyer, supplier, and RFQ
- Migration runner script and db:migrate command
- Initial project structure and tooling skeletons (Level 0)
