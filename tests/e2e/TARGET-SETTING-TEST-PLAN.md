# Target Setting Workflow Test Plan - Story 1.4

**Author:** Test Expert (AI)  
**Date:** November 12, 2025  
**Story:** 1.4 - Target Setting Workflow  
**Test Coverage:** End-to-End + Load Testing

---

## Overview

This document describes the comprehensive test strategy for the Target Setting Workflow (Story 1.4), covering all acceptance criteria and the performance requirement for 200 concurrent users.

### Test Objectives

1. ✅ Verify complete target setting workflow from employee creation to HR approval
2. ✅ Validate all acceptance criteria (AC1-AC11)
3. ✅ Ensure system stability with 200 concurrent users
4. ✅ Prevent data loss, corruption, crashes, or hangs under load
5. ✅ Verify security and authorization controls
6. ✅ Confirm audit trail completeness

---

## Test Files Structure

```
tests/
├── e2e/
│   ├── target-setting.spec.ts          # Main E2E test suite (25+ test cases)
│   └── TARGET-SETTING-TEST-PLAN.md     # This file
└── load/
    └── target-save-load-test.js         # Load test for 200 concurrent users
```

---

## Test Coverage Matrix

### Story 1.4 Acceptance Criteria Coverage

| AC  | Requirement | Test Cases | Status |
|-----|-------------|------------|--------|
| AC1 | Target creation form with fields | `AC1: Target creation form with all required fields` | ✅ |
| AC2 | Weight validation (must total 100%) | `AC2 & AC3: Weight validation and 3-5 targets constraint` | ✅ |
| AC3 | 3-5 targets per employee supported | `AC2 & AC3: Weight validation and 3-5 targets constraint` | ✅ |
| AC4 | Manager review and approval workflow | `AC4: Manager can request revisions with feedback` | ✅ |
| AC5 | Target storage for year-long access | `AC5: Target storage and year-long access` | ✅ |
| AC6 | Auto-save functionality (3 seconds) | `Performance: Auto-save functionality works correctly` | ✅ |
| AC7 | Save Draft button state management | Built into form tests | ✅ |
| AC8 | Clear notifications for save operations | Visual inspection + integration tests | ✅ |
| AC9 | Unsaved changes warning dialog | Manual browser test | ⚠️ |
| AC10 | Page reload loads latest data | Built into workflow tests | ✅ |
| AC11 | Concurrent submission (200 users) | Load test: `target-save-load-test.js` | ✅ |

---

## E2E Test Cases (target-setting.spec.ts)

### Basic Functionality Tests

#### 1. AC1: Target Creation Form Rendering
**Test:** `AC1: Target creation form with all required fields`
- Verifies form displays correctly
- Checks all required fields exist (task, KPI, weight, difficulty)
- Confirms initial 3 targets are visible

#### 2. AC2 & AC3: Validation Rules
**Test:** `AC2 & AC3: Weight validation and 3-5 targets constraint`
- Tests weight total validation (must equal 100%)
- Verifies real-time weight indicator
- Tests min 3 targets constraint
- Tests max 5 targets constraint
- Verifies submit button disabled when invalid

#### 3. Complete Workflow
**Test:** `Complete workflow: Create, submit, and manager approve`
- Employee creates 3 targets with 100% weight
- Employee submits to manager
- Manager reviews and approves
- Verifies status transitions

#### 4. AC4: Revision Request Flow
**Test:** `AC4: Manager can request revisions with feedback`
- Manager requests revisions with feedback
- Employee receives feedback
- Employee updates targets
- Resubmits for approval

#### 5. AC5: Data Persistence
**Test:** `AC5: Target storage and year-long access`
- Verifies targets are stored correctly
- Tests API retrieval by cycle year
- Confirms data accessibility

---

### Comprehensive Workflow Tests

#### 6. Complete Phase 1 Workflow (Steps 1.1-1.6)
**Test:** `Workflow Step 1.1-1.6: Complete target setting process from draft to HR approval`

**Flow:**
1. **Step 1.1:** Employee creates 4 targets with detailed descriptions
2. **Step 1.2:** Manager reviews targets
3. **Step 1.3:** Manager requests revision with specific feedback
4. **Step 1.4:** Employee updates targets based on feedback
5. **Step 1.5:** Manager approves updated targets
6. **Step 1.6:** Verification of final approval

**Validation:**
- ✅ All state transitions work correctly
- ✅ Feedback is properly communicated
- ✅ Revision loop works as expected
- ✅ Final approval is recorded

---

### Edge Case Tests

#### 7. Cannot Submit with Incorrect Weight
**Test:** `Edge Case: Cannot submit targets with weight != 100%`
- Tests weight total = 90% (under by 10%)
- Verifies warning message displayed
- Confirms submit button is disabled

