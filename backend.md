# ⚙️ AssetFlow - Backend Architecture & Implementation Specification

This document serves as the master blueprint for the AssetFlow backend. It defines the technology stack, architectural patterns, workflow state machines, and module specifications required to build a production-grade, scalable Enterprise Asset & Resource Management platform.

---

## 🛠️ Technology Stack

- **Runtime:** Node.js 22+
- **Language:** TypeScript (Strict mode, no `any`)
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT Access Token & JWT Refresh Token (with Refresh Token Rotation)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Documentation:** Swagger / OpenAPI
- **Storage:** Supabase Storage
- **Caching:** Redis
- **Mail:** Nodemailer
- **Logging:** Pino
- **Testing:** Jest & Supertest
- **Package Manager:** pnpm

---

## 🏛️ System Architecture

The backend strictly adheres to **Clean Architecture** principles to separate concerns, ensure testability, and decouple business logic from framework-specific implementation.

```text
Presentation Layer (Controllers) -> NEVER contains business logic
       ↓
Routes & Middlewares (Auth, RBAC, Validation)
       ↓
Application Layer (Services / Use Cases) -> OWNS all business rules
       ↓
Data Access Layer (Repositories) -> NEVER contains validation
       ↓
Infrastructure Layer (Prisma / PostgreSQL / Supabase / Redis)
```

### Project Structure

```text
server/
├── src/
│   ├── config/          # Environment variables, DB connections
│   ├── controllers/     # Route handlers (HTTP req/res)
│   ├── middlewares/     # Auth, RBAC, Error Handling, Rate Limiting
│   ├── repositories/    # Database abstraction layer (Prisma calls)
│   ├── services/        # Core business logic and workflows
│   ├── routes/          # Express route definitions
│   ├── validators/      # Zod schemas for input validation
│   ├── dto/             # Data Transfer Objects
│   ├── interfaces/      # TypeScript interfaces
│   ├── types/           # Custom types
│   ├── utils/           # Utility functions (Hash, JWT, formatting)
│   ├── constants/       # Enums and global constants
│   ├── events/          # Event emitters/listeners
│   ├── jobs/            # Cron jobs (Overdue reminders, cleanup)
│   ├── mail/            # Email templates and Nodemailer setup
│   ├── storage/         # Supabase storage helpers
│   ├── prisma/          # Prisma schema and migrations
│   ├── swagger/         # OpenAPI YAML/JSON configs
│   └── tests/           # Unit, Integration, e2e tests
└── package.json
```

---

## 🔐 Authentication & RBAC

### Authentication Flows
- **JWT Strategy:** Short-lived Access Tokens, long-lived Refresh Tokens.
- **Features:** Register, Login, Logout, Refresh Token Rotation, Forgot Password, Reset Password, Change Password, Profile Management.
- **Security:** Secure HTTP-only cookies, Token Revocation, Password hashing via bcrypt.

### Role-Based Access Control (RBAC)
Roles are strictly defined and verified via middleware.
- **Admin**
- **Asset Manager**
- **Department Head**
- **Employee**

*Rule: No hardcoded role checks inside controllers. Permissions must be middleware-driven to support future expansion.*

---

## 🔄 Workflow State Machines

The backend enforces strict state transitions. Invalid transitions must be rejected by the Service layer.

### 1. Asset Lifecycle
```text
Available ➔ Allocated ➔ Returned ➔ Available
Available ➔ Maintenance ➔ Available
Available ➔ Disposed
```
*(Lost assets cannot be allocated. Disposed assets cannot be edited. Deleted assets use soft-delete).*

### 2. Booking Lifecycle
```text
Pending ➔ Approved ➔ Active ➔ Completed
```

### 3. Maintenance Lifecycle
```text
Pending ➔ Approved ➔ Assigned ➔ In Progress ➔ Resolved ➔ Closed
```

### 4. Audit Lifecycle
```text
Draft ➔ Assigned ➔ In Progress ➔ Completed ➔ Locked
```
*(Audits become immutable after completion. Discrepancies are auto-generated).*

---

## 🔌 API Design Standards

### Base URL: `/api/v1/`

### Consistent Response Formats
**Success Response:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Global Error Handling
A central Error Middleware handles:
- Business Errors
- Zod Validation Errors
- Authentication & Authorization Errors
- Not Found / Conflict
- Database Errors (Prisma exceptions)
- External Service Errors

---

## 📦 Core Modules Implementation Plan

The system is broken down into 15 distinct modules. Each module contains its own Controller, Route, Service, Repository, Validator, DTO, and Tests.

1. **Authentication:** JWT issuance, token rotation, password resets.
2. **Organization:** Master data setup.
3. **Departments:** Department hierarchy, head assignments.
4. **Employees:** User directory, role provisioning.
5. **Categories:** Asset classifications and custom metadata.
6. **Assets:** Registration, soft deletes, lifecycle management, unique tags/serials.
7. **Allocation:** Conflict-free assignment, return inspection enforcement, auto-status updates.
8. **Transfers:** Cross-department approval workflows.
9. **Booking:** Calendar-based reservation, strict overlap validation, start/end time validation.
10. **Maintenance:** Approval routing, technician assignment, status syncing with assets.
11. **Audit:** Immutable verification cycles, auto-generated discrepancy reports.
12. **Dashboard:** Aggregated statistics (Available, Allocated, Lost, Overdue, Top Categories).
13. **Reports:** Utilization, maintenance frequency, asset age, overdue returns.
14. **Notifications:** Email & In-App, scheduled reminders, read/unread states.
15. **Activity Logs:** Immutable tracking of Who, What, When, Entity, Old Value, New Value, IP, Browser.

---

## ⚙️ Background Jobs & Caching

### Cron Jobs (Node-cron)
- **Daily Overdue Reminder:** Flags and emails users with past-due allocations.
- **Warranty Expiry Reminder:** Alerts Asset Managers of upcoming expirations.
- **Audit Reminder:** Notifies assigned auditors of pending tasks.
- **Booking Cleanup:** Automatically marks expired active bookings as complete.

### Redis Caching
- Caches high-traffic endpoints (e.g., Dashboard stats, Asset Categories).
- Invalidates cache on mutating operations (POST, PUT, DELETE).

---

## 🛡️ Security & Performance

- **Security:** Helmet, Rate Limiting, CORS, Compression, Input Sanitization (Zod), Parameterized Queries (Prisma), Secrets Management via `.env`.
- **Performance:** Database transactions for multi-step operations (e.g., Asset Transfer), optimized indexing, Connection Pooling, lazy loading, and solving N+1 query issues.

---

## 📝 Next Steps for Implementation

To build this system in a robust, enterprise-grade manner, developers must follow the exact ordered sequence:
`Auth` ➔ `Org` ➔ `Departments` ➔ `Employees` ➔ `Categories` ➔ `Assets` ➔ `Allocations` ➔ `Transfers` ➔ `Bookings` ➔ `Maintenance` ➔ `Audit` ➔ `Dashboard` ➔ `Reports` ➔ `Notifications` ➔ `Activity Logs`.

Every module must compile successfully, pass validation, and be documented in Swagger before proceeding to the next.
