# pa-assistant Product Requirements Document (PRD)

**Author:** BMad
**Date:** 2025-11-02
**Project Level:** 2
**Target Scale:** MVP - 200 users (pilot: 10 users)

---

## Goals and Background Context

### Goals

- **Reduce review cycle time by 75%** - Cut manager review time from 20-40 hours to 5-10 hours and employee self-review time from 1-2 days to 2-4 hours
- **Achieve 95% on-time completion rate** - Enable timely completion of all performance reviews within designated review periods
- **Maintain review authenticity with 70%+ AI feature adoption** - Position AI as a transparent writing assistant that preserves authenticity while improving efficiency

### Background Context

The company's annual performance review process has reached a critical breaking point. With 200 employees following the Japanese fiscal year calendar (April-May for target setting, March-April for evaluation), the current Excel-based system creates unsustainable burdens: managers spend 20-40 hours per cycle evaluating 30-40 direct reports, while employees struggle for 1-2 days to articulate their achievements professionally.

The core problem is lack of structured support. Excel provides no guidance for writing professional assessments, no synthesis of multiple feedback sources, and no connection to company goals. This leads to rushed, generic reviews that directly impact salary and bonuses—creating fairness concerns and retention risks. As the company scales, this manual process becomes exponentially more burdensome, threatening to collapse under its own weight while competitors gain advantages through modern HR technology.

---

## Requirements

### Functional Requirements

**User Management & Authentication**
- **FR001**: System shall support five user roles (Employee, Manager, HR Admin, General Director, Board of Manager) with role-based access control

> **Implementation Reference:** See [rbac-spec.md](./rbac-spec.md) for detailed RBAC data model, audit schema, and API contracts. See [ui-role-header.md](./ui-role-header.md) for UI component implementation guidance.

### Role behaviour & multi-role support

Many users will hold more than one role during the review process and the system must make this explicit and easy to manage. The PRD requires the following behaviours:

