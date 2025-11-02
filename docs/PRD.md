# pa-assistant Product Requirements Document (PRD)

**Author:** BMad
**Date:** 2025-11-02
**Project Level:** 2
**Target Scale:** MVP - 200 users (pilot: 10 users)

---

## Goals and Background Context

### Goals

- **Reduce review cycle time by 75%** - Cut manager review time from 20-40 hours to 5-10 hours and employee self-review time from 1-2 days to 2-4 hours
- **Achieve 95% on-time completion rate** - Enable timely completion of all performance reviews within designated review periods
- **Maintain review authenticity with 70%+ AI feature adoption** - Position AI as a transparent writing assistant that preserves authenticity while improving efficiency

### Background Context

The company's annual performance review process has reached a critical breaking point. With 200 employees following the Japanese fiscal year calendar (April-May for target setting, March-April for evaluation), the current Excel-based system creates unsustainable burdens: managers spend 20-40 hours per cycle evaluating 30-40 direct reports, while employees struggle for 1-2 days to articulate their achievements professionally.

The core problem is lack of structured support. Excel provides no guidance for writing professional assessments, no synthesis of multiple feedback sources, and no connection to company goals. This leads to rushed, generic reviews that directly impact salary and bonuses—creating fairness concerns and retention risks. As the company scales, this manual process becomes exponentially more burdensome, threatening to collapse under its own weight while competitors gain advantages through modern HR technology.

---

## Requirements

### Functional Requirements

**User Management & Authentication**
- **FR001**: System shall support three user roles (Employee, Manager, HR Admin) with role-based access control
- **FR002**: HR Admin shall be able to add, edit, and import employee records (CSV/Excel bulk import) including Employee ID, name, grade/level, department, manager, email, job title, and employment status
- **FR003**: System shall auto-populate employee information (name, grade, department, manager) when Employee ID is entered on forms

**Target Setting Workflow**
- **FR004**: Employees shall create 3-5 performance targets with task description, KPI, weight percentage (auto-validated to total 100%), and difficulty level (L1-L3), with ability to modify targets during self-evaluation (modifications flagged and sent to manager for review)
- **FR005**: Managers shall review and approve employee targets with ability to request revisions
- **FR006**: System shall store approved targets for the entire review cycle year

**Performance Evaluation**
- **FR007**: System shall automatically calculate target scores using formula: Total Points = Weight × Difficulty × Rating
- **FR008**: System shall automatically convert final scores to performance ranks based on configurable grade-tier mappings (e.g., APE2/D1 vs APE1/C4)
- **FR009**: Employees shall complete self-evaluations with AI-assisted writing for result explanations, clearly marked as "AI-assisted" with full edit capability
- **FR010**: Managers shall complete evaluations viewing employee self-review side-by-side, with AI synthesis of multiple inputs (employee review + manager comments) clearly marked as "AI-assisted"

**Dashboard & Monitoring**
- **FR011**: Managers shall access dashboard showing all direct reports with completion status indicators (Not Started, In Progress, Pending Review, Completed)
- **FR012**: HR Admin shall create and edit company/department goals visible to all users during target setting and evaluation phases

**AI Integration & Help System**
- **FR013**: HR Admin shall configure AI backend (Ollama local, Cloud API, or web-based tool with auto-open/prompt generation) without code deployment
- **FR014**: System shall provide accessible help pages with process flows, definitions, examples, and guidance throughout all workflows

### Non-Functional Requirements

- **NFR001**: System shall support 200 concurrent users with page load times < 2 seconds and AI response times < 10 seconds
- **NFR002**: System shall implement role-based access control, data encryption at rest and in transit, and audit logging for all sensitive operations
- **NFR003**: System shall provide Excel-familiar UI with table-based data entry, keyboard navigation, and glassmorphism design aesthetics

---

## User Journeys

### User Journey: Employee Self-Review Completion

**Actor:** Software Engineer (Employee)

**Scenario:** March review period - employee completes self-evaluation for 3-5 annual targets set in April

