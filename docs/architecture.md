# pa-assistant Architecture Document

**Project:** pa-assistant  
**Author:** Winston (Architect Agent)  
**Date:** November 5, 2025  
**Version:** 1.0  
**Project Level:** 2 (Greenfield)  
**Target Scale:** MVP - 200 users (pilot: 10 users)

---

## Executive Summary

This document defines the technical architecture for **pa-assistant**, a modern performance review management system that replaces Excel-based workflows with an AI-enhanced web application. The architecture leverages Next.js 14+ App Router for a type-safe, full-stack TypeScript solution with pluggable authentication (username/password now, LDAP future), dual-mode AI integration (web-based and local Ollama), and comprehensive RBAC with multi-role support.

**Key Architectural Principles:**
- **Developer Productivity:** Full TypeScript stack with type-safe database access via Prisma
- **Scalability:** SQLite for MVP, clear migration path to PostgreSQL for production
- **Security First:** Role-based access control, audit logging, data encryption
- **AI Transparency:** Clear labeling of AI-assisted content with full user control
- **Maintainability:** Consistent naming conventions, error handling, and testing patterns

---

## Project Initialization

**First Implementation Story: Project Setup**

Execute the following command to initialize the project with all architectural decisions pre-configured:

```ash
npx create-next-app@latest pa-assistant --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Initial Setup Decisions Provided by Starter:**
-  TypeScript configuration (strict mode enabled)
-  Tailwind CSS (for glassmorphism and shadcn/ui)
-  App Router (modern Next.js architecture)
-  src/ directory structure (cleaner organization)
-  Path aliases (@/* imports for cleaner imports)
-  ESLint configuration
-  Basic folder structure

**Post-Initialization Setup:**

```ash
# Install core dependencies
npm install @prisma/client prisma
npm install next-auth@beta bcrypt
npm install zustand @tanstack/react-query
npm install react-hook-form zod
npm install date-fns winston

# Install shadcn/ui
npx shadcn-ui@latest init

# Install dev dependencies
npm install -D @types/bcrypt vitest @vitejs/plugin-react
npm install -D playwright @playwright/test
npm install -D prisma

# Initialize Prisma
npx prisma init --datasource-provider sqlite

# Generate Prisma Client
npx prisma generate
```

---

## Technology Stack

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Frontend Framework** | Next.js App Router | 14+ | SSR for performance (<2s page load), API routes included, shadcn/ui compatibility, modern React patterns |
| **Language** | TypeScript | 5.0+ | Type safety, reduced runtime errors, better developer experience, end-to-end type safety with Prisma |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS, perfect for glassmorphism, highly customizable, small bundle size |
| **UI Components** | shadcn/ui | Latest | Accessible (WCAG 2.1 AA), customizable, built on Radix UI, excellent table components for Excel-like UI |
| **Database (MVP)** | SQLite | 3.40+ | Zero-config setup, file-based backups, perfect for 200 user scale, easy local development |
| **Database (Production)** | PostgreSQL | 14+ | Enterprise-grade reliability, JSONB for audit logs, row-level security, industry standard |
| **ORM** | Prisma | 5.0+ | Type-safe queries, automatic migrations, works with both SQLite and PostgreSQL, Prisma Studio GUI |
| **Authentication** | NextAuth.js (Auth.js) | 5.0+ | Username/password + future LDAP support, JWT and session management, built-in CSRF protection |
| **AI Integration** | Ollama REST API | Latest | Local AI support for privacy, no API key costs, fallback to web-based mode |
| **State Management** | Zustand | 4.0+ | Lightweight (<1KB), simple API, perfect for role switching and modal state |
| **Data Fetching** | TanStack Query | 5.0+ | Caching, optimistic updates, automatic refetching, excellent DX |
| **Form Handling** | React Hook Form + Zod | Latest | Performant (minimal re-renders), type-safe validation, integrates with shadcn/ui |
| **Charts & Visualization** | Recharts | 2.0+ | React-native charting library, responsive, composable, good for analytics dashboards (Epic 3) |
| **Testing (Unit)** | Vitest | Latest | Fast, Vite-powered, Jest-compatible API |
| **Testing (E2E)** | Playwright | Latest | Cross-browser testing, reliable, powerful selectors |
| **Date/Time** | date-fns | 3.0+ | Lightweight (vs moment.js), tree-shakeable, functional API |
| **Logging** | Winston | 3.0+ | Structured logging, multiple transports, production-ready |

**Migration Path:** SQLite → PostgreSQL requires only Prisma datasource change; no application code changes needed.

---

## Decision Summary

| Category | Decision | Affects Epics | Rationale |
|----------|----------|---------------|-----------|
| **Starter Template** | Next.js 14+ App Router | All | Provides TypeScript, Tailwind, App Router, optimized build, API routes - reduces initial setup by 80% |
| **Database Strategy** | SQLite (MVP) → PostgreSQL (Production) | All | SQLite perfect for pilot (10 users), PostgreSQL for scale (200+ users), Prisma abstracts migration |
| **Authentication** | NextAuth.js with pluggable providers | Epic 1 | Username/password now, LDAP future, no business logic changes when switching providers |
| **AI Architecture** | Dual-mode (Web-based + Local Ollama) | Epic 1, Story 1.5, 1.6 | Flexibility for security requirements, no vendor lock-in, graceful degradation |
| **RBAC Implementation** | Multi-role support with RoleAssignment | Epic 1, Story 1.10, 1.11 | Single user can be Employee, Manager, and HR Admin in different contexts, audit trail for all role switches |
| **State Management** | Zustand + React Server Components | All | Minimal client state, leverage RSC for data fetching, Zustand for UI state like role switching |
| **Form Validation** | React Hook Form + Zod | Epic 1, Story 1.4, 1.5 | Type-safe validation, excellent performance, integrates with shadcn/ui form components |
| **Error Handling** | Unified ApiResponse format | All | Consistent error codes, structured responses, easy to debug |
| **Logging Strategy** | Winston with structured logs | All | Production-ready, file + console transports, JSON format for log aggregation |
| **Date Handling** | date-fns with UTC storage | All | Store UTC in DB, display in user's local timezone, consistent date operations |
| **Testing Approach** | Vitest (unit) + Playwright (E2E) | All | Fast unit tests, reliable E2E tests, modern testing tools |
| **Historical Data** | Archived reviews with read-only enforcement | Epic 2, Story 2.3a | NFR007 compliance, multi-year analytics, prevents accidental modification |
| **Analytics & Visualization** | Recharts + TanStack Query | Epic 3 | Lightweight charts library, responsive, integrates with React Server Components for data fetching |
| **Data Aggregation** | Prisma aggregation + custom SQL for complex queries | Epic 3 | Leverage Prisma for simple aggregations, raw SQL for multi-year trend analysis performance |

---

## Complete Project Structure

```
pa-assistant/
 src/
    app/                          # Next.js App Router
       (auth)/                   # Auth route group
          login/
             page.tsx
          layout.tsx
      
       (dashboard)/              # Protected route group
          dashboard/
             page.tsx          # Main dashboard
             manager/
                page.tsx      # Manager dashboard (Story 2.1)
             hr-consolidation/
                page.tsx      # HR consolidation (Story 2.6)
             employee/
                 page.tsx      # Employee dashboard (Story 3.1)
         
          analytics/            # Analytics & Insights (Epic 3)
             employee/
                page.tsx      # Personal performance trends (Story 3.1)
             manager/
                page.tsx      # Team analytics (Story 3.3)
             hr/
                page.tsx      # Company-wide analytics (Story 3.4)
             historical/
                 page.tsx      # Historical data visualization (Story 3.2)
         
          reviews/              # Review workflows
             [id]/
                page.tsx      # Evaluation screen (Story 1.5, 1.6)
                edit/
                    page.tsx
             new/
                 page.tsx
         
          targets/              # Target setting
             [id]/
                page.tsx      # Target form (Story 1.4)
             new/
                 page.tsx
         
          admin/                # HR Admin (Story 1.9, 1.12)
             page.tsx
             users/
                page.tsx      # User mgmt (Story 1.2, 1.3)
             fiscal-years/
                page.tsx      # FY mgmt (Story 1.12)
             departments/
                page.tsx      # Dept config (Story 1.12)
             grade-systems/
                page.tsx      # Grade config (Story 1.12)
             ai-config/
                page.tsx      # AI config (Story 1.9)
             goals/
                 page.tsx      # Company goals (Story 2.2)
         
          help/
              page.tsx          # Help system (Story 1.7)
      
       api/                      # API routes
          auth/
             [...nextauth]/
                 route.ts      # NextAuth (Story 1.2)
         
          users/
             route.ts          # GET, POST users
             [id]/
                route.ts      # GET, PUT, DELETE
             import/
                 route.ts      # CSV import (Story 1.3)
         
          reviews/
             route.ts
             [id]/
                 route.ts
                 submit/
                    route.ts  # State transitions
                 calculate/
                     route.ts  # Score calc (Story 1.8)
         
          targets/
             route.ts
             [id]/
                 route.ts
         
          ai/
             generate-prompt/
                route.ts      # Web-based mode
             generate/
                 route.ts      # Local Ollama
         
          admin/                # Admin endpoints
             fiscal-years/
                route.ts      # FY CRUD
             departments/
                route.ts      # Dept CRUD
             employee-types/
                route.ts      # Grade systems
             score-mappings/
                route.ts      # Score→rank
             goals/
                 route.ts      # Goals (Story 2.2)
         
          analytics/            # Analytics endpoints (Epic 3)
             employee/
                [id]/
                   route.ts   # Personal trends (Story 3.1)
             manager/
                [id]/
                   route.ts   # Team analytics (Story 3.3)
             hr/
                route.ts      # Company-wide (Story 3.4)
             historical/
                route.ts      # Y-o-Y comparisons (Story 3.2)
             transfers/
                 route.ts      # Transfer history (Story 3.5)
         
          audit/
              route.ts
      
       globals.css
       layout.tsx
       page.tsx
   
    components/                   # React components
       ui/                       # shadcn/ui
          button.tsx
          input.tsx
          table.tsx
          modal.tsx
          ...
      
       auth/
          login-form.tsx
          role-header.tsx       # Story 1.11, 1.14
      
       reviews/
          review-form.tsx
          target-row.tsx
          ai-help-modal.tsx
          result-explanation-modal.tsx
          workflow-state-indicator.tsx  # Story 1.13
      
       targets/
          target-form.tsx
          target-table.tsx
      
       dashboard/
          manager-dashboard.tsx  # Story 2.1
          department-submission.tsx  # Story 2.5
          hr-consolidation.tsx   # Story 2.6
          employee-dashboard.tsx # Story 3.1
      
       analytics/               # Analytics components (Epic 3)
          performance-trend-chart.tsx    # Story 3.1, 3.2
          year-over-year-comparison.tsx  # Story 3.2
          team-analytics-dashboard.tsx   # Story 3.3
          rank-distribution-chart.tsx    # Story 3.4
          department-comparison-table.tsx # Story 3.4
          transfer-history-timeline.tsx  # Story 3.5
      
       charts/                  # Reusable chart components
          line-chart.tsx        # Multi-year trends
          bar-chart.tsx         # Rank distribution
          pie-chart.tsx         # Performance breakdown
          area-chart.tsx        # Historical comparisons
      
       admin/
          user-import.tsx
          fy-manager.tsx
          grade-config.tsx
          ai-config.tsx
      
       shared/
           navbar.tsx
           sidebar.tsx
           loading.tsx
   
    lib/                          # Utilities & services
       auth/
          auth-service.ts       # Auth abstraction
          rbac.ts
      
       db/
          prisma.ts             # Singleton
          seed.ts
      
       ai/
          ai-service.ts
          ollama-client.ts
          prompt-templates.ts
      
       scoring/
          calculator.ts         # Story 1.8
          rank-converter.ts
      
       audit/
          audit-logger.ts
      
       backup/
          backup-service.ts     # Story 2.3a
      
       analytics/               # Analytics services (Epic 3)
          trend-calculator.ts   # Multi-year trend analysis
          aggregation-service.ts # Team/company aggregations
          comparison-service.ts # Y-o-Y comparisons
          transfer-service.ts   # Transfer tracking (Story 3.5)
      
       utils/
          date.ts
          validation.ts
          api-response.ts
      
       logger.ts
   
    hooks/
       use-auth.ts
       use-review.ts
       use-role-switch.ts
       use-ai-assistance.ts
   
    types/
       auth.ts
       review.ts
       target.ts
       user.ts
       audit.ts
   
    middleware.ts                 # RBAC enforcement

 prisma/
    schema.prisma
    migrations/
    seed.ts

 public/
    images/
    fonts/

 tests/
    unit/
    integration/
    e2e/

 docs/                             # Documentation
    PRD.md
    epics.md
    ux-design-specification.md
    rbac-spec.md
    architecture.md               # This document

 .env
 .env.example
 .gitignore
 next.config.js
 tailwind.config.js
 tsconfig.json
 package.json
 vitest.config.ts
 playwright.config.ts
 README.md
```

---

## Epic to Architecture Mapping

| Epic | Stories | Modules | Key Files |
|------|---------|---------|-----------|
| **Epic 1: Foundation & Core** | 1.1-1.14 | Auth, Users, Targets, Reviews, AI, RBAC, Config | \src/app/(auth)/*\, \src/app/api/auth/*\, \src/app/(dashboard)/targets/*\, \src/app/(dashboard)/reviews/*\, \src/lib/auth/*\, \src/lib/ai/*\, \src/components/auth/role-header.tsx\ |
| **Epic 2: Dashboards & Production** | 2.1-2.6 | Dashboards, Security, Audit, Backup | \src/app/(dashboard)/dashboard/manager/*\, \src/app/(dashboard)/dashboard/hr-consolidation/*\, \src/lib/backup/*\, \src/lib/audit/*\ |
| **Epic 3: Analytics & Insights** | 3.1-3.5 | Analytics, Historical Data, Visualizations, Transfer Management | \src/app/(dashboard)/dashboard/employee/*\, \src/app/(dashboard)/analytics/*\, \src/lib/analytics/*\, \src/components/charts/*\, \src/app/api/analytics/*\ |

---


---

## High-Level Architecture Diagram

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Employee   │  │   Manager    │  │   HR Admin   │            │
│  │   Dashboard  │  │   Dashboard  │  │   Dashboard  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┴──────────────────┘                     │
│                            │                                        │
│              React Components (shadcn/ui)                          │
│              Zustand (Client State)                                │
│              TanStack Query (Data Fetching)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    Next.js 14+ App Router                           │
│                    (Single Server - MVP)                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Frontend (React SSR)                       │  │
│  │  - Server Components for data fetching                     │  │
│  │  - Client Components for interactivity                     │  │
│  │  - Glassmorphism UI with Tailwind                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                             │                                       │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │               API Routes (Backend)                          │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │    /auth     │  │   /reviews   │  │   /targets   │    │  │
│  │  │  NextAuth.js │  │   Business   │  │   Business   │    │  │
│  │  │   JWT Auth   │  │    Logic     │  │    Logic     │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                  │                  │             │  │
│  │  ┌──────┴──────────────────┴──────────────────┴─────────┐ │  │
│  │  │            Middleware (RBAC Enforcement)             │ │  │
│  │  └──────────────────────┬───────────────────────────────┘ │  │
│  │                         │                                  │  │
│  │  ┌──────────────────────▼───────────────────────────────┐ │  │
│  │  │            Service Layer                             │ │  │
│  │  │  - AuthService (RBAC logic)                         │ │  │
│  │  │  - AIService (Dual-mode AI)                         │ │  │
│  │  │  - ScoreCalculator                                  │ │  │
│  │  │  - AuditLogger                                      │ │  │
│  │  └──────────────────────┬───────────────────────────────┘ │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │                 Prisma ORM                                │  │
│  │  - Type-safe database queries                            │  │
│  │  - Automatic migrations                                  │  │
│  │  - Database abstraction layer                            │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
┌────────▼──────────┐              ┌────────────▼──────────┐
│   SQLite (MVP)    │              │  Ollama AI (Optional) │
│   - File-based    │              │  - Local inference    │
│   - ./dev.db      │              │  - Port 11434         │
│   - Daily backups │              │  - llama2 model       │
└───────────────────┘              └───────────────────────┘
         │
         │ (Future Migration)
         │
┌────────▼──────────┐
│   PostgreSQL      │
│   - Production    │
│   - Managed DB    │
│   - Cloud-hosted  │
└───────────────────┘
```

### Data Flow Architecture

**User Request Flow (Example: Employee submits self-review)**

```mermaid
sequenceDiagram
    actor Browser
    participant Middleware as Next.js Middleware
    participant API as API Route Handler<br/>/api/reviews/[id]/route.ts
    participant Service as Service Layer
    participant Prisma as Prisma ORM
    participant DB as SQLite Database

    Browser->>Middleware: 1. POST /api/reviews/:id<br/>Authorization: Bearer <JWT>
    Middleware->>Middleware: Extract JWT token<br/>Verify authentication<br/>Check role permissions
    
    Middleware->>API: 2. Authorized request
    API->>API: Validate request body (Zod)<br/>Business logic
    
    API->>Service: 3. Call services
    Service->>Service: AuthService.canAccessReview()<br/>ScoreCalculator.calculate()<br/>AuditLogger.log()
    
    Service->>Prisma: 4. Database operations
    Prisma->>Prisma: Type-safe queries<br/>Transaction support
    
    Prisma->>DB: 5. SQL queries
    DB->>DB: Atomic writes<br/>ACID compliance
    
    DB-->>Prisma: Query results
    Prisma-->>Service: Data returned
    Service-->>API: 6. Response
    API-->>Middleware: JSON response
    Middleware-->>Browser: 7. { success: true, data: {...} }
    Browser->>Browser: Update UI
```

### Multi-Role Access Control Flow

```mermaid
graph TD
    User["User Account (Single Login)<br/>email: alice@company.com<br/>roles: ['employee', 'manager', 'hr_admin']"]
    
    Employee["As Employee<br/>- Own review<br/>- Set targets<br/>- Self-eval"]
    Manager["As Manager<br/>- Review direct reports<br/>- Approve targets<br/>- Give feedback<br/>- Submit to HR"]
    HRAdmin["As HR Admin<br/>- View all reviews<br/>- Config system<br/>- Reports"]
    
    Delegate["Temporary Reviewer<br/>(Bob covers Alice)<br/>effectiveFrom: 2025-02-01<br/>effectiveTo: 2025-05-31"]
    
    User --> Employee
    User --> Manager
    User --> HRAdmin
    Manager -.->|Can delegate via<br/>RoleAssignment| Delegate
```

### AI Integration Architecture

```mermaid
flowchart TD
    UI["User Interface<br/>Employee writing self-evaluation<br/>result explanation"]
    AIService["AIService<br/>- Check mode: web or local<br/>- Load prompt template from database<br/>- Combine with user context"]
    
    WebMode["Web-Based Mode<br/>1. Generate combined prompt<br/>2. Display in modal for copy/paste<br/>3. User copies to ChatGPT/Claude<br/>4. User pastes result back"]
    
    LocalMode["Local Ollama Mode<br/>1. Generate prompt<br/>2. Call Ollama API (POST /api/generate)<br/>3. Get response<br/>4. Return result"]
    
    Display["Display AI-generated content in modal<br/>- Side-by-side comparison (original vs AI)<br/>- 'AI-assisted' badge<br/>- Full edit capability<br/>- Accept/Reject buttons"]
    
    UI -->|Clicks 'Get AI Help'| AIService
    AIService --> WebMode
    AIService --> LocalMode
    WebMode --> Display
    LocalMode --> Display
```

### Security Layers

```mermaid
graph TD
    Layer1["Layer 1: Network Security<br/>- HTTPS/TLS encryption for all traffic<br/>- Secure cookie flags (HttpOnly, Secure, SameSite)"]
    
    Layer2["Layer 2: Authentication<br/>- NextAuth.js with JWT tokens (8-hour expiration)<br/>- bcrypt password hashing (12 rounds)<br/>- Session management"]
    
    Layer3["Layer 3: Authorization (RBAC)<br/>- Middleware: Route-level permission checks<br/>- AuthService: Resource-level access control<br/>- Multi-role support with context switching"]
    
    Layer4["Layer 4: Data Protection<br/>- Row-level permissions via Prisma queries<br/>- Archived review read-only enforcement<br/>- Field-level access control (employee vs manager fields)"]
    
    Layer5["Layer 5: Audit & Compliance<br/>- All sensitive operations logged to AuditEntry<br/>- Immutable audit trail (append-only)<br/>- Role switches tracked with timestamp"]
    
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5
```

### Review Workflow State Machine

The review process follows a strict state machine with role-based transitions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REVIEW WORKFLOW STATE MACHINE                       │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │  SELF_EVAL_DRAFT     │ ◄─── Initial State
                    │  (Employee edits)    │
                    └──────────┬───────────┘
                               │ Employee: "Submit Self-Evaluation"
                               │ Validation: All targets rated, result explanations provided
                               ▼
                    ┌──────────────────────┐
                    │ SELF_EVAL_SUBMITTED  │
                    │  (Read-only)         │
                    └──────────┬───────────┘
                               │ System: Auto-transition
                               │ Action: Notify manager
                               ▼
                    ┌──────────────────────────┐
                    │ MANAGER_EVAL_IN_PROGRESS │
                    │  (Manager edits)         │
                    └──────────┬───────────────┘
                               │ Manager: "Submit Manager Evaluation"
                               │ Validation: All targets rated, feedback provided, score calculated
                               ▼
                    ┌──────────────────────┐
                    │ MANAGER_EVAL_COMPLETE│
                    │  (Read-only)         │
                    └──────────┬───────────┘
                               │ Manager: "Submit to HR"
                               │ Action: Calculate final score & rank
                               ▼
                    ┌──────────────────────┐
                    │ SUBMITTED_TO_HR_FINAL│
                    │  (HR Admin reviews)  │
                    └──────────┬───────────┘
                               │ HR Admin: "Mark as HR Complete"
                               │ Validation: Review verified, no data issues
                               ▼
                    ┌──────────────────────┐
                    │  HR_REVIEW_COMPLETE  │
                    │  (Ready for board)   │
                    └──────────┬───────────┘
                               │ HR Admin: "Mark as Board Approved"
                               │ (After board meeting)
                               ▼
                    ┌──────────────────────┐
                    │   BOARD_APPROVED     │
                    │  (Ready to deliver)  │
                    └──────────┬───────────┘
                               │ Manager: "Deliver Feedback"
                               │ Action: Feedback session with employee
                               ▼
                    ┌──────────────────────┐
                    │  FEEDBACK_DELIVERED  │
                    │  (Review complete)   │
                    └──────────┬───────────┘
                               │ HR Admin: "Archive Review"
                               │ Action: Close fiscal year, mark read-only
                               ▼
                    ┌──────────────────────┐
                    │      ARCHIVED        │ ◄─── Final State
                    │  (Read-only forever) │      (NFR007 Compliance)
                    └──────────────────────┘
```

**State Transition Rules:**

| From State | To State | Actor | Validation | Actions |
|------------|----------|-------|------------|---------|
| `self_eval_draft` | `self_eval_submitted` | Employee | All targets rated (1-5), result explanations provided | Notify manager via email/dashboard |
| `self_eval_submitted` | `manager_eval_in_progress` | System | Auto (immediate) | Update manager's todo list |
| `manager_eval_in_progress` | `manager_eval_complete` | Manager | All targets re-rated, feedback per target, overall summary | Calculate preliminary score |
| `manager_eval_complete` | `submitted_to_hr_final` | Manager | Final score calculated, rank assigned | Notify HR Admin, add to HR queue |
| `submitted_to_hr_final` | `hr_review_complete` | HR Admin | Data integrity check passed | Mark as ready for board |
| `hr_review_complete` | `board_approved` | GD/BOM | Board meeting occurred | Notify manager to schedule feedback session |
| `board_approved` | `feedback_delivered` | Manager | Feedback session completed | Log delivery timestamp, notify employee |
| `feedback_delivered` | `archived` | HR Admin | Fiscal year closed | Set `archived=true`, prevent modifications (except HR flags) |

**State Permissions:**

| State | Employee | Manager | HR Admin | GD/BOM |
|-------|----------|---------|----------|--------|
| `self_eval_draft` | Read/Write | Read | Read | Read |
| `self_eval_submitted` | Read | Read | Read | Read |
| `manager_eval_in_progress` | Read | Read/Write | Read | Read |
| `manager_eval_complete` | Read | Read | Read | Read |
| `submitted_to_hr_final` | Read | Read | Read/Write (minimal) | Read |
| `hr_review_complete` | Read | Read | Read | Read/Write (approve) |
| `board_approved` | Read | Read | Read | Read |
| `feedback_delivered` | Read | Read | Read | Read |
| `archived` | Read | Read | Read + Flag issues | Read |

**Implementation Example:**

```typescript
// src/lib/workflows/review-state-machine.ts
export const REVIEW_STATES = {
  SELF_EVAL_DRAFT: 'self_eval_draft',
  SELF_EVAL_SUBMITTED: 'self_eval_submitted',
  MANAGER_EVAL_IN_PROGRESS: 'manager_eval_in_progress',
  MANAGER_EVAL_COMPLETE: 'manager_eval_complete',
  SUBMITTED_TO_HR_FINAL: 'submitted_to_hr_final',
  HR_REVIEW_COMPLETE: 'hr_review_complete',
  BOARD_APPROVED: 'board_approved',
  FEEDBACK_DELIVERED: 'feedback_delivered',
  ARCHIVED: 'archived'
} as const

