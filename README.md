# 📦 AssetFlow
### Enterprise Asset & Resource Management System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

**AssetFlow** is a modern, centralized ERP platform engineered to simplify and digitize how organizations track, allocate, and maintain physical assets and shared resources. Designed with a clean architecture and role-based workflows, AssetFlow eliminates manual tracking inefficiencies and provides real-time visibility into asset lifecycles, ensuring seamless operations for any organization.

---

## 📑 Table of Contents

- [About the Project](#about-the-project)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Complete Workflow](#complete-workflow)
- [Core Modules](#core-modules)
- [Technology Stack](#technology-stack)
- [Proposed System Architecture](#proposed-system-architecture)
- [Proposed Folder Structure](#proposed-folder-structure)
- [Proposed Database Design](#proposed-database-design)
- [Project Workflow](#project-workflow)
- [Future Scope](#future-scope)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [License](#license)
- [Author](#author)

---

## 🚀 About the Project

**Vision:** To simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources through a robust, centralized ERP platform. AssetFlow is industry-agnostic, ready to serve schools, hospitals, offices, factories, and government agencies.

**Motivation:** Organizations often rely on outdated manual methods—like spreadsheets and paper logs—which lead to double-allocations, missing inventory, and neglected maintenance. 

**Objectives:** To deliver core ERP functionality featuring scalable module design, structured asset lifecycles, and centralized resource booking, completely decoupled from accounting and invoicing concerns.

**Business Problem:** A lack of real-time visibility into asset condition, location, and ownership causes immense operational friction. 

**Solution:** A user-centric, responsive web application that provides intuitive tools for master data management, conflict-free asset allocation, calendar-based resource booking, and automated audit cycles.

---

## 🎯 Problem Statement

Design and develop an Enterprise Asset & Resource Management System capable of streamlining physical resource handling across an organization. The system must:

1. Maintain centralized master data (departments, categories, and employees).
2. Track assets across a flexible, multi-state lifecycle (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed).
3. Facilitate asset allocations and shared resource bookings with absolute prevention of overlapping schedules or double-allocations.
4. Route maintenance and repair requests through a structured approval hierarchy.
5. Execute scheduled, assigned audit verification cycles complete with automated discrepancy reporting.
6. Surface actionable insights through a KPI dashboard and automated notifications for overdue returns and activities.

---

## ✨ Key Features

### 🔐 Authentication & Security
* **Purpose:** Ensure secure, authorized access.
* **Benefits:** Realistic account creation where standard employees cannot self-elevate permissions.
* **Business Value:** Protects organizational data and ensures strict compliance with internal hierarchies.

### 📊 Real-Time Dashboard
* **Purpose:** Provide an operational snapshot tailored to the user's role.
* **Benefits:** Live KPI cards displaying Assets Available, Pending Transfers, Active Bookings, and Overdue Returns.
* **Business Value:** Accelerates decision-making and highlights urgent operational bottlenecks immediately.

### 🏢 Organization Master Data
* **Purpose:** Maintain the foundational architecture of the company.
* **Benefits:** Centralized management of departmental hierarchies, customizable asset categories (e.g., warranty periods), and employee directory statuses.
* **Business Value:** Creates a single source of truth that powers the entire ERP system.

### 📦 Asset Registration & Tracking
* **Purpose:** Digitally ingest and monitor physical assets.
* **Benefits:** Auto-generated Asset Tags, photo uploads, serial number tracking, and complete historical audit trails.
* **Business Value:** Prevents inventory loss and provides total visibility into an asset's lifetime value and current state.

### 🔄 Conflict-Free Allocation
* **Purpose:** Manage custody of physical items.
* **Benefits:** Strict conflict rules block double-allocations. Features a complete transfer workflow (Request → Approve → Re-allocate) and return condition check-ins.
* **Business Value:** Ensures accountability for corporate property and prevents scheduling gridlock.

### 📅 Resource Booking
* **Purpose:** Manage time-slot based shared resources (rooms, projectors, vehicles).
* **Benefits:** Visual calendar interface with programmatic overlap validation.
* **Business Value:** Maximizes the utilization of shared company assets without administrative overhead.

### 🛠️ Maintenance Workflow
* **Purpose:** Handle asset degradation and repairs.
* **Benefits:** Multi-stage workflow (Pending → Approved → Technician Assigned → Resolved) that automatically updates the asset's availability state.
* **Business Value:** Prolongs asset lifespan and ensures broken items are never accidentally allocated.

### 📋 Audit Cycles
* **Purpose:** Conduct physical inventory checks.
* **Benefits:** Scope-based audit creation, auditor assignment, and automatic discrepancy generation for missing or damaged goods.
* **Business Value:** Streamlines compliance, identifies shrinkage, and maintains data integrity.

### 📈 Reports & Analytics
* **Purpose:** Deliver actionable operational insights.
* **Benefits:** Utilization trends, maintenance frequency heatmaps, and exportable department-wise summaries.
* **Business Value:** Enables data-driven procurement and retirement planning.

---

## 👥 User Roles

AssetFlow implements strict Role-Based Access Control (RBAC):

1. **Admin**
   * **Responsibilities:** Manages the Organization Setup (master data for departments, asset categories, and audit cycles).
   * **Permissions:** The *only* role capable of promoting a standard Employee to an Asset Manager or Department Head. Views organization-wide analytics.

2. **Asset Manager**
   * **Responsibilities:** The core operator of the system.
   * **Permissions:** Registers new assets, executes allocations, and approves transfers, maintenance requests, and audit discrepancy resolutions. Approves asset returns and notes.

3. **Department Head**
   * **Responsibilities:** Oversees a specific department's resource pool.
   * **Permissions:** Views all assets allocated to their department. Approves internal departmental transfer requests and books shared resources on behalf of their team.

4. **Employee**
   * **Responsibilities:** The standard end-user.
   * **Permissions:** Views their personal allocated assets, books shared resources by time slot, raises maintenance requests, and initiates return/transfer requests.

---

## 🔄 Complete Workflow

### Detailed Explanation
1. **Setup:** The Admin creates the departments and asset categories, then promotes specific registered users to management roles.
2. **Ingestion:** Asset Managers register new assets into the system, generating an Asset Tag and marking them as *Available* or *Shared/Bookable*.
3. **Distribution:** Assets are allocated to employees. If a requested asset is already held, the system blocks the action and prompts a Transfer Request instead.
4. **Utilization:** Employees book shared resources via a calendar, with the system rejecting any overlapping time slots.
5. **Upkeep:** If an item breaks, the employee raises a Maintenance Request. The Asset Manager approves it, automatically shifting the asset state to *Under Maintenance*.
6. **Reconciliation:** Asset Managers initiate periodic Audit Cycles. Assigned auditors physically verify the assets, and the system locks the cycle, auto-generating discrepancy reports for missing items.

### Mermaid Flowchart

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

### Step-by-Step Lifecycle
1. **Creation:** Employee signs up -> Admin assigns role.
2. **Onboarding:** Asset Registered (State: `Available`).
3. **Assignment:** Asset Allocated (State: `Allocated`) OR Asset Booked (State: `Reserved`).
4. **Degradation:** Asset breaks (State: `Under Maintenance`).
5. **Recovery:** Asset repaired (State: `Available`).
6. **Verification:** Asset audited. If not found (State: `Lost`). If end-of-life (State: `Retired` or `Disposed`).

---

## 🧩 Core Modules

* **Authentication:** Handles secure onboarding. Only standard employee accounts are created at signup; privileges must be granted by an Admin.
* **Dashboard:** The operational hub providing KPI cards and highlighting overdue events to ensure immediate action.
* **Organization Setup:** Admin-exclusive module to establish department hierarchies, define category metadata, and manage the user directory.
* **Asset Management:** The registry for all physical items, holding metadata (tags, acquisition cost, photos) and historical lifecycle logs.
* **Asset Allocation:** The custody engine enforcing conflict rules. Manages the lifecycle of expected return dates, check-in conditions, and transfer approvals.
* **Resource Booking:** A calendar-driven interface that strictly prevents time-slot overlaps for shared resources.
* **Maintenance:** A routing module that moves repair requests through a structured approval and resolution pipeline, protecting asset integrity.
* **Audit:** A compliance module allowing managers to lock in date ranges and assign auditors to verify physical inventory against digital records.
* **Reports:** An analytics engine generating insights on asset utilization, departmental holding summaries, and upcoming maintenance schedules.
* **Notifications:** The system's nervous system, dispatching alerts for overdue returns, booking reminders, and required workflow approvals.

---

## 💻 Technology Stack

| Technology | Role | Purpose |
| :--- | :--- | :--- |
| **React.js** | Frontend Library | Building a highly interactive, component-driven user interface. |
| **Vite** | Build Tool | Ensuring ultra-fast hot module replacement (HMR) and optimized production builds. |
| **Tailwind CSS** | Styling | Rapid, utility-first UI development to ensure a responsive, modern aesthetic. |
| **Node.js** | Runtime | Fast, scalable JavaScript runtime for the backend server. |
| **Express.js** | Backend Framework | Creating robust RESTful APIs to handle business logic and routing. |
| **PostgreSQL** | Relational Database | Storing complex relational master data with high reliability and ACID compliance. |
| **Prisma ORM** | Object-Relational Mapper | Type-safe database querying and simplified schema migrations. |
| **Supabase Storage** | File Storage | Securely hosting asset photographs, condition reports, and user documents. |

---

## 🏗️ Proposed System Architecture

> *Conceptual representation based on the designated technology stack.*

```mermaid
graph LR
    subgraph Frontend Client
        UI[React.js UI Components]
        State[State Management]
        Router[Client Router]
        UI <--> State
        State <--> Router
    end

    subgraph Backend Server
        API[Express.js REST API]
        Auth[Auth & Role Middleware]
        Logic[Business Logic Controllers]
        API <--> Auth
        Auth <--> Logic
    end

    subgraph Data Layer
        ORM[Prisma Client]
        DB[(PostgreSQL Database)]
        Store[Supabase File Storage]
    end

    Router <-->|HTTP / JSON| API
    Logic <--> ORM
    ORM <--> DB
    Logic <-->|Upload Photos/Docs| Store
```

---

## 📁 Proposed Folder Structure

> *This is a recommended enterprise monorepo structure and may differ from the final implementation.*

```text
assetflow-workspace/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, icons, global styles
│   │   ├── components/         # Reusable UI components (Buttons, Modals)
│   │   ├── features/           # Feature-based modules (Assets, Bookings, Auth)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layout wrappers (DashboardLayout, AuthLayout)
│   │   ├── pages/              # Route entry points
│   │   ├── services/           # API integration and HTTP clients
│   │   ├── store/              # Global state management
│   │   └── utils/              # Helper functions and formatters
│   ├── index.html
│   └── vite.config.js
├── server/                     # Node.js Backend Application
│   ├── prisma/                 # Prisma schema and migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/             # Environment and external service configs
│   │   ├── controllers/        # Request handlers (AssetController, AuthController)
│   │   ├── middlewares/        # Express middlewares (Auth Guard, Role Check)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Core business logic
│   │   └── utils/              # Error handlers, loggers
│   ├── .env                    # Server environment variables
│   └── server.js               # Application entry point
├── package.json
└── README.md
```

---

## 🗄️ Proposed Database Design

> *Conceptual Entity-Relationship breakdown based on the problem statement.*

* **Users (Employees):** Stores credentials, roles (Admin, Manager, Head, Employee), and references their Department.
* **Departments:** Hierarchical structure (supports Parent/Child departments).
* **Asset Categories:** Master list of asset types, storing optional custom metadata requirements.
* **Assets:** The core entity. Stores Asset Tag, condition, acquisition details, status, and references Category and current holding User/Department.
* **Allocations / Transfers:** Join table tracking the history of an asset's assignment, expected return dates, and transfer approvals.
* **Bookings:** Tracks time-slots, referencing the User and the shared Asset, ensuring no time overlaps exist.
* **Maintenance Requests:** Tracks repair tickets, linking an Asset to a priority level, description, and status.
* **Audits:** Defines an audit cycle (date range, location) and links to multiple Discrepancy Reports for flagged assets.
* **Activity Logs:** Append-only ledger tracking all administrative and operational actions for system accountability.

---

## ⚙️ Project Workflow

1. **Initialization:** The platform is deployed. The root Admin configures the organizational structure (Departments & Categories).
2. **Onboarding:** Staff create accounts. The Admin reviews the directory and elevates specific staff to Department Heads or Asset Managers.
3. **Inventory Population:** Asset Managers physically tag items, upload photos to Supabase, and register them into PostgreSQL via Prisma.
4. **Daily Operations:** 
   * Employees search the directory and request laptops or book conference rooms.
   * Department heads approve cross-departmental transfers.
   * Managers monitor the dashboard for overdue returns.
5. **Lifecycle Events:** Assets break and are routed to Maintenance. Audits are triggered quarterly to resolve physical vs. digital discrepancies.

---

## 🚀 Future Scope

While the current system delivers comprehensive ERP functionality, future enhancements could include:

* **Hardware Integrations:** QR Scanner, Barcode Support, and RFID integration for instant mobile asset check-outs.
* **AI & Analytics:** AI-driven predictive maintenance based on repair frequency patterns.
* **Mobility:** A dedicated Mobile Application (React Native) for field auditors and on-the-go maintenance requests.
* **Real-time Comms:** Native Push Notifications and WebSocket integrations for instant workflow alerts.
* **Offline Mode:** Offline sync capabilities for conducting audits in basements or remote locations without internet access.

---

## 🛠️ Installation

> *Generic setup instructions for this React + Node + PostgreSQL stack. Commands may require adjustment based on the final repository structure.*

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/AssetFlow.git
   cd AssetFlow
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   # Configure your .env file here
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   # Configure your .env file here
   npm run dev
   ```

---

## 🔐 Environment Variables

Ensure you create `.env` files in both the `client` and `server` directories.

**Server (`server/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow?schema=public"
JWT_SECRET="your_super_secret_jwt_string"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```
*(Do not commit actual secrets to version control)*

---

## 📸 Screenshots

> *This section will be updated with application screenshots after the implementation and UI development are finalized.*

| Login & Authentication | Operational Dashboard |
| :---: | :---: |
| *(Screenshot placeholder)* | *(Screenshot placeholder)* |

| Asset Registration | Resource Booking |
| :---: | :---: |
| *(Screenshot placeholder)* | *(Screenshot placeholder)* |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author

Designed and architected as a complete Enterprise Asset & Resource Management solution. 
Built with a focus on scalable architecture, seamless user experience, and robust backend engineering.
#   A s s e t F l o w _ s y s t e m  
 