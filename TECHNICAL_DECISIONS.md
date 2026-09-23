# Technical Decisions & Architectural Trade-offs

This document details the architectural choices, engineering trade-offs, and design rationales made during the development of the Mini B2B RFQ Marketplace.

---

## 1. Session-Based Authentication vs. JSON Web Tokens (JWT)

### Decision
We implemented **stateful session-based authentication** using `express-session` with a persistent MySQL session store (`express-mysql-session`), signed HTTP-only cookies, and session fixation protection.

### Comparison & Trade-off Analysis
| Factor | Stateful Sessions (Our Choice) | Stateless JWTs |
| :--- | :--- | :--- |
| **Revocation** | **Immediate**: Deleting the session row in MySQL instantly logs out the user on all devices. | **Difficult**: Requires distributed token blacklists or short expiration intervals with refresh token rotation. |
| **Security Surface** | **Minimal**: Session ID is an opaque cryptographic token stored in an `HttpOnly`, `Secure`, `SameSite=None` cookie inaccessible to JavaScript. | **Elevated**: If stored in `localStorage`, vulnerable to XSS. If stored in cookies, payload still visible to anyone inspecting tokens. |
| **Data Staleness** | **None**: The user's role and status are validated on each request against current database state. | **High**: Role changes (e.g. account suspension) are not reflected until the token expires. |
| **Complexity** | Simple server-side session management with automatic DB cleanup. | High architectural overhead for refresh tokens and edge synchronization. |

### Rationale
In enterprise B2B procurement, access control integrity is paramount. If a supplier or buyer account is suspended or logged out, access must terminate immediately. Stateful sessions backed by MySQL provide immediate revocation and tamper immunity without requiring Redis or complex token invalidation infrastructure.

---

## 2. Raw Parameterized SQL (`mysql2/promise`) vs. Object-Relational Mapping (ORM)

### Decision
We chose **raw parameterized SQL** via `mysql2/promise` over modern ORMs (such as Prisma, TypeORM, or Sequelize).

### Comparison & Trade-off Analysis
| Factor | Raw Parameterized SQL (Our Choice) | Heavyweight ORM |
| :--- | :--- | :--- |
| **SQL Injection Immunity** | **100% Guaranteed**: All dynamic parameters use prepared statements (`?` placeholders) executed via `pool.execute()`. | Often protected, but complex raw queries in ORMs can introduce subtle vulnerabilities. |
| **Query Performance & Control** | Full transparency: exact control over `LEFT JOIN`, `COUNT()`, subqueries, and index hints. | Risk of silent N+1 query patterns or inefficient sub-optimal joins. |
| **Code Footprint & Overhead** | Zero runtime overhead; fast startup times; minimal node_modules footprint. | Significant build-time compilation overhead, schema generation steps, and engine binaries. |
| **Schema Alignment** | SQL migration files (`db.sql`) serve as the single source of truth for tables, constraints, and indexes. | Schema drift risk between ORM schema file and actual relational database state. |

### Rationale
By writing explicit, parameterized SQL queries, we maintain full visibility over execution plans and ensure exact utilization of composite indexes (such as `idx_rfqs_status_deadline` and `uq_rfq_supplier`). This eliminates ORM abstraction leakage while delivering top-tier database performance.

---

## 3. React 18 + Vite + Bootstrap 5 vs. Tailwind CSS / Material UI

### Decision
We selected **React 18 with Vite and Bootstrap 5**, paired with bespoke CSS enhancements for micro-interactions and accessibility.

### Comparison & Trade-off Analysis
| Factor | Bootstrap 5 + Custom CSS (Our Choice) | Tailwind CSS / Material UI |
| :--- | :--- | :--- |
| **B2B UI Suitability** | Standard tabular views, structured input forms, modal cards, and responsive grids fit enterprise workflows out-of-the-box. | Requires extensive composition of utility classes or heavy component runtime bloat. |
| **Development Velocity** | Semantic class names (`badge`, `table-hover`, `card`, `btn-outline-primary`) accelerate clean dashboard development. | High cognitive load memorizing extensive utility strings; MUI components introduce large bundle sizes. |
| **Bundle Size & Speed** | Vite provides sub-second hot module reloading and lightweight production builds (~250 KB minified). | Full component libraries like MUI often introduce 1 MB+ bundle overhead. |