export const VALID_TRANSITIONS: Record<string, string[]> = {
  [REVIEW_STATES.SELF_EVAL_DRAFT]: [REVIEW_STATES.SELF_EVAL_SUBMITTED],
  [REVIEW_STATES.SELF_EVAL_SUBMITTED]: [REVIEW_STATES.MANAGER_EVAL_IN_PROGRESS],
  [REVIEW_STATES.MANAGER_EVAL_IN_PROGRESS]: [REVIEW_STATES.MANAGER_EVAL_COMPLETE],
  [REVIEW_STATES.MANAGER_EVAL_COMPLETE]: [REVIEW_STATES.SUBMITTED_TO_HR_FINAL],
  [REVIEW_STATES.SUBMITTED_TO_HR_FINAL]: [REVIEW_STATES.HR_REVIEW_COMPLETE],
  [REVIEW_STATES.HR_REVIEW_COMPLETE]: [REVIEW_STATES.BOARD_APPROVED],
  [REVIEW_STATES.BOARD_APPROVED]: [REVIEW_STATES.FEEDBACK_DELIVERED],
  [REVIEW_STATES.FEEDBACK_DELIVERED]: [REVIEW_STATES.ARCHIVED],
  [REVIEW_STATES.ARCHIVED]: [] // Terminal state
}

export class ReviewStateMachine {
  static canTransition(currentState: string, targetState: string): boolean {
    const validNextStates = VALID_TRANSITIONS[currentState] || []
    return validNextStates.includes(targetState)
  }
  
  static async transition(
    reviewId: string, 
    targetState: string,
    actorId: string,
    actorRole: string
  ): Promise<Review> {
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    // Validate transition
    if (!this.canTransition(review.status, targetState)) {
      throw new Error(
        `Invalid state transition: ${review.status} → ${targetState}`
      )
    }
    
    // Validate actor permissions
    if (!this.canActorTransition(review, targetState, actorId, actorRole)) {
      throw new Error('Actor not authorized for this transition')
    }
    
    // Perform validation for target state
    this.validateStateRequirements(review, targetState)
    
    // Execute transition with audit log
    return await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: { 
          status: targetState,
          ...(targetState === REVIEW_STATES.ARCHIVED && {
            archived: true,
            archivedAt: new Date(),
            archivedBy: actorId
          })
        }
      })
      
      // Log state transition
      await tx.auditEntry.create({
        data: {
          actorId,
          actorRole,
          action: 'state_transition',
          targetType: 'review',
          targetId: reviewId,
          details: {
            fromState: review.status,
            toState: targetState,
            timestamp: new Date()
          }
        }
      })
      
      // Execute post-transition actions
      await this.executePostTransitionActions(updatedReview, targetState)
      
      return updatedReview
    })
  }
  
  private static canActorTransition(
    review: Review,
    targetState: string,
    actorId: string,
    actorRole: string
  ): boolean {
    const transitionPermissions = {
      [REVIEW_STATES.SELF_EVAL_SUBMITTED]: ['employee'],
      [REVIEW_STATES.MANAGER_EVAL_COMPLETE]: ['manager'],
      [REVIEW_STATES.SUBMITTED_TO_HR_FINAL]: ['manager'],
      [REVIEW_STATES.HR_REVIEW_COMPLETE]: ['hr_admin'],
      [REVIEW_STATES.BOARD_APPROVED]: ['general_director', 'board_manager'],
      [REVIEW_STATES.FEEDBACK_DELIVERED]: ['manager'],
      [REVIEW_STATES.ARCHIVED]: ['hr_admin']
    }
    
    const allowedRoles = transitionPermissions[targetState] || []
    return allowedRoles.includes(actorRole)
  }
  
  private static validateStateRequirements(review: Review, targetState: string) {
    switch (targetState) {
      case REVIEW_STATES.SELF_EVAL_SUBMITTED:
        // Must have all targets rated
        const targets = JSON.parse(review.employeeTargets || '[]')
        if (targets.length === 0 || targets.some(t => !t.rating || !t.resultExplanation)) {
          throw new Error('All targets must be rated with result explanations')
        }
        break
        
      case REVIEW_STATES.MANAGER_EVAL_COMPLETE:
        // Must have manager ratings and feedback
        if (!review.managerTargetRatings || !review.managerFeedback) {
          throw new Error('Manager must provide ratings and feedback for all targets')
        }
        if (!review.overallSummary) {
          throw new Error('Manager must provide overall summary')
        }
        break
        
      case REVIEW_STATES.SUBMITTED_TO_HR_FINAL:
        // Must have final score and rank
        if (review.finalScore === null || !review.finalRank) {
          throw new Error('Final score and rank must be calculated')
        }
        break
    }
  }
  
  private static async executePostTransitionActions(
    review: Review, 
    targetState: string
  ) {
    switch (targetState) {
      case REVIEW_STATES.SELF_EVAL_SUBMITTED:
        // Notify manager
        await NotificationService.notifyManager(review.reviewerId, review.id)
        break
        
      case REVIEW_STATES.SUBMITTED_TO_HR_FINAL:
        // Add to HR queue
        await NotificationService.notifyHRTeam(review.id)
        break
        
      case REVIEW_STATES.BOARD_APPROVED:
        // Notify manager to schedule feedback
        await NotificationService.notifyManagerForFeedback(review.reviewerId, review.id)
        break
        
      case REVIEW_STATES.FEEDBACK_DELIVERED:
        // Notify employee
        await NotificationService.notifyEmployeeFeedbackReady(review.revieweeId, review.id)
        break
    }
  }
  
  static getAvailableTransitions(currentState: string, userRole: string): string[] {
    const allNextStates = VALID_TRANSITIONS[currentState] || []
    
    // Filter by role permissions
    return allNextStates.filter(state => {
      const transitionPermissions = {
        [REVIEW_STATES.SELF_EVAL_SUBMITTED]: ['employee'],
        [REVIEW_STATES.MANAGER_EVAL_COMPLETE]: ['manager'],
        [REVIEW_STATES.SUBMITTED_TO_HR_FINAL]: ['manager'],
        [REVIEW_STATES.HR_REVIEW_COMPLETE]: ['hr_admin'],
        [REVIEW_STATES.BOARD_APPROVED]: ['general_director', 'board_manager'],
        [REVIEW_STATES.FEEDBACK_DELIVERED]: ['manager'],
        [REVIEW_STATES.ARCHIVED]: ['hr_admin']
      }
      
      const allowedRoles = transitionPermissions[state] || []
      return allowedRoles.includes(userRole)
    })
  }
}
```

**Usage in API Routes:**

```typescript
// src/app/api/reviews/[id]/submit/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { targetState } = await request.json()
  
  try {
    const review = await ReviewStateMachine.transition(
      params.id,
      targetState,
      session.user.id,
      session.user.currentRole // From role-switching context
    )
    
    return NextResponse.json(createSuccessResponse(review))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error.message, 'TRANSITION_ERROR'),
      { status: 400 }
    )
  }
}
```

**Benefits of State Machine Pattern:**
- ✅ **Enforces valid workflow** - Prevents invalid state transitions
- ✅ **Role-based permissions** - Only authorized users can trigger transitions
- ✅ **Audit trail** - Every state change is logged
- ✅ **Validation** - Ensures data completeness before advancing
- ✅ **Testable** - Easy to test all valid/invalid transitions
- ✅ **Self-documenting** - State diagram serves as living documentation

---

## Database Schema Visualization

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA (11 TABLES)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│         USER             │  Central entity for all actors
├──────────────────────────┤
│ PK id: uuid              │
│    email: string (UQ)    │
│    username: string (UQ) │ ◄─── Credentials auth
│    passwordHash: string  │
│    fullName: string      │
│    roles: string[]       │ ◄─── ["employee","manager","hr_admin","general_director","board_manager"]
│                          │
│    ldapDN: string (UQ)   │ ◄─── Future LDAP
│    ldapSyncedAt: date    │
│    authProvider: string  │
│                          │
│ FK managerId: uuid       │ ◄─── Self-reference (manager)
│    grade: string         │
│    department: string    │
│    employeeId: string    │
│    jobTitle: string      │
│    employmentStatus: str │
│                          │
│    createdAt: datetime   │
│    updatedAt: datetime   │
└────────┬─────────────────┘
         │
         │ 1:N (manager → direct reports)
         ├──────────────────────────────────────┐
         │                                      │
         │ 1:N (reviewee)          1:N (reviewer)
         ├──────────────┐          ┌────────────┤
         │              │          │            │
         ▼              ▼          ▼            │
┌─────────────────┐  ┌─────────────────────┐   │
│ TARGETSETTING   │  │      REVIEW         │   │
├─────────────────┤  ├─────────────────────┤   │
│ PK id: uuid     │  │ PK id: uuid         │   │
│ FK employeeId   │  │ FK revieweeId       │ ──┘
│ FK managerId    │  │ FK reviewerId       │
│    cycleYear    │  │    cycleYear        │
│    status       │  │    status           │ ◄─── State machine
│    targets: JSON│  │                     │
│                 │  │ currentJobDesc: txt │
│    submittedAt  │  │ careerPath: txt     │
│    approvedAt   │  │ employeeTargets:JSON│
│    submittedTo  │  │ employeeSubmittedAt │
│       HRAt      │  │                     │
│    createdAt    │  │ managerTargetRatings│
│    updatedAt    │  │ managerFeedback:JSON│
│                 │  │ overallSummary: txt │
│ UQ(employeeId,  │  │ finalScore: float   │
│    cycleYear)   │  │ finalRank: string   │
└─────────────────┘  │ managerSubmittedAt  │
                     │                     │
                     │ archived: boolean   │ ◄─── NFR007
                     │ archivedAt: date    │
                     │ archivedBy: uuid    │
                     │                     │
                     │ createdAt: datetime │
                     │ updatedAt: datetime │
                     │                     │
                     │ UQ(revieweeId,      │
                     │    cycleYear)       │
                     └─────────────────────┘

┌──────────────────────────┐
│    ROLEASSIGNMENT        │  Delegation support
├──────────────────────────┤
│ PK id: uuid              │
│ FK reviewerId: uuid      │ ──┐ Both reference User
│ FK revieweeId: uuid      │ ──┤
│    reason: string        │   │
│    effectiveFrom: date   │   │
│    effectiveTo: date     │   │
│    createdAt: datetime   │   │
│                          │   │
│ IX(reviewerId,           │   │
│    effectiveFrom,        │   │
│    effectiveTo)          │   │
└──────────────────────────┘   │
                               │
┌──────────────────────────┐   │
│      AUDITENTRY          │   │
├──────────────────────────┤   │
│ PK id: uuid              │   │
│ FK actorId: uuid         │ ──┘
│    actorRole: string     │ ◄─── Role used during action
│    action: string        │ ◄─── "submit_review", "switch_role"
│    targetType: string    │ ◄─── "review", "target", "user"
│    targetId: string      │
│    details: JSON         │ ◄─── Diffs, ai_assisted flag, etc.
│    timestamp: datetime   │
│                          │
│ IX(actorId, timestamp)   │
│ IX(targetType, targetId) │
└──────────────────────────┘

┌──────────────────────────┐
│      FISCALYEAR          │  HR Admin config
├──────────────────────────┤
│ PK id: uuid              │
│    year: int (UQ)        │
│    startDate: date       │
│    endDate: date         │
│    isClosed: boolean     │
│    closedAt: datetime    │
│    closedBy: string      │
│    createdAt: datetime   │
└──────────────────────────┘

┌──────────────────────────┐
│      DEPARTMENT          │  HR Admin config
├──────────────────────────┤
│ PK id: uuid              │
│    name: string (UQ)     │
│    headId: string        │
│    createdAt: datetime   │
│    updatedAt: datetime   │
└──────────────────────────┘

┌──────────────────────────┐
│     EMPLOYEETYPE         │  HR Admin config
├──────────────────────────┤
│ PK id: uuid              │
│    type: string (UQ)     │ ◄─── "Engineer", "Back-Office"
│    grades: JSON          │ ◄─── ["G1","G2","G3"]
│    createdAt: datetime   │
│    updatedAt: datetime   │
└──────────────────────────┘

┌──────────────────────────┐
│     SCOREMAPPING         │  HR Admin config
├──────────────────────────┤
│ PK id: uuid              │
│    employeeType: string  │ ─┐
│    grade: string         │ ─┤ Composite unique key
│    mappings: JSON        │  │ ◄─── [{min:0,max:180,rank:"A+"}]
│    createdAt: datetime   │  │
│    updatedAt: datetime   │  │
│                          │  │
│ UQ(employeeType, grade)  │ ─┘
└──────────────────────────┘

┌──────────────────────────┐
│      COMPANYGOAL         │  Story 2.2
├──────────────────────────┤
│ PK id: uuid              │
│    title: string         │
│    description: text     │
│    department: string    │ ◄─── NULL = company-wide
│    cycleYear: int        │
│    createdAt: datetime   │
│    updatedAt: datetime   │
└──────────────────────────┘

┌──────────────────────────┐
│       AICONFIG           │  Story 1.9
├──────────────────────────┤
│ PK id: uuid              │
│    mode: string          │ ◄─── "web" | "local"
│    ollamaUrl: string     │
│    ollamaModel: string   │
│    resultExplanationTmpl │ ◄─── Prompt templates
│    managerFeedbackTmpl   │
│    updatedAt: datetime   │
└──────────────────────────┘
```

### Key Relationships

**1:N Relationships:**
```
User (manager) ──< User (direct reports)
    1 manager can have many direct reports

User (reviewee) ──< Review
    1 employee can have many reviews (1 per year)

User (reviewer) ──< Review
    1 manager can review many employees

User (employee) ──< TargetSetting
    1 employee can have many target sets (1 per year)

User (manager) ──< TargetSetting
    1 manager can approve many target sets

User (actor) ──< AuditEntry
    1 user can have many audit log entries
```

**M:N Relationships (through junction tables):**
```
User (reviewer) ──< RoleAssignment >── User (reviewee)
    Supports temporary delegation:
    Manager A delegates reviewing Employee B to Manager C
    effectiveFrom/effectiveTo provides time-bound delegation
```

### Data Flow: Review Lifecycle

```mermaid
sequenceDiagram
    participant Employee
    participant Manager
    participant System
    participant HRAdmin as HR Admin
    participant TargetDB as TargetSetting DB
    participant ReviewDB as Review DB
    participant AuditDB as AuditEntry DB

    Note over Employee,TargetDB: STEP 1: TARGET SETTING (Prior Year End)
    
    Employee->>TargetDB: CREATE Target Setting<br/>(status: draft, targets: 3-5)
    Employee->>Manager: SUBMIT for approval
    Manager->>TargetDB: REVIEW/APPROVE
    TargetDB->>TargetDB: status: approved → complete
    
    Note over System,ReviewDB: STEP 2: REVIEW CYCLE (Year End)
    
    System->>TargetDB: COPY approved targets
    System->>ReviewDB: CREATE Review<br/>(status: draft, employeeTargets copied)
    
    Employee->>ReviewDB: SELF-EVALUATE<br/>• Rate targets (1-5)<br/>• Write result explanations<br/>• Update job desc<br/>• Career path
    Employee->>ReviewDB: SUBMIT self-evaluation
    ReviewDB->>AuditDB: Log: self_eval_submitted
    
    ReviewDB->>Manager: Notify: Review ready<br/>(status: manager_eval_in_progress)
    Manager->>ReviewDB: MANAGER EVALUATE<br/>• Re-rate targets<br/>• Write feedback per target<br/>• Overall summary<br/>• Final score calculated
    Manager->>ReviewDB: SUBMIT TO HR<br/>(finalScore: 245, finalRank: "A")
    ReviewDB->>AuditDB: Log: submitted_to_hr_final
    
    Note over HRAdmin,ReviewDB: STEP 3: HR REVIEW & BOARD APPROVAL
    
    ReviewDB->>HRAdmin: Review data<br/>(status: submitted_to_hr_final)
    HRAdmin->>ReviewDB: MARK HR COMPLETE<br/>(status: hr_review_complete)
    ReviewDB->>AuditDB: Log: hr_review_complete
    
    HRAdmin->>ReviewDB: BOARD MEETING<br/>MARK APPROVED<br/>(status: board_approved)
    ReviewDB->>AuditDB: Log: board_approved
    
    Note over Manager,ReviewDB: STEP 4: FEEDBACK DELIVERY
    
    ReviewDB->>Manager: Notify: Ready for feedback session
    Manager->>ReviewDB: DELIVER FEEDBACK<br/>(status: feedback_delivered)
    ReviewDB->>AuditDB: Log: feedback_delivered
    
    Note over HRAdmin,ReviewDB: STEP 5: ARCHIVAL (FY CLOSE)
    
    HRAdmin->>ReviewDB: CLOSE FISCAL YEAR<br/>(status: archived, archived: true)
    ReviewDB->>AuditDB: Log: archived
    ReviewDB->>ReviewDB: READ-ONLY FOREVER<br/>(NFR007 Compliance)
```

### Data Relationships & Constraints

**Unique Constraints:**
```sql
-- Prevent duplicate reviews per year
UNIQUE(Review.revieweeId, Review.cycleYear)

-- Prevent duplicate target sets per year
UNIQUE(TargetSetting.employeeId, TargetSetting.cycleYear)

-- Ensure unique user identifiers
UNIQUE(User.email)
UNIQUE(User.username)
UNIQUE(User.employeeId)
UNIQUE(User.ldapDN)

-- Prevent duplicate config entries
UNIQUE(Department.name)
UNIQUE(EmployeeType.type)
UNIQUE(FiscalYear.year)
UNIQUE(ScoreMapping.employeeType, ScoreMapping.grade)
```

**Foreign Key Cascades:**
```sql
-- User deletion (should be soft-delete via employmentStatus)
User.managerId → User.id (SET NULL on delete)

-- Review deletion (should be rare, only during draft)
Review.revieweeId → User.id (RESTRICT)
Review.reviewerId → User.id (RESTRICT)

-- TargetSetting deletion (should be rare)
TargetSetting.employeeId → User.id (RESTRICT)
TargetSetting.managerId → User.id (RESTRICT)

-- RoleAssignment deletion (cascade when user deleted)
RoleAssignment.reviewerId → User.id (CASCADE)
RoleAssignment.revieweeId → User.id (CASCADE)

-- AuditEntry (never delete, append-only)
AuditEntry.actorId → User.id (RESTRICT)
```

**Indexes for Performance:**
```sql
-- User lookups
CREATE INDEX idx_user_email ON User(email)
CREATE INDEX idx_user_username ON User(username)
CREATE INDEX idx_user_manager ON User(managerId)
CREATE INDEX idx_user_department ON User(department)

-- Review queries
CREATE INDEX idx_review_reviewee_year ON Review(revieweeId, cycleYear)
CREATE INDEX idx_review_reviewer_status ON Review(reviewerId, status)
CREATE INDEX idx_review_status ON Review(status)
CREATE INDEX idx_review_archived ON Review(archived)

-- Audit queries
CREATE INDEX idx_audit_actor_time ON AuditEntry(actorId, timestamp)
CREATE INDEX idx_audit_target ON AuditEntry(targetType, targetId)
CREATE INDEX idx_audit_action ON AuditEntry(action)

-- Delegation queries
CREATE INDEX idx_role_assignment_reviewer ON RoleAssignment(reviewerId, effectiveFrom, effectiveTo)
```

### JSON Field Structures

**TargetSetting.targets (Array of 3-5 targets):**
```json
[
  {
    "taskDescription": "Improve system performance",
    "kpi": "Reduce page load time by 30%",
    "weight": 30,
    "difficulty": "L2"
  },
  {
    "taskDescription": "Mentor junior developers",
    "kpi": "Conduct 10 mentoring sessions",
    "weight": 20,
    "difficulty": "L1"
  }
  // ... 1-3 more targets (total weight = 100)
]
```

**Review.employeeTargets (Copied from TargetSetting + ratings):**
```json
[
  {
    "taskDescription": "Improve system performance",
    "kpi": "Reduce page load time by 30%",
    "weight": 30,
    "difficulty": "L2",
    "employeeRating": 4,
    "resultExplanation": "Successfully reduced load time by 35%...",
    "aiAssisted": true
  }
  // ... more targets
]
```

**Review.managerTargetRatings (Manager's assessment):**
```json
[
  {
    "targetIndex": 0,
    "managerRating": 4,
    "disagreeReason": null
  },
  {
    "targetIndex": 1,
    "managerRating": 3,
    "disagreeReason": "Only 8 sessions conducted, not 10"
  }
]
```

**Review.managerFeedback (Per-target feedback):**
```json
[
  {
    "targetIndex": 0,
    "feedback": "Excellent work on performance optimization...",
    "aiAssisted": true
  },
  {
    "targetIndex": 1,
    "feedback": "Good effort on mentoring, aim for consistency..."
  }
]
```

**ScoreMapping.mappings (Score to rank conversion):**
```json
[
  {"min": 0, "max": 100, "rank": "C"},
  {"min": 101, "max": 150, "rank": "B"},
  {"min": 151, "max": 180, "rank": "B+"},
  {"min": 181, "max": 230, "rank": "A"},
  {"min": 231, "max": 300, "rank": "A+"}
]
```

**AuditEntry.details (Context-specific metadata):**
```json
{
  "previousStatus": "self_eval_draft",
  "newStatus": "self_eval_submitted",
  "changedFields": ["employeeTargets", "employeeSubmittedAt"],
  "aiAssisted": true,
  "ipAddress": "192.168.1.100"
}
```

### Migration Path: SQLite → PostgreSQL

**Schema Compatibility:**
```typescript
// Prisma schema change (ONLY THIS LINE CHANGES)
datasource db {
  provider = "sqlite"              // MVP
  // provider = "postgresql"       // Production
  url      = env("DATABASE_URL")
}

// Application code: ZERO CHANGES REQUIRED
// Prisma abstracts database differences
```

**Data Migration Command:**
```bash
# Export from SQLite
npx prisma db push --schema=schema-sqlite.prisma

# Migrate data (using Prisma)
npx prisma migrate deploy --schema=schema-postgres.prisma

# Verify
npx prisma studio
```

---

## Component Architecture Overview

This section documents the frontend component structure, organization patterns, and how components interact with the backend and each other.

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION COMPONENT TREE                             │
└─────────────────────────────────────────────────────────────────────────────┘

app/
├── layout.tsx (Root Layout)
│   ├── Providers (RSC)
│   │   ├── SessionProvider (NextAuth)
│   │   ├── QueryClientProvider (TanStack Query)
│   │   └── ThemeProvider (Tailwind)
│   │
│   └── RoleHeader (Client Component)
│       ├── UserAvatar
│       ├── RoleSelector
│       └── NotificationBadge
│
├── (auth)/
│   ├── login/page.tsx (Server Component)
│   │   └── LoginForm (Client Component)
│   │       ├── UsernameField (shadcn/ui Input)
│   │       ├── PasswordField (shadcn/ui Input)
│   │       └── SubmitButton (shadcn/ui Button)
│   │
│   └── logout/page.tsx
│
└── (dashboard)/
    ├── layout.tsx (Dashboard Layout)
    │   ├── Sidebar (Client Component)
    │   │   ├── Navigation Menu
    │   │   └── Quick Actions
    │   │
    │   └── MainContent (Server Component slot)
    │
    ├── dashboard/
    │   ├── employee/page.tsx (Server Component)
    │   │   ├── TargetOverviewCard
    │   │   ├── ReviewStatusCard
    │   │   └── ActionItemsList
    │   │
    │   ├── manager/page.tsx (Server Component)
    │   │   ├── TeamReviewTable (Client Component)
    │   │   │   ├── DataTable (shadcn/ui)
    │   │   │   ├── FilterBar
    │   │   │   └── BulkActions
    │   │   │
    │   │   └── PerformanceDistributionChart
    │   │
    │   └── hr-consolidation/page.tsx (Server Component)
    │       ├── ConsolidationTable (Client Component)
    │       ├── RankDistributionChart
    │       └── ExportActions
    │
    ├── targets/
    │   ├── new/page.tsx (Server Component)
    │   │   └── TargetSettingForm (Client Component)
    │   │       ├── TargetInputFields (Array Field)
    │   │       │   ├── TaskDescription (Textarea)
    │   │       │   ├── KPIField (Input)
    │   │       │   ├── WeightSlider (shadcn/ui Slider)
    │   │       │   ├── DifficultySelector (Select)
    │   │       │   └── RemoveTargetButton
    │   │       │
    │   │       ├── AddTargetButton
    │   │       └── WeightTotalIndicator
    │   │
    │   └── [id]/page.tsx (Server Component)
    │       └── TargetReviewView
    │
    ├── reviews/
    │   ├── [id]/
    │   │   ├── page.tsx (Server Component)
    │   │   │   └── ReviewWorkflow (Client Component)
    │   │   │       ├── StateIndicator
    │   │   │       ├── TabNavigation (Self-Eval / Manager Eval)
    │   │   │       │
    │   │   │       ├── SelfEvaluationTab
    │   │   │       │   ├── TargetRatingGrid (Client Component)
    │   │   │       │   │   ├── RatingStars (1-5)
    │   │   │       │   │   ├── ResultExplanation (Textarea)
    │   │   │       │   │   └── AIHelpButton
    │   │   │       │   │
    │   │   │       │   ├── JobDescriptionField
    │   │   │       │   └── CareerPathField
    │   │   │       │
    │   │   │       └── ManagerEvaluationTab
    │   │   │           ├── EmployeeRatingsReadOnly
    │   │   │           ├── ManagerRatingGrid
    │   │   │           ├── FeedbackFields (Per-target)
    │   │   │           ├── OverallSummary
    │   │   │           └── ScoreDisplay
    │   │   │
    │   │   └── submit/route.ts (API Route)
    │   │
    │   └── archived/[id]/page.tsx (Read-only view)
    │
    └── settings/
        ├── hr-config/page.tsx (Server Component)
        │   ├── FiscalYearManager
        │   ├── DepartmentManager
        │   ├── EmployeeTypeManager
        │   └── ScoreMappingEditor
        │
        └── ai-config/page.tsx (Server Component)
            └── AIConfigForm (Client Component)
                ├── ModeSelector (web/local)
                ├── OllamaSettings (Conditional)
                └── PromptTemplateEditor
```

### Component Categories

**1. Layout Components (Server Components)**
```typescript
// app/layout.tsx - Root Layout
import { Providers } from '@/components/providers'
import { RoleHeader } from '@/components/auth/role-header'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <RoleHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/(dashboard)/layout.tsx - Dashboard Layout
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
```

**2. Page Components (Server Components by Default)**
```typescript
// app/(dashboard)/reviews/[id]/page.tsx
import { prisma } from '@/lib/db/prisma'
import { ReviewWorkflow } from '@/components/reviews/review-workflow'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // Server-side data fetching
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      reviewee: true,
      reviewer: true
    }
  })
  
  // Authorization check
  if (!canAccessReview(session.user.id, review)) {
    redirect('/unauthorized')
  }
  
  // Pass data to Client Component
  return <ReviewWorkflow review={review} currentUser={session.user} />
}
```

**3. Interactive Components (Client Components)**
```typescript
// src/components/reviews/review-workflow.tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelfEvaluationTab } from './self-evaluation-tab'
import { ManagerEvaluationTab } from './manager-evaluation-tab'
import { useReviewStateMachine } from '@/hooks/use-review-state-machine'

