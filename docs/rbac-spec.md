# RBAC & Audit Spec — pa-assistant

This document describes a minimal RBAC data model, audit schema, and API contract to implement multi-role support and traceability.

## Data model (simplified)

- User
  - id: string (uuid)
  - email: string
  - fullName: string
  - roles: string[] // e.g., ["employee", "manager", "hr_admin"]
  - managerId: string | null // link to manager user
  - grade: string
  - department: string

- Review
  - id: string (uuid)
  - revieweeId: string
  - reviewerId: string
  - cycleYear: number
  - status: string // not_started | in_progress | pending_manager_review | completed

- RoleAssignment (optional explicit mapping for delegated reviewers)
  - id: string
  - reviewerId: string
  - revieweeId: string
  - reason: string
  - effectiveFrom: datetime
  - effectiveTo: datetime | null

- AuditEntry
  - id: string (uuid)
  - actorId: string
  - actorRole: string // the role the actor was using when performing action
  - action: string // e.g., "edit_target", "accept_ai_synthesis", "switch_role"
  - targetType: string // e.g., "review", "target", "user"
  - targetId: string
  - details: object // JSON blob with optional metadata (diffs, ai_assisted: true)
  - timestamp: datetime

## Implementation notes

- Permission checks must always evaluate the active role (actor.roles contains actorRole) and the relationship graph (reviewerId == actorId OR RoleAssignment exists OR actor has hr_admin role).
- HR Admins should be allowed read and configuration actions; write actions to others' data should be possible only with explicit audit logging and flagged in the UI.
- Role-switching must be transient (per session) and recorded as an AuditEntry with action "switch_role" capturing fromRole -> toRole.

## API contracts (examples)

- GET /api/users/:id
  - returns user object including roles

- POST /api/admin/users/:id/roles
  - body: { roles: ["employee","manager"] }
  - only HR Admins allowed

- POST /api/reviews/:id/actions
  - body: { action: "accept_ai_synthesis", actorRole: "manager", details: { editorDiff: ..., ai_assisted: true } }
  - server creates AuditEntry automatically

- POST /api/audit
  - internal use only; created by server whenever sensitive operations occur

## Testing

- Unit tests for permission matrix:
  - actor with manager role can edit direct report review
  - actor with manager role cannot edit unrelated review
  - HR Admin can view all reviews and perform config actions; edits must create flagged audit entries
- Integration tests for role-switching and UI visibility

## Security

- Store audit logs in append-only store where possible
- Limit retention based on company policy; ensure logs are exportable for compliance reviews

## Notes

This spec is intentionally minimal and developer-friendly. Expand with concrete database schema (SQL migration), policy decision points (e.g., delegation workflows), and any SSO claims mapping (if integrating with LDAP/SSO).
# RBAC & Audit Spec — pa-assistant

This document describes a minimal RBAC data model, audit schema, and API contract to implement multi-role support and traceability.

Data model (simplified)

- User
  - id: string (uuid)
  - email: string
  - fullName: string
  - roles: string[] // e.g., ["employee", "manager", "hr_admin"]
  - managerId: string | null // link to manager user
  - grade: string
  - department: string

- Review
  - id: string (uuid)
  - revieweeId: string
  - reviewerId: string
  - cycleYear: number
  - status: string // not_started | in_progress | pending_manager_review | completed

- RoleAssignment (optional explicit mapping for delegated reviewers)
  - id: string
  - reviewerId: string
  - revieweeId: string
  - reason: string
  - effectiveFrom: datetime
  - effectiveTo: datetime | null

- AuditEntry
  - id: string (uuid)
  - actorId: string
  - actorRole: string // the role the actor was using when performing action
  - action: string // e.g., "edit_target", "accept_ai_synthesis", "switch_role"
  - targetType: string // e.g., "review", "target", "user"
  - targetId: string
  - details: object // JSON blob with optional metadata (diffs, ai_assisted: true)
  - timestamp: datetime

Implementation notes

- Permission checks must always evaluate the active role (actor.roles contains actorRole) and the relationship graph (reviewerId == actorId OR RoleAssignment exists OR actor has hr_admin role).
- HR Admins should be allowed read and configuration actions; write actions to others' data should be possible only with explicit audit logging and flagged in the UI.
- Role-switching must be transient (per session) and recorded as an AuditEntry with action "switch_role" capturing fromRole -> toRole.

API contracts (examples)

- GET /api/users/:id
  - returns user object including roles

- POST /api/admin/users/:id/roles
  - body: { roles: ["employee","manager"] }
  - only HR Admins allowed

- POST /api/reviews/:id/actions
  - body: { action: "accept_ai_synthesis", actorRole: "manager", details: { editorDiff: ..., ai_assisted: true } }
  - server creates AuditEntry automatically

- POST /api/audit
  - internal use only; created by server whenever sensitive operations occur

Testing

- Unit tests for permission matrix:
  - actor with manager role can edit direct report review
  - actor with manager role cannot edit unrelated review
  - HR Admin can view all reviews and perform config actions; edits must create flagged audit entries
- Integration tests for role-switching and UI visibility

Security

- Store audit logs in append-only store where possible
- Limit retention based on company policy; ensure logs are exportable for compliance reviews

Notes

This spec is intentionally minimal and developer-friendly. Expand with concrete database schema (SQL migration), policy decision points (e.g., delegation workflows), and any SSO claims mapping (if integrating with LDAP/SSO).