**Steps:**
1. Employee logs into pa-assistant and sees dashboard with "Self-Review Due" notification
2. Employee clicks on current review period and sees their 3-5 approved targets from April
3. For each target, employee:
   - Views target description, KPI, weight (%), and difficulty level (pre-filled from April)
   - **Option to modify target fields** (task, KPI, weight, difficulty) if circumstances changed during the year - system flags modifications and notifies manager for review
   - Ensures total weight still equals 100% (system validates)
   - Enters self-assessment rating (1-5 scale)
   - System auto-calculates Total Points = Weight × Difficulty × Rating
   - Employee enters factual bullet points for "Result Explanation" (e.g., "Completed Project X, reduced bug count by 30%")
   - Employee clicks "Get AI Help" - AI transforms bullets into professional narrative
   - AI output clearly marked "AI-assisted" with side-by-side comparison
   - Employee reviews, edits if needed, and accepts
4. System displays overall calculated score and rank based on employee's grade tier
5. Employee reviews company/department goals displayed in sidebar for context alignment
6. Employee submits completed self-review (manager receives notification including any target modifications for review)
7. Manager receives notification that review is ready for their evaluation

**Success Outcome:** Self-review completed in 2-4 hours (vs. 1-2 days previously), employee feels confident their work is professionally articulated, with flexibility to adjust targets if priorities shifted during the year

---

## UX Design Principles

1. **Familiarity Through Excel-Like Patterns** - Use table-based layouts, keyboard navigation (Tab, Enter, Arrow keys), and familiar data entry patterns to reduce learning curve for users accustomed to Excel workflows

2. **Transparency Builds Trust** - All AI-assisted content clearly marked with "AI-assisted" badges, side-by-side comparison of original inputs vs. AI output, and full user control over final content

3. **Progressive Disclosure** - Show complexity only when needed; hide advanced features until requested to maintain clean, approachable interface

4. **Contextual Guidance** - Company and department goals visible in sidebar throughout target setting and evaluation; inline help tooltips and accessible help pages reduce support burden

---

## User Interface Design Goals

- **Glassmorphism Aesthetic** - Frosted glass effects with transparency, backdrop blur, soft shadows, and subtle gradients create modern, professional feel that reduces HR process anxiety
- **Responsive Feedback** - Loading states, success confirmations, and validation messages provide immediate user feedback for all actions
- **Accessible Design** - Clear contrast despite glassmorphism effects, keyboard navigation support, screen reader compatibility
- **Consistent Patterns** - Unified design language across all workflows ensures predictable, intuitive navigation

---

## Epic List

**Epic 1: Foundation & Core Workflows (Est. 9-13 stories)**
- Establish project infrastructure (repo, database, authentication)
- Implement user management and employee data import
- Build target setting workflow with validation
- Create self-evaluation workflow with AI assistance
- Develop manager evaluation workflow with AI synthesis
- Implement automatic score calculation and rank conversion
- Create HR admin configuration panel (AI backend, rank mappings)
- Deploy basic help system

**Epic 2: Dashboards & Production Readiness (Est. 4-6 stories)**
- Build manager dashboard with completion tracking
- Add company/department goals management
- Implement security, audit logging, and data encryption
- Production deployment preparation and testing

**Total Estimated Stories: 13-19 stories**

> **Note:** Detailed epic breakdown with full story specifications is available in [epics.md](./epics.md)

---

## Out of Scope

- Automated quarterly reminder emails (manual reminders for MVP)
- Employee dashboard with multi-year performance trends
- Manager analytics dashboard (team trends, aggregates, historical comparisons)
- Historical data visualization and year-over-year charts
- Peer feedback / 360-degree review integration
- Export to PDF/Excel functionality (employee data import/add is included in MVP)
- Advanced HR reporting and company-wide analytics
- Mobile responsive design (desktop-first for MVP)
- Multi-language support (English-only for MVP)
- Dark mode / theme customization (glassmorphism light theme for MVP)
- Advanced AI features (auto-suggested KPIs, sentiment analysis)
- Integration with existing HR/payroll systems (direct sync)
- Advanced employee data management (departmental transfers, role changes history)
- Advanced notification system
- Collaborative commenting/feedback threads
- Custom workflow configuration per department

