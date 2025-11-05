# pa-assistant - Epic Breakdown

**Author:** BMad
**Date:** 2025-11-02
**Project Level:** 2
**Target Scale:** MVP - 200 users (pilot: 10 users)

---

## Overview

This document provides the detailed epic breakdown for pa-assistant, expanding on the high-level epic list in the [PRD](./PRD.md).

Each epic includes:

- Expanded goal and value proposition
- Complete story breakdown with user stories
- Acceptance criteria for each story
- Story sequencing and dependencies

**Epic Sequencing Principles:**

- Epic 1 establishes foundational infrastructure and initial functionality
- Subsequent epics build progressively, each delivering significant end-to-end value
- Stories within epics are vertically sliced and sequentially ordered
- No forward dependencies - each story builds only on previous work

---

## Epic 1: Foundation & Core Workflows

**Expanded Goal:** Establish the technical foundation and core performance review workflows that enable employees and managers to complete their essential tasks. This epic delivers the minimum viable product that replaces Excel-based reviews with a structured, AI-assisted system.

**Value Proposition:** Users can immediately begin using pa-assistant for target setting and evaluations, experiencing the core time-saving benefits while building trust through transparent AI assistance.

**Story Breakdown:**

**Story 1.1: Project Infrastructure Setup**

As a developer,
I want project infrastructure established,
So that development can begin with proper tooling and deployment setup.

**Acceptance Criteria:**
1. Git repository initialized with proper structure
2. Database schema designed and implemented (SQLite for MVP)
3. Basic authentication system implemented (JWT-based)
4. Development environment configured and running
5. Basic CI/CD pipeline established

**Prerequisites:** None

**Story 1.2: User Management & Authentication**

As an HR Admin,
I want to manage user accounts and roles,
So that employees, managers, and admins can securely access the system.

**Acceptance Criteria:**
1. Three user roles implemented (Employee, Manager, HR Admin)
2. User registration and login functionality working
3. Role-based access control enforced
4. Basic user profile management available
5. Session management and logout working

**Prerequisites:** Story 1.1

**Story 1.10: RBAC & Multi-Role Support Implementation**

As a developer,
I want the system to support multi-role user accounts and enforce reviewer scoping,
So that a single account can act as Employee, Manager, and/or HR Admin with clear permission boundaries and auditability.

**Acceptance Criteria:**
1. Data model includes User.roles (array) and Review.assignment linking reviewer→reviewee
2. HR Admin UI can assign/remove roles from user accounts
3. Reviewer permissions are scoped to explicit assignments (manager→direct reports) and cannot access/edit records outside their scope
4. Role-switching UI exists for users with multiple roles and switching is recorded in audit logs
5. Audit entries record actorId, actorRole, action, targetRecord, timestamp, and ai_assisted flag where appropriate
6. Unit and integration tests cover role scoping and audit logging
7. Implementation follows data model and API contracts defined in [rbac-spec.md](./rbac-spec.md)

**Prerequisites:** Story 1.2

**Story 1.11: Active-Role UI & Role Switch Component**

As a user with multiple roles,
I want a clear UI header showing the active role and a safe way to switch contexts,
So that I always know whether I'm acting as a reviewee, a reviewer, or an admin and actions are unambiguous.

**Acceptance Criteria:**
1. Header component displays active role and context (e.g., "Acting as: Reviewer — Reviewing: Akira Sato")
2. Role switch control (dropdown or button) visible only when user has multiple roles
3. Switching role updates available UI actions immediately and is recorded in audit logs
4. Microcopy explains permission changes when switching roles
5. Design matches UX spec (color-coded sections; blue employee, orange manager, read-only HR Admin)
6. Implementation follows guidance in [ui-role-header.md](./ui-role-header.md)

**Prerequisites:** Story 1.2, Story 1.10

**Story 1.3: Employee Data Management**

As an HR Admin,
I want to import and manage employee records,
So that the system has accurate employee information for auto-population.

**Acceptance Criteria:**
1. CSV/Excel import functionality for employee data
2. Employee record fields: ID, name, grade, department, manager, email, job title, status
3. Manual add/edit employee functionality
4. Employee directory view available
5. Auto-population working when Employee ID entered

**Prerequisites:** Story 1.2

**Story 1.4: Target Setting Workflow**

As an employee,
I want to create and submit my performance targets,
So that my annual goals are established for the review cycle.

**Acceptance Criteria:**
1. Target creation form with fields: task, KPI, weight, difficulty
2. Weight validation (must total 100%)
3. 3-5 targets per employee supported
4. Manager review and approval workflow
5. Target storage for year-long access

**Prerequisites:** Story 1.3

**Story 1.5: Self-Evaluation Workflow**

As an employee,
I want to complete my self-review with AI assistance,
So that I can professionally articulate my achievements in less time.

