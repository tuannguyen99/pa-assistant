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