- Multi-role accounts: A single user account may be assigned multiple roles (Employee, Manager, HR Admin, General Director, Board of Manager). Role assignments must be editable by HR Admins.
- Active-role indicator: The UI shall display the active role and context at the top of the page (e.g., "Acting as: Reviewer — Reviewing: Akira Sato" or "Acting as: Reviewee — Your self-evaluation").
- Reviewer scoping: Reviewer permissions are scoped to explicit manager→direct-report assignments. When a manager is a reviewee, the manager's higher-level manager becomes the reviewer by default. HR may reassign reviewers for delegation or temporary reorgs; these changes shall be recorded in the audit log.
- Permission boundaries: Reviewer actions (viewing/editing others' evaluations, accepting AI-synthesized content) are allowed only for records assigned to the reviewer. HR Admins may have broader visibility but any edits/approvals performed by HR shall be clearly flagged and auditable.
- Audit & traceability: All actions performed while acting in a reviewer or admin capacity shall be recorded with actor role, action type, timestamp, and whether AI-assisted content was created/accepted/edited. Original inputs must remain visible alongside AI-assisted outputs.

These behaviours MUST be reflected in the RBAC implementation, UI microcopy, and audit schema.

- **FR002**: HR Admin shall be able to add, edit, and import employee records (CSV/Excel bulk import) including Employee ID, name, grade/level, department, manager, email, job title, and employment status
- **FR003**: System shall auto-populate employee information (name, grade, department, manager) when Employee ID is entered on forms

**FR001a**: System shall allow assigning multiple roles to a single user account and provide HR interfaces to edit these assignments. Role switching in the UI shall be possible where appropriate and shall be recorded in audit logs.

**Workflow States & Process**

> **Detailed Workflow:** See [performance-review-workflow.md](./performance-review-workflow.md) for complete process description, state transitions, workflow diagrams, and timeline.

**Target Setting States:**
- `draft` - Employee creating targets
- `submitted_to_manager` - Awaiting manager review
- `revision_requested` - Manager requested changes
- `manager_approved` - Manager approved targets
- `submitted_to_hr` - Submitted to HR for visibility
- `target_setting_complete` - Ready for evaluation phase

**Performance Evaluation States:**
- `self_eval_draft` - Employee working on self-evaluation
- `self_eval_submitted` - Awaiting manager evaluation
- `manager_eval_in_progress` - Manager reviewing
- `manager_eval_complete` - Manager finished evaluation
- `submitted_to_hr_final` - Submitted to HR for consolidation
- `hr_review_complete` - Ready for board review
- `board_approved` - Board approved final decisions
- `feedback_delivered` - Manager delivered final feedback
- `archived` - Fiscal year closed (read-only)

**Target Setting Workflow**
- **FR004**: Employees shall create 3-5 performance targets with task description, KPI, weight percentage (auto-validated to total 100%), and difficulty level (L1-L3), with ability to modify targets at mid-year and during self-evaluation (modifications flagged and sent to manager for review)
- **FR005**: Managers shall review employee targets with ability to send feedback and request revisions, then submit department targets to HR for alignment verification
- **FR005a**: HR shall review all department targets to verify quality and alignment with company targets, with ability to send feedback to managers for employee updates
- **FR005b**: System shall support mid-year target setting period where all employees can update their targets following the same review workflow (employee → manager → HR)
- **FR006**: System shall store approved targets for the entire review cycle year

**Performance Evaluation Workflow**
- **FR007**: System shall automatically calculate target scores using formula: Total Points = Weight × Difficulty × Rating
- **FR008**: System shall automatically convert final scores to performance ranks based on configurable grade-tier mappings (e.g., APE2/D1 vs APE1/C4). Rank intervals must use validated non-overlapping numeric ranges with half-open form `[min, max)` except the top band which is fully inclusive `[min, max]` to avoid precision gaps. Example Engineer tier mapping (illustrative only):
    - A+: [3.75, 4.50]
    - A:  [3.25, 3.75)
    - B+: [2.75, 3.25)
    - B:  [2.25, 2.75)
    - C:  [0.00, 2.25)
    Configuration validation shall reject overlapping or gapped intervals and enforce ascending min values. Rank resolution occurs after manager evaluation completion (FR010) and again after HR consolidation (FR010b) if recalculation rules apply.
- **FR009**: Employees shall complete self-evaluations with AI-assisted writing for result explanations, clearly marked as "AI-assisted" with full edit capability; employees may modify original targets with visible flagging and manager notification
- **FR010**: Managers shall complete evaluations viewing employee self-review side-by-side, with AI synthesis of multiple inputs (employee review + manager comments) clearly marked as "AI-assisted"; optional 1-on-1 review meeting
- **FR010a**: Managers shall submit completed department evaluations to HR with scores and ranks for company-wide consolidation
- **FR010b**: HR Admin shall consolidate all department submissions, verify calculations, and prepare company-wide performance reports for Board review
- **FR010c**: General Director and Board of Manager shall hold decision meeting to review company-wide data and approve final performance decisions (only GD/BOM can approve performance)
- **FR010d**: Managers shall deliver final feedback to employees in 1-on-1 meetings, communicating performance rank and board decisions
- **FR010e**: HR Admin shall close fiscal year after feedback delivery, marking all reviews as archived (read-only) with historical data preservation

**Dashboard & Monitoring**
- **FR011**: Managers shall access dashboard showing all direct reports with completion status indicators (Not Started, In Progress, Pending Review, Completed)
- **FR012**: HR Admin shall create and edit company/department goals visible to all users during target setting and evaluation phases

**AI Integration & Help System**
- **FR013**: HR Admin shall configure AI backend (Ollama local, Cloud API, or web-based tool with auto-open/prompt generation) without code deployment
- **FR014**: System shall provide accessible help pages with process flows, definitions, examples, and guidance throughout all workflows

**HR Admin Configuration**
- **FR022**: HR Admin shall be able to create and close Review Fiscal Years (FY) for the system. Creating a FY sets the active review window and locks/unlocks target-setting and evaluation workflows; closing a FY marks the cycle as finalised and prevents further edits except by HR Admin with audit logging.
- **FR023**: HR Admin shall be able to configure company departments and assign a Head of Department (HoD) for each department. Department configuration must be visible during target setting and evaluation and used to scope dashboards and reports.
- **FR024**: HR Admin shall be able to configure employee types (e.g., "Engineer", "Back-Office") and the associated grade systems. Each employee type must include a configurable list of valid grades (for example: Engineers = [E0, E1, E2, SE1, SE2, SE3, APE1, APE2, APE3]; Back-Office = [C0, C1, C2, C3, C4, APE1,...]).
- **FR025**: HR Admin shall be able to configure score-to-rank conversion tables per employee type and grade tier. The conversion must be editable in the admin UI and applied automatically when calculating final rank during evaluation.
- **FR026**: All HR Admin configuration actions (create/modify/close FY, department changes, employee type/grade edits, score→rank updates) shall generate AuditEntry records capturing actorId, actorRole, action, details and timestamp. Config changes must include an optional "reason" field in the UI to support governance.

**User Interface & Experience**
- **FR015**: System shall implement glassmorphism design language with frosted glass effects, transparency, backdrop blur, soft shadows, and subtle gradients
- **FR016**: System shall provide Excel-familiar interface with table-based data entry, keyboard navigation (Tab, Enter, Arrow keys), and inline editing patterns
- **FR017**: System shall support Excel-like table resizing for columns and rows with visual feedback and handle positioning
- **FR018**: System shall implement Role-Based Access Control (RBAC) with visual indicators: blue sections (employee-editable), orange sections (manager-editable), disabled states for read-only access
- **FR019**: System shall support HR Admin role with read-only access to all employee/manager review fields (with audit logging for any edits), plus full configuration access for system settings (see FR022-FR026)
- **FR020**: System shall provide Modal UI for Result Explanation with AI assistance, allowing employees to edit their explanations and managers to read them and write feedback
- **FR021**: System shall display company/department goals throughout target setting and evaluation phases to connect individual work to business context

### Non-Functional Requirements

- **NFR001**: System shall support 200 concurrent users with page load times < 2 seconds and AI response times < 10 seconds
- **NFR002**: System shall implement role-based access control, data encryption at rest and in transit, and audit logging for all sensitive operations. Technical standards: TLS 1.3 for all HTTP/WebSocket traffic; AES-256-GCM (or encrypted volume equivalent) for at-rest storage; bcrypt password hashing with cost factor ≥12; JWT access tokens signed using HS256/RS256 with 256-bit keys (rotation annually or upon compromise); audit log integrity assured by append-only store or hash-chain sequencing; secrets managed via environment variables with least-privilege access.
- **NFR003**: System shall provide Excel-familiar UI with table-based data entry, keyboard navigation, and glassmorphism design aesthetics
- **NFR004**: System shall meet **WCAG 2.1 AA accessibility standards** with full keyboard navigation, screen reader support, and high contrast compliance
- **NFR005**: System shall implement **desktop-first responsive design** optimized for modern browsers with horizontal scrolling for wide tables
- **NFR006**: System shall implement automated database backup with daily incremental backups and weekly full backups, stored in secure off-site location with 30-day retention minimum
- **NFR007**: System shall preserve historical review data as read-only after fiscal year completion, enabling multi-year trend analysis and statistical reporting while preventing accidental modification of closed review cycles

### Database Management & Historical Data

**Backup Strategy:**
- **Automated Daily Backups**: Incremental backups performed automatically at 2 AM local time when system usage is minimal
- **Weekly Full Backups**: Complete database snapshots created every Sunday, retained for 90 days minimum
- **Backup Storage**: Encrypted backups stored in separate physical/cloud location from primary database
- **Recovery Testing**: Monthly automated restore tests to verify backup integrity
- **Retention Policy**: Daily backups retained for 30 days, weekly backups for 90 days, annual snapshots retained for 7 years (compliance requirement)
- **Backup Technologies**: SQLite file-based backups for MVP (simple file copy + verification), with migration path to pg_dump (PostgreSQL) or mysqldump (MySQL) for production scale
   - *Incremental Definition (SQLite)*: Page-level differential copy capturing only changed pages since last full backup; weekly full backup establishes new baseline; integrity validated with SHA-256 checksums pre- and post-transfer.

**Historical Data Management:**
- **Fiscal Year Closure**: When HR Admin closes a fiscal year (FR022), all review records for that year are marked as `archived: true` and become read-only
- **Read-Only Enforcement**: Backend API rejects any PUT/PATCH/DELETE requests to archived records (except by HR Admin with audit logging)
- **Historical Data Access**: Archived reviews remain queryable for:
  - Employee career progression views (multi-year performance trends)
  - Manager historical team analytics
  - HR statistical analysis and reporting
  - Compliance audits and legal discovery
- **Data Retention**: Review data retained indefinitely for HR analytics; audit logs retained for 7 years minimum (compliance requirement)
 - **Archive Indicators**: UI displays clear "Archived - FY 2024" badges on historical reviews to prevent confusion with active cycle

**Retention Policy Table:**
| Data Type | Retention | Rationale | Notes |
|-----------|-----------|-----------|-------|
| Active Reviews (current FY) | FY duration | Operational workflow | Editable until closure |
| Archived Reviews | Indefinite | Long-term performance analysis | Read-only (FR010e) |
| Audit Logs | ≥ 7 years | Compliance & traceability | Exportable, append-only integrity |
| Daily Incremental Backups | 30 days | Point-in-time recovery | Auto-pruned; relies on weekly baseline |
| Weekly Full Backups | 90 days | Disaster recovery baseline | Monthly restore test performed |
| Annual Snapshot | 7 years | Regulatory, historical analytics | Off-site encrypted storage |
| Configuration Change Audit | ≥ 7 years | Governance of HR admin actions | Includes reason field (FR026) |

---

## User Journeys

### User Journey: Employee Self-Review Completion *(FR004, FR006, FR007, FR008, FR009, FR021)*

**Actor:** Software Engineer (Employee)

**Scenario:** March review period - employee completes self-evaluation for 3-5 annual targets set in April

**Steps:**
1. Employee logs in and sees dashboard with "Self-Review Due" notification *(dashboard visibility – FR011 indirect; journey focus)*
2. Employee opens current review period and sees approved targets from April *(target storage – FR006)*
3. For each target, employee performs a structured evaluation:
  - Views target description, KPI, weight (%), difficulty *(target definition – FR004)*
  - **Optional modification of target fields** (task, KPI, weight, difficulty) if changed priorities *(mid-year / evaluation modification flow – FR004, FR005b); system flags & notifies manager (FR009)*
  - Validates total weight still equals 100% *(weight validation – FR004)*
  - Enters self-assessment rating (1–5) *(rating capture – FR009)*
  - System auto-calculates Total Points = Weight × Difficulty × Rating *(score formula – FR007)*
  - Enters factual bullet points for Result Explanation *(raw input capture – FR009)*
  - Clicks "Get AI Help" → AI transforms bullets into professional narrative *(AI assistance – FR009)*
  - Output marked "AI-assisted" side-by-side with original bullets *(transparency – FR009)*
  - Reviews/edits and accepts narrative *(full edit capability – FR009)*
4. System displays overall calculated score (sum of points – FR007) and rank based on grade-tier mapping *(rank conversion – FR008)*
5. Employee reviews company/department goals in sidebar for alignment *(context goals display – FR021)*
6. Employee submits self-review; system persists evaluation and flags any modified targets for manager review *(submission + modification flagging – FR009)*
7. Manager receives notification for evaluation *(workflow progression enabling manager evaluation – FR010)*

**Success Outcome:** Self-review completed in 2–4 hours (vs. 1–2 days previously), employee articulates achievements professionally with transparent AI assistance and legitimately flagged target changes for reviewer visibility.

### User Journey: Manager Evaluation Completion *(FR010, FR007, FR008, FR011, FR021, FR010a)*

**Actor:** Manager (Reviewer)

**Scenario:** After employee self-review submission, manager evaluates results, synthesizes feedback, and finalizes department submission.

**Steps:**
1. Manager logs in and sees dashboard with pending reviews count *(status indicators – FR011)*
2. Opens an employee’s evaluation: side-by-side view of employee targets & self-review *(comparison layout – FR010)*
3. For each target:
  - Reviews employee rating & narrative *(input consumption – FR010)*
  - Enters manager rating (1–5) *(manager assessment capture – FR010)*
  - Auto-calculated Total Points updates (Weight × Difficulty × Rating) *(formula reuse – FR007)*
  - Enters per-target manager comment *(feedback input – FR010)*
  - (Optional) Invokes AI Synthesis to combine employee narrative + manager comments *(AI synthesis – FR010)*
  - Accepts/edits AI-assisted output; system logs AI-assisted acceptance *(audit transparency – FR010 + FR019)*
4. Reviews cumulative score and provisional rank mapping *(score sum – FR007, rank conversion – FR008)*
5. Adds overall performance summary (optional AI synthesis combining target-level context) *(FR010)*
6. Marks review as complete; status transitions to `manager_eval_complete` *(state progression – workflow states)*
7. Upon all team reviews completion, manager uses Department Submission dashboard to submit consolidated data to HR *(bulk submission – FR010a with dashboard context – FR011)*

**Success Outcome:** Manager completes evaluations with reduced synthesis time, consistent scoring, and transparent AI-assisted commentary; department-level submission ready for HR consolidation.

### Edge Case Mini-Journeys *(Risk & Validation Enhancements)*

1. **Invalid Weight Total (FR004 Validation Failure):** Employee modifies a target, resulting total weight = 105%. System blocks save, highlights offending rows, shows corrective tooltip, and prevents submission until total = 100%.
2. **AI Backend Timeout (FR009 Resilience):** Employee requests AI help; local Ollama times out after configured threshold (e.g., 8s). UI displays fallback prompt: option to retry or open web-based AI provider with auto-generated prompt; action logged.
3. **Reviewer Reassignment (FR001a / FR019):** HR Admin delegates a review mid-cycle (manager on leave). RoleAssignment created; manager dashboard updates; audit entry records delegation reason and effective dates; employee sees updated reviewer label.
4. **Archived Review Edit Attempt (FR010e / NFR007):** User attempts to edit a prior fiscal year review. API returns 403 with "Archived – FY YYYY" message; UI displays read-only badge; if HR Admin override required, special modal capturing reason triggers audit log.
5. **Mid-Year Target Modification (FR005b):** Employee adjusts KPI mid-year; system flags target with "Modified" badge; sends manager notification; audit entry created with before/after diff; rank recalculation deferred until evaluation phase.

---
## Glossary

| Term | Definition |
|------|------------|
| **RBAC** | Role-Based Access Control governing permissions by assigned roles and reviewer relationships. |
| **Reviewer Scoping** | Limiting a manager’s edit/view rights strictly to assigned reviewees (direct reports or delegated). |
| **AI-Assisted** | Content generated or synthesized with AI; always marked and auditable with original inputs retained. |
| **Target** | A performance commitment defined by task, KPI, weight, and difficulty for the fiscal cycle. |
| **Difficulty (L1–L3)** | Relative challenge level (L1 highest / most complex, L3 lowest) influencing score weighting fairness. |
| **Total Points** | Computed per target: Weight × Difficulty × Rating (FR007). |
| **Rank Conversion** | Mapping from final numeric score to rank label based on grade-tier configured ranges (FR008, FR025). |
| **Archived** | Read-only state for reviews after fiscal year closure; modifications disallowed except audited HR overrides (FR010e, NFR007). |
| **Fiscal Year (FY)** | Review cycle period (e.g., Apr–Mar) determining target setting and evaluation windows (FR022). |
| **Role Switch** | User changing active role context (e.g., employee → manager) for task execution; always logged (FR001a). |
| **AuditEntry** | Immutable record capturing actor, role, action, target, metadata, timestamp for sensitive operations (FR019, FR026). |
| **Incremental Backup** | A backup capturing only changed database pages since last full backup (SQLite page-level strategy). |

---

---

## UX Design Principles

1. **Familiarity Through Excel-Like Patterns** - Use table-based layouts, keyboard navigation (Tab, Enter, Arrow keys), and familiar data entry patterns to reduce learning curve for users accustomed to Excel workflows

2. **Transparency Builds Trust** - All AI-assisted content clearly marked with "AI-assisted" badges, side-by-side comparison of original inputs vs. AI output, and full user control over final content

3. **Progressive Disclosure** - Show complexity only when needed; hide advanced features until requested to maintain clean, approachable interface

4. **Contextual Guidance** - Company and department goals visible in sidebar throughout target setting and evaluation; inline help tooltips and accessible help pages reduce support burden

5. **Glassmorphism Aesthetic** - Frosted glass effects with transparency and backdrop blur create modern, professional feel that reduces HR process anxiety

6. **Role-Based Visual Clarity** - Blue sections (employee-editable), orange sections (manager-editable), clear visual indicators for read-only access, supporting HR Admin read-only role

7. **Modal-First Result Explanation** - Excel-like modal approach for detailed explanations with AI assistance, allowing employees to edit and managers to read and provide feedback

8. **Accessibility First** - WCAG 2.1 AA compliance with full keyboard navigation, screen reader support, and high contrast despite glassmorphism effects

9. **Desktop-Optimized Responsive Design** - Fixed layout optimized for desktop browsers with horizontal scrolling for wide tables, no mobile optimization required for MVP

---

## User Interface Design Goals

- **Glassmorphism Aesthetic** - Frosted glass effects with transparency, backdrop blur, soft shadows, and subtle gradients create modern, professional feel that reduces HR process anxiety
- **Responsive Feedback** - Loading states, success confirmations, and validation messages provide immediate user feedback for all actions
- **Accessible Design** - **WCAG 2.1 AA compliance** with clear contrast despite glassmorphism effects, keyboard navigation support, screen reader compatibility, and high contrast focus indicators
- **Consistent Patterns** - Unified design language across all workflows ensures predictable, intuitive navigation
- **Excel-Like Table Interactions** - Column and row resizing, familiar data entry patterns, keyboard shortcuts for power users
- **Role-Based Visual Design** - Color-coded sections (blue for employee, orange for manager), disabled states for read-only access, clear permission boundaries
- **Modal UI for Complex Tasks** - Result Explanation modal with AI assistance, side-by-side employee/manager sections, clear edit permissions
- **Desktop-First Responsive Design** - Optimized for desktop browsers with fixed layout (max 1200px), horizontal scrolling for tables, no mobile optimization for MVP

---

## Epic List (Updated Actual Counts)

**Epic 1: Foundation & Core Workflows (Actual: 14 stories)**
- Establish project infrastructure (repo, database, authentication)
- Implement user management and employee data import
- Build target setting workflow with validation
- Create self-evaluation workflow with AI assistance
- Develop manager evaluation workflow with AI synthesis
- Implement automatic score calculation and rank conversion
- Create HR admin configuration panel (AI backend, rank mappings)
- Deploy basic help system

**Epic 2: Dashboards & Production Readiness (Actual: 6 stories)**
- Build manager dashboard with completion tracking
- Add company/department goals management
- Implement security, audit logging, and data encryption
- Production deployment preparation and testing

**Total Stories: 20 stories (Finalized)**

> **Note:** Detailed epic breakdown with full story specifications is available in [epics.md](./epics.md)

---

## Out of Scope

- Automated quarterly reminder emails (manual reminders for MVP)
- Employee dashboard with multi-year performance trends
- Manager analytics dashboard (team trends, aggregates, historical comparisons)
- Historical data visualization and year-over-year charts
- Peer feedback / 360-degree review integration
- Export to PDF/Excel functionality (employee data import/add is included in MVP)
- Advanced HR reporting and company-wide analytics
- Mobile responsive design (desktop-first for MVP)
- Multi-language support (English-only for MVP)
- Dark mode / theme customization (glassmorphism light theme for MVP)
- Advanced AI features (auto-suggested KPIs, sentiment analysis)
- Integration with existing HR/payroll systems (direct sync)
- Advanced employee data management (departmental transfers, role changes history)
- Advanced notification system
- Collaborative commenting/feedback threads
- Custom workflow configuration per department

