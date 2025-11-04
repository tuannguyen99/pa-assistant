# Documentation index for pa-assistant

This folder contains the Product Brief, Product Requirements Document (PRD), UX designs and supporting artifacts for the pa-assistant project.

Important docs (authoritative):

- `bmm-product-brief-pa-assistant-2025-11-02.md` — High-level product brief and strategic context (source for PRD input)
- `PRD.md` — Product Requirements Document (detailed functional and non-functional requirements)
- `epics.md` — Epic breakdown and story lists
- `ux-design-specification.md` — UX and interaction details

Role behaviour & multi-role support (summary)

- A single user account may hold multiple roles: Employee (reviewee), Manager (reviewer) and HR Admin.
- The system displays the active role and context in the UI ("Acting as: Reviewer / Reviewee / Admin").
- Reviewer permissions are scoped by manager→direct-report assignment. When a manager is themselves under review, their higher-level manager becomes the default reviewer.
- HR Admins have system-wide visibility and configuration privileges; any edits or approvals they perform on other users' records are auditable and flagged in the UI.
- All reviewer/admin actions, including acceptance or editing of AI-assisted content, are recorded in the audit log with actor role and timestamps.

For full details see `PRD.md` (Role behaviour & multi-role support) and the product brief referenced above.
