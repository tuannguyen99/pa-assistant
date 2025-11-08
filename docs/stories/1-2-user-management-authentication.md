# Story 1.2: User Management & Authentication

Status: review

## Story

As an HR Admin,
I want to manage user accounts and roles,
so that employees, managers, and admins can securely access the system.

## Acceptance Criteria

1. Five user roles implemented (Employee, Manager, HR Admin, Board of Manager, General Director)
2. User registration and login functionality working
3. Role-based access control enforced
4. Basic user profile management available
5. Session management and logout working

## Tasks / Subtasks

- [x] Task 1: Implement user registration functionality (AC: 2)
  - [x] Create registration page with form validation
  - [x] Add API route for user registration with password hashing
  - [x] Add unit tests for registration logic
  - [x] Add E2E test for user registration flow
- [x] Task 2: Implement role-based access control enforcement (AC: 3)
  - [x] Update middleware to check user roles for route protection
  - [x] Add role checking utilities in auth service
  - [x] Add unit tests for role-based access control
  - [x] Update E2E tests to verify role restrictions
- [x] Task 3: Create user profile management interface (AC: 4)
  - [x] Build profile page with user information display
  - [x] Add profile edit functionality with form validation
  - [x] Add unit tests for profile management
  - [x] Add E2E test for profile update flow
- [x] Task 4: Ensure session management and logout functionality (AC: 5)
  - [x] Add logout button to navigation/header
  - [x] Verify session timeout and refresh handling
  - [x] Add unit tests for session management
  - [x] Update E2E tests to include logout verification
- [x] Task 5: Implement and validate five user roles (AC: 1)
  - [x] Ensure User model supports roles array with Employee, Manager, HR Admin, Board of Manager, General Director
  - [x] Add role assignment logic in registration/profile management
  - [x] Add unit tests for role validation
  - [x] Add E2E tests for role-specific functionality

## Dev Notes

- Relevant architecture patterns and constraints: Follow pluggable provider pattern from authentication-architecture.md, use NextAuth.js with credentials provider, implement AuthService abstraction layer, enforce RBAC with role-based route protection
- Source tree components to touch: src/app/api/auth/[...nextauth]/route.ts (extend for registration), src/lib/auth/auth-service.ts (add role methods), src/app/register/page.tsx (new), src/app/profile/page.tsx (new), src/components/auth/ (reuse login form), middleware.ts (enhance role checks)
- Testing standards summary: Use Vitest for unit testing with jsdom environment, Playwright for E2E testing with authentication flows, follow testing-strategy.md patterns for auth testing

### Project Structure Notes

- Alignment with unified project structure: Follow src/app/ App Router structure, use @/* aliases for imports, organize auth components in src/components/auth/, place API routes in src/app/api/auth/, follow naming conventions from coding-standards.md
- Detected conflicts or variances: None - builds on existing auth infrastructure from Story 1.1

### Learnings from Previous Story

**From Story 1-1 (Status: done)**

- **New Service Created**: AuthService abstraction layer available at src/lib/auth/auth-service.ts - reuse for role checking methods
- **Architectural Change**: NextAuth.js v4.24.13 with credentials provider and JWT strategy established
- **Schema Changes**: User model includes roles array, passwordHash field with bcrypt hashing
- **Files Created**: auth.config.ts, auth.ts, middleware.ts, login page - extend existing auth setup rather than recreate
- **Testing Setup**: Auth test suite initialized at tests/unit/auth.test.ts - follow established patterns for new auth tests
- **Middleware Protection**: Route protection implemented for /dashboard and /admin routes - enhance for role-specific access

[Source: stories/1-1-project-infrastructure-setup.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-1.2-User-Management-&-Authentication]
- [Source: docs/PRD.md#User-Management-&-Authentication]
- [Source: docs/architecture/authentication-architecture.md#MVP-Implementation-UsernamePassword]
- [Source: docs/architecture/data-architecture.md#Complete-Prisma-Schema]
- [Source: docs/architecture/testing-strategy.md#Authentication-Testing]
- [Source: docs/architecture/coding-standards.md#Authentication-Code-Standards]
- [Source: docs/architecture/unified-project-structure.md#Authentication-Module-Structure]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->
- docs/stories/1-2-user-management-authentication.context.xml

### Agent Model Used

Scrum Master Agent v1

### Debug Log References

- Updated User model roles from String to Json for proper array storage
- Fixed middleware matcher to include /dashboard base route
- Resolved Prisma client regeneration issues after schema changes
- Handled TypeScript casting for Json roles field

### Completion Notes List

- Implemented complete user registration flow with role selection
- Enhanced AuthService with role checking and registration methods
- Added role-based middleware protection for admin routes
- Created profile management interface with edit functionality
- Added header component with logout functionality
- All unit tests passing (18/18)
- Updated database schema and seeded with proper Json roles

### File List

**Application Code:**
- src/app/register/page.tsx - User registration page
- src/app/profile/page.tsx - User profile management page
- src/app/api/auth/register/route.ts - Registration API endpoint
- src/app/api/auth/profile/route.ts - Profile API endpoint
- src/lib/auth/auth-service.ts - Enhanced with role checking and registration methods
- middleware.ts - Enhanced role-based route protection
- src/components/Header.tsx - Header component with logout functionality
- prisma/schema.prisma - Updated User model with Json roles

**Tests:**
- tests/unit/auth-registration.test.ts - Registration logic tests
- tests/unit/auth-roles.test.ts - Role-based access control tests
- tests/e2e/auth-registration.spec.ts - Registration E2E tests

## Change Log

- Initial draft created on 2025-11-08
- Updated AC1 to implement five user roles (Employee, Manager, HR Admin, Board of Manager, General Director) on 2025-11-08
- Implemented all tasks and acceptance criteria on 2025-11-08
- Status changed to review on 2025-11-08