# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- MySQL relational schema with 3NF normalized tables: users, rfqs, quotations, and sessions (Level 1)
- Strict foreign keys, unique constraints (uq_rfq_supplier), check constraints, and performance indexes
- Seed script with sample buyer, supplier, and RFQ
- Migration runner script and db:migrate command
- Initial project structure and tooling skeletons (Level 0)
