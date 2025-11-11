# Story 1.4: Target Setting Workflow

Status: drafted

## Story

As an employee,
I want to create and submit my performance targets,
so that my annual goals are established for the review cycle.

## Acceptance Criteria

1. Target creation form with fields: task, KPI, weight, difficulty
2. Weight validation (must total 100%)
3. 3-5 targets per employee supported
4. Manager review and approval workflow
5. Target storage for year-long access
6. Auto-save functionality saves drafts every 3 seconds after any field modification (current role, long-term goal, task description, KPI, weight, difficulty)
7. Save Draft button enabled when form has unsaved changes, disabled when form is clean or during save operations
8. Clear notifications for auto-save progress ("Auto-saving draft..."), success ("Draft auto-saved successfully"), and errors with specific messages
9. Unsaved changes warning dialog when attempting to reload page or navigate to other pages (dashboard, profile)
10. Page reload loads latest data from database with Save Draft button disabled (clean state)
11. System handles concurrent saves from 200+ users without data loss or corruption, maintaining fast response times (<500ms average)

## Tasks / Subtasks

- [ ] Task 1: Create target setting data model and API endpoints (AC: 1, 3, 5)
  - [ ] Extend Prisma schema with TargetSetting model (already exists from data-architecture.md)
  - [ ] Create migration for TargetSetting table
  - [ ] Implement POST /api/targets/create endpoint for draft creation
  - [ ] Implement PUT /api/targets/[id] endpoint for updating targets
  - [ ] Implement POST /api/targets/[id]/submit endpoint for manager submission
  - [ ] Implement validation middleware for target data (3-5 targets, fields required)
  - [ ] Add unit tests for target validation logic
  - [ ] Add unit tests for target API endpoints

- [ ] Task 2: Build target creation form UI (AC: 1, 2, 3)
  - [ ] Create src/app/(dashboard)/targets/new/page.tsx with server component shell
  - [ ] Build TargetSettingForm client component with dynamic array fields
  - [ ] Implement task description textarea input
  - [ ] Implement KPI input field
  - [ ] Implement weight percentage slider/input with real-time total display
  - [ ] Implement difficulty selector (L1/L2/L3) with tooltips
  - [ ] Add "Add Target" button (max 5 targets)
  - [ ] Add "Remove Target" button (min 3 targets enforced)
  - [ ] Implement real-time weight validation showing total = 100%
  - [ ] Add visual feedback for validation errors
  - [ ] Add auto-save draft functionality
  - [ ] Add E2E test for target creation form

- [ ] Task 3: Implement manager review and approval workflow (AC: 4)
  - [ ] Create src/app/(dashboard)/targets/pending/page.tsx for manager dashboard
  - [ ] Build manager review interface showing pending targets
  - [ ] Implement side-by-side target review view
  - [ ] Add manager approval action with POST /api/targets/[id]/approve
  - [ ] Add "Request Revisions" action with feedback textarea
  - [ ] Implement state transitions (draft  submitted_to_manager  manager_approved)
  - [ ] Add notification system for employee when manager approves/requests changes
  - [ ] Update src/app/(dashboard)/targets/[id]/page.tsx for employee to view status
  - [ ] Add unit tests for approval workflow logic
  - [ ] Add E2E test for complete manager approval workflow

- [ ] Task 4: Implement target storage and retrieval (AC: 5)
  - [ ] Create GET /api/targets?cycleYear=YYYY endpoint for retrieving employee targets
  - [ ] Implement unique constraint enforcement (one target set per employee per year)
  - [ ] Add target modification tracking for mid-year updates (future story preparation)
  - [ ] Add audit logging for target creation, submission, and approval actions
  - [ ] Add unit tests for retrieval logic
  - [ ] Add E2E test for year-long target access verification

## Dev Notes

- **Relevant architecture patterns and constraints:**
  - Follow data-architecture.md for TargetSetting model schema with status states: draft | submitted_to_manager | revision_requested | manager_approved | submitted_to_hr | target_setting_complete
  - Implement state machine pattern from core-workflows.md for target setting process
  - Use Prisma for all database operations with proper transaction handling
  - Implement proper RBAC: employees can only edit their own targets, managers can only review direct reports' targets
  - Follow frontend-architecture.md: use Server Components for data loading, Client Components for interactive forms
  - Validate weight total = 100% on both client and server side
  - Difficulty levels: L1 (highest complexity) = 1.25, L2 (moderate) = 1.0, L3 (lowest) = 0.75

- **Source tree components to touch:**
  - prisma/schema.prisma (TargetSetting model already defined)
  - src/app/api/targets/route.ts (new - create/list endpoints)
  - src/app/api/targets/[id]/route.ts (new - update/get single target)
  - src/app/api/targets/[id]/submit/route.ts (new - submit to manager)
  - src/app/api/targets/[id]/approve/route.ts (new - manager approval)
  - src/app/(dashboard)/targets/new/page.tsx (new - target creation form)
  - src/app/(dashboard)/targets/[id]/page.tsx (new - target detail/status view)
  - src/app/(dashboard)/targets/pending/page.tsx (new - manager review dashboard)
  - src/components/targets/TargetSettingForm.tsx (new - reusable form component)
  - src/components/targets/WeightIndicator.tsx (new - weight total display)
  - src/lib/validations/target-schema.ts (new - Zod schemas for validation)
  - middleware.ts (extend for target route protection)
  - tests/unit/target-validation.test.ts (new)
  - tests/unit/target-api.test.ts (new)
  - tests/e2e/target-setting.spec.ts (new)

