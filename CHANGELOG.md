# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Authentication UI: Login and Register pages with client-side validation and role selection (Level 10)
- Quick-fill demo account buttons on login page for evaluator convenience
- authService API helper module
- React / Vite SPA frontend foundation with Bootstrap 5 and React Router (Level 9)
- Axios API client configured with withCredentials: true and base URL from VITE_API_BASE_URL
- AuthContext providing session restoration (/api/auth/me on mount), login, register, and logout
- Role-aware responsive Navbar, ProtectedRoute, and RoleRoute authorization guards
- Shared UI components: Spinner, EmptyState, ErrorState, StatusBadge
- Complete Quotation system: POST /api/rfqs/:rfqId/quotations, GET /api/quotations/my, GET /api/rfqs/:rfqId/quotations (Level 8)
- Enforced single quotation per supplier per RFQ with pre-check and database unique constraint backstop
- Business rules: quotations rejected on closed or expired RFQs (409 Conflict)
- Strict authorization: only suppliers submit quotations, only RFQ owner views all bids, suppliers only view their own bids
- Supplier RFQ discovery endpoint GET /api/rfqs with keyword search, location filtering, and pagination (Level 7)
- Dynamic is_expired computation ensuring passed deadlines are flagged in real-time
- Role-gated supplier access (403 for buyers attempting to access supplier discovery)
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
