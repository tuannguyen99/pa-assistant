# Performance Review Workflow — pa-assistant

**Author:** BMad  
**Date:** 2025-11-05  
**Version:** 1.0

---

## Overview

This document describes the complete performance review cycle workflow for pa-assistant, from target setting at the beginning of the fiscal year through final feedback delivery. The workflow involves three primary actors: Employees, Managers, and HR Admin, with clear handoffs and state transitions at each stage.

**Fiscal Year Timeline:**
- **April-May**: Target Setting Phase
- **April-March (Year-long)**: Execution & Progress Tracking
- **March-April (Next Year)**: Performance Evaluation Phase
- **May**: Board Decision & Final Feedback

---

## Workflow Phases

### **Phase 1: Target Setting (Beginning of FY - April/May)**

#### **Step 1.1: Employee Creates Individual Targets**
- **Actor:** Employee
- **Action:** Create 3-5 performance targets
- **Fields:**
  - Task description
  - KPI (Key Performance Indicator)
  - Weight percentage (must total 100%)
  - Difficulty level (L1, L2, L3)
- **State Transition:** `draft` → `submitted_to_manager`
- **Duration:** ~2-4 hours per employee

#### **Step 1.2: Manager Reviews Employee Targets**
- **Actor:** Manager
- **Action:** Review each direct report's targets
- **Options:**
  - **Approve** → targets locked for the year
  - **Request Revisions** → back to employee with feedback
  - **Optional:** Schedule 1-on-1 meeting to discuss targets
- **State Transition:** `submitted_to_manager` → `manager_approved` OR `revision_requested`
- **Duration:** ~30-60 minutes per employee

#### **Step 1.3: Manager Submits Department Targets to HR**
- **Actor:** Manager
- **Action:** Consolidate and submit all approved department targets to HR
- **Purpose:** HR visibility for alignment with company goals
- **State Transition:** `manager_approved` → `submitted_to_hr`
- **Deliverable:** Department target summary report
- **Duration:** ~1-2 hours per department

#### **HR Checkpoint:**
- **Actor:** HR Admin
- **Action:** Review department submissions, verify alignment with company goals
- **State Transition:** `submitted_to_hr` → `target_setting_complete`

---

### **Phase 2: Execution Period (April-March)**

- Employees work toward their approved targets
- System stores targets for reference throughout the year
- No formal workflow steps during this phase (out of scope for MVP)

---

### **Phase 3: Performance Evaluation (End of FY - March/April)**

#### **Step 3.1: Employee Submits Self-Evaluation**
- **Actor:** Employee
- **Action:** Complete self-assessment for each target
- **Fields:**
  - Self-assessment rating (1-5 scale)
  - Result explanation (with AI assistance)
  - **Optional:** Modify target fields if circumstances changed
    - Modified targets are flagged and sent to manager for review
- **State Transition:** `target_setting_complete` → `self_eval_submitted`
- **System Calculation:** Total Points = Weight × Difficulty × Rating
- **Duration:** ~2-4 hours per employee

#### **Step 3.2: Manager Reviews Employee Evaluation**
- **Actor:** Manager
- **Action:** Review employee self-evaluation and complete manager assessment
- **View:** Side-by-side comparison of:
  - Original approved targets
  - Employee self-evaluation
  - Any target modifications (flagged)
- **Manager Tasks:**
  - Review each target's self-assessment
  - Write manager evaluation/feedback (with AI synthesis)
  - Acknowledge or question target modifications
  - Calculate final scores
- **Options:**
  - **Optional:** Schedule 1-on-1 review meeting with employee
- **State Transition:** `self_eval_submitted` → `manager_eval_complete`
- **Duration:** ~30-60 minutes per employee

#### **Step 3.3: Manager Submits Department Evaluations to HR**
- **Actor:** Manager
- **Action:** Consolidate and submit all completed evaluations to HR
- **Deliverable:** Department evaluation summary with scores and ranks
- **State Transition:** `manager_eval_complete` → `submitted_to_hr_final`
- **Duration:** ~1-2 hours per department

---

### **Phase 4: HR Consolidation & Board Review (April/May)**

#### **Step 4.1: HR Summarizes Company-Wide Data**
- **Actor:** HR Admin
- **Action:** 
  - Aggregate all department submissions
  - Verify score calculations and rank conversions
  - Generate company-wide performance distribution
  - Prepare board presentation materials
- **State Transition:** `submitted_to_hr_final` → `hr_review_complete`
- **Deliverable:** Company-wide performance report
- **Duration:** ~2-4 days for 200 employees

#### **Step 4.2: Board of Managers Decision Meeting**
- **Actors:** Board of Managers (senior leadership)
- **Action:**
  - Review company-wide performance data
  - Validate rank distributions
  - Make final decisions on promotions, bonuses, salary adjustments
  - Approve exceptional cases or adjustments
- **State Transition:** `hr_review_complete` → `board_approved`
- **Duration:** 1-2 meetings (2-4 hours total)

