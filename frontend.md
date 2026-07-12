# 🖥️ AssetFlow - Frontend Architecture & Implementation Specification

This document serves as the master blueprint for the AssetFlow frontend. It defines the technology stack, application architecture, component standards, and module specifications required to build a production-grade, scalable Enterprise Asset & Resource Management platform, aiming for quality comparable to SAP Fiori, Oracle NetSuite, and Atlassian Jira.

---

## 🛠️ Technology Stack

- **Framework:** React 19
- **Language:** TypeScript (Strict mode)
- **Bundler:** Vite
- **Styling:** TailwindCSS
- **UI Library:** shadcn/ui
- **Icons:** Lucide React
- **Routing:** React Router DOM v7
- **Server State:** TanStack React Query
- **Forms:** React Hook Form
- **Validation:** Zod
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Notifications:** Sonner
- **Date Utilities:** date-fns

---

## 🏛️ Application Architecture

The frontend strictly adheres to **Feature-First Architecture**. Code is organized by business domain rather than file type to ensure maintainability at an enterprise scale.

### Project Structure

```text
client/
├── src/
│   ├── app/             # Global app configuration, providers, router setup
│   ├── assets/          # Static assets (images, fonts, global CSS)
│   ├── components/      # Shared/Global UI components (Buttons, Inputs, Modals)
│   ├── features/        # Feature-based domains (Assets, Bookings, Auth)
│   ├── hooks/           # Global custom hooks
│   ├── layouts/         # Page layout wrappers
│   ├── pages/           # High-level route entry points
│   ├── routes/          # Route configurations and guards
│   ├── services/        # Global API configurations and HTTP clients
│   ├── contexts/        # React Context providers (Auth, Theme)
│   ├── store/           # Local UI state management (Zustand/Redux if used)
│   ├── types/           # Global TypeScript types and interfaces
│   ├── utils/           # Helper functions and formatters
│   ├── constants/       # Global constants and enums
│   ├── schemas/         # Global Zod validation schemas
│   └── styles/          # Tailwind/CSS configurations
└── package.json
```

### Feature Module Structure

Every domain inside `src/features/` must be self-contained:
```text
features/assets/
├── components/      # Asset-specific components (AssetCard, AssetTimeline)
├── pages/           # Asset-specific pages (AssetList, AssetDetails)
├── hooks/           # Asset-specific data fetching (useAssets)
├── services/        # Asset-specific API calls
├── schemas/         # Asset validation schemas
├── types/           # Asset TypeScript types
├── constants/       # Asset constants
└── utils/           # Asset helper functions
```

---

## 🧭 Layouts & Routing

### Layouts
- **Authentication Layout:** Clean, minimal, focused on secure login/reset forms.
- **Dashboard Layout:** 
  - Top Navigation & Collapsible Sidebar
  - Breadcrumb Navigation
  - Global Search Bar
  - Notification Center (Bell with unread indicators)
  - Profile Menu & Theme Toggle
  - Quick Actions (Register Asset, Book Resource, etc.)
  - Responsive Mobile Drawer for navigation.
- **Public Layout:** For any public-facing or tracking pages.
- **Error Layout:** 404, 403, and global fallback UI.

### Routing & Security
- **React Router DOM v7** with lazy loading and route-based code splitting.
- **Protected Routes & Permission Routes:** UI automatically adapts based on backend permissions. Pages hide and buttons disappear if the user lacks the required role.
- **Authentication Flow:** Persistent login, automatic token refresh via Axios interceptors, session expiry handling, and secure logout.

---

## 📦 Enterprise Component Standards

The system requires a robust suite of reusable, highly accessible enterprise components.

### Enterprise Data Tables
Every table must support:
- Server-side Pagination, Sorting, and Filtering.
- Global Search.
- Column Visibility toggles.
- Sticky Headers.
- Bulk Selection & Bulk Actions.
- CSV Export.
- Responsive scaling for smaller viewports.

### Forms
Every form must include:
- Client-side Zod validation with clear inline error messages.
- Required field indicators.
- Loading, Success, and Failure states.
- Dirty state detection to prevent accidental data loss.
- Autosave capabilities where appropriate.

### Domain-Specific UIs
- **Booking UI:** Calendar views (Daily, Weekly, Monthly), availability/conflict indicators, and side-drawers for booking details.
- **Asset UI:** Asset Timelines, Image Galleries, QR/Barcode displays, and visual condition/maintenance histories.
- **Maintenance UI:** Workflow timelines, Priority badges, Technician/Vendor cards, and cost summaries.
- **Audit UI:** Verification screens, missing asset discrepancy cards, and comprehensive audit summary dashboards.

---

## 📡 API Layer & State Management

- **Server State:** Handled exclusively by **TanStack React Query** for caching, background fetching, and optimistic updates.
- **Authentication State:** Handled by **React Context**.
- **UI State:** Handled by local state (`useState`, `useReducer`) or a lightweight state manager (e.g., Zustand). No duplication of server state in local state.
- **API Architecture:** Axios is **never** called directly in components. All requests are typed, centralized in `services/`, and utilize Axios interceptors for global error handling and silent Token Refresh.

---

## ✨ Enterprise UX Standards

- **Error Handling:** Graceful degradation using Error Boundaries, Toast notifications (Sonner), inline field errors, and friendly retry mechanisms.
- **Loading States:** Skeleton loaders for tables, cards, and pages; avoiding jarring screen jumps.
- **Responsive Design:** Fluid transitions from Desktop ➔ Laptop ➔ Tablet ➔ Mobile. Sidebars collapse automatically; tables adapt to scroll or card views.
- **Accessibility (a11y):** Full keyboard navigation, ARIA labels, focus management, screen reader support, and high-contrast compliance.
- **Performance:** Extensive use of `React.memo`, dynamic imports, virtualized lists for large datasets, and strict image optimization.

---

## 🚀 Module Implementation Sequence

To build the frontend systematically and ensure all dependencies compile, modules must be developed in the following strict order:

1. **Authentication:** Login, password management, JWT interceptors.
2. **Dashboard:** KPI cards, charts (Recharts), recent activities.
3. **Departments:** Master data management grids.
4. **Categories:** Metadata setup for assets.
5. **Employees:** Directory and role management.
6. **Assets:** Registration, tracking, and detail views.
7. **Allocation:** Transfer workflows and custody management.
8. **Booking:** Calendar integration and resource scheduling.
9. **Maintenance:** Approval workflows and repair tracking.
10. **Audit:** Verification cycles and discrepancy reporting.
11. **Reports:** Exportable analytics and utilization charts.
12. **Notifications:** Real-time updates and notification center.
13. **Profile:** User settings and preferences.
14. **Settings:** Global application configurations.
15. **Shared Components:** Ongoing refinement of the design system components.

Every generated screen must compile successfully and integrate seamlessly with the backend APIs before moving to the next.
