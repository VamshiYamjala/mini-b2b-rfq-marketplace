# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
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