---

### **Phase 5: Feedback Delivery (May)**

#### **Step 5.1: Manager Delivers Final Feedback to Employee**
- **Actor:** Manager
- **Action:**
  - Schedule 1-on-1 feedback meeting with each employee
  - Share final performance rank
  - Discuss strengths, areas for improvement
  - Communicate promotion/bonus/salary decisions
  - Set expectations for next cycle
- **State Transition:** `board_approved` → `feedback_delivered`
- **Duration:** ~30-60 minutes per employee

#### **Step 5.2: Fiscal Year Closure**
- **Actor:** HR Admin
- **Action:** Close fiscal year in system
- **Effect:**
  - All reviews marked as `archived: true`
  - Data becomes read-only (except HR Admin with audit logging)
  - Historical data preserved for analytics
- **State Transition:** `feedback_delivered` → `archived`

---

## State Definitions

### **Target Setting States**

| State | Description | Editable By | Next Actions |
|-------|-------------|-------------|--------------|
| `draft` | Employee is creating targets | Employee | Submit to Manager |
| `submitted_to_manager` | Waiting for manager review | None (locked) | Manager Approve/Reject |
| `revision_requested` | Manager requested changes | Employee | Revise & Resubmit |
| `manager_approved` | Manager approved targets | None (locked) | Manager submits to HR |
| `submitted_to_hr` | Submitted to HR for visibility | None (locked) | HR acknowledges |
| `target_setting_complete` | Target setting phase done | None (locked) | Wait for evaluation phase |

### **Performance Evaluation States**

| State | Description | Editable By | Next Actions |
|-------|-------------|-------------|--------------|
| `self_eval_draft` | Employee working on self-eval | Employee | Submit to Manager |
| `self_eval_submitted` | Waiting for manager evaluation | None (locked) | Manager completes eval |
| `manager_eval_in_progress` | Manager reviewing and evaluating | Manager | Complete evaluation |
| `manager_eval_complete` | Manager finished evaluation | None (locked) | Manager submits to HR |
| `submitted_to_hr_final` | Submitted to HR for final review | None (locked) | HR consolidation |
| `hr_review_complete` | HR prepared for board review | None (locked) | Board meeting |
| `board_approved` | Board approved final decisions | None (locked) | Manager delivers feedback |
| `feedback_delivered` | Final feedback given to employee | None (locked) | HR closes FY |
| `archived` | Fiscal year closed, read-only | HR Admin only | Historical reference |

---

## Workflow Diagram (Text-Based)

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        PHASE 1: TARGET SETTING (April-May)                     ║
╚════════════════════════════════════════════════════════════════════════════════╝

    [Employee]                    [Manager]                        [HR Admin]
        │                             │                                 │
        │ 1.1 Create Targets          │                                 │
        │ (draft)                     │                                 │
        ├────────────────────────────>│                                 │
        │                             │ 1.2 Review Targets              │
        │                             │ (submitted_to_manager)          │
        │                             │                                 │
        │<────────────────────────────┤ Revision?                       │
        │ (revision_requested)        │   │                             │
        │                             │   │ No, Approve                 │
        │                             │   v                             │
        │                             │ (manager_approved)              │
        │                             │                                 │
        │                             │ 1.3 Submit Dept to HR           │
        │                             ├────────────────────────────────>│
        │                             │                                 │
        │                             │                                 │ Review & Acknowledge
        │                             │                                 │ (submitted_to_hr)
        │                             │                                 │
        │                             │                                 │ ✓ Complete
        │                             │                                 │ (target_setting_complete)
        │                             │                                 │

╔════════════════════════════════════════════════════════════════════════════════╗
║                    PHASE 2: EXECUTION PERIOD (April-March)                     ║
║                          [Employees work on targets]                           ║
╚════════════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════════════╗
║                   PHASE 3: PERFORMANCE EVALUATION (March-April)                ║
╚════════════════════════════════════════════════════════════════════════════════╝

    [Employee]                    [Manager]                        [HR Admin]
        │                             │                                 │
        │ 3.1 Self-Evaluation         │                                 │
        │ (self_eval_draft)           │                                 │
        │ - Rate targets              │                                 │
        │ - Write explanations        │                                 │
        │ - Modify targets (optional) │                                 │
        ├────────────────────────────>│                                 │
        │                             │ 3.2 Manager Evaluation          │
        │                             │ (self_eval_submitted)           │
        │                             │ - Review self-eval              │
        │                             │ - Check modifications           │
        │                             │ - Write feedback                │
        │                             │ - Calculate scores              │
        │                             │ (manager_eval_complete)         │
        │                             │                                 │
        │                             │ 3.3 Submit Dept to HR           │
        │                             ├────────────────────────────────>│
        │                             │                                 │
        │                             │                                 │
        │                             │                                 │

