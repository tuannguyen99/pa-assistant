# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-11-08 | 1-1 | 1 | Bug | High | TBD | Open | Fix middleware.ts import and export issues (AC #3) [file: pa-app/middleware.ts:1-10] |
| 2025-11-08 | 1-1 | 1 | Bug | High | TBD | Open | Move auth.config.ts to root or update middleware import path [file: pa-app/middleware.ts] |
| 2025-11-08 | 1-1 | 1 | Enhancement | Medium | TBD | Open | Add unit tests for authentication flow [file: pa-app/tests/unit/auth.test.ts] |
| 2025-11-08 | 1-1 | 1 | Enhancement | Medium | TBD | Open | Add E2E tests for login/logout functionality [file: pa-app/tests/e2e/auth.spec.ts] |
| 2025-11-08 | 1-1 | 1 | Enhancement | Low | TBD | Open | Standardize NextAuth version usage (recommend v5 throughout) |
| 2025-11-09 | 1-2 | 1 | Enhancement | Low | TBD | Open | Enhance CSV import with proper parsing library (papaparse) to handle quoted commas [file: src/app/api/auth/import-users/route.ts] |
| 2025-11-09 | 1-2 | 1 | Enhancement | Low | TBD | Open | Add more specific error codes and detailed error messages for better debugging [file: src/app/api/auth/create-user/route.ts, src/app/api/auth/update-user/route.ts] |
| 2025-11-09 | 1-2 | 1 | Enhancement | Medium | TBD | Open | Remove unused PUT endpoint in profile route or document its purpose [file: src/app/api/auth/profile/route.ts:31-56] |
| 2025-11-09 | 1-2 | 1 | Enhancement | Low | TBD | Open | Create shared constants file for role definitions to reduce duplication [file: src/lib/constants/roles.ts] |