interface ReviewWorkflowProps {
  review: Review
  currentUser: User
}

export function ReviewWorkflow({ review, currentUser }: ReviewWorkflowProps) {
  const [activeTab, setActiveTab] = useState('self-eval')
  const { canTransition, transitionTo } = useReviewStateMachine(review)
  
  return (
    <div className="container mx-auto p-6">
      <StateIndicator status={review.status} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="self-eval">Self-Evaluation</TabsTrigger>
          <TabsTrigger value="manager-eval">Manager Evaluation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="self-eval">
          <SelfEvaluationTab
            review={review}
            readOnly={review.status !== 'self_eval_draft'}
            onSubmit={() => transitionTo('self_eval_submitted')}
          />
        </TabsContent>
        
        <TabsContent value="manager-eval">
          <ManagerEvaluationTab
            review={review}
            readOnly={review.status !== 'manager_eval_in_progress'}
            onSubmit={() => transitionTo('manager_eval_complete')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**4. Form Components (Client Components with React Hook Form)**
```typescript
// src/components/targets/target-setting-form.tsx
'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TargetSetSchema } from '@/lib/validation/target-schemas'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export function TargetSettingForm({ initialData, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(TargetSetSchema),
    defaultValues: initialData || {
      targets: [{ taskDescription: '', kpi: '', weight: 20, difficulty: 'L1' }]
    }
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'targets'
  })
  
  const totalWeight = form.watch('targets').reduce((sum, t) => sum + t.weight, 0)
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4">
            <FormField
              control={form.control}
              name={`targets.${index}.taskDescription`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe the target..." />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`targets.${index}.kpi`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Measurable indicator..." />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`targets.${index}.weight`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove Target
              </Button>
            )}
          </div>
        ))}
        
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ taskDescription: '', kpi: '', weight: 20, difficulty: 'L1' })}
            disabled={fields.length >= 5}
          >
            Add Target
          </Button>
          
          <div className="text-sm">
            Total Weight: <span className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
              {totalWeight}%
            </span>
          </div>
        </div>
        
        <Button type="submit" disabled={totalWeight !== 100}>
          Save Targets
        </Button>
      </form>
    </Form>
  )
}
```

**5. Modal Components (Client Components)**
```typescript
// src/components/ai/ai-help-modal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAIService } from '@/hooks/use-ai-service'

interface AIHelpModalProps {
  open: boolean
  onClose: () => void
  context: {
    targetDescription: string
    kpi: string
    employeeRating: number
  }
  onAccept: (text: string) => void
}

export function AIHelpModal({ open, onClose, context, onAccept }: AIHelpModalProps) {
  const { generateSuggestion, isLoading } = useAIService()
  const [suggestion, setSuggestion] = useState('')
  const [userEdit, setUserEdit] = useState('')
  
  const handleGenerate = async () => {
    const result = await generateSuggestion('result_explanation', context)
    setSuggestion(result)
    setUserEdit(result)
  }
  
  const handleAccept = () => {
    onAccept(userEdit)
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Writing Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Your Input</h3>
            <div className="p-3 bg-muted rounded text-sm space-y-2">
              <p><strong>Target:</strong> {context.targetDescription}</p>
              <p><strong>KPI:</strong> {context.kpi}</p>
              <p><strong>Rating:</strong> {context.employeeRating}/5</p>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Explanation'}
            </Button>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">AI Suggestion</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                AI-assisted
              </span>
            </div>
            
            <Textarea
              value={userEdit}
              onChange={(e) => setUserEdit(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="AI suggestion will appear here..."
            />
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAccept} disabled={!userEdit}>
                Accept & Use
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**6. Shared UI Components (shadcn/ui)**
```typescript
// All shadcn/ui components in src/components/ui/
// - button.tsx
// - input.tsx
// - textarea.tsx
// - select.tsx
// - dialog.tsx
// - tabs.tsx
// - table.tsx
// - slider.tsx
// - form.tsx (React Hook Form integration)
// - toast.tsx
// - dropdown-menu.tsx
// - card.tsx
// - badge.tsx
// - avatar.tsx

// Usage example:
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Review Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter value..." />
    <Button>Submit</Button>
  </CardContent>
</Card>
```

### Component Communication Patterns

**1. Server to Client (Props)**
```typescript
// Server Component (page.tsx)
export default async function Page() {
  const data = await prisma.review.findMany()
  return <ClientComponent data={data} /> // Pass via props
}

// Client Component
'use client'
export function ClientComponent({ data }: { data: Review[] }) {
  // Use data in client component
}
```

**2. Client to Server (API Routes + TanStack Query)**
```typescript
// Client Component
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function ReviewForm() {
  const queryClient = useQueryClient()
  
  const submitReview = useMutation({
    mutationFn: async (data: ReviewData) => {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
  
  return <form onSubmit={(e) => {
    e.preventDefault()
    submitReview.mutate(formData)
  }} />
}
```

**3. Client to Client (Zustand State Management)**
```typescript
// src/stores/role-store.ts
import { create } from 'zustand'

interface RoleStore {
  currentRole: 'employee' | 'manager' | 'hr_admin'
  setRole: (role: string) => void
}

export const useRoleStore = create<RoleStore>((set) => ({
  currentRole: 'employee',
  setRole: (role) => set({ currentRole: role })
}))

// Usage in any Client Component
'use client'
import { useRoleStore } from '@/stores/role-store'

export function RoleSelector() {
  const { currentRole, setRole } = useRoleStore()
  
  return (
    <select value={currentRole} onChange={(e) => setRole(e.target.value)}>
      <option value="employee">Employee</option>
      <option value="manager">Manager</option>
      <option value="hr_admin">HR Admin</option>
    </select>
  )
}
```

**4. Parent to Child (Props + Callbacks)**
```typescript
// Parent Component
export function ReviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handleAccept = (text: string) => {
    // Handle accepted text
    setIsModalOpen(false)
  }
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Get AI Help</Button>
      
      <AIHelpModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
      />
    </>
  )
}
```

### Component Design Principles

**1. Server Components by Default**
- Use Server Components for data fetching, layout, and static content
- Only convert to Client Components when interactivity is needed
- Benefits: Better performance, smaller bundle size, SEO-friendly

**2. Composition Over Props Drilling**
```typescript
// Bad: Props drilling
<Layout user={user}>
  <Sidebar user={user}>
    <UserMenu user={user} />
  </Sidebar>
</Layout>

// Good: Context or Server Component data fetching
<Layout>
  <Sidebar>
    <UserMenu /> {/* Fetches user via getServerSession */}
  </Sidebar>
</Layout>
```

**3. Colocation**
```
src/components/
├── reviews/              # Feature-specific components
│   ├── review-workflow.tsx
│   ├── self-evaluation-tab.tsx
│   ├── manager-evaluation-tab.tsx
│   └── state-indicator.tsx
│
├── targets/              # Feature-specific components
│   ├── target-setting-form.tsx
│   └── target-rating-grid.tsx
│
├── ui/                   # Shared UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx
│
└── shared/               # Shared business components
    ├── data-table.tsx
    ├── error-boundary.tsx
    └── loading-spinner.tsx
```

**4. Single Responsibility**
```typescript
// Bad: God component
export function ReviewForm() {
  // 500 lines of logic + UI
}

// Good: Split responsibilities
export function ReviewForm() {
  // Orchestration only
  return (
    <>
      <TargetRatingSection />
      <FeedbackSection />
      <SubmitSection />
    </>
  )
}
```

**5. Type Safety**
```typescript
// Define props interface
interface ReviewWorkflowProps {
  review: Review              // Prisma-generated type
  currentUser: User           // Prisma-generated type
  onSubmit?: () => void
}

// Use in component
export function ReviewWorkflow({ review, currentUser, onSubmit }: ReviewWorkflowProps) {
  // TypeScript ensures type safety
}
```

### Component Testing Strategy

**1. Server Component Testing (Integration Tests)**
```typescript
// tests/integration/review-page.test.tsx
import { render, screen } from '@testing-library/react'
import ReviewPage from '@/app/(dashboard)/reviews/[id]/page'
import { prismaMock } from '@/tests/mocks/prisma'

describe('ReviewPage', () => {
  it('renders review data correctly', async () => {
    prismaMock.review.findUnique.mockResolvedValue({
      id: '1',
      reviewee: { fullName: 'John Doe' },
      status: 'self_eval_draft'
    })
    
    const Component = await ReviewPage({ params: { id: '1' } })
    render(Component)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

**2. Client Component Testing (Unit Tests)**
```typescript
// tests/unit/target-setting-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TargetSettingForm } from '@/components/targets/target-setting-form'

describe('TargetSettingForm', () => {
  it('validates total weight equals 100%', async () => {
    const onSubmit = jest.fn()
    render(<TargetSettingForm onSubmit={onSubmit} />)
    
    // Add targets with total weight != 100
    fireEvent.click(screen.getByText('Add Target'))
    
    const submitButton = screen.getByText('Save Targets')
    expect(submitButton).toBeDisabled()
  })
  
  it('enables submit when weight equals 100%', async () => {
    // Test implementation
  })
})
```

**3. E2E Component Flows (Playwright)**
```typescript
// tests/e2e/review-submission.spec.ts
import { test, expect } from '@playwright/test'

test('employee can submit self-evaluation', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="username"]', 'john.doe')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await page.goto('/reviews/1')
  
  // Rate all targets
  await page.click('[data-testid="target-0-rating-4"]')
  await page.fill('[data-testid="target-0-explanation"]', 'Completed successfully')
  
  // Submit
  await page.click('button:has-text("Submit Self-Evaluation")')
  
  // Verify state change
  await expect(page.locator('[data-testid="review-status"]')).toHaveText('Submitted')
})
```

### Component Performance Optimization

**1. React Server Components (Default)**
- Zero JavaScript sent to client
- Direct database access
- No useState, useEffect needed

**2. Client Component Optimization**
```typescript
// Use React.memo for expensive components
import { memo } from 'react'

export const TargetRatingGrid = memo(function TargetRatingGrid({ targets }) {
  // Only re-renders when targets change
})

// Use useMemo for expensive calculations
import { useMemo } from 'react'

export function ReviewSummary({ review }) {
  const finalScore = useMemo(() => {
    return calculateComplexScore(review)
  }, [review])
  
  return <div>Score: {finalScore}</div>
}

// Use useCallback for callback props
import { useCallback } from 'react'

export function ParentComponent() {
  const handleSubmit = useCallback((data) => {
    // Submit logic
  }, [])
  
  return <ChildComponent onSubmit={handleSubmit} />
}
```

**3. Code Splitting**
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const AIHelpModal = dynamic(() => import('@/components/ai/ai-help-modal'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Don't render on server
})

export function ReviewForm() {
  return (
    <>
      <Button onClick={() => setShowModal(true)}>Get AI Help</Button>
      {showModal && <AIHelpModal />}
    </>
  )
}
```

**4. Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image'

export function UserAvatar({ user }) {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={user.fullName}
      width={40}
      height={40}
      className="rounded-full"
    />
  )
}
```

### Component Accessibility (WCAG 2.1 AA)

All components follow accessibility best practices:

```typescript
// 1. Semantic HTML
<button type="button">Submit</button>  // Not <div onClick>

// 2. ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <X />
</button>

// 3. Keyboard navigation
<Dialog
  onKeyDown={(e) => {
    if (e.key === 'Escape') onClose()
  }}
>

// 4. Focus management
import { useEffect, useRef } from 'react'

export function Modal({ open }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus()
    }
  }, [open])
  
  return <Dialog>
    <button ref={closeButtonRef}>Close</button>
  </Dialog>
}

// 5. Color contrast (enforced by Tailwind)
<span className="text-gray-900 dark:text-gray-100">
  High contrast text
</span>
```

**shadcn/ui Benefits:**
- ✅ Built on Radix UI (accessible primitives)
- ✅ ARIA attributes included
- ✅ Keyboard navigation support
- ✅ Screen reader tested
- ✅ Focus management built-in

---

## Frontend Architecture

This section provides a comprehensive view of the frontend architecture, built on Next.js 14+ App Router with React Server Components and modern patterns.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           Browser Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │  React Client  │  │    Zustand     │  │ TanStack Query │              │
│  │   Components   │  │  State Manager │  │  Cache Layer   │              │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘              │
│           │                   │                    │                       │
│           └───────────────────┴────────────────────┘                       │
│                               │                                            │
│                    Client-Side JavaScript                                  │
│                    (Minimal, only for interactivity)                       │
│                                                                             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                        Next.js Server Layer                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                  React Server Components (RSC)                        │ │
│  │  - Server-side rendering                                              │ │
│  │  - Direct database queries via Prisma                                 │ │
│  │  - Zero JavaScript to client                                          │ │
│  │  - Automatic code splitting                                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     App Router (File-based routing)                   │ │
│  │                                                                       │ │
│  │  app/                                                                 │ │
│  │  ├── (auth)/                  ← Route groups                         │ │
│  │  │   ├── login/page.tsx       ← Public routes                        │ │
│  │  │   └── logout/page.tsx                                             │ │
│  │  │                                                                    │ │
│  │  └── (dashboard)/             ← Protected routes                     │ │
│  │      ├── layout.tsx           ← Shared layout                        │ │
│  │      ├── dashboard/                                                  │ │
│  │      │   ├── employee/page.tsx                                       │ │
│  │      │   ├── manager/page.tsx                                        │ │
│  │      │   └── hr-consolidation/page.tsx                               │ │
│  │      │                                                                │ │
│  │      ├── targets/                                                    │ │
│  │      │   ├── new/page.tsx                                            │ │
│  │      │   └── [id]/page.tsx                                           │ │
│  │      │                                                                │ │
│  │      └── reviews/                                                    │ │
│  │          ├── [id]/page.tsx                                           │ │
│  │          └── archived/[id]/page.tsx                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       Middleware Layer                                │ │
│  │  - Authentication check (NextAuth.js)                                │ │
│  │  - RBAC enforcement                                                  │ │
│  │  - Route protection                                                  │ │
│  │  - Role validation                                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rendering Strategy

**Server Components (Default)**
- Used for: Layouts, page shells, data display, static content
- Benefits: Zero JavaScript, faster initial load, better SEO
- Data fetching: Direct Prisma queries in component

```typescript
// app/(dashboard)/reviews/[id]/page.tsx
import { prisma } from '@/lib/db/prisma'

export default async function ReviewPage({ params }) {
  // Server-side data fetching
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { reviewee: true, reviewer: true }
  })
  
  // Render on server, send HTML to client
  return <ReviewDetails review={review} />
}
```

**Client Components ('use client')**
- Used for: Forms, modals, interactive widgets, state management
- Benefits: Rich interactivity, real-time updates, animations
- When to use: onClick, onChange, useState, useEffect

```typescript
// src/components/reviews/review-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function ReviewForm({ initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({ defaultValues: initialData })
  
  // Client-side interactivity
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT LAYERS                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Server State (TanStack Query)                                             │
│  - API responses cached                                                    │
│  - Automatic refetching                                                    │
│  - Optimistic updates                                                      │
│  - Background sync                                                         │
│                                                                            │
│  Example: Reviews list, user data, target settings                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Global Client State (Zustand)                                             │
│  - Role switching (employee/manager/hr_admin)                              │
│  - Modal open/close state                                                 │
│  - Theme preferences                                                       │
│  - Notification state                                                      │
│                                                                            │
│  Example: currentRole, isModalOpen, theme                                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Local Component State (useState)                                          │
│  - Form input values                                                       │
│  - UI toggles                                                              │
│  - Temporary selections                                                    │
│                                                                            │
│  Example: searchQuery, isExpanded, selectedTab                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  URL State (Next.js Router)                                                │
│  - Filters, pagination                                                     │
│  - Search parameters                                                       │
│  - Shareable state                                                         │
│                                                                            │
│  Example: ?page=2&status=pending&role=manager                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Fetching Patterns

**Pattern 1: Server Component Direct Query**
```typescript
// Best for: Initial page load, SEO-critical content
export default async function Page() {
  const data = await prisma.review.findMany()
  return <List data={data} />
}
```

**Pattern 2: Client Component with TanStack Query**
```typescript
// Best for: Interactive lists, real-time updates, infinite scroll
'use client'
import { useQuery } from '@tanstack/react-query'

export function ReviewList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => fetch('/api/reviews').then(r => r.json())
  })
  
  if (isLoading) return <Skeleton />
  return <List data={data} />
}
```

**Pattern 3: Server Component + Client Component Composition**
```typescript
// Best for: Combining static shell with dynamic content
// page.tsx (Server Component)
export default async function Page() {
  const staticData = await prisma.fiscalYear.findMany()
  
  return (
    <>
      <StaticHeader data={staticData} />
      <DynamicReviewList /> {/* Client Component */}
    </>
  )
}
```

### Styling Architecture

**Tailwind CSS + shadcn/ui System**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STYLING LAYERS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Design Tokens (tailwind.config.js)                               │
│  - Colors: primary, secondary, accent, muted                               │
│  - Spacing: 4px base unit                                                  │
│  - Typography: font families, sizes, weights                               │
│  - Breakpoints: sm, md, lg, xl, 2xl                                        │
│  - Animation: duration, easing                                             │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 2: Component Primitives (shadcn/ui)                                 │
│  - Button, Input, Select, Dialog                                           │
│  - Table, Card, Badge, Avatar                                              │
│  - Pre-configured with accessibility                                       │
│  - Customizable via className                                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 3: Composite Components                                             │
│  - ReviewCard, TargetGrid, DashboardWidget                                 │
│  - Built from primitives                                                   │
│  - Domain-specific styling                                                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 4: Glassmorphism Theme                                              │
│  - Backdrop blur effects                                                   │
│  - Translucent surfaces                                                    │
│  - Gradient overlays                                                       │
│  - Modern aesthetic                                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

**Example Implementation:**
```typescript
// Glassmorphism card component
<div className="
  backdrop-blur-md
  bg-white/80 dark:bg-gray-900/80
  border border-white/20
  shadow-xl
  rounded-xl
  p-6
">
  <h2 className="text-2xl font-semibold mb-4">Review Details</h2>
  <ReviewContent />
</div>
```

### Form Handling Architecture

```typescript
// Complete form pattern with React Hook Form + Zod
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define validation schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  explanation: z.string().min(50).max(1000)
})

// 2. Infer TypeScript types
type ReviewFormData = z.infer<typeof reviewSchema>

// 3. Form component
export function ReviewForm() {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 3, explanation: '' }
  })
  
  // 4. Submit handler
  const onSubmit = async (data: ReviewFormData) => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      toast.success('Review submitted')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <RatingStars {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}
```

### Error Handling & Loading States

**Error Boundaries:**
```typescript
// app/error.tsx - Route-level error boundary
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

**Loading States:**
```typescript
// app/loading.tsx - Route-level loading UI
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

**Suspense Boundaries:**
```typescript
// Granular loading for specific components
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header /> {/* Loads immediately */}
      
      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewList /> {/* Streams in when ready */}
      </Suspense>
    </>
  )
}
```

### Frontend Performance Optimizations

1. **Code Splitting**: Automatic via Next.js App Router
2. **Image Optimization**: `next/image` with lazy loading
3. **Font Optimization**: `next/font` for self-hosted fonts
4. **Route Prefetching**: Links prefetch on hover
5. **Bundle Analysis**: `@next/bundle-analyzer`

```typescript
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/charts/performance-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Don't render on server
})
```

---

## Backend Architecture

This section details the backend architecture built on Next.js API Routes with a clean service layer pattern.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Routes Layer                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  app/api/                                                                   │
│  ├── auth/[...nextauth]/route.ts    ← NextAuth.js endpoint                │
│  │                                                                          │
│  ├── reviews/                                                              │
│  │   ├── route.ts                   ← GET /api/reviews, POST              │
│  │   ├── [id]/route.ts              ← GET, PATCH, DELETE by ID           │
│  │   ├── [id]/submit/route.ts       ← POST state transitions             │
│  │   └── [id]/self-eval/route.ts    ← PATCH self-evaluation              │
│  │                                                                          │
│  ├── targets/                                                              │
│  │   ├── route.ts                   ← Target CRUD operations              │
│  │   └── [id]/approve/route.ts      ← Manager approval                    │
│  │                                                                          │
│  ├── users/                                                                │
│  │   ├── route.ts                   ← User management                     │
│  │   └── [id]/route.ts              ← User details                        │
│  │                                                                          │
│  ├── fiscal-years/                                                         │
│  │   └── [year]/close/route.ts      ← Fiscal year operations              │
│  │                                                                          │
│  └── reports/                                                              │
│      └── multi-year/route.ts        ← Historical reporting                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/lib/                                                                   │
│  ├── auth/                                                                  │
│  │   ├── auth-service.ts            ← Authentication & authorization       │
│  │   └── permissions.ts             ← RBAC logic                          │
│  │                                                                          │
│  ├── scoring/                                                              │
│  │   └── score-calculator.ts        ← Performance score calculation        │
│  │                                                                          │
│  ├── workflows/                                                            │
│  │   ├── review-state-machine.ts    ← State transition logic              │
│  │   └── notification-service.ts    ← Email/in-app notifications          │
│  │                                                                          │
│  ├── ai/                                                                   │
│  │   └── ai-service.ts               ← AI integration (Ollama/web)        │
│  │                                                                          │
│  ├── audit/                                                                │
│  │   └── audit-logger.ts             ← Audit trail logging                │
│  │                                                                          │
│  └── backup/                                                               │
│      └── backup-service.ts           ← Database backup operations          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       Data Access Layer (Prisma)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/lib/db/                                                                │
│  ├── prisma.ts                       ← Singleton Prisma client             │
│  └── seed.ts                         ← Database seeding                    │
│                                                                             │
│  prisma/                                                                    │
│  ├── schema.prisma                   ← Database schema definition          │
│  └── migrations/                     ← Version-controlled migrations       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Database Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SQLite (MVP) / PostgreSQL (Production)                                    │
│  - 11 tables: User, Review, TargetSetting, RoleAssignment, etc.           │
│  - ACID transactions                                                        │
│  - Foreign key constraints                                                  │
│  - Performance indexes                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Route Structure

**Standard Route Pattern:**
```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'
import { AuditLogger } from '@/lib/audit/audit-logger'