╔════════════════════════════════════════════════════════════════════════════════╗
║                 PHASE 4: HR CONSOLIDATION & BOARD REVIEW (April-May)          ║
╚════════════════════════════════════════════════════════════════════════════════╝

    [Employee]                    [Manager]                        [HR Admin]
        │                             │                                 │
        │                             │                                 │ 4.1 Consolidate Data
        │                             │                                 │ (submitted_to_hr_final)
        │                             │                                 │ - Aggregate all depts
        │                             │                                 │ - Verify calculations
        │                             │                                 │ - Generate reports
        │                             │                                 │
        │                             │            ┌────────────────────┤
        │                             │            │   [Board Meeting]  │
        │                             │            │ 4.2 Review & Decide│
        │                             │            │ (hr_review_complete)│
        │                             │            │                    │
        │                             │            └────────────────────>
        │                             │                                 │ (board_approved)
        │                             │                                 │

╔════════════════════════════════════════════════════════════════════════════════╗
║                        PHASE 5: FEEDBACK DELIVERY (May)                        ║
╚════════════════════════════════════════════════════════════════════════════════╝

    [Employee]                    [Manager]                        [HR Admin]
        │                             │                                 │
        │<────────────────────────────┤ 5.1 1-on-1 Feedback             │
        │ (feedback_delivered)        │ - Share rank                    │
        │                             │ - Discuss results               │
        │                             │ - Communicate decisions         │
        │                             │                                 │
        │                             │                                 │ 5.2 Close Fiscal Year
        │                             │                                 │ (archived)
        │                             │                                 │ - Mark all reviews read-only
        │                             │                                 │ - Preserve historical data
        │                             │                                 │
```

---

## Key Decision Points & Optional Steps

### **Optional Meetings:**
- **Target Setting Review Meeting** (Step 1.2): Manager may schedule 1-on-1 to discuss and refine targets
- **Performance Review Meeting** (Step 3.2): Manager may schedule 1-on-1 to discuss self-evaluation and expectations

### **Target Modification Flag:**
- If employee modifies targets during self-evaluation (Step 3.1), system:
  - Flags the changes visually
  - Notifies manager
  - Requires manager acknowledgment during evaluation (Step 3.2)

### **Revision Loops:**
- **Target Setting:** Employee → Manager → (revision?) → Employee → Manager → Approve
- **No revision loop in evaluation phase** (final deadline pressure)

---

## System Notifications

| Event | Recipient | Notification |
|-------|-----------|--------------|
| Employee submits targets | Manager | "John Doe submitted targets for review" |
| Manager requests revisions | Employee | "Your manager requested changes to your targets" |
| Manager approves targets | Employee | "Your targets have been approved" |
| Evaluation period opens | All Employees | "Self-evaluation period is now open" |
| Employee submits self-eval | Manager | "John Doe submitted self-evaluation" |
| Manager completes evaluation | Employee | "Your manager has completed your evaluation" |
| Board approves final results | All Managers | "Performance review decisions are final - schedule feedback meetings" |
| Feedback delivered | HR Admin | "Manager X delivered feedback to Y employees" |

---

## Database State Flow

**TargetSetting Table:**
```
employeeId | managerId | status | submittedAt | approvedAt | submittedToHRAt
-----------+-----------+--------+-------------+------------+-----------------
emp-001    | mgr-001   | draft  | NULL        | NULL       | NULL
                          ↓
emp-001    | mgr-001   | submitted_to_manager | 2025-04-15 | NULL | NULL
                          ↓
emp-001    | mgr-001   | manager_approved | 2025-04-15 | 2025-04-20 | NULL
                          ↓
emp-001    | mgr-001   | submitted_to_hr | 2025-04-15 | 2025-04-20 | 2025-04-25
                          ↓
emp-001    | mgr-001   | target_setting_complete | 2025-04-15 | 2025-04-20 | 2025-04-25
```

**Review Table:**
```
reviewId | revieweeId | reviewerId | cycleYear | status | archived
---------+------------+------------+-----------+--------+---------
rev-001  | emp-001    | mgr-001    | 2025      | self_eval_draft | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | self_eval_submitted | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | manager_eval_complete | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | submitted_to_hr_final | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | board_approved | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | feedback_delivered | false
                                                   ↓
rev-001  | emp-001    | mgr-001    | 2025      | archived | true
```

---

## Implementation Notes

1. **State validation:** Backend must enforce valid state transitions (can't skip from `draft` to `archived`)
2. **Permission checks:** Each state has specific edit permissions (see State Definitions table)
3. **Audit logging:** All state transitions create AuditEntry records
4. **Email notifications:** Triggered on key state transitions
5. **Dashboard updates:** Manager dashboard shows real-time status for all direct reports

---

## References

- [PRD.md](./PRD.md) - Functional requirements FR004-FR010
- [rbac-spec.md](./rbac-spec.md) - Permission model and audit logging
- [epics.md](./epics.md) - Implementation stories for workflows

---

**Document Control:**
- **Review Cycle:** Updated when workflow requirements change
- **Owner:** Product Manager
- **Stakeholders:** Engineering, HR, Management