**Acceptance Criteria:**
1. Self-evaluation form loads approved targets
2. Rating input (1-5 scale) for each target
3. AI writing assistant for result explanations
4. "AI-assisted" markers and side-by-side comparison
5. Full edit capability of AI suggestions
6. Target modification option with manager notification

**Prerequisites:** Story 1.4

**Story 1.6: Manager Evaluation Workflow**

As a manager,
I want to review employee self-evaluations with AI synthesis,
So that I can provide comprehensive feedback efficiently.

**Acceptance Criteria:**
1. Manager dashboard showing pending reviews
2. Side-by-side view of employee self-review
3. AI synthesis of multiple inputs (employee review + manager comments)
4. "AI-assisted" markers and edit capability
5. Final score calculation and rank display
6. Review submission and completion tracking

**Prerequisites:** Story 1.5

**Story 1.7: Basic Help System**

As a user,
I want access to guidance and definitions,
So that I can use the system effectively without extensive training.

**Acceptance Criteria:**
1. Help pages for process flows and definitions
2. Contextual help tooltips throughout forms
3. Examples of good vs. poor targets
4. AI usage guidance and best practices
5. Accessible from all major screens

**Prerequisites:** Story 1.6

**Story 1.8: Score Calculation & Rank Conversion**

As a manager,
I want automatic score calculation and rank assignment,
So that performance evaluation is consistent and efficient.

**Acceptance Criteria:**
1. Formula implementation: Total Points = Weight × Difficulty × Rating
2. Overall score calculation (sum of all target points)
3. Grade-based rank conversion (configurable mappings)
4. Real-time display during evaluation
5. Rank display in final assessment

**Prerequisites:** Story 1.6

**Story 1.9: HR Admin Configuration Panel**

As an HR Admin,
I want to configure AI backends and rank mappings,
So that the system works with our infrastructure and policies.

**Acceptance Criteria:**
1. AI backend selection (Ollama, Cloud API, Web-based)
2. Rank configuration per grade tier
3. Connection testing functionality
4. Configuration persistence
5. No code deployment required for changes

**Prerequisites:** Story 1.8

**Story 1.12: HR Admin Configuration — Fiscal Year, Departments, Employee Types & Grade Systems**

As an HR Admin,
I want to configure fiscal years, departments, employee types and grade systems, and score→rank conversion tables,
So that the performance review process matches company policy and grade-specific rank mapping is applied consistently.

