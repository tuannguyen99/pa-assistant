# RBAC & Audit Spec — pa-assistant

> **Document Purpose:** This spec provides the technical implementation details for multi-role support, audit logging, and HR Admin capabilities defined in the PRD (FR001, FR001a, FR019, FR022-FR026). See [PRD.md](./PRD.md) for business requirements and [ui-role-header.md](./ui-role-header.md) for UI implementation guidance.

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
  - archived: boolean // true when fiscal year is closed (implements NFR007)
  - archivedAt: datetime | null // timestamp when fiscal year was closed
  - archivedBy: string | null // HR Admin userId who closed the fiscal year

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

## HR Admin configuration endpoints (examples)

> **Note:** These endpoints implement the HR Admin configuration requirements FR022-FR026 from the PRD. All configuration changes must create AuditEntry records with optional reason fields for governance.

- POST /api/admin/fy
  - body: { year: 2025, startDate: "2025-04-01", endDate: "2026-03-31", action: "create" }
  - only HR Admins allowed; server creates AuditEntry { action: "create_fy", details }

- POST /api/admin/fy/:id/close
  - body: { reason: "End of cycle" }
  - only HR Admins allowed; server creates AuditEntry { action: "close_fy", details }

- POST /api/admin/departments
  - body: { name: "Engineering", headId: "user-uuid" }
  - only HR Admins allowed; server creates AuditEntry { action: "create_department", details }

- POST /api/admin/employee-types
  - body: { type: "Engineer", grades: ["E0","E1","E2","SE1","SE2","SE3","APE1","APE2","APE3"] }
  - server creates AuditEntry { action: "create_employee_type", details }

- POST /api/admin/score-to-rank
  - body: { type: "Engineer", grade: "APE2", mappings: [{min:3.75, max:4.5, rank:"A+"}, ...] }
  - server creates AuditEntry { action: "update_score_to_rank", details }

## HR Admin Capabilities Summary

HR Admins have two distinct permission sets:

1. **Read-only access to review data**: HR Admins can view all employee and manager fields, including Result Explanation modals, but cannot edit review content without explicit audit logging and UI flagging (per FR019).

2. **Full configuration access** (FR022-FR026):
   - Create/close Fiscal Years (FY) — locks/unlocks target-setting and evaluation workflows
   - Configure company departments and assign Heads of Department
   - Configure employee types (e.g., Engineer, Back-Office) and associated grade systems
   - Configure score-to-rank conversion tables per employee type/grade tier
   - All configuration actions generate AuditEntry records with optional reason field for governance

These dual responsibilities ensure HR Admins can manage system configuration without compromising the integrity of individual performance reviews.

## Testing

- Unit tests for permission matrix:
  - actor with manager role can edit direct report review
  - actor with manager role cannot edit unrelated review
  - HR Admin can view all reviews and perform config actions; edits must create flagged audit entries
- Integration tests for role-switching and UI visibility

## Security

- Store audit logs in append-only store where possible
- Limit retention based on company policy; ensure logs are exportable for compliance reviews

## Database Backup & Historical Data

> **Implementation of NFR006 and NFR007 from PRD**

**Backup Implementation:**
- **SQLite (MVP)**: Automated file copy with SHA-256 verification checksums
- **PostgreSQL/MySQL (Production)**: Use `pg_dump` or `mysqldump` with gzip compression
- **Schedule**: Daily incremental backups at 2 AM, weekly full backups on Sunday
- **Storage**: Encrypted backups stored in separate location (cloud bucket or off-site server)
- **Retention**: Daily backups for 30 days, weekly backups for 90 days, annual snapshots for 7 years
- **Recovery Testing**: Automated monthly restore tests to verify backup integrity

**Historical Data Protection:**

The Review model includes `archived` fields to implement read-only historical data after fiscal year closure:
- `archived: boolean` — true when HR Admin closes fiscal year
- `archivedAt: datetime` — timestamp of fiscal year closure
- `archivedBy: string` — HR Admin userId who performed the closure

**API Enforcement Example:**
```javascript
// Middleware to protect archived reviews
app.put('/api/reviews/:id', async (req, res) => {
  const review = await getReview(req.params.id)
  const user = req.user
  
  if (review.archived) {
    if (user.roles.includes('hr_admin')) {
      // HR Admin can edit archived reviews but it's logged
      await createAuditEntry({
        actorId: user.id,
        actorRole: 'hr_admin',
        action: 'edit_archived_review',
        targetType: 'review',
        targetId: review.id,
        details: {
          warning: 'Editing closed fiscal year data',
          fiscalYear: review.cycleYear,
          archivedAt: review.archivedAt
        }
      })
    } else {
      return res.status(403).json({
        error: 'Cannot modify archived review from closed fiscal year'
      })
    }
  }
  
  // Continue with update...
})
```

**Fiscal Year Closure Process:**
1. HR Admin initiates FY closure via POST /api/admin/fy/:id/close
2. Server updates all reviews with matching cycleYear:
   - Set `archived = true`
   - Set `archivedAt = now()`
   - Set `archivedBy = adminUserId`
3. Create AuditEntry for FY closure with reason
4. UI displays "Archived - FY 2024" badges on historical reviews

## Notes

This spec is intentionally minimal and developer-friendly. Expand with concrete database schema (SQL migration), policy decision points (e.g., delegation workflows), and any SSO claims mapping (if integrating with LDAP/SSO).