// GET /api/reviews - List reviews
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'AUTH_REQUIRED'),
        { status: 401 }
      )
    }
    
    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'employee'
    const status = searchParams.get('status')
    
    // 3. Authorization check
    if (!session.user.roles.includes(role)) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'INVALID_ROLE'),
        { status: 403 }
      )
    }
    
    // 4. Build query based on role
    const where = role === 'employee'
      ? { revieweeId: session.user.id }
      : { reviewerId: session.user.id }
    
    if (status) {
      where.status = status
    }
    
    // 5. Database query
    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewee: { select: { id: true, fullName: true, employeeId: true } },
        reviewer: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 6. Return success response
    return NextResponse.json(createSuccessResponse(reviews))
    
  } catch (error) {
    // 7. Error handling
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error', 'SERVER_ERROR'),
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validation with Zod
    const validation = ReviewCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', 'VALIDATION_ERROR', validation.error),
        { status: 400 }
      )
    }
    
    // Business logic in transaction
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: validation.data
      })
      
      // Audit log
      await tx.auditEntry.create({
        data: {
          actorId: session.user.id,
          actorRole: 'hr_admin',
          action: 'create_review',
          targetType: 'review',
          targetId: created.id
        }
      })
      
      return created
    })
    
    return NextResponse.json(createSuccessResponse(review), { status: 201 })
    
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      createErrorResponse('Failed to create review', 'CREATE_ERROR'),
      { status: 500 }
    )
  }
}
```

### Service Layer Pattern

**Example: AuthService**
```typescript
// src/lib/auth/auth-service.ts
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'

export class AuthService {
  /**
   * Check if user can access a specific review
   */
  static async canAccessReview(
    userId: string,
    reviewId: string,
    role: string
  ): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { revieweeId: true, reviewerId: true, archived: true }
    })
    
    if (!review) return false
    
    // Employee can only access own review
    if (role === 'employee') {
      return review.revieweeId === userId
    }
    
    // Manager can access direct reports' reviews
    if (role === 'manager') {
      if (review.reviewerId === userId) return true
      
      // Check for delegation
      const delegation = await prisma.roleAssignment.findFirst({
        where: {
          reviewerId: userId,
          revieweeId: review.revieweeId,
          effectiveFrom: { lte: new Date() },
          effectiveTo: { gte: new Date() }
        }
      })
      
      return !!delegation
    }
    
    // HR Admin can access all reviews
    if (role === 'hr_admin') {
      return true
    }
    
    return false
  }
  
  /**
   * Check if user can modify a review
   */
  static async canModifyReview(
    userId: string,
    reviewId: string,
    role: string
  ): Promise<boolean> {
    // Archived reviews cannot be modified
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { archived: true, status: true, revieweeId: true, reviewerId: true }
    })
    
    if (!review || review.archived) return false
    
    // Check status-specific permissions
    if (role === 'employee') {
      return review.status === 'self_eval_draft' && review.revieweeId === userId
    }
    
    if (role === 'manager') {
      return review.status === 'manager_eval_in_progress' && review.reviewerId === userId
    }
    
    // HR Admin has limited modification rights
    if (role === 'hr_admin') {
      return ['submitted_to_hr_final', 'hr_review_complete'].includes(review.status)
    }
    
    return false
  }
}
```

**Example: ScoreCalculator Service**
```typescript
// src/lib/scoring/score-calculator.ts
export class ScoreCalculator {
  private static DIFFICULTY_MULTIPLIERS = {
    'L1': 1.0,
    'L2': 1.2,
    'L3': 1.5
  }
  
  /**
   * Calculate final review score
   */
  static calculateScore(
    targets: EmployeeTarget[],
    managerRatings: ManagerRating[]
  ): number {
    let totalScore = 0
    
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const rating = managerRatings[i]
      
      // Base score: rating × weight
      const baseScore = rating.managerRating * target.weight
      
      // Apply difficulty multiplier
      const multiplier = this.DIFFICULTY_MULTIPLIERS[target.difficulty]
      const targetScore = baseScore * multiplier
      
      totalScore += targetScore
    }
    
    return Math.round(totalScore)
  }
  
  /**
   * Map score to rank based on employee type and grade
   */
  static async mapToRank(
    score: number,
    employeeType: string,
    grade: string
  ): Promise<string> {
    const mapping = await prisma.scoreMapping.findUnique({
      where: {
        employeeType_grade: { employeeType, grade }
      }
    })
    
    if (!mapping) {
      throw new Error(`No score mapping found for ${employeeType} - ${grade}`)
    }
    
    const ranges = mapping.mappings as ScoreRange[]
    
    for (const range of ranges) {
      if (score >= range.min && score <= range.max) {
        return range.rank
      }
    }
    
    throw new Error(`Score ${score} outside valid ranges`)
  }
}
```

### Validation Layer (Zod Schemas)

```typescript
// src/lib/validation/review-schemas.ts
import { z } from 'zod'

// Base target schema
export const BaseTargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

// Target set validation (3-5 targets, total weight = 100%)
export const TargetSetSchema = z.array(BaseTargetSchema)
  .min(3, 'Minimum 3 targets required')
  .max(5, 'Maximum 5 targets allowed')
  .refine(
    (targets) => targets.reduce((sum, t) => sum + t.weight, 0) === 100,
    { message: 'Target weights must total exactly 100%' }
  )

// Employee self-evaluation schema
export const SelfEvaluationSchema = z.object({
  employeeTargets: z.array(
    z.object({
      ...BaseTargetSchema.shape,
      employeeRating: z.number().int().min(1).max(5),
      resultExplanation: z.string().min(50).max(1000),
      aiAssisted: z.boolean().optional()
    })
  ),
  currentJobDesc: z.string().min(10).max(500),
  careerPath: z.string().max(500).optional()
})

// Manager evaluation schema
export const ManagerEvaluationSchema = z.object({
  managerTargetRatings: z.array(
    z.object({
      targetIndex: z.number().int().min(0),
      managerRating: z.number().int().min(1).max(5),
      disagreeReason: z.string().max(500).optional()
    })
  ),
  managerFeedback: z.array(
    z.object({
      targetIndex: z.number().int().min(0),
      feedback: z.string().min(50).max(1000),
      aiAssisted: z.boolean().optional()
    })
  ),
  overallSummary: z.string().min(100).max(2000)
})
```

### Transaction Patterns

**Pattern 1: Simple Transaction**
```typescript
// Single operation with audit log
const result = await prisma.$transaction(async (tx) => {
  const review = await tx.review.update({
    where: { id },
    data: { status: 'submitted' }
  })
  
  await tx.auditEntry.create({
    data: { /* audit data */ }
  })
  
  return review
})
```

**Pattern 2: Complex Multi-Step Transaction**
```typescript
// Multiple related operations
const result = await prisma.$transaction(async (tx) => {
  // 1. Update review
  const review = await tx.review.update({
    where: { id },
    data: { status: 'manager_eval_complete', finalScore, finalRank }
  })
  
  // 2. Create notification
  await tx.notification.create({
    data: { userId: review.revieweeId, message: 'Review completed' }
  })
  
  // 3. Update manager stats
  await tx.user.update({
    where: { id: review.reviewerId },
    data: { reviewsCompleted: { increment: 1 } }
  })
  
  // 4. Audit log
  await tx.auditEntry.create({
    data: { /* audit data */ }
  })
  
  return review
})
```

### Error Handling Strategy

```typescript
// Unified error response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// Error codes
export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  REVIEW_ARCHIVED = 'REVIEW_ARCHIVED',
  SERVER_ERROR = 'SERVER_ERROR'
}

// Factory functions
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(
  message: string,
  code: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  }
}
```

### Middleware Pattern

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Public routes
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login')
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Authentication check
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Role validation for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const roleParam = request.nextUrl.searchParams.get('role')
    
    if (roleParam && !token.roles.includes(roleParam)) {
      return NextResponse.json(
        { error: 'Forbidden: Role not assigned' },
        { status: 403 }
      )
    }
    
    // Check archived review modification
    if (request.method !== 'GET' && request.nextUrl.pathname.includes('/reviews/')) {
      // Archived review protection logic
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
```

### Logging & Monitoring

```typescript
// src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// Usage in API routes
import { logger } from '@/lib/logger'

logger.info('Review submitted', {
  userId: session.user.id,
  reviewId: review.id,
  status: review.status
})

logger.error('Failed to calculate score', {
  error: error.message,
  reviewId: review.id
})
```

### Caching Strategy

```typescript
// Next.js route caching
export const revalidate = 3600 // Revalidate every hour

// TanStack Query caching (client-side)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
})

// Redis caching (future production)
// import { redis } from '@/lib/redis'
// 
// const cached = await redis.get(`review:${id}`)
// if (cached) return JSON.parse(cached)
// 
// const review = await prisma.review.findUnique({ where: { id } })
// await redis.set(`review:${id}`, JSON.stringify(review), 'EX', 300)
```

---

## Core Workflows

This section documents the key business workflows that drive the performance review system. Each workflow includes sequence diagrams, implementation details, and validation rules.

### Workflow 1: Target Setting Process

**Actors:** Employee, Manager, System  
**Trigger:** Start of fiscal year or new employee onboarding  
**Outcome:** Approved target set ready for performance evaluation

```mermaid
sequenceDiagram
    participant Employee
    participant System
    participant Manager
    
    Note over Employee,Manager: TARGET SETTING WORKFLOW
    
    Employee->>System: 1. Navigate to "Set Targets"
    System->>System: Create Draft
    
    Employee->>System: 2. Add 3-5 targets<br/>- Task description<br/>- KPI (measurable)<br/>- Weight (total = 100%)<br/>- Difficulty (L1/L2/L3)
    
    System->>System: 3. Validation:<br/>✓ Min 3 targets, Max 5 targets<br/>✓ Total weight = 100%<br/>✓ All fields filled
    
    Employee->>System: 4. Click "Submit to Manager"
    System->>System: Status: submitted
    System->>Manager: Notification: Targets pending approval
    
    Manager->>Manager: 5. Review targets<br/>(Dashboard shows pending)
    
    Note over Manager: 6. Manager options:<br/>A) Approve<br/>B) Request changes<br/>C) Modify & approve
    
    Manager->>System: [OPTION A: Approve]
    System->>System: Status: approved
    System->>Employee: Notification: Targets approved
    
    Note over System: 7. Targets locked for review cycle<br/>Status: complete
    
    Note over System: Copy to Review.employeeTargets<br/>when review cycle starts
```

**Implementation:**

```typescript
// src/app/api/targets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/prisma'
import { TargetSetSchema } from '@/lib/validation/target-schemas'
import { AuditLogger } from '@/lib/audit/audit-logger'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // 1. Authentication check
  if (!session?.user) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', 'AUTH_REQUIRED'),
      { status: 401 }
    )
  }
  
  // 2. Parse and validate request
  const body = await request.json()
  const validation = TargetSetSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      createErrorResponse('Validation failed', 'VALIDATION_ERROR', validation.error),
      { status: 400 }
    )
  }
  
  const { targets } = validation.data
  
  // 3. Check for existing target set
  const existing = await prisma.targetSetting.findUnique({
    where: {
      employeeId_cycleYear: {
        employeeId: session.user.id,
        cycleYear: new Date().getFullYear()
      }
    }
  })
  
  if (existing && existing.status !== 'draft') {
    return NextResponse.json(
      createErrorResponse('Target set already submitted', 'ALREADY_SUBMITTED'),
      { status: 409 }
    )
  }
  
  // 4. Create or update target set
  const targetSetting = await prisma.targetSetting.upsert({
    where: {
      employeeId_cycleYear: {
        employeeId: session.user.id,
        cycleYear: new Date().getFullYear()
      }
    },
    create: {
      employeeId: session.user.id,
      managerId: session.user.managerId,
      cycleYear: new Date().getFullYear(),
      status: 'draft',
      targets: targets
    },
    update: {
      targets: targets,
      updatedAt: new Date()
    }
  })
  
  // 5. Audit log
  await AuditLogger.logAction({
    actorId: session.user.id,
    actorRole: 'employee',
    action: 'create_targets',
    targetType: 'target_setting',
    targetId: targetSetting.id,
    details: { targetCount: targets.length }
  })
  
  return NextResponse.json(createSuccessResponse(targetSetting))
}

// Submit targets to manager
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { id, action } = await request.json()
  
  if (action === 'submit') {
    // 1. Validate target set is complete
    const targetSetting = await prisma.targetSetting.findUnique({
      where: { id }
    })
    
    if (!targetSetting || targetSetting.employeeId !== session.user.id) {
      return NextResponse.json(
        createErrorResponse('Not found', 'NOT_FOUND'),
        { status: 404 }
      )
    }
    
    if (targetSetting.status !== 'draft') {
      return NextResponse.json(
        createErrorResponse('Already submitted', 'INVALID_STATUS'),
        { status: 400 }
      )
    }
    
    // 2. Update status
    const updated = await prisma.targetSetting.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date()
      }
    })
    
    // 3. Notify manager
    await NotificationService.notifyTargetSubmission(
      targetSetting.managerId,
      session.user.id,
      targetSetting.id
    )
    
    // 4. Audit log
    await AuditLogger.logAction({
      actorId: session.user.id,
      actorRole: 'employee',
      action: 'submit_targets',
      targetType: 'target_setting',
      targetId: id
    })
    
    return NextResponse.json(createSuccessResponse(updated))
  }
  
  // Manager approval
  if (action === 'approve') {
    const targetSetting = await prisma.targetSetting.findUnique({
      where: { id }
    })
    
    // Authorization check
    if (targetSetting.managerId !== session.user.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'NOT_AUTHORIZED'),
        { status: 403 }
      )
    }
    
    const updated = await prisma.targetSetting.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date()
      }
    })
    
    // Notify employee
    await NotificationService.notifyTargetApproval(
      targetSetting.employeeId,
      targetSetting.id
    )
    
    await AuditLogger.logAction({
      actorId: session.user.id,
      actorRole: 'manager',
      action: 'approve_targets',
      targetType: 'target_setting',
      targetId: id
    })
    
    return NextResponse.json(createSuccessResponse(updated))
  }
}
```

**Validation Rules:**
- Minimum 3 targets, maximum 5 targets
- Total weight must equal exactly 100%
- Each target must have non-empty task description and KPI
- Difficulty must be one of: L1, L2, L3
- Weight must be between 1 and 100
- Cannot submit if already submitted (must be draft status)
- Only assigned manager can approve

---

### Workflow 2: Self-Evaluation Submission

**Actors:** Employee, System  
**Trigger:** Review cycle opens (typically end of fiscal year)  
**Outcome:** Self-evaluation submitted to manager for review

```mermaid
sequenceDiagram
    participant Employee
    participant System
    participant AIService
    participant Manager
    
    Note over Employee,Manager: SELF-EVALUATION WORKFLOW
    
    System->>Employee: 1. System creates review<br/>(copies approved targets)
    
    Employee->>System: 2. Navigate to "My Review"<br/>Status: self_eval_draft
    
    Note over Employee: 3. For each target:
    Employee->>System: A. Rate performance (1-5 stars)<br/>1: Did not achieve<br/>2: Partially achieved<br/>3: Achieved<br/>4: Exceeded<br/>5: Far exceeded
    
    Employee->>System: B. Write result explanation
    
    opt Optional: AI Help
        Employee->>AIService: Click "AI Help"
        AIService->>AIService: Generate suggestion
        AIService-->>Employee: Return AI suggestion
        Employee->>Employee: Edit/Accept AI suggestion<br/>(marked as ai_assisted=true)
    end
    
    Employee->>System: 4. Update current job description<br/>(free text, 500 chars max)
    
    Employee->>System: 5. Update career path<br/>(aspirations, 500 chars max)
    
    Employee->>System: 6. Save as draft (auto-save every 30s)
    System->>System: Store in DB
    
    Employee->>System: 7. Click "Submit Self-Evaluation"
    
    System->>System: Validation:<br/>✓ All targets rated<br/>✓ All explanations provided
    
    System->>System: State transition:<br/>self_eval_draft → self_eval_submitted
    
    System->>Manager: Notify manager
    
    System-->>Employee: Confirmation:<br/>"Self-evaluation submitted successfully"
    
    Note over System: 8. Review becomes read-only for employee
```

**Implementation:**

```typescript
// src/app/api/reviews/[id]/self-eval/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const { employeeTargets, currentJobDesc, careerPath } = await request.json()
  
  // 1. Get review and validate ownership
  const review = await prisma.review.findUnique({
    where: { id: params.id }
  })
  
  if (!review || review.revieweeId !== session.user.id) {
    return NextResponse.json(
      createErrorResponse('Not found', 'NOT_FOUND'),
      { status: 404 }
    )
  }
  
  if (review.status !== 'self_eval_draft') {
    return NextResponse.json(
      createErrorResponse('Cannot edit after submission', 'INVALID_STATUS'),
      { status: 400 }
    )
  }
  
  // 2. Validate employee targets
  const validation = EmployeeTargetsSchema.safeParse(employeeTargets)
  if (!validation.success) {
    return NextResponse.json(
      createErrorResponse('Validation failed', 'VALIDATION_ERROR'),
      { status: 400 }
    )
  }
  
  // 3. Update review
  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      employeeTargets,
      currentJobDesc,
      careerPath,
      updatedAt: new Date()
    }
  })
  
  // 4. Audit log
  await AuditLogger.logAction({
    actorId: session.user.id,
    actorRole: 'employee',
    action: 'update_self_eval',
    targetType: 'review',
    targetId: params.id,
    details: {
      aiAssisted: employeeTargets.some(t => t.aiAssisted)
    }
  })
  
  return NextResponse.json(createSuccessResponse(updated))
}

// Submit self-evaluation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  // Use state machine for transition
  try {
    const review = await ReviewStateMachine.transition(
      params.id,
      'self_eval_submitted',
      session.user.id,
      'employee'
    )
    
    return NextResponse.json(createSuccessResponse(review))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error.message, 'TRANSITION_ERROR'),
      { status: 400 }
    )
  }
}
```

**Validation Rules:**
- All targets must have a rating (1-5)
- All targets must have result explanation (min 50 chars)
- Current job description required (max 500 chars)
- Career path optional (max 500 chars)
- Cannot submit if status is not `self_eval_draft`
- Auto-save every 30 seconds while editing
- AI assistance must be flagged in data

---

### Workflow 3: Manager Evaluation & Scoring

**Actors:** Manager, System  
**Trigger:** Employee submits self-evaluation  
**Outcome:** Complete review with final score and rank

```mermaid
sequenceDiagram
    participant Manager
    participant System
    participant AIService
    participant ScoreCalculator
    participant HRAdmin as HR Admin
    
    Note over Manager,HRAdmin: MANAGER EVALUATION WORKFLOW
    
    System->>Manager: 1. Notification: "Employee submitted self-eval"
    
    Manager->>System: 2. Navigate to Team Reviews Dashboard<br/>See: Pending reviews list
    
    Manager->>System: 3. Click on employee's review<br/>Status: manager_eval_in_progress
    
    System-->>Manager: 4. View employee's self-ratings<br/>(Read-only, side-by-side comparison)
    
    Note over Manager: 5. For each target:
    Manager->>System: A. Provide manager rating (1-5)<br/>- Can agree with employee<br/>- Can disagree (must explain)
    
    opt Optional: AI Help
        Manager->>AIService: B. Click "AI Help" for feedback
        AIService->>AIService: Generate suggestion
        AIService-->>Manager: Return AI suggestion
        Manager->>Manager: Edit/Accept AI suggestion
    end
    
    Manager->>System: 6. Write overall summary<br/>(Required: 100+ chars)
    
    Manager->>System: 7. Save as draft (auto-save)
    
    Manager->>System: 8. Click "Complete Evaluation"
    
    System->>System: Validation:<br/>✓ All rated<br/>✓ All feedback<br/>✓ Summary provided
    
    System->>ScoreCalculator: Calculate Score
    
    Note over ScoreCalculator: For each target:<br/>baseScore = rating × weight ×<br/>difficultyMultiplier<br/><br/>finalScore = Σ baseScores
    
    ScoreCalculator->>System: Return calculated score
    
    System->>System: Map to Rank:<br/>lookup(employeeType, grade, finalScore)
    
    System->>System: State transition:<br/>manager_eval_in_progress →<br/>manager_eval_complete
    
    System-->>Manager: Score & Rank Displayed<br/>finalScore: 245<br/>finalRank: "A"
    
    Manager->>Manager: 9. Review scorecard<br/>[Can go back and adjust if needed]
    
    Manager->>System: 10. Click "Submit to HR"
    
    System->>System: State transition:<br/>manager_eval_complete →<br/>submitted_to_hr_final
    
    System->>HRAdmin: Notify HR
    
    System-->>Manager: Confirmation
```

**Implementation:**

```typescript
// src/lib/scoring/score-calculator.ts
export class ScoreCalculator {
  private static DIFFICULTY_MULTIPLIERS = {
    'L1': 1.0,   // Base difficulty
    'L2': 1.2,   // 20% bonus for higher difficulty
    'L3': 1.5    // 50% bonus for highest difficulty
  }
  
  static calculateReviewScore(review: Review): {
    finalScore: number
    breakdown: ScoreBreakdown[]
  } {
    const targets = review.managerTargetRatings as ManagerRating[]
    const employeeTargets = review.employeeTargets as EmployeeTarget[]
    
    const breakdown: ScoreBreakdown[] = []
    let totalScore = 0
    
    for (let i = 0; i < targets.length; i++) {
      const rating = targets[i].managerRating
      const target = employeeTargets[i]
      
      // Base score: rating × weight
      const baseScore = rating * target.weight
      
      // Apply difficulty multiplier
      const multiplier = this.DIFFICULTY_MULTIPLIERS[target.difficulty]
      const targetScore = baseScore * multiplier
      
      totalScore += targetScore
      
      breakdown.push({
        targetIndex: i,
        taskDescription: target.taskDescription,
        rating,
        weight: target.weight,
        difficulty: target.difficulty,
        multiplier,
        score: targetScore
      })
    }
    
    return {
      finalScore: Math.round(totalScore),
      breakdown
    }
  }
  
  static async mapScoreToRank(
    score: number,
    employeeType: string,
    grade: string
  ): Promise<string> {
    // Lookup score mapping from database
    const mapping = await prisma.scoreMapping.findUnique({
      where: {
        employeeType_grade: {
          employeeType,
          grade
        }
      }
    })
    
    if (!mapping) {
      throw new Error(`No score mapping found for ${employeeType} - ${grade}`)
    }
    
    const mappings = mapping.mappings as ScoreRange[]
    
    // Find matching range
    for (const range of mappings) {
      if (score >= range.min && score <= range.max) {
        return range.rank
      }
    }
    
    throw new Error(`Score ${score} outside valid ranges`)
  }
}

// src/app/api/reviews/[id]/manager-eval/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const {
    managerTargetRatings,
    managerFeedback,
    overallSummary
  } = await request.json()
  
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { reviewee: true }
  })
  
  // Authorization check
  if (review.reviewerId !== session.user.id) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', 'NOT_AUTHORIZED'),
      { status: 403 }
    )
  }
  
  // Calculate score
  const { finalScore, breakdown } = ScoreCalculator.calculateReviewScore({
    ...review,
    managerTargetRatings
  })
  
  // Map to rank
  const finalRank = await ScoreCalculator.mapScoreToRank(
    finalScore,
    review.reviewee.employeeType,
    review.reviewee.grade
  )
  
  // Update review with transaction
  const updated = await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: { id: params.id },
      data: {
        managerTargetRatings,
        managerFeedback,
        overallSummary,
        finalScore,
        finalRank,
        status: 'manager_eval_complete',
        managerSubmittedAt: new Date()
      }
    })
    
    // Audit log
    await tx.auditEntry.create({
      data: {
        actorId: session.user.id,
        actorRole: 'manager',
        action: 'complete_manager_eval',
        targetType: 'review',
        targetId: params.id,
        details: {
          finalScore,
          finalRank,
          breakdown
        }
      }
    })
    
    return review
  })
  
  return NextResponse.json(createSuccessResponse({
    review: updated,
    scoreBreakdown: breakdown
  }))
}
```