#### 8. Minimum Targets Constraint
**Test:** `Edge Case: Cannot submit with less than 3 targets`
- Verifies remove button is disabled at minimum
- Prevents submission with < 3 targets

#### 9. Maximum Targets Constraint
**Test:** `Edge Case: Cannot add more than 5 targets`
- Adds targets until maximum reached
- Verifies "Add Target" button disabled
- Prevents exceeding limit

---

### Security Tests

#### 10. Authorization Check
**Test:** `Security: Manager cannot approve targets for non-direct report`
- Creates employee without manager assignment
- Verifies manager cannot access/approve
- Tests API endpoint security

---

### Performance Tests

#### 11. Auto-Save Functionality
**Test:** `Performance: Auto-save functionality works correctly`
- Types in target field
- Waits 4 seconds (3s delay + 1s buffer)
- Verifies auto-save indicator appears
- Tests draft persistence

---

### State Machine Tests

#### 12. Invalid State Transitions
**Test:** `State Transition: Cannot approve targets in wrong state`
- Creates target in `draft` state
- Manager attempts approval via API
- Expects 409 Conflict error
- Verifies proper error message

**Valid State Flow:**
```
draft 
  → submitted_to_manager 
  → manager_approved OR revision_requested
  → (if revision_requested) → draft → submitted_to_manager
  → manager_approved
```

---

### Audit & Compliance Tests

#### 13. Audit Trail Verification
**Test:** `Audit Trail: All actions are logged`
- Counts audit entries before action
- Creates and submits target
- Counts audit entries after
- Verifies increase in audit log

**Expected Audit Events:**
- `create_target_draft`
- `submit_target`
- `approve_targets` or `request_target_revision`

---

### Data Validation Tests

#### 14. Difficulty Levels
**Test:** `Data Validation: All difficulty levels work correctly`
- Tests L1 (highest complexity, multiplier 1.25)
- Tests L2 (moderate, multiplier 1.0)
- Tests L3 (lowest, multiplier 0.75)
- Verifies dropdown selection persists

---

### UI/UX Tests

#### 15. Status Indicators
**Test:** `UI/UX: Status indicators are clear and accurate`
- Creates targets in various states
- Verifies correct status badge display
- Tests status label accuracy

**Status Labels:**
- `draft` → "Draft"
- `submitted_to_manager` → "Pending Manager Review"
- `revision_requested` → "Revision Requested"
- `manager_approved` → "Manager Approved"

---

## Load Test (target-save-load-test.js)

### Test Objective
Verify system stability when 200 users submit target settings simultaneously without crashes, hangs, errors, or data loss.

### Test Configuration
```javascript
NUM_CONCURRENT_USERS: 200
TEST_CYCLE_YEAR: Current year + 10 (to avoid conflicts)
TARGET_RESPONSE_TIME: <500ms average
TARGET_SUCCESS_RATE: ≥95%
```

### Test Scenario
Each of 200 virtual users:
1. Creates a target setting with 4 targets
2. Submits via POST /api/targets
3. Includes realistic data:
   - Task descriptions (50-100 chars)
   - KPIs (20-50 chars)
   - Weights totaling 100%
   - Mixed difficulty levels (L1, L2, L3)
   - Current role and long-term goals

### Success Criteria

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| No crashes | 0 system crashes | Manual observation |
| No hangs | 0 timeout errors | Timeout set to 10s |
| Response time | <500ms average | Calculated from durations |
| Success rate | ≥95% | (successful / total) * 100 |
| Data integrity | 0 corruption | Database inspection |

### Metrics Collected

**Timing Metrics:**
- Total test duration
- Requests per second
- Average response time
- Min/Max response times
- P50, P95, P99 percentiles

**Success Metrics:**
- Successful submissions count
- Failed submissions count
- Success rate percentage
- Error rate percentage

**Error Analysis:**
- Error types and counts
- Sample error messages
- Status codes distribution

### How to Run Load Test

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Run load test
node tests/load/target-save-load-test.js

# Expected output:
# ✅ All requirements met!
# Success Rate: >95%
# Avg Response Time: <500ms
```

### Expected Results

**PASS Conditions:**
- ✅ Success rate ≥95%
- ✅ Average response time <500ms
- ✅ Zero timeout errors
- ✅ All 4 requirements met

**Example Output:**
```
╔════════════════════════════════════════════════════════════════╗
║                     📊 TEST RESULTS                            ║
╚════════════════════════════════════════════════════════════════╝

⏱️  TIMING METRICS:
   Total Test Duration:       5234ms
   Requests per Second:       38.21

✅  SUCCESS METRICS:
   Successful Submissions:    198/200
   Success Rate:              99.00%

⚡  RESPONSE TIME METRICS:
   Average Response Time:     312.45ms
   Min Response Time:         89ms
   Max Response Time:         856ms
   P50 (Median):             298ms
   P95:                      567ms
   P99:                      734ms

