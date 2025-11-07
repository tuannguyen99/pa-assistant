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
11. "Submit to Board" action available to HR Admin when all departments reach hr_review_complete state, creates board review package and transitions reviews to awaiting board approval status
12. Board approval action (available only to GD/BOM roles) displays company-wide performance summary and allows authorized approval, transitions all reviews from hr_review_complete to board_approved state, captures board meeting date/notes, logs approval timestamp and approver identity, requires confirmation dialog with "This action is final and cannot be undone" warning

**Prerequisites:** Story 2.1, Story 1.12, Story 2.5

---

## Epic 3: Analytics & Insights

**Expanded Goal:** Transform performance data into actionable insights through employee career tracking, manager team analytics, and company-wide reporting capabilities. Enable data-driven talent management decisions at all organizational levels.

**Value Proposition:** Users gain deep visibility into performance trends, career progression patterns, and organizational performance, enabling proactive talent management and strategic workforce planning.

**Test Data Prerequisites:** Development environment should seed 2-3 years of test data (multiple fiscal years, 20-50 users, varied review data, score distributions matching production patterns) for analytics validation and performance testing.

**Story Breakdown:**

**Story 3.1: Employee Performance Dashboard - Multi-Year Trends**

As an employee,
I want to view my performance history across multiple years with trend visualization,
So that I can understand my career progression and identify areas for development.

**Acceptance Criteria:**
1. Dashboard displays multi-year performance trend chart (line/bar chart showing scores from past fiscal years)
2. Goal achievement rate visualization over time (percentage of targets achieved by difficulty level)
3. Rank history timeline showing progression (A+, A, B+, etc.) across years
4. Performance metrics include: average score, rank, difficulty level progression
5. Custom date range selector for specific period analysis
6. Side-by-side comparison view for year-over-year analysis
7. Career development insights section with recommended focus areas
8. Export functionality for performance summary (PDF/CSV)
9. Responsive visualization adapting to data availability (handles first-year users gracefully)
10. Multi-year trend queries complete in <3s with pagination enabled (performance testing required)

**Prerequisites:** Epic 1 complete, Epic 2 complete (minimum 1 fiscal year of historical data)

**Story 3.2: Historical Data Visualization & Year-Over-Year Charts**

As a user (employee, manager, or HR admin),
I want year-over-year comparison charts with statistical trend analysis,
So that I can identify meaningful performance patterns and changes over time.

**Acceptance Criteria:**
1. Year-over-year comparison charts for individual, team, and company-wide data
2. Statistical significance indicators (trend lines, confidence intervals where applicable)
3. Custom date range reporting with flexible period selection
4. Performance pattern identification (consistent performer, improver, concerning trend badges)
5. Drill-down capability from high-level trends to detailed review data
6. Comparison views: side-by-side, overlay, stacked visualizations
7. Data export for all visualizations (CSV, JSON)
8. Visualization accessibility compliance (WCAG 2.1 AA for charts)
9. Performance optimization for large historical datasets (lazy loading, pagination)
10. Historical trend charts load in <2s with caching enabled (performance testing required)

**Prerequisites:** Story 3.1

**Story 3.3: Manager Analytics Dashboard - Team Trends & Aggregates**

As a manager,
I want a team analytics dashboard showing aggregated performance trends and individual contributor patterns,
So that I can make informed talent management decisions and identify development opportunities.

**Acceptance Criteria:**
1. Team performance aggregates: average score, rank distribution chart, completion rates
2. Individual contributor trend lines (anonymized comparison view)
3. Performance distribution analysis (bell curve, outlier identification)
4. Historical comparison showing team evolution despite roster changes
5. Filter controls: by grade level, by review cycle, by performance band
6. Predictive insights: team members at risk, high performers ready for advancement
7. Drill-down navigation: team view → individual review details
8. Export team summary report for leadership meetings
9. Real-time updates as team members complete reviews
10. Multi-year team comparison (e.g., current team vs. same team 1 year ago)
11. Team analytics aggregations complete in <3s for standard queries (performance testing required)

**Prerequisites:** Story 3.2, Story 2.1 (Manager Dashboard foundation)

**Story 3.4: Advanced HR Reporting & Company-Wide Analytics**

As an HR Admin,
I want comprehensive company-wide analytics with department comparisons and board-ready reports,
So that I can provide executive leadership with data-driven insights for strategic HR decisions.

**Acceptance Criteria:**
1. Company-wide performance overview: total employees reviewed, rank distribution, average scores by department
2. Department comparison matrix with sortable metrics (average score, completion rate, rank distribution)
3. One-click board report generator creating presentation materials (PowerPoint/PDF export)
4. Drill-down navigation: Company → Department → Manager → Individual Review
5. Outlier detection and data quality flagging (statistical anomalies, incomplete data)
6. Historical trend analysis across 3+ fiscal years
7. Rank distribution shift analysis (year-over-year changes in grade distributions)
8. Custom report builder with metric selection and filtering
9. Scheduled report generation and email delivery
10. Audit log integration showing all administrative actions in context
11. Export formats: Excel, PDF, CSV, JSON for further analysis
12. Visualization dashboard with interactive charts (drill-down, filters, time-range selectors)
13. Company-wide reports generate in <10s for complex multi-year aggregations (performance testing required)
14. Dashboard initial load completes in <2s with progressive enhancement for detailed analytics

**Prerequisites:** Story 3.3, Story 2.6 (HR Consolidation Dashboard foundation)

**Story 3.5: Advanced Employee Data Management - Transfer & Role History**

As an HR Admin,
I want to track employee departmental transfers and role changes with complete historical preservation,
So that performance data remains accurate and continuous despite organizational changes.

**Acceptance Criteria:**
1. Employee transfer workflow: update department/manager with effective date
2. Audit trail creation for all transfers (old dept/manager → new dept/manager with timestamp)
3. Historical data preservation: all previous reviews remain linked to employee profile
4. Mid-cycle transfer handling: current review transferred to new manager with "Transferred mid-cycle" flag
5. Role change history timeline displayed on employee profile
6. Manager access to transferred employee's complete historical reviews
7. Department reporting accuracy: transferred employees appear in both dept reports (prorated by time)
8. Employee dashboard shows seamless performance history across departments
9. Transfer impact analysis: performance before/after transfer visualization
10. Bulk transfer support for organizational restructuring
11. Transfer notification to old and new managers
12. Review continuity: targets set with old manager remain visible and editable by new manager
13. Transfer history queries complete in <3s including multi-year review data (performance testing required)

**Prerequisites:** Story 1.3 (Employee Data Management foundation), Story 3.1 (historical data infrastructure)

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