**Acceptance Criteria:**
1. UI for creating/closing Fiscal Years with active windows noted and closing locked behind confirmation and reason input
2. UI to create/edit departments and assign Head of Department
3. UI to create employee types and configure grade lists per type (persisted)
4. UI to create/edit score→rank conversion tables per employee type/grade tier
5. All changes create AuditEntry records with details and optional reason field
6. End-to-end test: create FY, add departments, configure Engineer grade list and conversion table, run an evaluation and verify rank mapping
7. API implementation follows endpoints defined in [rbac-spec.md](./rbac-spec.md#hr-admin-configuration-endpoints-examples)

**Prerequisites:** Story 1.2, Story 1.9

**Story 1.13: Workflow State Indicator Component**

As a user,
I want to see my current position in the review workflow and available next actions,
So that I understand where I am in the process and what I can do next.

**Acceptance Criteria:**
1. State badge displays current workflow state (Draft, Submitted to Manager, Manager Review, Archived, etc.)
2. Visual timeline shows completed/current/upcoming phases in the 9-step workflow
3. Context-aware action buttons for state transitions (Submit to Manager, Submit to HR)
4. Hover tooltips explain state meaning and next steps
5. Color-coded badges: gray=draft, blue=submitted, orange=in review, green=complete, purple=archived
6. Notifications trigger on state transitions
7. Audit trail link for viewing state change history
8. Implementation follows UX spec Section 6.1 Workflow State Indicator

**Prerequisites:** Story 1.4, Story 1.5, Story 1.6

**Story 1.14: Active Role Header Component**

As a user with multiple roles,
I want a clear UI header showing my active role and ability to switch contexts,
So that I always know whether I'm acting as an employee, manager, or HR admin.

**Acceptance Criteria:**
1. Header displays active role badge and context label (e.g., "Acting as: Reviewer — Reviewing: Akira Sato")
2. Role switcher dropdown visible only for multi-role users
3. Role switch updates UI permissions immediately and logs to audit trail
4. Toast notification confirms role change with message
5. Color-coded visual feedback: blue=employee, orange=manager, gray=HR admin
6. Microcopy explains permission changes when switching
7. All role switches recorded with timestamp and context in audit logs
8. Implementation follows [ui-role-header.md](./ui-role-header.md) and UX spec Section 6.1 Active Role Header Component

**Prerequisites:** Story 1.10, Story 1.11

## Epic 2: Dashboards, Scoring & Production Readiness

**Expanded Goal:** Complete the user experience with dashboards and production-grade features that enable full-scale deployment and monitoring of the performance review process.

**Value Proposition:** Managers can track completion across their teams, HR admins can manage company goals, and the system handles production workloads with security and reliability.

**Story Breakdown:**

**Story 2.1: Manager Dashboard**

As a manager,
I want a dashboard showing all my direct reports' review status,
So that I can track completion and identify overdue reviews.

**Acceptance Criteria:**
1. Dashboard lists all direct reports with status indicators
2. Status types: Not Started, In Progress, Pending Review, Completed
3. Click-through to individual reviews
4. Completion percentage overview
5. Flagged overdue items

**Prerequisites:** Epic 1 complete

**Story 2.2: Company Goals Management**

As an HR Admin,
I want to create and edit company/department goals,
So that users have business context throughout the process.

**Acceptance Criteria:**
1. Company-level objectives creation and editing
2. Department-level targets management
3. Goals visible during target setting
4. Goals visible during evaluation
5. Goal updates reflected immediately

**Prerequisites:** Story 2.1

**Story 2.3: Security & Audit Implementation**

As an HR Admin,
I want sensitive data protected with audit trails,
So that performance data remains secure and compliant.

**Acceptance Criteria:**
1. Data encryption at rest and in transit
2. Role-based access control enforced
3. Audit logging for sensitive operations
4. Secure authentication (bcrypt, JWT)
5. Data privacy compliance measures

**Prerequisites:** Story 2.2

**Story 2.3a: Database Backup & Historical Data Management**

As an HR Admin and System Administrator,
I want automated database backups and read-only historical data preservation,
So that review data is protected from loss and previous fiscal years remain available for analysis without risk of modification.

**Acceptance Criteria:**
1. Automated daily incremental backups at 2 AM with verification checksums
2. Automated weekly full backups on Sunday with 90-day retention
3. Encrypted backup storage in separate location from primary database
4. Monthly automated restore tests to verify backup integrity
5. Fiscal year closure sets `archived: true` on all reviews for that year
6. API rejects PUT/PATCH/DELETE requests to archived reviews (except HR Admin with audit logging)
7. UI displays "Archived - FY 20XX" badges on historical reviews
8. Historical reviews remain queryable for analytics and reporting
9. Implementation follows backup strategy and API enforcement defined in [rbac-spec.md](./rbac-spec.md#database-backup--historical-data)

**Prerequisites:** Story 2.2, Story 1.12

**Story 2.4: Production Deployment Preparation**

As a developer,
I want production-ready deployment configuration,
So that the system can handle 200 concurrent users reliably.

**Acceptance Criteria:**
1. Docker containerization complete
2. Performance optimization implemented
3. Load testing completed
4. Backup and recovery procedures
5. Monitoring and logging configured

**Prerequisites:** Story 2.3

**Story 2.5: Department Submission Dashboard (for Managers)**

As a manager,
I want to track completion status across all my direct reports and submit consolidated department data to HR,
So that I can manage my team's review process efficiently and meet submission deadlines.

**Acceptance Criteria:**
1. Employee list table shows all direct reports with completion status
2. Aggregation summary displays department-wide statistics (average score, rank distribution, completion %)
3. "Submit All to HR" button enabled only when all reviews complete
4. Filter/sort controls for state, name, score, completion status
5. Click employee row to open individual evaluation
6. Export department summary for offline review
7. Confirmation dialog before bulk submission to HR
8. Real-time status updates as employees/managers complete reviews
9. Implementation follows UX spec Section 6.1 Department Submission Dashboard

**Prerequisites:** Story 2.1, Story 1.6

**Story 2.6: HR Consolidation Dashboard**

As an HR Admin,
I want a company-wide view of all department submissions with consolidation and fiscal year management tools,
So that I can prepare board presentations and manage the review cycle lifecycle.

**Acceptance Criteria:**
1. Department list shows all departments with submission status and aggregated metrics
2. Company-wide statistics: total employees reviewed, rank distribution chart, average scores by department
3. Board report generator creates presentation materials with one click
4. Fiscal year controls: create new FY, close current FY with confirmation and reason input
5. Filter/export tools for department/state filtering and data export
6. Drill-down navigation: Department → Manager → Individual Review
7. Real-time validation of calculation accuracy across all reviews
8. Flagging of outliers or data quality issues
9. Audit log viewing for all administrative actions
10. Implementation follows UX spec Section 6.1 HR Consolidation Dashboard

**Prerequisites:** Story 2.1, Story 1.12, Story 2.5

---

## Story Guidelines Reference

**Story Format:**

`
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. [Another specific criterion]
3. [etc.]

**Prerequisites:** [Dependencies on previous stories, if any]
`

**Story Requirements:**

- **Vertical slices** - Complete, testable functionality delivery
- **Sequential ordering** - Logical progression within epic
- **No forward dependencies** - Only depend on previous work
- **AI-agent sized** - Completable in 2-4 hour focused session
- **Value-focused** - Integrate technical enablers into value-delivering stories

---

**For implementation:** Use the create-story workflow to generate individual story implementation plans from this epic breakdown.