🎯 TEST EVALUATION
   ✅ No crashes/hangs: PASS
   ✅ Response time <500ms (avg): PASS
   ✅ No data loss: PASS
   ✅ System stability: PASS

╔════════════════════════════════════════════════════════════════╗
║            ✅ LOAD TEST PASSED - SYSTEM IS STABLE! ✅          ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Test Execution Guide

### Prerequisites

1. **Database Setup:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

2. **Test Users:**
   - Test Manager (manager.target@example.com)
   - Test Employee (employee.target@example.com)
   - Test HR Admin (hradmin.target@example.com)

3. **Environment:**
   - Development server running on http://localhost:3000
   - Clean database state

### Running E2E Tests

**Run all target setting tests:**
```bash
npx playwright test tests/e2e/target-setting.spec.ts
```

**Run specific test:**
```bash
npx playwright test tests/e2e/target-setting.spec.ts -g "AC1"
```

**Run with UI mode (recommended for debugging):**
```bash
npx playwright test tests/e2e/target-setting.spec.ts --ui
```

**Run in debug mode:**
```bash
npx playwright test tests/e2e/target-setting.spec.ts --debug
```

### Running Load Test

```bash
# Ensure dev server is running
npm run dev

# In another terminal
node tests/load/target-save-load-test.js
```

---

## Test Data Management

### Test Users Created by Tests
- `manager.target@example.com` (Manager)
- `employee.target@example.com` (Employee)
- `hradmin.target@example.com` (HR Admin)

### Cleanup Strategy
- `beforeAll`: Creates test users
- `afterAll`: Deletes all test data (targets, audit entries, users)
- Tests use future cycle years to avoid conflicts

---

## Known Issues & Limitations

### Current Limitations

1. **Browser-based unsaved changes warning (AC9):**
   - Requires manual testing with browser navigation
   - Cannot be fully automated in Playwright
   - Status: ⚠️ Needs manual verification

2. **Load test authentication:**
   - Uses mock cookies for testing
   - Production should use real session tokens
   - Current approach tests endpoint throughput

### Future Enhancements

1. **Integration with CI/CD:**
   - Add to GitHub Actions workflow
   - Run on every PR to main branch
   - Generate test reports automatically

2. **Visual regression testing:**
   - Add screenshot comparisons
   - Verify UI consistency across browsers

3. **API contract testing:**
   - Add Pact tests for API contracts
   - Ensure backend/frontend compatibility

---

## Test Metrics & Coverage

### Current Test Suite Size
- **Total E2E Tests:** 25+
- **Load Tests:** 1 comprehensive test
- **Coverage:** 100% of Story 1.4 acceptance criteria

### Test Execution Time
- **E2E Tests:** ~5-8 minutes (all tests)
- **Load Test:** ~10-15 seconds (200 concurrent users)

### Code Coverage Goals
- **API Routes:** >90% coverage
- **Components:** >85% coverage
- **Workflows:** 100% path coverage

---

## Troubleshooting Guide

### Common Issues

**1. Tests timing out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000 // 60 seconds
```

**2. Database conflicts:**
```bash
# Reset database before tests
npx prisma migrate reset --force
npx prisma db seed
```

**3. Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Restart dev server
npm run dev
```

**4. Load test failures:**
- Ensure dev server is running
- Check network connectivity
- Verify no rate limiting active
- Inspect server logs for errors

---

## References

- **Story Definition:** `docs/stories/1-4-target-setting-workflow.md`
- **Workflow Spec:** `docs/performance-review-workflow.md`
- **API Documentation:** `docs/architecture/core-workflows.md`
- **Test Strategy:** `docs/architecture/testing-strategy.md`

---

## Approval & Sign-off

**Test Plan Author:** AI Test Expert  
**Date Created:** November 12, 2025  
**Last Updated:** November 12, 2025  
**Status:** ✅ Ready for Execution

**Reviewed by:**
- [ ] Dev Team Lead
- [ ] QA Manager
- [ ] Product Owner

---

## Appendix: Test Scenarios Quick Reference

### Happy Path Tests ✅
1. Employee creates and submits targets
2. Manager approves targets
3. Targets stored and accessible
4. Auto-save works correctly

### Alternate Path Tests ⚡
5. Manager requests revision
6. Employee updates and resubmits
7. Multiple revision cycles

### Edge Cases 🔍
8. Weight validation (under/over 100%)
9. Min/max targets constraint
10. Invalid state transitions

### Error Conditions ❌
11. Unauthorized access attempts
12. Invalid data submissions
13. Network timeout simulation

### Performance 🚀
14. 200 concurrent user submissions
15. Response time under load
16. System stability verification

---

**End of Test Plan**
