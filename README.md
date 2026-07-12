# 📦 AssetFlow
**Enterprise Asset & Resource Management System**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

**AssetFlow** is a modern, centralized ERP platform engineered to simplify and digitize how organizations track, allocate, and maintain physical assets and shared resources. Built with clean architecture, intuitive user experience, and enterprise-grade security.

---

## 📑 Table of Contents

- [About the Project](#about-the-project)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Complete Workflow](#complete-workflow)
- [Core Modules](#core-modules)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [Project Workflow](#project-workflow)
- [Future Scope](#future-scope)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [License](#license)
- [Author](#author)

---

## 🚀 About the Project

**Vision**

To simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources through a robust, centralized ERP platform that's industry-agnostic and scalable.

**Motivation**

Organizations often rely on outdated manual methods—like spreadsheets and paper logs—which lead to:
- Double-allocations and scheduling conflicts
- Missing or misplaced inventory
- Neglected maintenance cycles
- Lack of real-time visibility into asset condition and ownership

**Objectives**

Deliver core ERP functionality featuring:
- Scalable module design
- Structured asset lifecycles
- Centralized resource booking
- Completely decoupled from accounting and invoicing

**Solution**

A user-centric, responsive web application providing:
- Intuitive master data management
- Conflict-free asset allocation
- Calendar-based resource booking
- Automated audit verification with discrepancy reporting

---

## 🎯 Problem Statement

Design and develop an Enterprise Asset & Resource Management System capable of streamlining physical resource handling across an organization. The system must:

1. **Maintain centralized master data** for departments, categories, and employees
2. **Track assets** across a flexible, multi-state lifecycle:
   - Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
3. **Facilitate allocations and bookings** with absolute prevention of overlapping schedules or double-allocations
4. **Route maintenance requests** through a structured approval hierarchy
5. **Execute audit cycles** with automated discrepancy reporting
6. **Surface actionable insights** through KPI dashboards and automated notifications

---

## ✨ Key Features

### 🔐 Authentication & Security
- Secure, authorized access control
- Standard employees cannot self-elevate permissions
- Strict compliance with internal hierarchies

### 📊 Real-Time Dashboard
- Operational snapshot tailored to user role
- Live KPI cards: Assets Available, Pending Transfers, Active Bookings, Overdue Returns
- Accelerated decision-making with urgent bottleneck highlighting

### 🏢 Organization Master Data
- Departmental hierarchy management
- Customizable asset categories (warranty periods, metadata)
- Centralized employee directory with status tracking
- Single source of truth for the entire ERP system

### 📦 Asset Registration & Tracking
- Auto-generated Asset Tags
- Photo uploads and serial number tracking
- Complete historical audit trails
- Prevents inventory loss with total visibility into asset lifecycle

### 🔄 Conflict-Free Allocation
- Strict conflict rules blocking double-allocations
- Complete transfer workflow: Request → Approve → Re-allocate
- Return condition check-ins
- Ensures accountability and prevents scheduling conflicts

### 📅 Resource Booking
- Visual calendar interface
- Programmatic overlap validation
- Time-slot based shared resources (rooms, projectors, vehicles)
- Maximizes utilization without administrative overhead

### 🛠️ Maintenance Workflow
- Multi-stage workflow: Pending → Approved → Assigned → Resolved
- Automatic asset availability state updates
- Protects against accidental allocation of broken items
- Prolongs asset lifespan

### 📋 Audit Cycles
- Scope-based audit creation
- Auditor assignment
- Automatic discrepancy generation
- Streamlines compliance and maintains data integrity

### 📈 Reports & Analytics
- Utilization trends and heatmaps
- Department-wise summaries
- Exportable reports
- Data-driven procurement and retirement planning

---

## 👥 User Roles

AssetFlow implements strict Role-Based Access Control (RBAC):

### Admin
**Responsibilities:** Manages Organization Setup (master data for departments, asset categories, and audit cycles)
- Only role capable of promoting employees to Asset Manager or Department Head
- Views organization-wide analytics

### Asset Manager
**Responsibilities:** Core operator of the system
- Registers new assets
- Executes allocations
- Approves transfers, maintenance requests, and audit discrepancies
- Approves asset returns and notes

### Department Head
**Responsibilities:** Oversees a specific department's resource pool
- Views all assets allocated to their department
- Approves internal departmental transfer requests
- Books shared resources on behalf of the team

### Employee
**Responsibilities:** Standard end-user
- Views personal allocated assets
- Books shared resources by time slot
- Raises maintenance requests
- Initiates return/transfer requests

---

## 🔄 Complete Workflow

### Step-by-Step Lifecycle

1. **Setup:** Admin creates departments and asset categories, then promotes users to management roles
2. **Ingestion:** Asset Managers register new assets, generating Asset Tags and marking status
3. **Distribution:** Assets are allocated to employees with conflict prevention
4. **Utilization:** Employees book shared resources with overlap validation
5. **Upkeep:** Maintenance requests route through approval and automatic state updates
6. **Reconciliation:** Periodic audit cycles with auto-generated discrepancy reports

### Asset Lifecycle States
- **Creation** → Employee signs up → Admin assigns role
- **Onboarding** → Asset Registered (State: `Available`)
- **Assignment** → Asset Allocated (State: `Allocated`) OR Asset Booked (State: `Reserved`)
- **Degradation** → Asset breaks (State: `Under Maintenance`)
- **Recovery** → Asset repaired (State: `Available`)
- **Verification** → Asset audited (State: `Lost`, `Retired`, or `Disposed`)

### Workflow Diagram

```mermaid
graph TD
    A[Admin: Setup Master Data & Assign Roles] --> B[Asset Manager: Registers Asset]
    B --> C{Asset Type & Status}
    
    C -->|Shared/Bookable| D[Employee: Books Resource]
    D --> E{Overlap Exists?}
    E -->|Yes| F[Booking Rejected]
    E -->|No| G[Booking Confirmed]
    
    C -->|Available| H[Asset Manager: Allocates Asset]
    H --> I[Employee: Custody of Asset]
    
    I --> J{Asset Condition?}
    J -->|Needs Repair| K[Raise Maintenance Request]
    K --> L[Asset Manager: Approves Repair]
    L --> M[Status: Under Maintenance]
    M -->|Resolved| C
    
    J -->|No Longer Needed| N[Initiate Return/Transfer]
    N --> O[Asset Manager: Approves Return]
    O --> C
    
    C --> P[Asset Manager: Initiates Audit Cycle]
    P --> Q[Auditor: Verifies Asset Status]
    Q --> R{Status Matches?}
    R -->|Yes| S[Audit Passed]
    R -->|No| T[Auto-Generate Discrepancy Report]
```

---

## 🧩 Core Modules

| Module | Purpose |
|--------|---------|
| **Authentication** | Secure onboarding with privilege management |
| **Dashboard** | Operational hub with KPI cards and overdue event highlights |
| **Organization Setup** | Admin-exclusive department hierarchy and category configuration |
| **Asset Management** | Registry for physical items with metadata and lifecycle logs |
| **Asset Allocation** | Custody engine with conflict rules and transfer approvals |
| **Resource Booking** | Calendar-driven interface with overlap validation |
| **Maintenance** | Multi-stage routing for repair requests and resolution |
| **Audit** | Compliance module for physical inventory verification |
| **Reports** | Analytics engine for utilization and departmental insights |
| **Notifications** | System alerts for overdue returns, reminders, and approvals |

---

## 💻 Technology Stack

| Technology | Role | Purpose |
|:-----------|:-----|:--------|
| **React.js** | Frontend Library | Interactive, component-driven user interface |
| **Vite** | Build Tool | Ultra-fast hot module replacement and optimized builds |
| **Tailwind CSS** | Styling | Responsive, utility-first UI development |
| **Node.js** | Runtime | Fast, scalable JavaScript backend |
| **Express.js** | Backend Framework | Robust RESTful APIs and business logic |
| **PostgreSQL** | Database | Complex relational data with ACID compliance |
| **Prisma ORM** | Database Access | Type-safe querying and schema migrations |
| **Supabase Storage** | File Storage | Secure hosting for photos and documents |

---

## 🏗️ System Architecture

```mermaid
graph LR
    subgraph Frontend["🖥️ Frontend Client"]
        UI["React.js UI Components"]
        State["State Management"]
        Router["Client Router"]
        UI <--> State
        State <--> Router
    end

    subgraph Backend["⚙️ Backend Server"]
        API["Express.js REST API"]
        Auth["Auth & Role Middleware"]
        Logic["Business Logic Controllers"]
        API <--> Auth
        Auth <--> Logic
    end

    subgraph Data["💾 Data Layer"]
        ORM["Prisma Client"]
        DB["PostgreSQL Database"]
        Store["Supabase Storage"]
    end

    Router <-->|HTTP / JSON| API
    Logic <--> ORM
    ORM <--> DB
    Logic <-->|Upload Photos/Docs| Store
```

---

## 📁 Folder Structure

```
AssetFlow_system/
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, global styles
│   │   ├── components/              # Reusable UI components
│   │   ├── features/                # Feature modules (Assets, Bookings, Auth)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── layouts/                 # Page layout wrappers
│   │   ├── pages/                   # Route entry points
│   │   ├── services/                # API integration
│   │   ├── store/                   # Global state management
│   │   └── utils/                   # Helper functions
│   ├── index.html
│   └── vite.config.js
│
├── backend/                          # Node.js Backend Application
│   ├── prisma/                      # Prisma schema and migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/                  # Environment and service configs
│   │   ├── controllers/             # Request handlers
│   │   ├── middlewares/             # Express middlewares
│   │   ├── routes/                  # API route definitions
│   │   ├── services/                # Core business logic
│   │   └── utils/                   # Error handlers, loggers
│   ├── .env
│   └── server.js
│
├── package.json
└── README.md
```

---

## 🗄️ Database Design

**Core Entities:**

- **Users (Employees):** Credentials, roles (Admin, Manager, Head, Employee), Department reference
- **Departments:** Hierarchical structure with parent/child relationships
- **Asset Categories:** Master list of asset types with custom metadata
- **Assets:** Asset Tags, condition, acquisition details, status, Category and User/Department references
- **Allocations & Transfers:** History of asset assignments, expected return dates, approvals
- **Bookings:** Time-slot reservations with overlap prevention
- **Maintenance Requests:** Repair tickets with priority, description, and status
- **Audits:** Audit cycles with date ranges, locations, and discrepancy reports
- **Activity Logs:** Append-only ledger for system accountability

---

## ⚙️ Project Workflow

1. **Initialization**
   - Platform deployed
   - Root Admin configures organizational structure

2. **Onboarding**
   - Staff create accounts
   - Admin elevates staff to management roles

3. **Inventory Population**
   - Asset Managers tag and photograph items
   - Register assets into the system

4. **Daily Operations**
   - Employees request assets or book resources
   - Department heads approve transfers
   - Managers monitor overdue returns

5. **Lifecycle Events**
   - Assets routed to maintenance
   - Quarterly audits resolve discrepancies

---

## 🚀 Future Scope

Potential enhancements include:

- **Hardware Integrations:** QR Scanner, Barcode, RFID for mobile check-outs
- **AI & Analytics:** Predictive maintenance based on repair patterns
- **Mobile App:** React Native application for field auditors
- **Real-time Comms:** Push notifications and WebSocket integrations
- **Offline Mode:** Sync capabilities for remote audits without internet

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Omikparekh/AssetFlow_system.git
   cd AssetFlow_system
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   
   # Configure your .env file (see Environment Variables section)
   
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   
   # Configure your .env file (see Environment Variables section)
   
   npm run dev
   ```

4. **Access the application:**
   - Frontend: `http://localhost:5173` (Vite default)
   - Backend: `http://localhost:5000`

---

## 🔐 Environment Variables

Create `.env` files in both `client` and `server` directories.

**Server (`server/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow?schema=public"
JWT_SECRET="your_super_secret_jwt_string"
JWT_EXPIRY="7d"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
NODE_ENV="development"
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

⚠️ **Security Note:** Never commit `.env` files with actual secrets to version control. Use `.env.example` for reference.

---

## 📸 Screenshots

> Screenshots will be updated after implementation and UI development are finalized.

| Section | Preview |
|:--------|:--------|
| **Login & Authentication** | *(Screenshot placeholder)* |
| **Operational Dashboard** | *(Screenshot placeholder)* |
| **Asset Registration** | *(Screenshot placeholder)* |
| **Resource Booking** | *(Screenshot placeholder)* |
| **Maintenance Workflow** | *(Screenshot placeholder)* |
| **Audit Management** | *(Screenshot placeholder)* |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author

**AssetFlow** is designed and architected as a complete Enterprise Asset & Resource Management solution.

Built with a focus on:
- ✅ Scalable architecture
- ✅ Seamless user experience
- ✅ Robust backend engineering
- ✅ Enterprise-grade security

---

**Last Updated:** July 2026

For questions or contributions, please open an issue or contact the development team.
