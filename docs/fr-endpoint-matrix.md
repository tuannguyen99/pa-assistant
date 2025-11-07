# FR → Endpoint Draft Matrix

This draft maps each Functional Requirement (FR) to suggested HTTP API endpoints, methods, auth/role constraints, minimal request/response shapes, and implementation notes. Use this as the starting point for an OpenAPI spec.

Notes:
- Auth: JWT access tokens (NFR002). Include role claim and activeRole for role-switching (FR001a).
- All endpoints require TLS 1.3 in production (NFR002).
- Audit: write AuditEntry records for all admin/config and role-sensitive actions (FR019, FR026).

----------------------------------------

FR001 / FR001a — User management & Role switching
- GET /api/users/:userId
  - Auth: any authenticated user with permission to view (self or HR/Admin)
  - Response: { id, employeeId, name, roles: ["Employee","Manager"], activeRole }
- POST /api/users
  - Auth: HR Admin
  - Body: { employeeId, name, email, roles: [] }
  - Response: { id }
- PATCH /api/users/:userId/roles
  - Auth: HR Admin
  - Body: { roles: ["Manager","HR Admin"] }
  - Side-effect: create AuditEntry (actorId, actorRole, action="update_roles", details)
- POST /api/users/:userId/role-switch
  - Auth: user themselves
  - Body: { activeRole: "Manager" }
  - Response: { success:true, activeRole }
  - Notes: record role switch in AuditEntry (FR001a)

FR002 / FR003 — Employee records & auto-populate
- GET /api/employees/:employeeId
  - Auth: HR Admin or Manager (scoped) or self
  - Response: { employeeId, name, grade, department, managerId, email, jobTitle, status }
- POST /api/employees/import
  - Auth: HR Admin
  - Content-Type: multipart/form-data (file)
  - Body: file=CSV/Excel
  - Response: { imported: N, errors: [...] }
  - Notes: import job should be async; return jobId and audit entry

FR004 — Targets (create, validate weights, mid-year edits)
- GET /api/reviews/:reviewId/targets
  - Auth: participant or reviewer (scoped)
  - Response: [{ id, task, kpi, weight, difficulty, modifiedFlag }]
- POST /api/reviews/:reviewId/targets
  - Auth: Employee (when draft) or HR Admin (exceptions)
  - Body: { task, kpi, weight, difficulty }
  - Validations: totalWeight == 100% for active review; if not, 400 with details
  - Response: { id }
- PATCH /api/reviews/:reviewId/targets/:targetId
  - Auth: Employee (during editable phase) or Manager/HR when allowed
  - Body: partial target fields; side-effect: set modifiedFlag and notify manager

FR005 / FR005a / FR005b / FR006 — Target review lifecycle & storage
- POST /api/reviews/:reviewId/state
  - Auth: actor must have permission (Employee/Manager/HR)
  - Body: { fromState, toState }
  - Side-effects: validate state transitions, create AuditEntry
- GET /api/reviews/:reviewId (includes persisted approved targets)
  - Auth: scoped viewer

FR007 — Score calculation
- POST /api/reviews/:reviewId/calculate-scores
  - Auth: system or Manager/HR
  - Body: { recalcAll: boolean }
  - Response: { targets: [{ targetId, weight, difficulty, rating, points }], totalPoints }
  - Notes: calculation formula is deterministic server-side; run on save and on manager completion

FR008 / FR025 — Rank conversion & grade-tier mappings
- GET /api/admin/grade-mappings?employeeType=Engineer&grade=APE2
  - Auth: HR Admin
  - Response: [{ rankLabel, min, max, inclusiveTop }] (server verifies intervals)
- POST /api/admin/grade-mappings
  - Auth: HR Admin
  - Body: { employeeType, grade, mappings: [{ rankLabel, min, max }] }
  - Side-effects: validate non-overlap/gap and persist; create AuditEntry

FR009 / FR013 — AI assistance & resilience
- POST /api/ai/summarize
  - Auth: Employee or Manager (scoped)
  - Body: { inputBullets: string[], maxTokens?, timeoutMs? }
  - Response: { output: string, model: "ollama|openai|web" , metadata: { latencyMs } }
  - Error: 504 on provider timeout; client shows fallback options
- GET /api/admin/ai-config
  - Auth: HR Admin
  - Response: { provider: "ollama", localEndpoint, timeoutMs }
  - PATCH /api/admin/ai-config (Auth: HR Admin) to configure provider

FR010 / FR010a / FR010b / FR010d — Manager evaluation & submissions
- GET /api/reviews/:reviewId/for-manager
  - Auth: Manager (scoped to direct reports)
  - Response: full review payload with self-review + targets
- PATCH /api/reviews/:reviewId/manager-eval
  - Auth: Manager
  - Body: { perTargetRatings: [{ targetId, rating, comment }], overallComment, aiAccepted: boolean }
  - Side-effect: recalc scores, set status to manager_eval_complete when manager indicates completion
- POST /api/admin/submissions/department
  - Auth: Manager
  - Body: { departmentId, reviewIds: [] }
  - Side-effect: queue HR consolidation

FR010c / FR010e — Board approvals & archive
- POST /api/admin/fy
  - Auth: HR Admin
  - Body: { fyStart, fyEnd, action: "create"|"close" }
  - Side-effect: on close — mark reviews archived, write AuditEntry, export snapshots
- POST /api/admin/approvals/:reviewId
  - Auth: GD or BOM
  - Body: { approved: true|false, notes }

FR011 — Manager dashboard
- GET /api/dashboard/manager
  - Auth: Manager
  - Response: { directReports: [{ id, name, status }], pendingCount }

FR012 — Goals management
- GET /api/goals
  - Auth: public (read) or scoped
- POST /api/goals
  - Auth: HR Admin
  - Body: { title, departmentId, description }

FR014 — Help pages
- GET /api/help/pages/:pageId
  - Auth: public

FR015-017 / UI concerns
- No specific server endpoints required beyond content/config endpoints above. Provide
  /api/ui/settings for persisted user preferences if needed (Auth: user).

FR018 / FR019 / FR026 — RBAC, HR Admin access, Audit logging
- All admin endpoints must check role claims and enforce reviewer scoping.
- POST /api/audit (internal)
  - Auth: system only
  - Body: { actorId, actorRole, action, details, timestamp }
- GET /api/audit?entityType=review&entityId=123
  - Auth: HR Admin (scoped), Security team

FR020 / FR021 — Result Explanations & Goals display
- POST /api/reviews/:reviewId/targets/:targetId/explanation
  - Auth: Employee/Manager (scoped)
  - Body: { rawBullets, aiOutput, acceptedByUser: boolean }
  - Side-effect: store original and aiOutput, flag aiAssisted boolean in audit

FR022 - FR024 — Admin configuration (FY, departments, employee types)
- POST /api/admin/departments
  - Auth: HR Admin
  - Body: { name, headOfDepartmentId }
- POST /api/admin/employee-types
  - Auth: HR Admin
  - Body: { name, validGrades: [] }

FR025 (revisited) — Apply conversion during evaluation
- POST /api/reviews/:reviewId/resolve-rank
  - Auth: system or HR Admin
  - Response: { finalRank }
  - Notes: called after manager_eval_complete and after HR consolidation if recalculation required

NFR Notes
- Performance: endpoints that calculate scores or call AI should be async-friendly (job queue) and expose job endpoints: /api/jobs/:jobId
- Security: JWT + role claim, rate limiting, audit for sensitive ops, TLS enforced

Next steps
- Convert this draft to OpenAPI YAML and add request/response schemas. Create tests for score calculation and interval validation (FR007/FR008).