**Validation Rules:**
- All targets must have manager rating
- All targets must have feedback (min 50 chars)
- Overall summary required (min 100 chars)
- If manager rating differs from employee by 2+ points, explanation required
- Score calculation must use correct difficulty multipliers
- Final rank must match score mapping table
- Only assigned manager can submit evaluation

---

### Workflow 4: Role Switching & Delegation

**Actors:** User (multi-role), System  
**Trigger:** User clicks role selector in header  
**Outcome:** User's view and permissions change based on selected role

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Zustand as Zustand Store
    participant API
    participant Middleware
    participant AuditLog as Audit Logger
    
    Note over User,AuditLog: ROLE SWITCHING WORKFLOW
    
    User->>System: 1. Login as alice@company.com<br/>roles: ["employee", "manager", "hr_admin"]
    
    System-->>User: 2. Default role: employee<br/>Dashboard shows: My reviews, My targets
    
    User->>System: 3. Click role selector in header<br/>Dropdown shows: Employee, Manager, HR Admin
    
    User->>Zustand: 4. Select "Manager"
    
    Zustand->>Zustand: Update currentRole = "manager"
    
    Zustand->>System: Check delegation:<br/>Query RoleAssignment for active delegations
    
    Zustand->>AuditLog: Log role switch
    
    Zustand-->>User: Dashboard updates immediately:<br/>- Shows team reviews<br/>- Shows pending approvals<br/>- Sidebar menu changes
    
    User->>API: 5. Make API calls with manager role<br/>GET /api/reviews?role=manager
    
    API->>Middleware: Check permissions
    
    Note over Middleware: - JWT valid<br/>- User has "manager" role<br/>- Check delegations
    
    Middleware-->>API: Authorized
    
    API-->>User: Returns: Team reviews<br/>(direct reports + delegated)
    
    User->>Zustand: 6. Switch to "HR Admin"
    
    Zustand->>Zustand: Update currentRole = "hr_admin"
    
    Zustand->>AuditLog: Log role switch
    
    Zustand-->>User: Dashboard shows:<br/>All reviews, System config
```

**Implementation:**

```typescript
// src/stores/role-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RoleStore {
  currentRole: 'employee' | 'manager' | 'hr_admin'
  availableRoles: string[]
  setRole: (role: string) => Promise<void>
  initializeRoles: (roles: string[]) => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      currentRole: 'employee',
      availableRoles: [],
      
      setRole: async (role: string) => {
        // Audit log the role switch
        await fetch('/api/audit/role-switch', {
          method: 'POST',
          body: JSON.stringify({
            previousRole: get().currentRole,
            newRole: role
          })
        })
        
        set({ currentRole: role as any })
        
        // Trigger router refresh to update RSC data
        window.location.reload()
      },
      
      initializeRoles: (roles: string[]) => {
        set({
          availableRoles: roles,
          currentRole: roles[0] as any
        })
      }
    }),
    {
      name: 'role-storage'
    }
  )
)

// src/components/auth/role-header.tsx
'use client'

import { useRoleStore } from '@/stores/role-store'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function RoleSelector({ userRoles }: { userRoles: string[] }) {
  const { currentRole, setRole } = useRoleStore()
  
  return (
    <Select value={currentRole} onValueChange={setRole}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {userRoles.map(role => (
          <SelectItem key={role} value={role}>
            {formatRoleName(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Extract role from query parameter or header
  const roleParam = request.nextUrl.searchParams.get('role')
  const roleHeader = request.headers.get('x-user-role')
  const requestedRole = roleParam || roleHeader || 'employee'
  
  // Validate user has this role
  if (!token.roles.includes(requestedRole)) {
    return NextResponse.json(
      { error: 'Forbidden: Role not assigned' },
      { status: 403 }
    )
  }
  
  // Check for active delegations
  if (requestedRole === 'manager') {
    const delegations = await prisma.roleAssignment.findMany({
      where: {
        reviewerId: token.sub,
        effectiveFrom: { lte: new Date() },
        effectiveTo: { gte: new Date() }
      }
    })
    
    // Add delegation info to request headers
    const response = NextResponse.next()
    response.headers.set('x-delegations', JSON.stringify(delegations))
    return response
  }
  
  return NextResponse.next()
}
```

**Validation Rules:**
- User must have the role in their `roles` array
- Role switches are audit logged
- Delegations checked for manager role
- Client-side state synced with server permissions
- Role context passed in all API requests

---

### Workflow 5: Review Archival & Historical Access

**Actors:** HR Admin, System  
**Trigger:** Fiscal year close  
**Outcome:** All reviews archived and made read-only

```mermaid
sequenceDiagram
    participant HRAdmin as HR Admin
    participant System
    participant Database
    participant User
    participant AuditLog as Audit Logger
    
    Note over HRAdmin,AuditLog: REVIEW ARCHIVAL WORKFLOW
    
    HRAdmin->>System: 1. Navigate to Fiscal Year Management
    
    HRAdmin->>System: 2. Select fiscal year (e.g., 2024)<br/>Status: Open<br/>Reviews: 45 completed, 3 in progress
    
    HRAdmin->>System: 3. Click "Close Fiscal Year"
    
    System->>System: Pre-check:<br/>- All reviews completed?<br/>- Board approval done?<br/>- All feedback delivered?
    
    System-->>HRAdmin: Warning: "3 reviews not yet delivered feedback"
    
    HRAdmin->>System: 4. Confirm closure<br/>[Override incomplete reviews]
    
    System->>Database: Batch update:<br/>UPDATE Review<br/>SET archived = true,<br/>archivedAt = NOW(),<br/>archivedBy = admin_id<br/>WHERE cycleYear = 2024
    
    System->>Database: UPDATE FiscalYear<br/>SET isClosed = true,<br/>closedAt = NOW()<br/>WHERE year = 2024
    
    System->>AuditLog: Log bulk archival
    
    System-->>HRAdmin: Success: "45 reviews archived"
    
    Note over User,Database: User attempts to edit archived review
    
    User->>System: 5. Edit archived review<br/>(As employee or manager)<br/>PATCH /api/reviews/archived-review-id
    
    System->>System: Check archived:<br/>IF review.archived = true<br/>THEN reject
    
    System-->>User: Error: "Cannot modify archived review (NFR007)"
    
    Note over HRAdmin,Database: HR Admin still has read access
    
    HRAdmin->>System: 6. View archived review<br/>GET /api/reviews/archived-review-id?role=hr_admin
    
    System-->>HRAdmin: Returns: Full review data (read-only)
    
    HRAdmin->>System: 7. Generate historical reports<br/>POST /api/reports/multi-year<br/>{ years: [2022, 2023, 2024] }
    
    System->>Database: Query archived:<br/>SELECT * FROM Review<br/>WHERE cycleYear IN (...)<br/>AND archived = true
    
    Database-->>System: Review data
    
    System-->>HRAdmin: Returns: Aggregated performance data
```

**Implementation:**

```typescript
// src/app/api/fiscal-years/[year]/close/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  const session = await getServerSession(authOptions)
  
  // Only HR Admin can close fiscal years
  if (!session.user.roles.includes('hr_admin')) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', 'NOT_AUTHORIZED'),
      { status: 403 }
    )
  }
  
  const year = parseInt(params.year)
  const { force } = await request.json()
  
  // Pre-checks
  const incompleteReviews = await prisma.review.count({
    where: {
      cycleYear: year,
      status: { notIn: ['feedback_delivered', 'archived'] }
    }
  })
  
  if (incompleteReviews > 0 && !force) {
    return NextResponse.json(
      createErrorResponse(
        `${incompleteReviews} reviews are not yet complete`,
        'INCOMPLETE_REVIEWS'
      ),
      { status: 400 }
    )
  }
  
  // Archive all reviews for this year
  const result = await prisma.$transaction(async (tx) => {
    // Update all reviews
    const archived = await tx.review.updateMany({
      where: { cycleYear: year },
      data: {
        archived: true,
        archivedAt: new Date(),
        archivedBy: session.user.id,
        status: 'archived'
      }
    })
    
    // Close fiscal year
    await tx.fiscalYear.update({
      where: { year },
      data: {
        isClosed: true,
        closedAt: new Date(),
        closedBy: session.user.id
      }
    })
    
    // Audit log
    await tx.auditEntry.create({
      data: {
        actorId: session.user.id,
        actorRole: 'hr_admin',
        action: 'close_fiscal_year',
        targetType: 'fiscal_year',
        targetId: year.toString(),
        details: {
          reviewsArchived: archived.count,
          force
        }
      }
    })
    
    return archived
  })
  
  return NextResponse.json(createSuccessResponse({
    reviewsArchived: result.count,
    year
  }))
}

// src/middleware.ts - Archived review protection
export async function middleware(request: NextRequest) {
  // ... existing auth checks ...
  
  // Check if modifying archived review
  if (request.method !== 'GET' && request.nextUrl.pathname.includes('/api/reviews/')) {
    const reviewId = request.nextUrl.pathname.split('/')[3]
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { archived: true }
    })
    
    if (review?.archived) {
      return NextResponse.json(
        {
          error: 'Cannot modify archived review (NFR007)',
          code: 'REVIEW_ARCHIVED'
        },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}
```

**Validation Rules:**
- Only HR Admin can close fiscal years
- Warning shown if reviews incomplete
- Force flag allows closure despite incomplete reviews
- All reviews for the year archived in single transaction
- Archived reviews completely read-only (except HR flags)
- Historical data accessible via dedicated endpoints
- Multi-year reports supported for trend analysis

---

## Architectural Patterns

This section documents the key architectural patterns and design principles used throughout the system to ensure consistency, maintainability, and scalability.

### 1. Layered Architecture Pattern

The application follows a strict layered architecture to separate concerns and maintain clean boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│         Presentation Layer (UI Components)                  │
│  - React Server Components (data fetching)                  │
│  - Client Components (interactivity)                        │
│  - Form components, dashboards, modals                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Uses
┌─────────────────────▼───────────────────────────────────────┐
│           API Layer (Next.js API Routes)                    │
│  - Request validation (Zod schemas)                         │
│  - Authentication/Authorization checks                      │
│  - Error handling and response formatting                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Delegates to
┌─────────────────────▼───────────────────────────────────────┐
│              Service Layer (Business Logic)                 │
│  - AuthService, AIService, ScoreCalculator                  │
│  - AuditLogger, BackupService                               │
│  - Domain-specific logic encapsulation                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Uses
┌─────────────────────▼───────────────────────────────────────┐
│           Data Access Layer (Prisma ORM)                    │
│  - Type-safe database queries                               │
│  - Transaction management                                   │
│  - Database abstraction                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Accesses
┌─────────────────────▼───────────────────────────────────────┐
│              Database Layer (SQLite/PostgreSQL)             │
│  - Data persistence                                         │
│  - ACID transactions                                        │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test each layer independently
- Changes in one layer don't cascade to others
- Business logic isolated from UI and data access

---

### 2. Repository Pattern (via Prisma)

Prisma ORM acts as a repository pattern implementation, abstracting database operations:

```typescript
// src/lib/db/prisma.ts - Singleton pattern
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Usage in service layer
export class ReviewService {
  async getReview(id: string) {
    return await prisma.review.findUnique({
      where: { id },
      include: { reviewee: true, reviewer: true }
    })
  }
}
```

**Benefits:**
- Database vendor independence (SQLite → PostgreSQL)
- Type-safe queries with TypeScript
- Centralized data access logic

---

### 3. Strategy Pattern (Authentication Providers)

NextAuth.js implements the Strategy pattern for pluggable authentication:

```typescript
// Current: Credentials Strategy
providers: [
  CredentialsProvider({ /* ... */ })
]

// Future: LDAP Strategy (no business logic changes)
providers: [
  LdapProvider({ /* ... */ })
]

// Application code remains unchanged
const user = await AuthService.getCurrentUser()
```

**Benefits:**
- Easy to swap authentication methods
- No business logic changes when switching providers
- Supports multiple authentication strategies simultaneously

---

### 4. Facade Pattern (Service Layer)

Service classes provide simplified interfaces to complex subsystems:

```typescript
// src/lib/auth/auth-service.ts
export class AuthService {
  // Facade hides complexity of NextAuth + Prisma + RBAC
  static async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    // Complex logic involving:
    // - Session validation
    // - Role checks
    // - Delegation lookup
    // - Archived status check
    // All hidden behind simple interface
  }
}

// Usage is simple
if (await AuthService.canAccessReview(userId, reviewId)) {
  // Allow access
}
```

**Benefits:**
- Simplified API for complex operations
- Encapsulates business rules
- Easy to mock for testing

---

### 5. Factory Pattern (API Response Creation)

Standardized response creation using factory functions:

```typescript
// src/lib/utils/api-response.ts
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(message: string, code: string): ApiResponse {
  return {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  }
}

// Usage in API routes
return NextResponse.json(createSuccessResponse(review))
return NextResponse.json(createErrorResponse('Not found', 'NOT_FOUND'), { status: 404 })
```

**Benefits:**
- Consistent API response format
- Easy to add cross-cutting concerns (logging, timing)
- Centralized response validation

---

### 6. Middleware Pattern (RBAC Enforcement)

Next.js middleware implements cross-cutting security concerns:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Chain of responsibility
  if (!token) return unauthorized()
  if (!hasRequiredRole(token, request.nextUrl)) return forbidden()
  
  return NextResponse.next()
}
```

**Benefits:**
- Centralized authentication/authorization
- Applied automatically to all routes
- No repeated security code in each API route

---

### 7. Observer Pattern (Audit Logging)

Audit logging observes and records sensitive operations:

```typescript
// src/lib/audit/audit-logger.ts
export class AuditLogger {
  static async logAction(params: {
    actorId: string
    actorRole: string
    action: string
    targetType: string
    targetId: string
    details?: any
  }) {
    await prisma.auditEntry.create({ data: params })
  }
}

// Usage after any sensitive operation
await AuditLogger.logAction({
  actorId: user.id,
  actorRole: currentRole,
  action: 'submit_review',
  targetType: 'review',
  targetId: review.id,
  details: { previousStatus: 'draft', newStatus: 'submitted' }
})
```

**Benefits:**
- Transparent audit trail
- Non-intrusive logging
- Complete compliance record

---

### 8. Adapter Pattern (AI Service)

AI Service adapts different AI providers to a common interface:

```typescript
// src/lib/ai/ai-service.ts
export class AIService {
  async getAIAssistance(context: AIContext): Promise<AIResult> {
    if (this.config.mode === 'web') {
      return this.webModeAdapter(context)
    } else {
      return this.ollamaAdapter(context)
    }
  }
  
  private async webModeAdapter(context: AIContext): Promise<AIResult> {
    // Adapt to copy/paste workflow
    return { type: 'prompt', content: this.generatePrompt(context) }
  }
  
  private async ollamaAdapter(context: AIContext): Promise<AIResult> {
    // Adapt to Ollama REST API
    const response = await fetch(this.config.ollamaUrl, { /* ... */ })
    return { type: 'result', content: response.data }
  }
}
```

**Benefits:**
- Consistent interface for different AI providers
- Easy to add new AI providers
- Configuration-driven behavior

---

### 9. Template Method Pattern (Form Validation)

Zod schemas define validation templates:

```typescript
// Base validation template
export const BaseTargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

// Extended template with custom validation
export const TargetSetSchema = z.array(BaseTargetSchema)
  .min(3)
  .max(5)
  .refine(
    (targets) => targets.reduce((sum, t) => sum + t.weight, 0) === 100,
    { message: 'Target weights must total exactly 100%' }
  )
```

**Benefits:**
- Reusable validation logic
- Type-safe validation
- Consistent error messages

---

### 10. Singleton Pattern (Database Connection)

Prisma client uses singleton to prevent connection exhaustion:

```typescript
// src/lib/db/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Benefits:**
- Single database connection pool
- Prevents connection leaks
- Optimized for serverless environments

---

### 11. Decorator Pattern (Logging & Timing)

Winston logger decorates operations with logging:

```typescript
// src/lib/logger.ts
import logger from '@/lib/logger'

export function withLogging(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      logger.info(`Starting ${operation}`, { args })
      try {
        const result = await originalMethod.apply(this, args)
        logger.info(`Completed ${operation}`, { result })
        return result
      } catch (error) {
        logger.error(`Failed ${operation}`, { error })
        throw error
      }
    }
    
    return descriptor
  }
}

// Usage
class ReviewService {
  @withLogging('review submission')
  async submitReview(reviewId: string) {
    // Method implementation
  }
}
```

**Benefits:**
- Non-intrusive logging
- Consistent log format
- Easy to add/remove logging

---

### 12. CQRS Light (Command Query Separation)

Separate read and write operations for clarity:

```typescript
// Query operations (src/lib/services/review-queries.ts)
export class ReviewQueries {
  static async getReview(id: string) {
    return await prisma.review.findUnique({ where: { id } })
  }
  
  static async listReviewsForManager(managerId: string) {
    return await prisma.review.findMany({
      where: { reviewerId: managerId }
    })
  }
}

// Command operations (src/lib/services/review-commands.ts)
export class ReviewCommands {
  static async submitReview(id: string, data: ReviewData) {
    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({ /* ... */ })
      await AuditLogger.logAction({ /* ... */ })
      return review
    })
  }
}
```

**Benefits:**
- Clear intent (read vs write)
- Easier to optimize separately
- Better testability

---

### 13. State Machine Pattern (Review Workflow)

Reviews follow a strict state machine:

```typescript
// src/lib/workflows/review-state-machine.ts
const REVIEW_TRANSITIONS = {
  'self_eval_draft': ['self_eval_submitted'],
  'self_eval_submitted': ['manager_eval_in_progress'],
  'manager_eval_in_progress': ['manager_eval_complete'],
  'manager_eval_complete': ['submitted_to_hr_final'],
  'submitted_to_hr_final': ['hr_review_complete'],
  'hr_review_complete': ['board_approved'],
  'board_approved': ['feedback_delivered'],
  'feedback_delivered': ['archived']
}

export class ReviewStateMachine {
  static canTransition(from: string, to: string): boolean {
    return REVIEW_TRANSITIONS[from]?.includes(to) ?? false
  }
  
  static async transition(reviewId: string, newStatus: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    
    if (!this.canTransition(review.status, newStatus)) {
      throw new Error(`Invalid transition: ${review.status} → ${newStatus}`)
    }
    
    return await prisma.review.update({
      where: { id: reviewId },
      data: { status: newStatus }
    })
  }
}
```

**Benefits:**
- Enforces valid workflow states
- Prevents invalid transitions
- Self-documenting business rules

---

### 14. Composition Over Inheritance

React components use composition instead of inheritance:

```typescript
// src/components/shared/modal.tsx
export function Modal({ children, title, onClose }: ModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Usage: Compose specific modals
export function AIHelpModal({ targetDescription, onAccept }: AIHelpModalProps) {
  return (
    <Modal title="AI Writing Assistant" onClose={() => {}}>
      <AIPromptDisplay target={targetDescription} />
      <AIResultInput onAccept={onAccept} />
    </Modal>
  )
}
```

**Benefits:**
- Flexible component reuse
- Easier to test
- Follows React best practices

---

### 15. Dependency Injection (Implicit via Imports)

Services receive dependencies through imports, enabling easy mocking:

```typescript
// src/lib/services/review-service.ts
import { prisma } from '@/lib/db/prisma'
import { AuditLogger } from '@/lib/audit/audit-logger'
import { ScoreCalculator } from '@/lib/scoring/calculator'

export class ReviewService {
  // Dependencies injected via imports
  async calculateAndSaveScore(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    const score = ScoreCalculator.calculate(review.targets)
    await prisma.review.update({ where: { id: reviewId }, data: { finalScore: score } })
    await AuditLogger.logAction({ /* ... */ })
  }
}

// Testing: Mock dependencies
jest.mock('@/lib/db/prisma')
jest.mock('@/lib/audit/audit-logger')
```

**Benefits:**
- Easy to test with mocks
- Clear dependency graph
- No complex DI container needed

---

## Pattern Selection Guidelines

When implementing new features, follow these guidelines:

| Scenario | Recommended Pattern | Example |
|----------|-------------------|---------|
| **Adding new authentication method** | Strategy Pattern | LDAP, OAuth, SAML |
| **Adding new API endpoint** | Layered Architecture | API Route → Service → Prisma |
| **Complex business operation** | Facade Pattern | Wrap in Service class |
| **State transitions** | State Machine | Review workflow, Target approval |
| **Cross-cutting concerns** | Middleware/Decorator | Auth, logging, timing |
| **Database queries** | Repository (Prisma) | Type-safe data access |
| **UI components** | Composition | Modal variants, form fields |
| **Configuration management** | Strategy/Adapter | AI providers, auth providers |
| **Audit requirements** | Observer Pattern | Log after sensitive operations |

---

## Anti-Patterns to Avoid

❌ **Business logic in UI components** - Keep components presentational, move logic to services  
❌ **Direct database access in API routes** - Use service layer  
❌ **Repeated validation logic** - Use Zod schemas  
❌ **God objects** - Keep services focused on single responsibility  
❌ **Circular dependencies** - Maintain clear layer boundaries  
❌ **Hardcoded configuration** - Use environment variables  
❌ **Ignoring error handling** - Always use try/catch and return ApiResponse  
❌ **Skipping audit logs** - Log all sensitive operations  

---

## Authentication Architecture

### Pluggable Provider Pattern

The authentication system is designed to support **username/password** authentication now with a clear migration path to **LDAP** in the future, without requiring business logic changes.

**Architecture Layers:**

```
Application Layer (Reviews, Targets, Dashboards)
          uses
Auth Service (Abstraction Layer)
  - getCurrentUser()
  - hasRole(role)
  - canAccessReview(reviewId)
          delegates to
NextAuth.js (Provider Manager)
  - Session management
  - JWT handling
  - Provider routing
          uses configured provider

 Credentials      LDAP     
  (MVP)         (Future)   

```

### MVP Implementation (Username/Password)

**NextAuth.js Credentials Provider:**

```	ypescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/db/prisma"

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })
        
        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            roles: user.roles
          }
        }
        return null
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.roles = token.roles
      return session
    }
  },
  
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60 // 8 hours
  }
}

export default NextAuth(authOptions)
```

### Future LDAP Migration

**When switching to LDAP:** Simply uncomment the LDAP provider configuration. No business logic changes required.

```	ypescript
// Future: Add LDAP provider
import LdapProvider from "next-auth/providers/ldap"

providers: [
  LdapProvider({
    id: 'ldap',
    name: 'LDAP',
    server: {
      url: process.env.LDAP_URL,
      bindDN: process.env.LDAP_BIND_DN,
      bindCredentials: process.env.LDAP_BIND_PASSWORD,
      searchBase: process.env.LDAP_SEARCH_BASE,
      searchFilter: '(uid={{username}})'
    },
    async authorize(user) {
      // Map LDAP user to local user record
      return await syncLdapUser(user)
    }
  })
]
```

### Auth Service Abstraction

```	ypescript
// src/lib/auth/auth-service.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db/prisma"

export class AuthService {
  static async getCurrentUser() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null
    
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roleAssignments: true }
    })
  }
  
  static async hasRole(userId: string, role: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return user?.roles.includes(role) ?? false
  }
  
  static async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) return false
    
    const user = await this.getCurrentUser()
    if (!user) return false
    
    // Reviewee access
    if (review.revieweeId === userId) return true
    
    // Reviewer access
    if (review.reviewerId === userId) return true
    
    // HR Admin access (read-only)
    if (user.roles.includes('hr_admin')) return true
    
    // Delegated reviewer access
    const delegation = await prisma.roleAssignment.findFirst({
      where: {
        reviewerId: userId,
        revieweeId: review.revieweeId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ]
      }
    })
    
    return !!delegation
  }
}
```

### User Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String?  @unique  // For credentials auth
  passwordHash String?             // For credentials (nullable for LDAP)
  fullName     String
  roles        String[]            // ["employee", "manager", "hr_admin"]
  
  // LDAP fields (for future)
  ldapDN       String?  @unique   // LDAP Distinguished Name
  ldapSyncedAt DateTime?
  authProvider String   @default("credentials") // "credentials" | "ldap"
  
  managerId    String?
  manager      User?    @relation("ManagerEmployee", fields: [managerId], references: [id])
  directReports User[]  @relation("ManagerEmployee")
  
  grade        String
  department   String
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## AI Integration Architecture

### Dual-Mode Strategy

The system supports two AI modes to accommodate different security and infrastructure requirements:

**Mode 1: Web-Based (Copy/Paste)**
- HR Admin configures prompt templates in database
- System generates combined prompt (template + context)
- User copies prompt to external AI tool (ChatGPT, Claude, etc.)
- User pastes result back into application
- **Benefit:** No API keys, no infrastructure, maximum flexibility

**Mode 2: Local Ollama**
- Direct integration with Ollama REST API
- Automatic prompt generation and result retrieval
- **Benefit:** Privacy, no external dependencies, faster UX

### Implementation

```	ypescript
// src/lib/ai/ai-service.ts
export type AIMode = 'web' | 'local'