- **Testing standards summary:**
  - Use Vitest for unit tests with jsdom environment
  - Test validation logic: 3-5 targets, weight = 100%, required fields
  - Test state transitions: draft  submitted  approved/revision_requested
  - Test RBAC enforcement: employees can't access others' targets, managers limited to direct reports
  - Use Playwright for E2E tests covering complete target creation and approval workflow
  - Follow testing-strategy.md patterns for API and workflow testing

### Project Structure Notes

- **Alignment with unified project structure:**
  - Follow src/app/(dashboard)/ structure for authenticated pages
  - Use src/app/api/ for API routes with proper RESTful naming
  - Create src/components/targets/ for target-specific reusable components
  - Create src/lib/validations/ for Zod validation schemas
  - Follow naming conventions from coding-standards.md

- **Detected conflicts or variances:**
  - None - TargetSetting model already defined in data-architecture.md
  - Builds on authentication from Story 1.2
  - Integrates with User model from Story 1.3 (employee/manager relationships)

### Learnings from Previous Story

**From Story 1.3: Employee Data Management (Status: done)**

- **New Components Created:**
  - EmployeeAutoPopulate component at src/components/admin/EmployeeAutoPopulate.tsx - ready for integration into target forms if needed for manager lookup
  - CSV import patterns at src/app/admin/users/import/page.tsx - reference for bulk operations patterns

- **API Patterns Established:**
  - API route structure: src/app/api/users/[id]/route.ts follows GET/PUT/DELETE pattern - replicate for targets
  - Validation approach: Comprehensive Zod schemas with detailed error messages - follow same pattern
  - Error handling: Structured error responses with status codes - maintain consistency

- **Authentication & RBAC:**
  - Middleware protection at middleware.ts enforces role-based access - extend for /targets routes
  - HR Admin role enforcement pattern - apply similar manager/employee scoping for targets
  - Session handling via NextAuth established - reuse for target ownership checks

- **Database Patterns:**
  - Prisma Client usage: await prisma.user.findUnique() patterns - apply to TargetSetting queries
  - Unique constraint handling: employeeId uniqueness with proper error messages - apply to employeeId + cycleYear uniqueness
  - Related data loading: include manager/employee relationships - use for target/user relationships

- **Testing Setup:**
  - Unit test structure: tests/unit/employee-import.test.ts patterns with Vitest + msw - follow for target validation tests
  - E2E test patterns: tests/e2e/employee-management.spec.ts with Playwright authentication flows - replicate for target workflows
  - Total test count: 50 unit tests passing - maintain high coverage standards

- **UI Patterns:**
  - Form validation: Real-time feedback and error display patterns - apply to weight validation
  - Search/filter functionality: src/app/admin/users/page.tsx patterns - useful for manager's pending targets list
  - Edit dialog patterns: Modal interfaces with form state management - consider for target revision requests

- **Files to Reuse/Reference:**
  - src/lib/auth/auth-service.ts - extend for target ownership validation
  - src/app/api/users/[id]/route.ts - API route structure template
  - tests/unit/employee-lookup.test.ts - validation testing patterns
  - middleware.ts - route protection patterns

[Source: docs/stories/1-3-employee-data-management.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-1.4-Target-Setting-Workflow]
- [Source: docs/PRD.md#FR004-Target-Setting-Workflow]
- [Source: docs/PRD.md#FR005-Manager-Review-Targets]
- [Source: docs/PRD.md#FR006-Target-Storage]
- [Source: docs/performance-review-workflow.md#Phase-1-Target-Setting]
- [Source: docs/architecture/data-architecture.md#TargetSetting-Model]
- [Source: docs/architecture/core-workflows.md#Workflow-1-Target-Setting-Process]
- [Source: docs/architecture/frontend-architecture.md#Rendering-Strategy]
- [Source: docs/architecture/testing-strategy.md#Unit-Tests]

## Dev Agent Record

### Context Reference

- docs/stories/1-4-target-setting-workflow.context.xml (Generated: 2025-11-09T21:53:15Z by BMAD Story Context Workflow)

### Agent Model Used

Scrum Master Agent v1

### Debug Log References

### Completion Notes List

### File List

## Change Log

- Initial draft created on 2025-11-09 by Scrum Master Agent
- Story identified from epics.md as next backlog item
- Requirements extracted from PRD.md (FR004, FR005, FR006) and performance-review-workflow.md
- Architecture context gathered from data-architecture.md, core-workflows.md, frontend-architecture.md
- Learnings incorporated from Story 1.3 (Employee Data Management)
- Status set to drafted in sprint-status.yaml