### Rationale
Enterprise procurement dashboards prioritize structured data density, accessible forms, and unambiguous status indicators over consumer animations. Bootstrap 5 provides a reliable, robust design system that fulfills all assignment aesthetic requirements without third-party bundle bloat.

---

## 4. Layered Architecture (Controller-Service-Model) vs. Monolithic Route Handlers

### Decision
We implemented a strict **four-layer architectural pattern**: Routes ➔ Controllers ➔ Services ➔ Models.

### Architecture Breakdown
1. **Routes**: Define URL paths, HTTP verbs, and bind authorization/validation middleware.
2. **Controllers**: Parse and sanitize HTTP parameters (`req.params`, `req.body`, `req.query`), invoke services, and wrap responses in the standard `{ success, data, message }` envelope.
3. **Services**: Contain pure business logic (verifying buyer ownership, evaluating expiration deadlines, blocking closed RFQ edits).
4. **Models**: Pure data access layer executing parameterized SQL against `mysql2/promise` pool.

### Rationale
Monolithic route handlers in Express quickly become unmaintainable and impossible to unit test. By decoupling business logic into a dedicated Service layer, domain rules can be tested in isolation without mocking the entire HTTP request lifecycle.

---

## 5. MySQL Relational Schema (3NF) vs. Document NoSQL (MongoDB)

### Decision
We implemented a normalized **MySQL relational schema** in Third Normal Form (3NF).

### Comparison & Trade-off Analysis
| Factor | MySQL Relational Schema (Our Choice) | Document NoSQL (MongoDB) |
| :--- | :--- | :--- |
| **Data Integrity** | Enforced at the engine level via Foreign Keys, `ON DELETE CASCADE`, and `CHECK` constraints. | Referential integrity must be manually maintained in application code. |
| **Unique Constraint Enforceability** | Composite unique constraint `uq_rfq_supplier (rfq_id, supplier_id)` strictly prohibits duplicate supplier bids. | Compound index in MongoDB lacks foreign key enforcement and cascade cleanup. |
| **Financial Precision** | Exact `DECIMAL(10, 2)` column types prevent IEEE-754 floating-point rounding errors on quotation prices. | Default JSON floating-point numbers can introduce decimal rounding errors. |
| **ACID Guarantees** | Complete transaction support ensuring multi-row consistency during bid submissions. | Eventual consistency or complex multi-document transaction syntax. |

### Rationale
In procurement platforms, quotation pricing, deadlines, and single-bid limits must be mathematically precise and tamper-proof. MySQL's relational engine guarantees referential and financial integrity.

---

## 6. Real-Time Dynamic Expiration vs. Scheduled Background Cron Jobs

### Decision
We evaluate RFQ expiration **dynamically at query time** using SQL timestamp comparison (`deadline < NOW()`) and service-layer timestamp evaluation (`new Date(rfq.deadline) < new Date()`), rather than relying solely on a cron daemon.

### Comparison & Trade-off Analysis
| Factor | Dynamic Real-Time Evaluation (Our Choice) | Background Cron Job |
| :--- | :--- | :--- |
| **Precision** | Sub-millisecond accuracy: the exact second a deadline elapses, bids are rejected. | Stale window between cron runs (e.g. 1 to 5 minute delay). |
| **Infrastructure Overhead** | Zero extra infrastructure: no cron runners, worker containers, or task queues. | Requires persistent cron process, Redis worker, or cloud scheduler. |
| **Failure Modes** | Immune to worker process crashes or scheduler restarts. | If the cron worker dies, expired RFQs remain open indefinitely. |

### Rationale
By evaluating `is_expired` in real time during `GET /api/rfqs` and rejecting bids in `QuotationService` if `new Date(rfq.deadline) < new Date()`, we eliminate any race condition window where an expired RFQ might accept bids before a cron job fires.