export interface AIConfig {
  mode: AIMode
  ollamaUrl?: string
  ollamaModel?: string
  promptTemplates: {
    resultExplanation: string
    managerFeedback: string
  }
}

export class AIService {
  constructor(private config: AIConfig) {}
  
  async generatePrompt(context: {
    type: 'result_explanation' | 'manager_feedback'
    userText: string
    targetDescription?: string
  }): Promise<string> {
    const template = context.type === 'result_explanation'
      ? this.config.promptTemplates.resultExplanation
      : this.config.promptTemplates.managerFeedback
    
    return \\

Context:
Target: \

User's Input:
\

Please write a professional version of this content.\
  }
  
  async getAIAssistance(context: {
    type: 'result_explanation' | 'manager_feedback'
    userText: string
    targetDescription?: string
  }): Promise<{ type: 'prompt' | 'result', content: string }> {
    const prompt = await this.generatePrompt(context)
    
    if (this.config.mode === 'web') {
      // Web-based: Return prompt for user to copy
      return {
        type: 'prompt',
        content: prompt
      }
    } else {
      // Local Ollama: Call API directly
      const response = await fetch(\\/api/generate\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.ollamaModel || 'llama2',
          prompt: prompt,
          stream: false
        })
      })
      
      if (!response.ok) {
        throw new Error('Ollama API error')
      }
      
      const data = await response.json()
      return {
        type: 'result',
        content: data.response
      }
    }
  }
}
```

### API Routes

```	ypescript
// src/app/api/ai/generate-prompt/route.ts (Web-based mode)
export async function POST(request: NextRequest) {
  const { type, userText, targetDescription } = await request.json()
  
  const config = await getAIConfig() // From database
  const aiService = new AIService(config)
  
  const result = await aiService.getAIAssistance({
    type,
    userText,
    targetDescription
  })
  
  return NextResponse.json({ success: true, data: result })
}

// src/app/api/ai/generate/route.ts (Local Ollama mode)
export async function POST(request: NextRequest) {
  // Same implementation - AIService handles mode switching
}
```

### AI Config Database Schema

```prisma
model AIConfig {
  id                    String   @id @default(uuid())
  mode                  String   @default("web") // "web" | "local"
  ollamaUrl             String?  @default("http://localhost:11434")
  ollamaModel           String?  @default("llama2")
  resultExplanationTmpl String   @default("Please help write a professional self-evaluation...")
  managerFeedbackTmpl   String   @default("Please help write constructive manager feedback...")
  updatedAt             DateTime @updatedAt
}
```

---


## Implementation Patterns & Consistency Rules

These patterns ensure all AI agents and developers write compatible, consistent code.

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **React Components** | PascalCase | \ReviewForm.tsx\, \TargetRow.tsx\ |
| **Utility Functions** | kebab-case | \uth-service.ts\, \pi-response.ts\ |
| **API Routes** | kebab-case folders | \iscal-years/route.ts\ |
| **Hooks** | camelCase with \use\ | \useAuth.ts\, \useReview.ts\ |
| **Types/Interfaces** | PascalCase | \User.ts\, \Review.ts\ |
| **Functions/Variables** | camelCase | \calculateScore()\, \userId\ |
| **Constants** | SCREAMING_SNAKE_CASE | \MAX_TARGETS = 5\ |
| **Database Tables** | PascalCase (singular) | \User\, \Review\, \AuditEntry\ |
| **Database Columns** | camelCase | \userId\, \createdAt\, \passwordHash\ |
| **Foreign Keys** | \{table}Id\ | \
eviewerId\, \managerId\ |
| **API Endpoints** | kebab-case, plural | \/api/reviews\, \/api/fiscal-years\ |

### Error Handling

**Unified API Response Format:**

```	ypescript
// src/lib/utils/api-response.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: any
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  }
}
```

**Standard Error Codes:**

| Code | HTTP | Usage |
|------|------|-------|
| \UNAUTHORIZED\ | 401 | Not authenticated |
| \FORBIDDEN\ | 403 | Not authorized |
| \NOT_FOUND\ | 404 | Resource doesn't exist |
| \VALIDATION_ERROR\ | 400 | Invalid input |
| \CONFLICT\ | 409 | State conflict |
| \ARCHIVED_REVIEW\ | 403 | Modify archived review |
| \WEIGHT_TOTAL_ERROR\ | 400 | Weights  100% |
| \INTERNAL_ERROR\ | 500 | Server error |

### Logging Strategy

**Winston Configuration:**

```	ypescript
// src/lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pa-assistant' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
})

export default logger
```

**Logging Levels:**

- \error\: Critical failures (DB connection failed, API timeout)
- \warn\: Recoverable issues (missing optional field, deprecated usage)
- \info\: Important events (user login, review submission, FY closure)
- \debug\: Detailed debugging (SQL queries, API requests)

### Date/Time Handling

**Always use date-fns:**

```	ypescript
import { format, parseISO, isAfter, addDays } from 'date-fns'

// Storage: ISO 8601 strings in database
const createdAt = new Date().toISOString() // "2025-11-05T10:30:00.000Z"

// Display: Format for UI
const displayDate = format(parseISO(createdAt), 'PPP') // "November 5, 2025"

// Comparison: Use date-fns utilities
if (isAfter(deadline, new Date())) {
  // Deadline is future
}
```

**Pattern:** Store UTC in DB, display in user's local timezone.

### Validation with Zod

```	ypescript
// src/lib/utils/validation.ts
import { z } from 'zod'

export const TargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

export const TargetSetSchema = z.array(TargetSchema)
  .min(3)
  .max(5)
  .refine(
    (targets) => {
      const total = targets.reduce((sum, t) => sum + t.weight, 0)
      return total === 100
    },
    { message: 'Target weights must total exactly 100%' }
  )
```

---

## Data Architecture

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String?  @unique
  passwordHash String?
  fullName     String
  roles        String[]  // ["employee", "manager", "hr_admin"]
  
  // LDAP fields (future)
  ldapDN       String?  @unique
  ldapSyncedAt DateTime?
  authProvider String   @default("credentials")
  
  managerId    String?
  manager      User?    @relation("ManagerEmployee", fields: [managerId], references: [id])
  directReports User[]  @relation("ManagerEmployee")
  
  grade        String
  department   String
  employeeId   String?  @unique
  jobTitle     String?
  employmentStatus String @default("active")
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  reviewsAsReviewee Review[] @relation("RevieweeReviews")
  reviewsAsReviewer Review[] @relation("ReviewerReviews")
  targetSetsAsEmployee TargetSetting[] @relation("EmployeeTargets")
  targetSetsAsManager TargetSetting[] @relation("ManagerTargets")
  auditEntries AuditEntry[]
  roleAssignmentsAsReviewer RoleAssignment[] @relation("ReviewerAssignments")
  roleAssignmentsAsReviewee RoleAssignment[] @relation("RevieweeAssignments")
}

model TargetSetting {
  id          String   @id @default(uuid())
  employeeId  String
  employee    User     @relation("EmployeeTargets", fields: [employeeId], references: [id])
  managerId   String
  manager     User     @relation("ManagerTargets", fields: [managerId], references: [id])
  cycleYear   Int
  status      String   @default("draft")
  // States: draft | submitted_to_manager | revision_requested | 
  //         manager_approved | submitted_to_hr | target_setting_complete
  
  targets     Json     // Array of 3-5 targets with task, KPI, weight, difficulty
  
  submittedAt DateTime?
  approvedAt  DateTime?
  submittedToHRAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([employeeId, cycleYear])
}

model Review {
  id          String   @id @default(uuid())
  revieweeId  String
  reviewee    User     @relation("RevieweeReviews", fields: [revieweeId], references: [id])
  reviewerId  String
  reviewer    User     @relation("ReviewerReviews", fields: [reviewerId], references: [id])
  cycleYear   Int
  status      String   @default("self_eval_draft")
  // States: self_eval_draft | self_eval_submitted | manager_eval_in_progress | 
  //         manager_eval_complete | submitted_to_hr_final | hr_review_complete |
  //         board_approved | feedback_delivered | archived
  
  // Employee fields
  currentJobDescription String?
  careerPath            String?
  employeeTargets       Json    // Array with ratings and result explanations
  employeeSubmittedAt   DateTime?
  
  // Manager fields
  managerTargetRatings  Json?
  managerFeedback       Json?   // Array of feedback per target
  overallSummary        String?
  finalScore            Float?
  finalRank             String?
  managerSubmittedAt    DateTime?
  
  // Historical data (NFR007)
  archived    Boolean  @default(false)
  archivedAt  DateTime?
  archivedBy  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([revieweeId, cycleYear])
}

model RoleAssignment {
  id            String    @id @default(uuid())
  reviewerId    String
  reviewer      User      @relation("ReviewerAssignments", fields: [reviewerId], references: [id])
  revieweeId    String
  reviewee      User      @relation("RevieweeAssignments", fields: [revieweeId], references: [id])
  reason        String
  effectiveFrom DateTime
  effectiveTo   DateTime?
  createdAt     DateTime  @default(now())
  
  @@index([reviewerId, effectiveFrom, effectiveTo])
}

model AuditEntry {
  id         String   @id @default(uuid())
  actorId    String
  actor      User     @relation(fields: [actorId], references: [id])
  actorRole  String   // Role used when performing action
  action     String   // e.g., "edit_target", "accept_ai_synthesis", "switch_role"
  targetType String   // e.g., "review", "target", "user"
  targetId   String
  details    Json?    // Optional metadata (diffs, ai_assisted flag, etc.)
  timestamp  DateTime @default(now())
  
  @@index([actorId, timestamp])
  @@index([targetType, targetId])
}

model FiscalYear {
  id        String   @id @default(uuid())
  year      Int      @unique
  startDate DateTime
  endDate   DateTime
  isClosed  Boolean  @default(false)
  closedAt  DateTime?
  closedBy  String?
  createdAt DateTime @default(now())
}

model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  headId    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model EmployeeType {
  id        String   @id @default(uuid())
  type      String   @unique  // "Engineer", "Back-Office"
  grades    Json     // Array of valid grades for this type
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ScoreMapping {
  id           String   @id @default(uuid())
  employeeType String
  grade        String
  mappings     Json     // Array of {min, max, rank}
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([employeeType, grade])
}

model CompanyGoal {
  id          String   @id @default(uuid())
  title       String
  description String
  department  String?  // null = company-wide
  cycleYear   Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AIConfig {
  id                    String   @id @default(uuid())
  mode                  String   @default("web")
  ollamaUrl             String?  @default("http://localhost:11434")
  ollamaModel           String?  @default("llama2")
  resultExplanationTmpl String   @default("Please help write a professional self-evaluation...")
  managerFeedbackTmpl   String   @default("Please help write constructive manager feedback...")
  updatedAt             DateTime @updatedAt
}
```

---

## Security Architecture

### Authentication & Authorization

**Multi-Layer Security:**

1. **Authentication** - NextAuth.js with JWT tokens (8-hour expiration)
2. **Authorization** - Role-based access control (RBAC) via middleware
3. **Session Management** - Secure HTTP-only cookies
4. **Password Security** - bcrypt hashing (12 rounds)

### RBAC Implementation

**Middleware Enforcement:**

```	ypescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api') && 
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin-only routes
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      if (!token.roles?.includes('hr_admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

### Data Protection

**Encryption:**
- **At Rest:** SQLite database file-level encryption (production: PostgreSQL TDE)
- **In Transit:** HTTPS/TLS for all API communication
- **Passwords:** bcrypt hashing (12 rounds, salted)
- **JWTs:** Signed with HS256 algorithm

**Audit Logging:**
- All sensitive operations logged to \AuditEntry\ table
- Includes: actor, role, action, target, timestamp, details
- Append-only audit trail for compliance

**Historical Data Protection (NFR007):**
- Archived reviews are read-only via API enforcement
- \rchived\ flag + \rchivedAt\ timestamp + \rchivedBy\ userId
- HR Admin edits of archived data create flagged audit entries

---

## Performance Considerations

### NFR001 Compliance

**Target:** 200 concurrent users, <2s page load, <10s AI response

**Strategies:**

1. **Next.js Optimizations:**
   - Server-side rendering for initial load
   - Incremental static regeneration for dashboards
   - Automatic code splitting
   - Image optimization

2. **Database Performance:**
   - Prisma connection pooling
   - Indexed foreign keys and common queries
   - SQLite WAL mode for concurrent reads
   - PostgreSQL for production scale

3. **Caching Strategy:**
   - TanStack Query for client-side caching (5-minute stale time)
   - Next.js edge caching for static assets
   - Database query result caching

4. **AI Response Time:**
   - Web-based mode: No backend latency
   - Local Ollama: <10s typical response time
   - Async processing with loading states

---

## Deployment Architecture

### MVP Deployment (Pilot: 10 users)

**Single-Server Setup:**

```

   Next.js Server (Port 3000)        
   - Frontend (React)                
   - API Routes                      
   - Server-side rendering           

           
           

   SQLite Database                   
   - File-based (./prisma/dev.db)    
   - Automated backups to local disk 


Optional:

   Ollama (Port 11434)               
   - Local AI inference              
   - llama2 model                    

```

### Production Deployment (200+ users)

**Scalable Architecture:**

```
         
            Load Balancer 
         
                  
         
           Next.js Cluster 
           (3+ instances)  
         
                  
         
            PostgreSQL     
            (managed)      
         

Backups: Automated to S3/Cloud Storage
Monitoring: Winston  CloudWatch/DataDog
CDN: Cloudflare/CloudFront for static assets
```

### Environment Configuration

```ash
# .env.example
DATABASE_URL="file:./dev.db"  # SQLite for MVP
# DATABASE_URL="postgresql://..." # PostgreSQL for production

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secure-secret"

# AI Configuration (optional)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# LDAP (future)
# LDAP_URL="ldap://ldap.company.com"
# LDAP_BIND_DN="cn=admin,dc=company,dc=com"
# LDAP_BIND_PASSWORD="password"
# LDAP_SEARCH_BASE="ou=users,dc=company,dc=com"

LOG_LEVEL="info"
NODE_ENV="development"
```

---

## Testing Strategy

### Unit Tests (Vitest)

```	ypescript
// src/lib/scoring/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateScore } from './calculator'

describe('Score Calculator', () => {
  it('calculates score correctly', () => {
    const result = calculateScore({
      weight: 30,
      difficulty: 'L2', // 2x multiplier
      rating: 4
    })
    expect(result).toBe(240) // 30 * 2 * 4
  })
})
```

### Integration Tests

```	ypescript
// tests/integration/api/reviews.test.ts
describe('Review API', () => {
  it('creates review successfully', async () => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ /* data */ })
    })
    expect(response.status).toBe(201)
  })
})
```

### E2E Tests (Playwright)

```	ypescript
// tests/e2e/target-setting.spec.ts
test('employee can create targets', async ({ page }) => {
  await page.goto('/targets/new')
  await page.fill('[name="taskDescription"]', 'Improve system performance')
  await page.fill('[name="kpi"]', 'Reduce load time by 30%')
  await page.selectOption('[name="difficulty"]', 'L2')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/targets\/\[id\]/)
})
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Choose Next.js 14+ App Router over separate frontend/backend

**Context:** Need full-stack TypeScript solution with SSR for performance.

**Decision:** Use Next.js 14+ App Router with built-in API routes.

**Rationale:**
- Reduces infrastructure complexity (single deployment)
- Built-in SSR for <2s page load (NFR001)
- Unified TypeScript codebase
- Excellent shadcn/ui integration
- Proven at scale (Vercel, Notion, TikTok)

**Consequences:**
-  Faster initial development
-  Simplified deployment
-  Coupled frontend/backend (mitigated by clean architecture)

---

### ADR-002: SQLite for MVP  PostgreSQL for Production

**Context:** Need database that works for pilot (10 users) and scales to 200+.

**Decision:** Start with SQLite, migrate to PostgreSQL post-pilot.

**Rationale:**
- SQLite: Zero-config, file-based backups, perfect for pilot
- PostgreSQL: Enterprise-grade for production
- Prisma ORM abstracts migration (datasource change only)

**Consequences:**
-  Rapid MVP development
-  Clear migration path
-  One-time migration effort (minimal with Prisma)

---

### ADR-003: Dual-Mode AI (Web + Local Ollama)

**Context:** Security requirements vary; some orgs can't use external AI.

**Decision:** Support both web-based (copy/paste) and local Ollama modes.

**Rationale:**
- Flexibility for different security policies
- Web mode: No infrastructure, no cost
- Local mode: Privacy, faster UX
- Graceful degradation if AI unavailable

**Consequences:**
-  Maximum flexibility
-  No vendor lock-in
-  Slightly more complex implementation (mitigated by AIService abstraction)

---

### ADR-004: Multi-Role Support with Audit Trail

**Context:** Many users are both Employee and Manager; some are also HR Admin.

**Decision:** Single user account with roles array, explicit role switching with audit logs.

**Rationale:**
- Real-world requirement: Managers review their own performance
- Clear permission boundaries per role
- Complete audit trail for compliance
- Supports delegation via RoleAssignment table

**Consequences:**
-  Matches real organizational structure
-  Full traceability
-  More complex RBAC logic (mitigated by AuthService)

---

## Development Workflow

### Getting Started

```ash
# Clone repository
git clone https://github.com/your-org/pa-assistant
cd pa-assistant

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed initial data
npm run seed

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development Commands

```ash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run prisma:studio # Database GUI
```

### Environment Configuration

**Environment Variables Structure:**

```bash
# .env.local (Development)
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# AI Configuration
AI_MODE="local"                          # "web" | "local"
OLLAMA_API_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# Optional: LDAP (Future)
LDAP_URL=""
LDAP_BIND_DN=""
LDAP_BIND_PASSWORD=""

# Logging
LOG_LEVEL="debug"                        # "debug" | "info" | "warn" | "error"
LOG_FILE_PATH="./logs/app.log"

# Feature Flags
FEATURE_AI_ASSISTANCE="true"
FEATURE_DELEGATION="true"
```

```bash
# .env.production (Production)
# Database
DATABASE_URL="postgresql://user:password@host:5432/pa_assistant"

# NextAuth.js
NEXTAUTH_URL="https://pa-assistant.company.com"
NEXTAUTH_SECRET="production-secret-key-min-32-chars"

# AI Configuration
AI_MODE="local"
OLLAMA_API_URL="http://ollama-service:11434"
OLLAMA_MODEL="llama2"

# LDAP
LDAP_URL="ldap://ldap.company.com:389"
LDAP_BIND_DN="cn=admin,dc=company,dc=com"
LDAP_BIND_PASSWORD="encrypted-password"

# Logging
LOG_LEVEL="info"
LOG_FILE_PATH="/var/log/pa-assistant/app.log"

# Feature Flags
FEATURE_AI_ASSISTANCE="true"
FEATURE_DELEGATION="true"
```

**Environment Variable Validation:**

```typescript
// src/lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // AI
  AI_MODE: z.enum(['web', 'local']).default('local'),
  OLLAMA_API_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().default('llama2'),

  // LDAP (Optional)
  LDAP_URL: z.string().url().optional(),
  LDAP_BIND_DN: z.string().optional(),
  LDAP_BIND_PASSWORD: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // Feature Flags
  FEATURE_AI_ASSISTANCE: z.string().transform(val => val === 'true').default('true'),
  FEATURE_DELEGATION: z.string().transform(val => val === 'true').default('true')
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
```

**Usage in Application:**

```typescript
// src/lib/ai/ai-service.ts
import { env } from '@/lib/config/env'

