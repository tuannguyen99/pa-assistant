# Architecture Decision Records (ADRs)

## ADR-001: Choose Next.js 14+ App Router over separate frontend/backend

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

## ADR-002: SQLite for MVP  PostgreSQL for Production

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

## ADR-003: Dual-Mode AI (Web + Local Ollama)

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

## ADR-004: Multi-Role Support with Audit Trail

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
