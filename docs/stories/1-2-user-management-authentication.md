# Story 1.2: User Management & Authentication

Status: review

## Story

As an HR Admin,
I want to manage user accounts and roles,
so that employees, managers, and admins can securely access the system.

As an HR Admin, I need to:
- Import users from existing company data sources
- Create new user accounts manually
- Assign appropriate roles to users
- Edit user profiles and role assignments
- View user information (available to all roles)

As other roles (Employee, Manager, Board of Manager, General Director), I need to:
- View my own profile information (read-only)
- Access the system based on my assigned role

## Acceptance Criteria

1. Five user roles implemented (Employee, Manager, HR Admin, Board of Manager, General Director)
2. HR Admin can create new user accounts and assign roles
3. HR Admin can import users from existing company data sources
4. HR Admin can edit user profiles and role assignments
5. Role-based access control enforced with HR Admin having full user management permissions
6. Other roles have view-only access to their own profiles
7. Login functionality working for all users
8. Session management and logout working

## Tasks / Subtasks

- [x] Task 1: Implement HR Admin user creation functionality (AC: 2)
  - [x] Create user management interface for HR Admin with form validation
  - [x] Add API route for user creation with password hashing
  - [x] Add unit tests for user creation logic
  - [x] Add E2E test for HR Admin user creation flow
- [x] Task 2: Implement user import functionality for HR Admin (AC: 3)
  - [x] Create user import interface supporting CSV/Excel formats
  - [x] Add API route for bulk user import with validation
  - [x] Add unit tests for import logic
  - [x] Add E2E test for user import flow
- [x] Task 3: Create HR Admin user profile management interface (AC: 4)
  - [x] Build user management page with user list and edit functionality
  - [x] Add user edit functionality with form validation and role assignment
  - [x] Add unit tests for user management
  - [x] Add E2E test for user edit flow
- [x] Task 4: Implement view-only profile access for other roles (AC: 6)
  - [x] Create read-only profile page for non-HR Admin users
  - [x] Add API route for viewing own profile
  - [x] Add unit tests for profile viewing
  - [x] Add E2E test for profile view flow
- [x] Task 5: Ensure session management and logout functionality (AC: 8)
  - [x] Add logout button to navigation/header
  - [x] Verify session timeout and refresh handling
  - [x] Add unit tests for session management
  - [x] Update E2E tests to include logout verification
- [x] Task 6: Implement and validate five user roles with proper permissions (AC: 1, 5)
  - [x] Ensure User model supports roles array with Employee, Manager, HR Admin, Board of Manager, General Director
  - [x] Add role assignment logic in user creation/management
  - [x] Implement permission checks for HR Admin user management features
  - [x] Add unit tests for role validation and permissions
  - [x] Add E2E tests for role-specific functionality

## Dev Notes

- Relevant architecture patterns and constraints: Follow pluggable provider pattern from authentication-architecture.md, use NextAuth.js with credentials provider, implement AuthService abstraction layer, enforce RBAC with role-based route protection, implement HR Admin permission checks for user management operations
- Source tree components to touch: src/app/api/auth/[...nextauth]/route.ts (extend for login), src/lib/auth/auth-service.ts (add user management methods), src/app/admin/users/page.tsx (new - user management interface), src/app/admin/users/import/page.tsx (new - user import), src/app/profile/page.tsx (read-only for non-HR Admin), src/components/auth/ (reuse login form), middleware.ts (enhance role checks for admin routes)
- Testing standards summary: Use Vitest for unit testing with jsdom environment, Playwright for E2E testing with authentication flows, follow testing-strategy.md patterns for auth testing, add tests for HR Admin permissions and user management operations

### Project Structure Notes

- Alignment with unified project structure: Follow src/app/ App Router structure, use @/* aliases for imports, organize auth components in src/components/auth/, place API routes in src/app/api/auth/, create admin routes in src/app/admin/, follow naming conventions from coding-standards.md
- Detected conflicts or variances: None - builds on existing auth infrastructure from Story 1.1, replaces self-registration with HR Admin managed user accounts

### Learnings from Previous Story

**From Story 1-1 (Status: done)**

- **New Service Created**: AuthService abstraction layer available at src/lib/auth/auth-service.ts - extend for user management methods
- **Architectural Change**: NextAuth.js v4.24.13 with credentials provider and JWT strategy established
- **Schema Changes**: User model includes roles array, passwordHash field with bcrypt hashing
- **Files Created**: auth.config.ts, auth.ts, middleware.ts, login page - extend existing auth setup for HR Admin user management rather than self-registration
- **Testing Setup**: Auth test suite initialized at tests/unit/auth.test.ts - follow established patterns for new user management tests
- **Middleware Protection**: Route protection implemented for /dashboard and /admin routes - enhance for HR Admin specific user management access

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

- Implemented complete HR Admin user management interface with user creation and editing
- Enhanced AuthService with user management methods and permission checks
- Added user import functionality supporting CSV/Excel formats
- Added role-based middleware protection for admin routes and user management features
- Created read-only profile interface for non-HR Admin users
- Added header component with logout functionality
- All unit tests passing (18/18)
- Updated database schema and seeded with proper Json roles

### File List

**Application Code:**
- src/app/admin/users/page.tsx - HR Admin user management interface
- src/app/admin/users/import/page.tsx - User import interface
- src/app/profile/page.tsx - Read-only user profile page
- src/app/api/auth/create-user/route.ts - User creation API endpoint
- src/app/api/auth/import-users/route.ts - User import API endpoint
- src/app/api/auth/update-user/route.ts - User update API endpoint
- src/lib/auth/auth-service.ts - Enhanced with user management and permission methods
- middleware.ts - Enhanced role-based route protection for admin features
- src/components/Header.tsx - Header component with logout functionality
- prisma/schema.prisma - Updated User model with Json roles

**Tests:**
- tests/unit/auth-user-management.test.ts - User management logic tests
- tests/unit/auth-roles.test.ts - Role-based access control tests
- tests/e2e/auth-user-management.spec.ts - User management E2E tests

## Change Log

- Initial draft created on 2025-11-08
- Updated AC1 to implement five user roles (Employee, Manager, HR Admin, Board of Manager, General Director) on 2025-11-08
- Implemented all tasks and acceptance criteria on 2025-11-08
- Status changed to review on 2025-11-08
- Modified story to implement HR Admin managed user accounts instead of self-registration on 2025-11-08
- Updated acceptance criteria to reflect HR Admin user creation, import, and management capabilities
- Changed user profile access to HR Admin edit-only, other roles view-only