export class AIService {
  async generateSuggestion(context: string): Promise<string> {
    if (env.AI_MODE === 'local') {
      const response = await fetch(`${env.OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.OLLAMA_MODEL,
          prompt: context
        })
      })
      return response.json()
    } else {
      // Web mode: Return prompt for user to copy
      return this.generateWebPrompt(context)
    }
  }
}
```

**Configuration Per Environment:**

| Variable | Development | Production | Notes |
|----------|-------------|------------|-------|
| DATABASE_URL | SQLite (file) | PostgreSQL | Prisma handles migration |
| AI_MODE | local | local | Can switch to web if needed |
| LOG_LEVEL | debug | info | More verbose in dev |
| NEXTAUTH_SECRET | Random dev key | Secure prod key | Min 32 chars |
| Feature Flags | true | Controlled | Easy A/B testing |

---

### Testing Strategy

**Testing Pyramid:**

```
        /\
       /  \
      /E2E \           ← 10% - Critical user flows
     /──────\
    /        \
   / Integr.  \        ← 20% - API + DB interactions
  /────────────\
 /              \
/  Unit Tests    \     ← 70% - Business logic, utilities
──────────────────
```

**Test Coverage Targets:**

| Layer | Coverage | Tools | Focus |
|-------|----------|-------|-------|
| **Unit Tests** | 80%+ | Vitest + Testing Library | Business logic, validation, utilities |
| **Integration Tests** | 60%+ | Vitest + Prisma Mock | API routes, service layer |
| **E2E Tests** | Critical paths | Playwright | User workflows |

**Testing Tools:**

```json
// package.json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0",
    "prisma": "^5.0.0",
    "jest-mock-extended": "^3.0.0"
  }
}
```

**Test Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/types.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

---

### Test Organization

**Directory Structure:**

```
tests/
├── setup.ts                      # Vitest global setup
├── mocks/
│   ├── prisma.ts                 # Prisma client mock
│   ├── next-auth.ts              # NextAuth mock
│   └── handlers.ts               # MSW handlers
│
├── unit/                         # Unit tests (70%)
│   ├── lib/
│   │   ├── validation/
│   │   │   ├── target-schemas.test.ts
│   │   │   └── review-schemas.test.ts
│   │   │
│   │   ├── workflows/
│   │   │   ├── review-state-machine.test.ts
│   │   │   └── score-calculator.test.ts
│   │   │
│   │   └── auth/
│   │       └── rbac.test.ts
│   │
│   └── components/
│       ├── auth/
│       │   ├── login-form.test.tsx
│       │   └── role-header.test.tsx
│       │
│       ├── reviews/
│       │   ├── review-workflow.test.tsx
│       │   └── self-evaluation-tab.test.tsx
│       │
│       └── targets/
│           └── target-setting-form.test.tsx
│
├── integration/                  # Integration tests (20%)
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.test.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── get-reviews.test.ts
│   │   │   ├── create-review.test.ts
│   │   │   └── submit-review.test.ts
│   │   │
│   │   └── targets/
│   │       ├── create-target-set.test.ts
│   │       └── approve-target-set.test.ts
│   │
│   └── services/
│       ├── auth-service.test.ts
│       ├── ai-service.test.ts
│       └── audit-logger.test.ts
│
└── e2e/                          # E2E tests (10%)
    ├── auth.spec.ts              # Login/logout flows
    ├── target-setting.spec.ts    # Complete target setting workflow
    ├── self-evaluation.spec.ts   # Employee self-evaluation flow
    ├── manager-review.spec.ts    # Manager evaluation flow
    ├── role-switching.spec.ts    # Multi-role user scenarios
    └── hr-consolidation.spec.ts  # HR admin workflows
```

---

### Test Examples

**1. Unit Test: Validation Schema**

```typescript
// tests/unit/lib/validation/target-schemas.test.ts
import { describe, it, expect } from 'vitest'
import { TargetSetSchema } from '@/lib/validation/target-schemas'

describe('TargetSetSchema', () => {
  it('validates a valid target set', () => {
    const validData = {
      targets: [
        {
          taskDescription: 'Complete project X',
          kpi: 'On-time delivery',
          weight: 50,
          difficulty: 'L2'
        },
        {
          taskDescription: 'Improve code quality',
          kpi: 'Code review score > 8',
          weight: 30,
          difficulty: 'L1'
        },
        {
          taskDescription: 'Mentor junior developers',
          kpi: '2 successful mentees',
          weight: 20,
          difficulty: 'L2'
        }
      ]
    }

    const result = TargetSetSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects target set with incorrect total weight', () => {
    const invalidData = {
      targets: [
        {
          taskDescription: 'Task 1',
          kpi: 'KPI 1',
          weight: 60,
          difficulty: 'L1'
        },
        {
          taskDescription: 'Task 2',
          kpi: 'KPI 2',
          weight: 30,
          difficulty: 'L2'
        }
      ]
    }

    const result = TargetSetSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Total weight must equal 100%')
    }
  })

  it('requires 3-5 targets', () => {
    const tooFewTargets = { targets: [] }
    const tooManyTargets = {
      targets: Array(6).fill({
        taskDescription: 'Task',
        kpi: 'KPI',
        weight: 16.67,
        difficulty: 'L1'
      })
    }

    expect(TargetSetSchema.safeParse(tooFewTargets).success).toBe(false)
    expect(TargetSetSchema.safeParse(tooManyTargets).success).toBe(false)
  })
})
```

**2. Unit Test: React Component**

```typescript
// tests/unit/components/auth/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { signIn } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}))

describe('LoginForm', () => {
  it('renders login form fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockSignIn = vi.mocked(signIn)
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/username/i), 'alice')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'alice',
        password: 'Password123!',
        redirect: false
      })
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    const mockSignIn = vi.mocked(signIn)
    mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/username/i), 'alice')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

**3. Integration Test: API Route**

```typescript
// tests/integration/api/reviews/submit-review.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { POST } from '@/app/api/reviews/[id]/submit/route'
import { prismaMock } from '@/tests/mocks/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

describe('POST /api/reviews/:id/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits review successfully', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'alice@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1',
      status: 'self_eval_draft',
      employeeTargets: [
        {
          id: 'target-1',
          employeeRating: 4,
          resultExplanation: 'Completed all tasks successfully'
        }
      ]
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)
    prismaMock.review.update.mockResolvedValue({
      ...mockReview,
      status: 'self_eval_submitted',
      employeeSubmittedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeTargets: mockReview.employeeTargets
      })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe('self_eval_submitted')
    expect(prismaMock.review.update).toHaveBeenCalledWith({
      where: { id: 'review-1' },
      data: {
        employeeTargets: mockReview.employeeTargets,
        status: 'self_eval_submitted',
        employeeSubmittedAt: expect.any(Date)
      }
    })
  })

  it('rejects submission with invalid state transition', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'alice@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1',
      status: 'archived', // Invalid state for submission
      employeeTargets: []
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeTargets: [] })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_STATE_TRANSITION')
  })

  it('enforces authorization', async () => {
    const mockSession = {
      user: { id: 'user-2', email: 'bob@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1', // Different user
      status: 'self_eval_draft',
      employeeTargets: []
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeTargets: [] })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('FORBIDDEN')
  })
})
```

**4. E2E Test: Complete Workflow**

```typescript
// tests/e2e/self-evaluation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Self-Evaluation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/login')
    await page.fill('input[name="username"]', 'alice')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard/employee')
  })

  test('complete self-evaluation flow', async ({ page }) => {
    // Navigate to review
    await page.click('text=My Review')
    await expect(page).toHaveURL(/\/reviews\//)

    // Verify review is in draft state
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Draft')

    // Rate first target
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()

    // Write explanation with AI assistance
    await page.fill(
      '[data-testid="target-0-explanation"]',
      'Completed all project milestones on time. Delivered high-quality code with 95% test coverage.'
    )

    // Click AI Help button
    await page.click('[data-testid="target-0-ai-help"]')

    // Wait for AI modal
    await expect(page.locator('[data-testid="ai-modal"]')).toBeVisible()

    // Verify AI suggestion appears
    await expect(page.locator('[data-testid="ai-suggestion"]')).not.toBeEmpty()

    // Accept AI suggestion
    await page.click('[data-testid="ai-accept"]')

    // Verify explanation updated
    await expect(page.locator('[data-testid="target-0-explanation"]')).not.toHaveValue(
      'Completed all project milestones on time. Delivered high-quality code with 95% test coverage.'
    )

    // Rate remaining targets
    await page.locator('[data-testid="target-1-rating"]').click()
    await page.locator('[data-value="5"]').click()
    await page.fill(
      '[data-testid="target-1-explanation"]',
      'Exceeded expectations by implementing additional features.'
    )

    await page.locator('[data-testid="target-2-rating"]').click()
    await page.locator('[data-value="3"]').click()
    await page.fill(
      '[data-testid="target-2-explanation"]',
      'Made progress but did not fully achieve the target due to dependencies.'
    )

    // Fill career section
    await page.fill('[name="currentJobDescription"]', 'Senior Software Engineer...')
    await page.fill('[name="careerPath"]', 'Aiming for Tech Lead position...')

    // Submit review
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('.toast')).toContainText('Review submitted successfully')
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Submitted')

    // Verify read-only after submission
    await expect(page.locator('[data-testid="target-0-rating"]')).toBeDisabled()
    await expect(page.locator('[data-testid="target-0-explanation"]')).toBeDisabled()
  })

  test('validates incomplete submission', async ({ page }) => {
    await page.click('text=My Review')

    // Try to submit without rating all targets
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()
    await page.fill('[data-testid="target-0-explanation"]', 'Explanation...')

    // Leave other targets unrated
    await page.click('button[type="submit"]')

    // Verify validation error
    await expect(page.locator('.toast')).toContainText('Please rate all targets')
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Draft')
  })

  test('supports auto-save', async ({ page }) => {
    await page.click('text=My Review')

    // Enter data
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()
    await page.fill('[data-testid="target-0-explanation"]', 'Auto-save test...')

    // Wait for auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toHaveText('Saved')

    // Reload page
    await page.reload()

    // Verify data persisted
    await expect(page.locator('[data-testid="target-0-rating"]')).toHaveValue('4')
    await expect(page.locator('[data-testid="target-0-explanation"]')).toHaveValue(
      'Auto-save test...'
    )
  })
})
```

**5. Mock Setup**

```typescript
// tests/mocks/prisma.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})
```

```typescript
// tests/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams()
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com', roles: ['employee'] }
    },
    status: 'authenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn()
}))
```

**Test Execution:**

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- tests/unit

# Run integration tests
npm test -- tests/integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- target-schemas.test.ts

# Watch mode
npm test -- --watch

# UI mode (Vitest)
npm test -- --ui
```

**CI/CD Integration:**

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Coding Standards

This section defines the coding standards, conventions, and best practices for the pa-assistant project to ensure consistency, maintainability, and code quality across the entire codebase.

### General Principles

1. **Write code for humans first, computers second**
2. **Favor readability over cleverness**
3. **Keep functions small and focused (single responsibility)**
4. **Don't Repeat Yourself (DRY) - but prefer clarity over extreme abstraction**
5. **Fail fast and explicitly - avoid silent failures**
6. **Type everything - leverage TypeScript's type system fully**

---

### TypeScript Standards

**1. Type Safety**

```typescript
// ✅ Good: Explicit types
interface User {
  id: string
  email: string
  roles: Role[]
}

function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// ❌ Bad: Using 'any'
function getUserById(id: any): Promise<any> {
  return prisma.user.findUnique({ where: { id } })
}
```

**2. Strict Mode**

```json
// tsconfig.json - Always use strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**3. Interfaces vs Types**

```typescript
// ✅ Good: Use interfaces for object shapes (can be extended)
interface ReviewProps {
  review: Review
  currentUser: User
}

interface ExtendedReviewProps extends ReviewProps {
  showHistory: boolean
}

// ✅ Good: Use types for unions, intersections, primitives
type Role = 'employee' | 'manager' | 'hr_admin'
type ReviewStatus = 'draft' | 'submitted' | 'archived'
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ErrorResponse }
```

**4. Enum Usage**

```typescript
// ✅ Good: Use const objects for enums (better tree-shaking)
export const REVIEW_STATES = {
  SELF_EVAL_DRAFT: 'self_eval_draft',
  SELF_EVAL_SUBMITTED: 'self_eval_submitted',
  ARCHIVED: 'archived'
} as const

export type ReviewState = typeof REVIEW_STATES[keyof typeof REVIEW_STATES]

// ❌ Avoid: TypeScript enums (unless you need reverse mapping)
enum ReviewStates {
  SELF_EVAL_DRAFT = 'self_eval_draft',
  SELF_EVAL_SUBMITTED = 'self_eval_submitted'
}
```

**5. Null Handling**

```typescript
// ✅ Good: Explicit null checks
function processReview(review: Review | null) {
  if (!review) {
    throw new Error('Review not found')
  }
  // TypeScript knows review is not null here
  return review.status
}

// ✅ Good: Optional chaining
const managerName = review.reviewer?.fullName ?? 'Unassigned'

// ❌ Bad: Non-null assertion (use sparingly)
const userName = user!.name // Assumes user is not null without checking
```

---

### Naming Conventions

**1. Variables and Functions**

```typescript
// ✅ Good: camelCase for variables and functions
const currentUser = getCurrentUser()
const isAuthenticated = checkAuthentication()
const reviewCount = getReviewCount()

function calculateFinalScore(targets: Target[]): number {
  // Implementation
}

// ❌ Bad: Inconsistent naming
const Current_User = getCurrentUser()
const is_authenticated = checkAuthentication()
```

**2. Components**

```typescript
// ✅ Good: PascalCase for React components
export function ReviewWorkflow({ review }: ReviewWorkflowProps) {
  return <div>...</div>
}

export function UserAvatar({ user }: UserAvatarProps) {
  return <img src={user.avatar} alt={user.name} />
}

// ❌ Bad: camelCase for components
export function reviewWorkflow() {
  return <div>...</div>
}
```

**3. Constants**

```typescript
// ✅ Good: UPPER_SNAKE_CASE for true constants
const MAX_TARGETS = 5
const MIN_TARGETS = 3
const DEFAULT_REVIEW_STATUS = 'self_eval_draft'

// ✅ Good: camelCase for configuration objects
const apiConfig = {
  baseUrl: process.env.API_URL,
  timeout: 5000
}
```

**4. Files and Folders**

```
✅ Good: kebab-case for files
src/
├── components/
│   ├── review-workflow.tsx
│   ├── target-setting-form.tsx
│   └── user-avatar.tsx
├── lib/
│   ├── review-state-machine.ts
│   └── score-calculator.ts

❌ Bad: Inconsistent naming
src/
├── components/
│   ├── ReviewWorkflow.tsx
│   ├── target_setting_form.tsx
│   └── UserAvatar.tsx
```

**5. Boolean Variables**

```typescript
// ✅ Good: Prefix with is/has/can/should
const isLoading = true
const hasPermission = false
const canEdit = checkEditPermission()
const shouldShowModal = true

// ❌ Bad: Ambiguous names
const loading = true
const permission = false
const edit = checkEditPermission()
```

---

### Code Organization

**1. File Structure**

```typescript
// ✅ Good: Organize imports by category
// 1. External dependencies
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal dependencies (absolute imports)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ReviewService } from '@/lib/services/review-service'

// 3. Types
import type { Review, User } from '@prisma/client'

// 4. Constants
const MAX_RETRIES = 3

// 5. Component/function definition
export function ReviewList() {
  // Implementation
}
```

**2. Component Structure**

```typescript
// ✅ Good: Consistent component organization
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Review } from '@prisma/client'

// 1. Types/Interfaces
interface ReviewCardProps {
  review: Review
  onUpdate: (review: Review) => void
}

// 2. Component
export function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 4. Event handlers
  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
  // 5. Render helpers (if needed)
  const renderStatus = () => {
    return <span>{review.status}</span>
  }
  
  // 6. Return JSX
  return (
    <div>
      {renderStatus()}
      <Button onClick={handleExpand}>Expand</Button>
    </div>
  )
}
```

**3. API Route Structure**

```typescript
// ✅ Good: Consistent API route pattern
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response'

// 1. Validation schema
const submitReviewSchema = z.object({
  employeeTargets: z.array(z.object({
    id: z.string(),
    employeeRating: z.number().min(1).max(5),
    resultExplanation: z.string().min(50)
  }))
})

// 2. GET handler
export async function GET(request: NextRequest) {
  try {
    // 2a. Authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      )
    }
    
    // 2b. Authorization
    // Check permissions...
    
    // 2c. Data fetching
    const reviews = await prisma.review.findMany({
      where: { revieweeId: session.user.id }
    })
    
    // 2d. Response
    return NextResponse.json(createSuccessResponse(reviews))
  } catch (error) {
    // 2e. Error handling
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Failed to fetch reviews'),
      { status: 500 }
    )
  }
}

// 3. POST handler
export async function POST(request: NextRequest) {
  // Similar structure...
}
```

---

### React Best Practices

**1. Component Types**

```typescript
// ✅ Good: Use Server Components by default
// app/reviews/page.tsx
export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany()
  return <ReviewList reviews={reviews} />
}

// ✅ Good: Use Client Components only when needed
// src/components/review-form.tsx
'use client'

export function ReviewForm() {
  const [data, setData] = useState({})
  return <form>...</form>
}
```

**2. Props Destructuring**

```typescript
// ✅ Good: Destructure props
export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  return <div>{review.title}</div>
}

// ❌ Bad: Using props object
export function ReviewCard(props: ReviewCardProps) {
  return <div>{props.review.title}</div>
}
```

**3. Conditional Rendering**

```typescript
// ✅ Good: Early returns for conditions
export function ReviewStatus({ review }: { review: Review }) {
  if (!review) {
    return <div>No review found</div>
  }
  
  if (review.archived) {
    return <ArchivedBadge />
  }
  
  return <StatusBadge status={review.status} />
}

// ❌ Bad: Nested ternaries
export function ReviewStatus({ review }: { review: Review }) {
  return review ? (
    review.archived ? (
      <ArchivedBadge />
    ) : (
      <StatusBadge status={review.status} />
    )
  ) : (
    <div>No review found</div>
  )
}
```

**4. Event Handlers**

```typescript
// ✅ Good: Named handler functions
export function ReviewForm() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // Handle submit
  }
  
  const handleCancel = () => {
    // Handle cancel
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={handleCancel}>Cancel</button>
      <button type="submit">Submit</button>
    </form>
  )
}

// ❌ Bad: Inline arrow functions (creates new function on each render)
export function ReviewForm() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); /* handle submit */ }}>
      <button onClick={() => { /* handle cancel */ }}>Cancel</button>
    </form>
  )
}
```

**5. Custom Hooks**

```typescript
// ✅ Good: Extract reusable logic into custom hooks
export function useReview(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => fetchReview(reviewId)
  })
}

// Usage
function ReviewPage({ params }: { params: { id: string } }) {
  const { data: review, isLoading, error } = useReview(params.id)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!review) return <NotFound />
  
  return <ReviewDetails review={review} />
}
```

---

### Error Handling

**1. API Error Responses**

```typescript
// ✅ Good: Consistent error structure
export interface ErrorResponse {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_STATE_TRANSITION'
  | 'INTERNAL_ERROR'

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): { success: false; error: ErrorResponse } {
  return {
    success: false,
    error: { code, message, details }
  }
}
```

**2. Try-Catch Blocks**

```typescript
// ✅ Good: Specific error handling
try {
  const review = await prisma.review.update({
    where: { id },
    data: { status: 'submitted' }
  })
  return createSuccessResponse(review)
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return createErrorResponse('NOT_FOUND', 'Review not found')
    }
  }
  
  console.error('Failed to update review:', error)
  return createErrorResponse('INTERNAL_ERROR', 'Failed to update review')
}
```

**3. Validation Errors**

```typescript
// ✅ Good: Use Zod for validation with detailed errors
const result = reviewSchema.safeParse(data)

if (!result.success) {
  return NextResponse.json(
    createErrorResponse('VALIDATION_ERROR', 'Invalid request data', {
      errors: result.error.flatten()
    }),
    { status: 400 }
  )
}
```

---

### Database Best Practices

**1. Prisma Queries**

```typescript
// ✅ Good: Use include for relations
const review = await prisma.review.findUnique({
  where: { id },
  include: {
    reviewee: {
      select: { id: true, fullName: true, email: true }
    },
    reviewer: {
      select: { id: true, fullName: true }
    }
  }
})

// ✅ Good: Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    fullName: true,
    roles: true
  },
  where: { employmentStatus: 'active' }
})

// ❌ Bad: Fetching unnecessary data
const users = await prisma.user.findMany() // Gets all fields
```

**2. Transactions**

```typescript
// ✅ Good: Use transactions for multiple operations
await prisma.$transaction(async (tx) => {
  // Update review
  const review = await tx.review.update({
    where: { id },
    data: { status: 'submitted', employeeSubmittedAt: new Date() }
  })
  
  // Create audit log
  await tx.auditEntry.create({
    data: {
      actorId: userId,
      actorRole: 'employee',
      action: 'submit_review',
      targetType: 'review',
      targetId: id,
      details: { previousStatus: 'draft' }
    }
  })
  
  return review
})
```

**3. Query Optimization**

```typescript
// ✅ Good: Use indexes for common queries
// In schema.prisma
model Review {
  id        String @id @default(cuid())
  revieweeId String
  cycleYear  Int
  status     String
  
  @@unique([revieweeId, cycleYear])
  @@index([revieweeId, status])
  @@index([status])
}

// ✅ Good: Batch queries instead of N+1
const reviews = await prisma.review.findMany({
  include: { reviewee: true }
})

// ❌ Bad: N+1 queries
const reviews = await prisma.review.findMany()
for (const review of reviews) {
  const reviewee = await prisma.user.findUnique({ 
    where: { id: review.revieweeId } 
  })
}
```

---

### Security Standards

**1. Authentication Checks**

```typescript
// ✅ Good: Always check authentication in API routes
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      createErrorResponse('UNAUTHORIZED', 'Not authenticated'),
      { status: 401 }
    )
  }
  
  // Continue with authorized logic
}
```

**2. Authorization Checks**

```typescript
// ✅ Good: Check permissions before operations
const canEdit = await AuthService.canModifyReview(session.user, reviewId)
if (!canEdit) {
  return NextResponse.json(
    createErrorResponse('FORBIDDEN', 'You do not have permission to modify this review'),
    { status: 403 }
  )
}
```

**3. Input Sanitization**

```typescript
// ✅ Good: Validate and sanitize all inputs
const submitReviewSchema = z.object({
  employeeTargets: z.array(z.object({
    id: z.string().cuid(),
    employeeRating: z.number().int().min(1).max(5),
    resultExplanation: z.string().min(50).max(1000).trim()
  })).min(3).max(5)
})

const result = submitReviewSchema.safeParse(data)
if (!result.success) {
  return NextResponse.json(
    createErrorResponse('VALIDATION_ERROR', 'Invalid input'),
    { status: 400 }
  )
}
```

**4. Sensitive Data**

```typescript
// ✅ Good: Exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    fullName: true,
    roles: true
    // passwordHash excluded
  }
})

// ❌ Bad: Exposing password hash
const user = await prisma.user.findUnique({
  where: { id }
  // Returns all fields including passwordHash
})
```

---

### Testing Standards

**1. Test File Organization**

```typescript
// ✅ Good: Descriptive test names
describe('ReviewStateMachine', () => {
  describe('canTransition', () => {
    it('allows transition from draft to submitted', () => {
      expect(
        ReviewStateMachine.canTransition('self_eval_draft', 'self_eval_submitted')
      ).toBe(true)
    })
    
    it('prevents transition from archived to any state', () => {
      expect(
        ReviewStateMachine.canTransition('archived', 'self_eval_draft')
      ).toBe(false)
    })
  })
})
```

**2. Test Data**

```typescript
// ✅ Good: Use factories for test data
function createMockReview(overrides?: Partial<Review>): Review {
  return {
    id: 'review-1',
    revieweeId: 'user-1',
    reviewerId: 'user-2',
    cycleYear: 2025,
    status: 'self_eval_draft',
    employeeTargets: [],
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

// Usage
const review = createMockReview({ status: 'submitted' })
```

**3. Assertions**

```typescript
// ✅ Good: Specific assertions
expect(response.status).toBe(200)
expect(response.data).toHaveProperty('review')
expect(response.data.review.status).toBe('submitted')

// ❌ Bad: Vague assertions
expect(response).toBeTruthy()
```

---

### Performance Standards

**1. Memoization**

```typescript
// ✅ Good: Memoize expensive calculations
import { useMemo } from 'react'

export function ReviewSummary({ review }: { review: Review }) {
  const finalScore = useMemo(() => {
    return calculateFinalScore(review.employeeTargets)
  }, [review.employeeTargets])
  
  return <div>Final Score: {finalScore}</div>
}
```

**2. Lazy Loading**

```typescript
// ✅ Good: Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/charts/performance-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

**3. Database Query Limits**

```typescript
// ✅ Good: Always paginate large datasets
const reviews = await prisma.review.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' }
})

// ❌ Bad: Fetching all records
const reviews = await prisma.review.findMany()
```

---

### Documentation Standards

**1. Function Documentation**

```typescript
/**
 * Calculates the final score for a review based on target ratings and difficulty.
 * 
 * @param targets - Array of target ratings with difficulty levels
 * @returns Final weighted score (0-300 range)
 * @throws {Error} If targets array is empty or invalid
 * 
 * @example
 * const score = calculateFinalScore([
 *   { rating: 4, weight: 50, difficulty: 'L2' },
 *   { rating: 5, weight: 30, difficulty: 'L1' },
 *   { rating: 3, weight: 20, difficulty: 'L3' }
 * ])
 * // Returns: 237.5
 */
export function calculateFinalScore(targets: TargetRating[]): number {
  if (!targets || targets.length === 0) {
    throw new Error('Targets array cannot be empty')
  }
  
  // Implementation
}
```

**2. Component Documentation**

```typescript
/**
 * ReviewWorkflow component manages the review submission process.
 * 
 * Features:
 * - Tab-based navigation (Self-Eval, Manager Eval, History)
 * - State machine enforcement
 * - Auto-save functionality
 * - AI assistance integration
 * 
 * @param review - The review object to display and edit
 * @param currentUser - The authenticated user viewing the review
 */
export function ReviewWorkflow({ review, currentUser }: ReviewWorkflowProps) {
  // Implementation
}
```

**3. Complex Logic Comments**

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate weighted score with difficulty multipliers
// L1=1.0, L2=1.2, L3=1.5 as per NFR004 scoring requirements
const weightedScore = targets.reduce((total, target) => {
  const multiplier = DIFFICULTY_MULTIPLIERS[target.difficulty]
  return total + (target.rating * target.weight * multiplier / 100)
}, 0)

// ❌ Bad: Obvious comments
// Loop through targets
for (const target of targets) {
  // Add score to total
  total += target.rating
}
```

---

### Code Review Checklist

Before submitting code for review, ensure:

- [ ] **TypeScript**: No `any` types, all functions typed
- [ ] **Tests**: Unit tests for business logic, integration tests for API routes
- [ ] **Error Handling**: All errors caught and handled appropriately
- [ ] **Security**: Authentication/authorization checks in place
- [ ] **Performance**: No N+1 queries, appropriate pagination
- [ ] **Naming**: Consistent naming conventions followed
- [ ] **Documentation**: Complex functions documented
- [ ] **Lint**: No ESLint warnings or errors
- [ ] **Format**: Code formatted with Prettier
- [ ] **Accessibility**: ARIA labels, keyboard navigation for interactive elements

---

## Error Handling Strategy

### Error Categories

**1. Client-Side Errors**

```typescript
// Form validation errors
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Network errors
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Usage in components
'use client'
import { toast } from '@/components/ui/use-toast'

export function ReviewForm() {
  const handleSubmit = async (data: ReviewFormData) => {
    try {
      await submitReview(data)
      toast({ title: 'Success', description: 'Review submitted' })
    } catch (error) {
      if (error instanceof ValidationError) {
        // Show field-specific error
        form.setError(error.field, { message: error.message })
      } else if (error instanceof NetworkError) {
        // Show network error toast
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: `Failed to connect to server (${error.statusCode})`
        })
      } else {
        // Generic error fallback
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.'
        })
      }
    }
  }
}
```

**2. Server-Side Errors (API Routes)**

```typescript
// src/lib/errors/api-errors.ts
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  
  // Business logic errors (422)
  REVIEW_ALREADY_SUBMITTED = 'REVIEW_ALREADY_SUBMITTED',
  TARGETS_NOT_APPROVED = 'TARGETS_NOT_APPROVED',
  FISCAL_YEAR_CLOSED = 'FISCAL_YEAR_CLOSED',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper factory functions
export const ApiErrors = {
  unauthorized: (message = 'Authentication required') =>
    new ApiError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Insufficient permissions') =>
    new ApiError(ErrorCode.FORBIDDEN, message, 403),
  
  invalidInput: (message: string, details?: Record<string, any>) =>
    new ApiError(ErrorCode.INVALID_INPUT, message, 400, details),
  
  notFound: (resource: string) =>
    new ApiError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),
  
  businessLogic: (code: ErrorCode, message: string) =>
    new ApiError(code, message, 422),
  
  internal: (message = 'Internal server error') =>
    new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500)
}
```

**3. Global Error Handler (API Routes)**

```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server'
import { ApiError } from '@/lib/errors/api-errors'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'

