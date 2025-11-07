# Decision Summary

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
| **Transfer Tracking** | AuditEntry-based history with UserTransferHistory table | Epic 3, Story 3.5 | Complete transfer audit trail, historical data preservation, prorated reporting |
| **Performance Optimization** | Query optimization, lazy loading, pagination | Epic 3 | NFR008/NFR009 compliance for multi-year data, <3s standard reports, <10s complex aggregations |

---
