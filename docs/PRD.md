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
- **FR008**: System shall automatically convert final scores to performance ranks based on configurable grade-tier mappings (e.g., APE2/D1 vs APE1/C4)
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
- **NFR002**: System shall implement role-based access control, data encryption at rest and in transit, and audit logging for all sensitive operations
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

---

## User Journeys

### User Journey: Employee Self-Review Completion

**Actor:** Software Engineer (Employee)

**Scenario:** March review period - employee completes self-evaluation for 3-5 annual targets set in April

**Steps:**
1. Employee logs into pa-assistant and sees dashboard with "Self-Review Due" notification
2. Employee clicks on current review period and sees their 3-5 approved targets from April
3. For each target, employee:
   - Views target description, KPI, weight (%), and difficulty level (pre-filled from April)
   - **Option to modify target fields** (task, KPI, weight, difficulty) if circumstances changed during the year - system flags modifications and notifies manager for review
   - Ensures total weight still equals 100% (system validates)
   - Enters self-assessment rating (1-5 scale)
   - System auto-calculates Total Points = Weight × Difficulty × Rating
   - Employee enters factual bullet points for "Result Explanation" (e.g., "Completed Project X, reduced bug count by 30%")
   - Employee clicks "Get AI Help" - AI transforms bullets into professional narrative
   - AI output clearly marked "AI-assisted" with side-by-side comparison
   - Employee reviews, edits if needed, and accepts
4. System displays overall calculated score and rank based on employee's grade tier
5. Employee reviews company/department goals displayed in sidebar for context alignment
6. Employee submits completed self-review (manager receives notification including any target modifications for review)
7. Manager receives notification that review is ready for their evaluation

**Success Outcome:** Self-review completed in 2-4 hours (vs. 1-2 days previously), employee feels confident their work is professionally articulated, with flexibility to adjust targets if priorities shifted during the year

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

## Epic List

**Epic 1: Foundation & Core Workflows (Est. 9-13 stories)**
- Establish project infrastructure (repo, database, authentication)
- Implement user management and employee data import
- Build target setting workflow with validation
- Create self-evaluation workflow with AI assistance
- Develop manager evaluation workflow with AI synthesis
- Implement automatic score calculation and rank conversion
- Create HR admin configuration panel (AI backend, rank mappings)
- Deploy basic help system

**Epic 2: Dashboards & Production Readiness (Est. 4-6 stories)**
- Build manager dashboard with completion tracking
- Add company/department goals management
- Implement security, audit logging, and data encryption
- Production deployment preparation and testing

**Total Estimated Stories: 13-19 stories**

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