export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', { errors: error.errors })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      },
      { status: 400 }
    )
  }

  // API errors (our custom errors)
  if (error instanceof ApiError) {
    logger.warn('API error', {
      code: error.code,
      message: error.message,
      details: error.details
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Database error', { code: error.code, meta: error.meta })
    
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this data already exists',
            details: { fields: error.meta?.target }
          }
        },
        { status: 409 }
      )
    }
    
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Referenced record does not exist',
            details: { field: error.meta?.field_name }
          }
        },
        { status: 400 }
      )
    }
    
    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found'
          }
        },
        { status: 404 }
      )
    }
  }

  // Unknown errors
  logger.error('Unexpected error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  )
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw ApiErrors.unauthorized()
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    const result = await createReview(validatedData)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
```

**4. Database Transaction Error Handling**

```typescript
// src/lib/db/transaction-wrapper.ts
import { prisma } from './prisma'
import { logger } from '@/lib/logger'

export async function withTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  options?: { maxRetries?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        return await operation(tx)
      })
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on validation or business logic errors
      if (
        error instanceof ApiError ||
        error instanceof ZodError
      ) {
        throw error
      }

      // Retry on transient errors
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2034' || // Transaction conflict
         error.code === 'P1001')   // Connection error
      ) {
        logger.warn(`Transaction attempt ${attempt} failed, retrying...`, {
          code: error.code,
          attempt
        })
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        )
        continue
      }

      // Don't retry other errors
      throw error
    }
  }

  logger.error('Transaction failed after max retries', { maxRetries })
  throw lastError
}

// Usage example
export async function submitReview(reviewId: string, userId: string) {
  return withTransaction(async (tx) => {
    // Update review
    const review = await tx.review.update({
      where: { id: reviewId },
      data: { status: 'submitted', submittedAt: new Date() }
    })

    // Log audit entry
    await tx.auditEntry.create({
      data: {
        actorId: userId,
        action: 'submit_review',
        targetType: 'review',
        targetId: reviewId
      }
    })

    return review
  })
}
```

**5. Frontend Error Boundaries**

```typescript
// app/error.tsx - Root-level error boundary
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}

// app/(dashboard)/reviews/error.tsx - Route-specific error boundary
'use client'

export default function ReviewError({ error, reset }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <h3 className="font-semibold mb-2">Failed to load review</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button variant="outline" onClick={reset}>Retry</Button>
    </div>
  )
}
```

**6. Logging Strategy**

```typescript
// src/lib/logger.ts
import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'pa-assistant',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console logging (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File logging (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// Usage examples
logger.info('User logged in', { userId: '123', email: 'user@example.com' })
logger.warn('Review submission attempted in closed fiscal year', { reviewId: '456' })
logger.error('Database connection failed', { error: error.message, stack: error.stack })

// Audit logging helper
export function logAudit(
  action: string,
  actorId: string,
  targetType: string,
  targetId: string,
  details?: Record<string, any>
) {
  logger.info('Audit event', {
    type: 'audit',
    action,
    actorId,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  })
}
```

### Error Response Format

**Standard API Error Response:**

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string          // Machine-readable error code
    message: string       // Human-readable message
    details?: {           // Optional additional context
      field?: string      // For validation errors
      fields?: string[]   // For multiple field errors
      [key: string]: any  // Custom error data
    }
  }
}

// Examples:
// 1. Authentication error
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 2. Validation error
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [
      { "field": "rating", "message": "Rating must be between 1 and 5" },
      { "field": "explanation", "message": "Explanation is required" }
    ]
  }
}

// 3. Business logic error
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot submit review in current state",
    "details": {
      "currentState": "archived",
      "attemptedState": "submitted"
    }
  }
}
```

### Error Monitoring Best Practices

1. **Structured Logging**: Always log errors with context (user ID, request ID, timestamp)
2. **Error Tracking**: Integrate with services like Sentry or LogRocket for production
3. **User-Friendly Messages**: Never expose internal errors to users
4. **Recovery Paths**: Provide actionable steps (retry, contact support)
5. **Rate Limiting**: Prevent error spam from affecting legitimate users

```typescript
// Example: Add request ID for tracing
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const requestId = uuidv4()
  
  try {
    // ... operation
  } catch (error) {
    logger.error('Request failed', {
      requestId,
      url: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred. Please contact support with this ID.',
          details: { requestId }
        }
      },
      { status: 500 }
    )
  }
}
```

---

## Security and Performance

### Security Architecture

**1. Authentication Security**

```typescript
// NextAuth.js configuration with security best practices
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            roles: true,
            passwordHash: true,
            employmentStatus: true
          }
        })

        if (!user || user.employmentStatus !== 'active') {
          throw new Error('Invalid credentials')
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60 // 8 hours
  },

  jwt: {
    maxAge: 8 * 60 * 60 // 8 hours
  },

  cookies: {
    sessionToken: {
      name: 'pa-assistant.session-token',
      options: {
        httpOnly: true,    // Prevent XSS attacks
        sameSite: 'lax',   // CSRF protection
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        path: '/'
      }
    }
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = token.roles as string[]
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**2. Authorization Middleware**

```typescript
// middleware.ts - Global route protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/logout', '/auth/error']

// Role-based route access
const routePermissions: Record<string, string[]> = {
  '/dashboard/employee': ['employee', 'manager', 'hr_admin'],
  '/dashboard/manager': ['manager', 'hr_admin'],
  '/dashboard/hr-consolidation': ['hr_admin'],
  '/admin': ['hr_admin']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  if (!token) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check authorization for protected routes
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const userRoles = token.roles as string[]
      const hasAccess = allowedRoles.some(role => userRoles.includes(role))
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

**3. Input Sanitization and Validation**

```typescript
// All API input validated with Zod schemas
import { z } from 'zod'

// Prevent XSS with sanitized strings
const sanitizedString = z.string()
  .trim()
  .min(1)
  .max(1000)
  .transform(str => 
    str.replace(/[<>]/g, '') // Remove < and > characters
  )

// Email validation
const emailSchema = z.string().email().toLowerCase()

// Review submission schema with comprehensive validation
export const reviewSubmissionSchema = z.object({
  targetRatings: z.array(z.object({
    targetId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    resultExplanation: sanitizedString.min(50).max(1000),
    aiAssisted: z.boolean()
  })).min(3).max(5),
  
  currentJobDescription: sanitizedString.max(2000),
  careerPath: sanitizedString.max(2000)
})

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validatedData = reviewSubmissionSchema.parse(body)
    
    // Safe to use validated data
    await saveReview(validatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: error.errors } },
        { status: 400 }
      )
    }
  }
}
```

**4. SQL Injection Prevention**

Prisma automatically prevents SQL injection through parameterized queries:

```typescript
// ✅ Safe: Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { username: userInput } // Automatically sanitized
})

// ✅ Safe: Query builder prevents injection
const reviews = await prisma.review.findMany({
  where: {
    revieweeId: userId,
    status: { in: ['submitted', 'completed'] }
  }
})

// ❌ Never use raw SQL with user input (unless absolutely necessary)
// If raw SQL is required, use parameterized queries:
const result = await prisma.$queryRaw`
  SELECT * FROM User WHERE username = ${userInput}
`
```

**5. CSRF Protection**

```typescript
// NextAuth.js provides built-in CSRF protection
// Additional protection for API routes:

// src/lib/security/csrf.ts
import { headers } from 'next/headers'

export function validateCSRFToken(request: NextRequest): boolean {
  const headersList = headers()
  const csrfToken = headersList.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  return csrfToken === cookieToken
}

// Usage in sensitive API routes
export async function POST(request: NextRequest) {
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_CSRF_TOKEN' } },
      { status: 403 }
    )
  }
  
  // Process request
}
```

**6. Rate Limiting**

```typescript
// src/lib/security/rate-limiter.ts
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number  // Time window in milliseconds
  uniqueTokenPerInterval: number // Max users to track
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number) || 0
        
        if (tokenCount >= limit) {
          reject(new Error('Rate limit exceeded'))
        } else {
          tokenCache.set(token, tokenCount + 1)
          resolve()
        }
      })
  }
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    await limiter.check(10, session.user.id) // Max 10 requests per minute
    
    // Process request
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
      { status: 429 }
    )
  }
}
```

**7. Sensitive Data Protection**

```typescript
// Never expose sensitive data in API responses
// src/lib/security/sanitize.ts

export function sanitizeUser(user: User) {
  const { passwordHash, ldapDN, ...safeUser } = user
  return safeUser
}

export function sanitizeReview(review: Review, userRole: string) {
  // Hide manager evaluation from employee until feedback delivered
  if (userRole === 'employee' && review.status !== 'feedback_delivered') {
    const { managerTargetRatings, managerFeedback, overallSummary, ...safeReview } = review
    return safeReview
  }
  
  return review
}

// Usage
const user = await prisma.user.findUnique({ where: { id: userId } })
return NextResponse.json({ success: true, data: sanitizeUser(user) })
```

**8. Environment Variables Security**

```typescript
// .env.local (never commit to Git)
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-recommended"
NEXTAUTH_URL="http://localhost:3000"

// Validate environment variables at startup
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  OLLAMA_BASE_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
})

// Validate on app startup
export const env = envSchema.parse(process.env)
```

### Performance Optimization

**1. Database Query Optimization**

```typescript
// Use select to limit returned fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    email: true
    // Don't fetch passwordHash, ldapDN, etc.
  }
})

// Use include for relations (avoid N+1 queries)
const reviews = await prisma.review.findMany({
  include: {
    reviewee: {
      select: { id: true, fullName: true, email: true }
    },
    reviewer: {
      select: { id: true, fullName: true }
    }
  }
})

// Add database indexes for frequently queried fields
// In schema.prisma:
model Review {
  // ... fields
  
  @@index([revieweeId, cycleYear])
  @@index([reviewerId, status])
  @@index([status])
}

// Use pagination for large datasets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count()
  ])

  return NextResponse.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}

// Use database transactions for consistency
const result = await prisma.$transaction([
  prisma.review.update({ where: { id }, data: { status: 'submitted' } }),
  prisma.auditEntry.create({ data: { actorId, action: 'submit_review' } })
])
```

**2. Caching Strategy**

```typescript
// TanStack Query client-side caching
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // Data fresh for 1 minute
      cacheTime: 5 * 60 * 1000,  // Cache for 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Use in components
'use client'
import { useQuery } from '@tanstack/react-query'

export function ReviewList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'list'],
    queryFn: async () => {
      const res = await fetch('/api/reviews')
      return res.json()
    },
    staleTime: 2 * 60 * 1000 // 2 minutes for review list
  })
}

// Server-side caching with Next.js
// app/(dashboard)/reviews/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany()
  return <ReviewList reviews={reviews} />
}

// Cache API responses with headers
export async function GET(request: NextRequest) {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

**3. Code Splitting and Lazy Loading**

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(
  () => import('@/components/charts/performance-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Don't render on server
  }
)

const AIHelpModal = dynamic(
  () => import('@/components/ai/ai-help-modal'),
  { ssr: false }
)

// Route-based code splitting (automatic with App Router)
// Each page.tsx is automatically a split point

// Component-level code splitting
export function ReviewPage() {
  const [showAI, setShowAI] = useState(false)
  
  return (
    <div>
      {/* AI modal only loaded when needed */}
      {showAI && <AIHelpModal />}
    </div>
  )
}
```

**4. Image Optimization**

```typescript
// Use Next.js Image component
import Image from 'next/image'

export function UserAvatar({ user }) {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={user.fullName}
      width={40}
      height={40}
      className="rounded-full"
      // Automatic optimization:
      // - WebP format
      // - Responsive sizes
      // - Lazy loading
      // - Placeholder blur
    />
  )
}
```

**5. React Performance Optimization**

```typescript
// Use React.memo for expensive components
import { memo } from 'react'

export const TargetRatingGrid = memo(function TargetRatingGrid({ targets }) {
  return (
    <div>
      {targets.map(target => (
        <TargetRow key={target.id} target={target} />
      ))}
    </div>
  )
})

// Use useMemo for expensive calculations
import { useMemo } from 'react'

export function ReviewSummary({ review }) {
  const finalScore = useMemo(() => {
    return calculateFinalScore(review.targetRatings)
  }, [review.targetRatings])
  
  return <div>Score: {finalScore}</div>
}

// Use useCallback for callback props
import { useCallback } from 'react'

export function ParentComponent() {
  const handleSubmit = useCallback((data) => {
    submitReview(data)
  }, []) // Dependencies array
  
  return <ChildComponent onSubmit={handleSubmit} />
}
```

**6. Bundle Size Optimization**

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Tree-shaking (automatic with ES modules)
# Use named imports instead of default imports
import { Button, Input } from '@/components/ui' // ✅ Good
import * as UI from '@/components/ui'           // ❌ Bad (imports everything)

# Use lightweight alternatives
# date-fns instead of moment.js (save ~200KB)
# zustand instead of redux (save ~30KB)
```

**7. Monitoring and Profiling**

```typescript
// Add performance monitoring
// src/lib/monitoring/performance.ts

export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async () => {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      logger.info('Performance metric', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('Performance metric (failed)', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

// Usage
const createReview = measurePerformance('create_review', async () => {
  return await prisma.review.create({ data: reviewData })
})

// Web Vitals tracking
// app/layout.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric)
    
    // Metrics tracked:
    // - FCP (First Contentful Paint)
    // - LCP (Largest Contentful Paint)
    // - CLS (Cumulative Layout Shift)
    // - FID (First Input Delay)
    // - TTFB (Time to First Byte)
  })
  
  return null
}
```

**8. Production Checklist**

- [ ] **HTTPS**: Enforce HTTPS in production
- [ ] **Security Headers**: Set CSP, X-Frame-Options, HSTS
- [ ] **Rate Limiting**: Implement on all API routes
- [ ] **Error Monitoring**: Integrate Sentry or similar
- [ ] **Log Aggregation**: Use Winston with external transport
- [ ] **Database Backups**: Automated daily backups
- [ ] **Environment Variables**: All secrets in environment, not code
- [ ] **Dependency Audit**: Run `npm audit` regularly
- [ ] **Bundle Analysis**: Optimize bundle size
- [ ] **Performance Testing**: Load test with expected traffic
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified

---

## Deployment Architecture

### Overview

The pa-assistant deployment architecture supports both MVP (pilot with 10 users) and production (200+ users) scenarios with clear migration paths. The architecture emphasizes simplicity for MVP while maintaining production-readiness.

### Deployment Environments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ENVIRONMENTS                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Development (Local)                                                       │
├────────────────────────────────────────────────────────────────────────────┤
│  • Next.js Dev Server (localhost:3000)                                     │
│  • SQLite database (./dev.db)                                              │
│  • Hot reload, debugging enabled                                           │
│  • Mock Ollama or web-based AI                                             │
│  • No SSL required                                                          │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Staging (Optional)                                                        │
├────────────────────────────────────────────────────────────────────────────┤
│  • Docker container or VM                                                  │
│  • SQLite or PostgreSQL                                                    │
│  • Production build, no hot reload                                         │
│  • SSL certificate (Let's Encrypt)                                         │
│  • Used for UAT and integration testing                                    │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Production (MVP) - Phase 1: Pilot (10 users)                             │
├────────────────────────────────────────────────────────────────────────────┤
│  • Single server deployment (VM or Docker)                                 │
│  • SQLite database with daily backups                                      │
│  • Nginx reverse proxy                                                     │
│  • SSL certificate (Let's Encrypt or company cert)                         │
│  • Ollama on same server (optional)                                        │
│  • Basic monitoring (PM2 or systemd)                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Production (Scale) - Phase 2: Full Rollout (200+ users)                  │
├────────────────────────────────────────────────────────────────────────────┤
│  • Multi-server or container orchestration (Kubernetes)                    │
│  • PostgreSQL (managed service or dedicated server)                        │
│  • Load balancer (HAProxy, Nginx, or cloud LB)                            │
│  • Redis for session storage (optional)                                    │
│  • Ollama on dedicated GPU server (optional)                               │
│  • Full monitoring stack (Prometheus, Grafana)                             │
│  • Log aggregation (ELK or cloud logging)                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### MVP Deployment (Single Server)

**Architecture Diagram:**

```
                              ┌─────────────────┐
                              │  Internet/LAN   │
                              └────────┬────────┘
                                       │ HTTPS (443)
                                       │
                              ┌────────▼────────┐
                              │  Nginx Reverse  │
                              │     Proxy       │
                              │  - SSL Termination
                              │  - Static Assets │
                              │  - Rate Limiting │
                              └────────┬────────┘
                                       │ HTTP (3000)
                                       │
┌──────────────────────────────────────▼───────────────────────────────────┐
│                          Application Server (VM/Docker)                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Next.js Application (PM2 Process Manager)                         │ │
│  │  - Port 3000                                                        │ │
│  │  - NODE_ENV=production                                             │ │
│  │  - 2-4 instances (cluster mode)                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  SQLite Database                                                   │ │
│  │  - /var/lib/pa-assistant/production.db                             │ │
│  │  - Daily backups to /backups/                                      │ │
│  │  - Write-ahead logging (WAL) enabled                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Ollama AI Service (Optional)                                      │ │
│  │  - Port 11434 (localhost only)                                     │ │
│  │  - llama2 model loaded                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Monitoring                                                        │ │
│  │  - PM2 monitoring dashboard                                        │ │
│  │  - Winston logs (/var/log/pa-assistant/)                          │ │
│  │  - Disk space monitoring                                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Server Requirements (MVP):**

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 2 cores | 4 cores | More cores for Ollama |
| **RAM** | 4 GB | 8 GB | 16 GB if running Ollama |
| **Storage** | 20 GB | 50 GB | 100 GB if running Ollama |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04 LTS | Or equivalent Linux |
| **Network** | 100 Mbps | 1 Gbps | Low latency preferred |

### Production Deployment (Scaled)

**Architecture Diagram:**

```
                         ┌─────────────────┐
                         │  Internet/LAN   │
                         └────────┬────────┘
                                  │ HTTPS (443)
                                  │
                         ┌────────▼────────┐
                         │  Load Balancer  │
                         │  (HAProxy/ALB)  │
                         │  - SSL Term     │
                         │  - Health Check │
                         │  - Session Affinity
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
     │   App Server 1  │ │  App Server 2  │ │  App Server 3  │
     │   Next.js (PM2) │ │  Next.js (PM2) │ │  Next.js (PM2) │
     │   Port 3000     │ │  Port 3000     │ │  Port 3000     │
     └────────┬────────┘ └───────┬────────┘ └───────┬────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │   (Managed DB)  │
                        │   - Primary     │
                        │   - Read Replica│
                        │   - Auto Backup │
                        └─────────────────┘

     ┌─────────────────┐         ┌─────────────────┐
     │  Redis Cluster  │         │  Ollama Server  │
     │  (Session Store)│         │  (GPU Enabled)  │
     │  - 3 nodes      │         │  - Port 11434   │
     │  - Sentinel     │         │  - LLaMA model  │
     └─────────────────┘         └─────────────────┘

     ┌──────────────────────────────────────────────┐
     │          Monitoring & Logging                │
     │  - Prometheus (metrics)                      │
     │  - Grafana (dashboards)                      │
     │  - ELK Stack (logs)                          │
     │  - AlertManager (alerts)                     │
     └──────────────────────────────────────────────┘
```

### Container Deployment (Docker)

**Docker Compose Configuration:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/data/production.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - ollama
    networks:
      - pa-assistant-network

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./ollama-models:/root/.ollama
    restart: unless-stopped
    networks:
      - pa-assistant-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/usr/share/nginx/html:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - pa-assistant-network

networks:
  pa-assistant-network:
    driver: bridge

volumes:
  data:
  logs:
  ollama-models:
```

**Dockerfile:**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Kubernetes Deployment (Advanced)

**Kubernetes Manifests:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pa-assistant
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pa-assistant
  template:
    metadata:
      labels:
        app: pa-assistant
    spec:
      containers:
      - name: app
        image: your-registry/pa-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: pa-assistant-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: pa-assistant-secrets
              key: nextauth-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pa-assistant-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: pa-assistant
  ports:
  - port: 80
    targetPort: 3000

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pa-assistant-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - pa-assistant.company.com
    secretName: pa-assistant-tls
  rules:
  - host: pa-assistant.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pa-assistant-service
            port:
              number: 80
```

### Nginx Configuration

```nginx
# nginx.conf
upstream pa_assistant {
    # Least connections load balancing
    least_conn;
    
    server app:3000 max_fails=3 fail_timeout=30s;
    # Add more servers for scaled deployment:
    # server app2:3000 max_fails=3 fail_timeout=30s;
    # server app3:3000 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

server {
    listen 80;
    server_name pa-assistant.company.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pa-assistant.company.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/pa-assistant-access.log;
    error_log /var/log/nginx/pa-assistant-error.log;

    # Static files (Next.js _next/static)
    location /_next/static {
        proxy_pass http://pa_assistant;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # API routes with rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=5 nodelay;
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main application
    location / {
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://pa_assistant/api/health;
    }
}
```

### Database Backup Strategy

**SQLite Backup Script:**

```bash
#!/bin/bash
# backup-sqlite.sh

BACKUP_DIR="/backups/pa-assistant"
DB_PATH="/var/lib/pa-assistant/production.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
sqlite3 $DB_PATH ".backup '$BACKUP_FILE'"

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Crontab Entry:**

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-sqlite.sh >> /var/log/pa-assistant-backup.log 2>&1
```

**PostgreSQL Backup:**

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/pa-assistant"
DB_NAME="pa_assistant"
DB_USER="pa_assistant_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Monitoring Setup

**PM2 Ecosystem File:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pa-assistant',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data']
  }]
}
```

**Health Check Endpoint:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check disk space (optional)
    const diskUsage = process.memoryUsage()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(diskUsage.heapUsed / 1024 / 1024),
        total: Math.round(diskUsage.heapTotal / 1024 / 1024)
      },
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t pa-assistant:${{ github.sha }} .
          docker tag pa-assistant:${{ github.sha }} pa-assistant:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push pa-assistant:${{ github.sha }}
          docker push pa-assistant:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/pa-assistant
            docker-compose pull
            docker-compose up -d --no-deps app
            docker-compose exec app npx prisma migrate deploy
```

### Environment Variables

**Production .env Template:**

```bash
# .env.production
# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pa_assistant"
# Or for SQLite: DATABASE_URL="file:/data/production.db"

# Authentication
NEXTAUTH_URL="https://pa-assistant.company.com"
NEXTAUTH_SECRET="your-32-character-secret-key-here"

# AI Integration
AI_MODE="local"  # or "web"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# LDAP (if applicable)
LDAP_URL="ldap://ldap.company.com:389"
LDAP_BIND_DN="cn=admin,dc=company,dc=com"
LDAP_BIND_PASSWORD="your-ldap-password"
LDAP_SEARCH_BASE="ou=users,dc=company,dc=com"

# Logging
LOG_LEVEL="info"
LOG_DIR="/var/log/pa-assistant"

# Feature Flags
ENABLE_AI_ASSISTANCE=true
ENABLE_DELEGATION=true
ENABLE_COMPANY_GOALS=true
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy tested
- [ ] Monitoring configured
- [ ] Load testing completed

**Deployment:**
- [ ] Deploy to staging first
- [ ] Run database migrations
- [ ] Verify health check endpoint
- [ ] Check application logs
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify backup job running

**Post-Deployment:**
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify database connections
- [ ] Test from different networks
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review

### Rollback Strategy

**Quick Rollback Steps:**

```bash
# Docker deployment
docker-compose down
docker-compose up -d --scale app=0  # Stop all app containers
docker tag pa-assistant:previous pa-assistant:latest
docker-compose up -d

# PM2 deployment
pm2 stop pa-assistant
git checkout previous-release-tag
npm ci
npm run build
npx prisma migrate deploy
pm2 restart pa-assistant

# Database rollback
# Use Prisma migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

### Disaster Recovery

**Recovery Time Objectives (RTO):**
- MVP: 4 hours
- Production: 1 hour

**Recovery Point Objectives (RPO):**
- MVP: 24 hours (daily backups)
- Production: 15 minutes (continuous replication)

**Disaster Recovery Plan:**

1. **Database Corruption:**
   - Restore from last backup
   - Replay transaction logs (PostgreSQL)
   - Verify data integrity

2. **Server Failure:**
   - Spin up new server from backup
   - Restore database
   - Update DNS if needed
   - Verify application health

3. **Data Center Outage:**
   - Failover to secondary region
   - Update DNS to point to backup
   - Restore from off-site backups

---

## Next Steps

With this architecture document complete, you're ready to begin implementation:

1. **Story 1.1: Project Setup** - Run initialization commands
2. **Story 1.2: Authentication** - Implement NextAuth.js
3. **Story 1.3: User Management** - Build admin user interface
4. **Continue Epic 1** - Follow story sequence from epics.md

**Key References:**
- [PRD.md](./PRD.md) - Product requirements
- [epics.md](./epics.md) - Detailed story breakdown
- [ux-design-specification.md](./ux-design-specification.md) - UI/UX guidance
- [rbac-spec.md](./rbac-spec.md) - RBAC implementation details
- [ui-role-header.md](./ui-role-header.md) - Role header component

---

**Document Status:**  Complete  
**Next Workflow:** validate-architecture (optional) or sprint-planning (required)  
**Generated:** November 5, 2025 by Winston (Architect Agent)

