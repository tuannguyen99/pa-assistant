# Technology Stack

| Category | Technology | Version | Verified Date | Rationale |
|----------|-----------|---------|---------------|-----------|
| **Frontend Framework** | Next.js App Router | 14.2.8 | 2025-11-07 | SSR for performance (<2s page load), API routes included, shadcn/ui compatibility, modern React patterns, stable release with App Router |
| **Language** | TypeScript | 5.3+ | 2025-11-07 | Type safety, reduced runtime errors, better developer experience, end-to-end type safety with Prisma, decorators support |
| **Styling** | Tailwind CSS | 3.4.1 | 2025-11-07 | Utility-first CSS, perfect for glassmorphism, highly customizable, small bundle size, modern color system |
| **UI Components** | shadcn/ui | 2.0+ (latest) | 2025-11-07 | Accessible (WCAG 2.1 AA), customizable, built on Radix UI, excellent table components for Excel-like UI |
| **Database (MVP)** | SQLite | 3.44+ | 2025-11-07 | Zero-config setup, file-based backups, perfect for 200 user scale, easy local development, improved JSON support |
| **Database (Production)** | PostgreSQL | 16+ | 2025-11-07 | Enterprise-grade reliability, JSONB for audit logs, row-level security, industry standard, performance improvements |
| **ORM** | Prisma | 5.7+ | 2025-11-07 | Type-safe queries, automatic migrations, works with both SQLite and PostgreSQL, Prisma Studio GUI, improved performance |
| **Authentication** | NextAuth.js v5 (Auth.js) | 5.0.0-beta.20+ | 2025-11-07 | Username/password + future LDAP support, JWT and session management, built-in CSRF protection, Next.js 14 compatibility |
| **AI Integration** | Ollama REST API | 0.1.20+ | 2025-11-07 | Local AI support for privacy, no API key costs, fallback to web-based mode, llama2/mistral model support |
| **State Management** | Zustand | 4.4+ | 2025-11-07 | Lightweight (<1KB), simple API, perfect for role switching and modal state, middleware support |
| **Data Fetching** | TanStack Query | 5.12+ | 2025-11-07 | Caching, optimistic updates, automatic refetching, excellent DX, SSR support for Next.js |
| **Form Handling** | React Hook Form + Zod | RHF 7.48+ / Zod 3.22+ | 2025-11-07 | Performant (minimal re-renders), type-safe validation, integrates with shadcn/ui, excellent TypeScript support |
| **Charts & Visualization** | Recharts | 2.10+ | 2025-11-07 | React-native charting library, responsive, composable, good for analytics dashboards (Epic 3) |
| **Testing (Unit)** | Vitest | 1.0+ | 2025-11-07 | Fast, Vite-powered, Jest-compatible API, native ESM support, TypeScript first-class support |
| **Testing (E2E)** | Playwright | 1.40+ | 2025-11-07 | Cross-browser testing, reliable, powerful selectors, excellent debugging tools, parallel execution |
| **Date/Time** | date-fns | 3.0+ | 2025-11-07 | Lightweight (vs moment.js), tree-shakeable, functional API, comprehensive timezone support |
| **Logging** | Winston | 3.11+ | 2025-11-07 | Structured logging, multiple transports, production-ready, flexible formatting |

**Version Verification Process:**
- All versions verified via npm registry and official documentation on 2025-11-07
- Minimum versions specified ensure compatibility and security patches
- Next verification scheduled: Q1 2026 (or when major releases occur)

**Migration Path:** SQLite → PostgreSQL requires only Prisma datasource change; no application code changes needed.

---
