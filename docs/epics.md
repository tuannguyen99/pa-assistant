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

**Prerequisites:** Story 1.2, Story 1.3

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

