# Product Brief: pa-assistant

**Date:** 2025-11-02
**Author:** BMad
**Status:** Draft for PM Review

---

## Executive Summary

**Performance Assessment Assistant (pa-assistant)** is an AI-powered web application that transforms the company's annual performance review process from an Excel-based bottleneck into a streamlined, data-driven system that saves 75% of time while improving review quality and fairness.

**The Problem:**
200 employees across the software development company struggle with annual performance reviews (Japanese fiscal year cycle). Managers spend 20-40 hours per review cycle evaluating 30-40 direct reports, manually synthesizing feedback and writing assessments. Employees spend 1-2 days writing self-reviews, unsure how to articulate achievements professionally or connect work to business goals. The Excel-based process provides no assistance, leading to rushed reviews, generic comments, and fairness concerns that directly impact salary, bonuses, and retention.

**The Solution:**
pa-assistant positions AI as a **professional writing assistant** that helps articulate REAL achievements, not fabricate them. Employees input factual bullet points about their work; AI transforms these into professional narratives. Managers receive AI-synthesized assessments from multiple feedback sources. All AI-enhanced content is clearly marked "AI-assisted," and managers see original inputs alongside AI output, building trust through transparency.

**Key Features:**
- Structured target setting and evaluation (mirroring existing Excel format)
- AI-assisted writing for employee self-reviews
- AI synthesis for manager assessments
- Automated score-to-rank conversion based on employee grade tiers
- Manager dashboard for tracking 30-40 direct reports
- Company/department goals visible throughout to connect work to business
- Built-in guidance and help system
- Flexible AI backend (Ollama local or cloud APIs)
- **Modern Glassmorphism UI with Excel-like table interactions**
- **Interactive wireframes v1.7 with role-based dashboards (wireframes-v1.7.html)**
- **Role-Based Access Control (RBAC) for shared evaluation screens**
- **HR Admin role with read-only access to all fields**
- **AI-assisted Result Explanation with Modal UI approach**
- **Comprehensive UX Design Specification (ux-design-specification.md)**
- **Color theme explorer and design direction mockups (ux-color-themes.html, ux-design-directions.html)**
- **Accessibility and responsive design considerations**
- On-premise deployment for data security

**Business Impact:**
- **Time Savings**: 500+ hours saved company-wide per review cycle ($25K-$37K value)
- **Cost Avoidance**: $50K-150K annually (no external HR software needed)
- **Quality**: 90%+ reviews with specific, actionable feedback (vs. generic comments)
- **Satisfaction**: Target 80%+ manager satisfaction, 75%+ employee satisfaction
- **ROI**: Break-even < 1 year, positive ROI from first full review cycle

**MVP Approach:**
2-month development timeline using BMAD methodology. Pilot with 10 test accounts on local PC running Ollama (CPU or GPU). Validate core hypothesis: AI-assisted reviews save time while maintaining authenticity and trust. After successful pilot, deploy to company server for 200 users.

**Target Users:**
- **Department Head Managers** (30-40 direct reports): Need time savings and quality consistency
- **Software Engineers** (all levels): Need help writing professional self-reviews and connecting work to business
- **HR Administrator**: Need content management, completion monitoring, and company-wide analytics

**Strategic Alignment:**
Supports operational excellence, employee experience, digital transformation, scalability, and cost efficiency. Addresses critical pain point that worsens as company grows. Practical, high-value AI use case that builds organizational AI capability.

---

## Problem Statement

**The annual performance review process has become unsustainable as the company scales, creating bottlenecks, quality issues, and employee dissatisfaction.**

**Current State:**
The company conducts mandatory annual performance reviews following the Japanese fiscal year calendar (April-May for goal setting, March-April for evaluation). The entire process relies on Excel files with no structured support for writing or synthesis.

**Quantified Impact:**

**For Managers:**
- Each manager evaluates 30-40 direct reports annually
- Each review requires 30-60 minutes of concentrated effort
- **Total time investment: 15-40 hours per manager** (equivalent to 2-5 full workdays)
- Must manually synthesize peer feedback, 360-degree reviews, and year-long goal tracking
- Process typically rushed at fiscal year-end due to time pressure

**For Employees:**
- Spend 1-2 full days writing self-reviews
- Lack clarity on what to write and how to frame achievements
- Struggle to recall which targets were achieved throughout the year
- Uncertainty leads to either overly brief or unfocused submissions

**Quality & Fairness Issues:**
- **Consistency problems**: Rushed reviews lead to generic, boilerplate comments
- **Subjectivity concerns**: Employees report fairness and consistency complaints
- **High-stakes consequences**: Reviews directly determine salary adjustments and bonuses, amplifying the impact of poor-quality assessments

**Business Impact:**
- **Scaling crisis**: Company growth is exponentially increasing the burden (40 reports × growing manager count)
- **Employee retention risk**: Dissatisfaction with review quality affects morale and retention
- **Manager burnout**: The review period creates significant stress and productivity loss
- **Opportunity cost**: Managers and employees lose productive work time to administrative review writing

**Why Existing Solutions Fail:**
Excel provides no assistance with:
- Synthesizing multiple feedback sources into coherent narratives
- Helping employees articulate achievements professionally
- Maintaining consistency across reviews
- Reducing time burden while improving quality

**Urgency:**
Recent feedback from both managers and employees indicates this is a critical pain point. As the company continues to grow, the current process will collapse under its own weight. Competitors investing in modern HR tools gain advantages in talent retention and management efficiency.

---

## Proposed Solution

**Performance Assessment Assistant (pa-assistant): An AI-powered web application that transforms performance reviews from a time-consuming writing burden into a structured, data-driven process that maintains authenticity while improving quality and efficiency.**

### Core Value Proposition

**"AI helps articulate REAL achievements, not fabricate them."**

The solution positions AI as a **professional writing assistant** that organizes and articulates factual data, NOT a content generator. This overcomes the "cheating tool" perception by maintaining complete transparency: all AI-enhanced content is clearly marked, and managers can see original employee inputs alongside AI-assisted outputs.

### Solution Architecture

**1. Built-in Guidance & Process Documentation**

**Interactive Help System:**
- Comprehensive guideline pages accessible throughout the application
- **For Employees**: How to define tasks, set KPIs, assign weights, determine difficulty levels
- **For Managers**: How to evaluate fairly, provide constructive feedback, use AI synthesis tools
- **Process Flows**: Visual representation of the entire evaluation cycle
  - April-May: Target Setting → Manager Review → Approval
  - Throughout Year: Quarterly reminders and progress tracking
  - March-April: Self-evaluation → Manager evaluation → Final review
- **Best Practices**: Examples of well-written targets vs. vague targets
- **Definitions Library**: Clear explanations of Task, KPI, Weight, Difficulty, Rating, etc.
- **Contextual help**: Tooltips and inline guidance throughout data entry forms

**2. Year-Round Goal Tracking & Reminders**
- System stores employee goals set during April-May target-setting period
- Automated quarterly email reminders prompt employees to track progress
- Eliminates the end-of-year problem: "I don't remember what I committed to"

**3. Structured Data Input (Mirroring Current Excel Structure)**

The system digitizes the existing Excel format with intelligence:

**Target Setting Phase (April-May):**
- **Individual Target Setting**: 4 columns
  - Task description
  - Targets (KPI)
  - Weight (%) - must total 100% (auto-validated)
  - Difficulty Level (L1-L3, L1 = highest)
- Employees define 3-5 targets per review period
- Manager review and approval workflow

**Evaluation Phase (End of Fiscal Year):**
- **Individual Target Evaluation**: 5 columns
  - Weight (W)
  - Difficulty (D)
  - Rating (R)
  - Total Point = W × D × R (auto-calculated)
  - **Result Explanation** ← **AI-ASSISTED WRITING POINT**

- **Manager Evaluation**: 5 columns
  - Weight (W)
  - Difficulty (D)
  - Rating (R)
  - Total Point = W × D × R (auto-calculated)
  - Manager's Comment ← **AI-ASSISTED SYNTHESIS POINT**

**4. AI-Assisted Writing for Employees**

**The Problem This Solves**: Employees struggle to write "Result Explanation" professionally

**The Solution**:
- Employee enters factual bullet points: projects worked on, tasks completed, measurable outcomes
- AI transforms these facts into professional, impact-focused narrative
- **Transparency**: Output clearly marked "AI-assisted" 
- **Authenticity preserved**: AI only reorganizes and articulates what employee provided
- Employees can edit AI suggestions before submission

**5. AI-Assisted Synthesis for Managers**

**The Problem This Solves**: Managers spend 30-60 minutes per review synthesizing multiple sources

**The Solution**:
- Manager provides per-target feedback in structured fields
- Manager can add overall performance feedback (narrative)
- AI synthesizes employee's self-review + manager's feedback + peer inputs into cohesive assessment
- **Transparency**: All AI-synthesized content marked "AI-assisted"
- **Control**: Manager reviews and edits before finalizing
- Side-by-side view: original inputs vs. AI-enhanced output

**6. Manager Dashboard**

**Real-time Progress Tracking:**
- List of all 30-40 direct reports with completion status
- Visual indicators: Not Started / In Progress / Pending Manager Review / Completed
- Flagged items requiring attention (overdue, incomplete sections)

**Performance Overview & Analytics:**
- Summary view of each team member's key achievements
- Year-over-year performance trends (individual and department-level)
- Aggregate metrics: average scores, difficulty distribution, completion rates
- Historical comparison even as team composition changes

**7. Employee Self-Service Dashboard**

- Personal performance history across years
- Goal tracking throughout the year
- Visualization of performance trends and growth trajectory
- Access to all previous reviews and manager feedback

### Deployment & Infrastructure

**On-Premise Deployment:**
- Self-hosted on company's local server infrastructure
- **Capacity**: Supports 200+ concurrent users during peak evaluation periods
- **Data sovereignty**: All performance data remains within company infrastructure
- **Network**: Accessible via company intranet only

**Flexible AI Backend Configuration:**
- **Option 1 - Local AI (Ollama)**: 
  - AI models run on company servers using Ollama
  - Complete data privacy - no information leaves company network
  - Requires adequate GPU resources for AI inference
  
- **Option 2 - Cloud AI APIs**: 
  - Integration with external AI services (ChatGPT, Gemini, Grok)
  - Faster inference, less infrastructure requirements
  - Data transmission to third-party APIs (requires policy approval)

- **Admin Configuration Panel**: IT can select and configure AI provider without code changes

### Key Differentiators

| Feature | pa-assistant | Generic AI Tools | Traditional HR Software | Excel + Manual AI |
|---------|--------------|------------------|------------------------|-------------------|
| **Structured Input** | ✅ Mirrors existing process | ❌ Freeform only | ✅ Yes but rigid | ❌ No structure |
| **Transparency** | ✅ AI-assisted markers | ❌ No visibility | N/A | ❌ No tracking |
| **Context Retention** | ✅ Year-long goal tracking | ❌ No memory | ⚠️ Limited | ❌ Manual only |
| **Manager Synthesis** | ✅ Multi-source synthesis | ❌ Single input | ❌ No AI | ⚠️ Manual prompting |
| **Analytics Dashboard** | ✅ Multi-year trends | ❌ None | ⚠️ Basic reporting | ❌ Manual charts |
| **On-Premise Option** | ✅ Local deployment | ❌ Cloud only | ⚠️ Enterprise tier | N/A |
| **AI Flexibility** | ✅ Local or Cloud | ❌ Vendor lock-in | ❌ No AI | ⚠️ Manual setup |
| **Built-in Training** | ✅ Comprehensive guides | ❌ None | ⚠️ Separate docs | ❌ None |

### Why This Will Succeed

1. **Minimal Process Change**: Digital version of existing Excel format reduces adoption friction
2. **Trust Through Transparency**: "AI-assisted" markers and visibility into original inputs build manager confidence
3. **Measurable Time Savings**: Reduces manager time from 15-40 hours to ~5-10 hours (60-75% reduction)
4. **Improved Quality**: Structured inputs + AI assistance = consistent, professional reviews
5. **Strategic Value**: Performance analytics enable data-driven talent management decisions
6. **Employee Empowerment**: Quarterly reminders + built-in guidance + dashboard help employees own their growth
7. **Data Control**: On-premise deployment addresses security and compliance concerns
8. **Guided Adoption**: Comprehensive help system reduces training burden and improves data quality

---

## Target Users
### Role behaviour & multi-role support

Many people in the organisation will hold more than one role for the purposes of performance reviews. The system explicitly supports multi-role assignment so that a single user account may act as a reviewee, a reviewer, or both depending on the relationship and the review cycle. Key rules and behaviours:

- Users may have multiple roles simultaneously (Employee, Manager, HR Admin). A single account can therefore be a reviewee (being reviewed) and a reviewer (reviewing others) during the same cycle.
- Manager-as-reviewer: A user assigned the Manager role has reviewer privileges for their direct reports (view/edit their evaluations, run AI synthesis for manager assessment, approve final assessments).
- Manager-as-reviewee: When a manager is being reviewed (they are a reviewee for their higher-level manager), the higher-level manager is assigned as the reviewer and the manager-under-review sees the standard reviewee interface (self-evaluation, view of manager comments after finalization per company policy).
- HR Admin role: HR Admins have system-wide oversight (content management, configuration, completion monitoring). HR Admins may also be reviewees or reviewers for their own line reports. When acting as a reviewer for direct reports, HR Admins use the same manager review workflow; when acting as a reviewee they receive reviews like any employee. Where appropriate, HR Admin reviewer actions are clearly flagged in audit logs and UI to avoid conflicts of interest.
- Clear role indicator: The UI displays the active role (Reviewee / Reviewer / Admin) and the context (e.g., "Reviewing: Alice Tan — as Manager", "Your review by: Dept Head") so users understand which hat they are wearing while interacting with the app.
- Permission scoping and visibility: Permissions are scoped to the relationship graph (manager→direct reports). A user only gets edit/reviewer access for people they are explicitly assigned to review. HR Admins can be granted elevated visibility but all edits and finalizations are audited.
- Audit & transparency: All actions taken while acting in a reviewer capacity (including AI-assisted synthesis acceptance or edits) are recorded with an explicit actor role (e.g., "HR Admin (Reviewer): edited manager comment") and timestamps. AI-assisted content remains marked and original inputs remain visible to support trust and traceability.

Examples:

- A senior engineer (Employee role) writes a self-review (reviewee). Their direct Manager (Manager role) reviews and finalises the review (reviewer). The senior engineer can also be a Manager for junior engineers at the same time and will have reviewer access for those direct reports.
- An HR Admin updates company-level guidance and also completes their own self-evaluation. Their HR activities are separated in the UI from their personal review activities and all HR-admin edits to others' records are auditable.

These clarifications are intended to make role-switching behaviour explicit for developers, HR, and product stakeholders so RBAC, UI indicators and audit logging can be implemented consistently.

### Primary User Segment: Department Head Managers

**Profile:**
- **Role**: Department heads managing engineering teams
- **Background**: Former software developers who transitioned into management
- **Span of Control**: 30-40 direct reports (significantly above typical span)
- **Technical Depth**: Understand technical work but may be removed from day-to-day coding
- **Time Constraints**: Balance strategic leadership with extensive people management

**Current Challenges:**
- **Volume Overwhelm**: 30-60 minutes × 40 reports = 20-40 hours during peak review season
- **Memory Gap**: Recalling specific achievements from 12 months ago across 40 people
- **Synthesis Burden**: Manually consolidating peer feedback, 360 reviews, and self-assessments
- **Consistency Struggle**: Maintaining fair, consistent tone and depth across all reviews when rushed
- **Generic Writing**: Time pressure leads to boilerplate comments that don't help employees grow
- **Conflicting Feedback**: Reconciling different perspectives into coherent assessment

**Goals:**
- Complete reviews efficiently without sacrificing quality
- Provide meaningful, constructive feedback that supports employee development
- Maintain fairness and consistency across all team members
- Reduce end-of-year crunch stress
- Use performance data to make informed talent decisions

**Success Criteria - What Makes Them Love This Tool:**
1. **Time Savings**: Reduces review time from 20-40 hours to 5-10 hours (75% reduction)
2. **Quality Confidence**: AI synthesis helps them write thoughtful, specific comments even when rushed
3. **Memory Support**: System surfaces employee's goals and quarterly progress automatically
4. **Consistency Assurance**: Dashboard shows review completion status and helps maintain even coverage
5. **Data-Driven Insights**: Analytics reveal team patterns, skill gaps, and growth trends
6. **Reduced Guilt**: Produces high-quality reviews despite time constraints - no more feeling like they shortchanged their team

### Secondary User Segment: Software Engineers (All Levels)

**Profile:**
- **Role**: Software developers and engineers across all seniority levels
- **Experience Range**: Junior engineers through senior/principal engineers
- **Common Struggle**: Both junior and senior engineers find self-review writing challenging
- **Language**: English proficiency sufficient for technical work but struggle with professional review writing
- **Work Context**: Focus on technical execution, may lack visibility into business impact

**Current Challenges:**
- **Blank Page Syndrome**: Don't know where to start with self-review
- **Achievement Articulation**: Struggle to describe technical work in professional language
- **Impact Quantification**: Difficulty connecting daily work to measurable business outcomes
- **Business Alignment**: Can't see how their work connects to company/department goals
- **Memory Fatigue**: Can't recall all accomplishments from the past year
- **Professional Tone**: Technical background doesn't prepare them for HR writing style
- **Target Setting Uncertainty**: Unclear what makes a "good" target or appropriate difficulty/weight

**Specific Pain Points by Aspect:**
- **Starting from scratch**: Most difficult - no template or structure
- **Quantifying impact**: Hard to measure "improved code quality" or "mentored junior dev"
- **Professional tone**: "I fixed bugs" vs. "Enhanced system stability through defect resolution"
- **Business connection**: **CRITICAL GAP** - Don't see how their work ties to company objectives

**Goals:**
- Write self-reviews that accurately represent their contributions
- Present achievements in professional, compelling language
- Understand and set meaningful performance targets
- Connect technical work to business value
- Complete self-review efficiently (reduce from 1-2 days to few hours)

**Success Criteria:**
1. **Context Awareness**: See company and department goals within the app to connect their work
2. **Guided Input**: Clear structure and examples for what to enter
3. **AI Translation**: Transform technical bullet points into professional narratives
4. **Time Savings**: Complete self-review in 2-4 hours instead of 1-2 days
5. **Confidence**: Feel their review accurately represents their work and impact
6. **Learning**: Improve over time through examples and AI suggestions

### Tertiary User Segment: HR Administrator

**Profile:**
- **Role**: Human Resources administrator responsible for performance management system
- **Dual Function**: 
  1. System administrator and content manager
  2. People manager for their own direct reports
- **Scope**: Company-wide visibility and editorial control

**Responsibilities:**
- **Content Management**:
  - Author and maintain guideline pages and help documentation
  - Define and update company-level business targets/OKRs
  - Document department-level targets and objectives
  - Manage evaluation templates and processes
  
- **System Oversight**:
  - Monitor completion rates across all departments
  - View anonymized analytics and company-wide performance trends
  - Ensure process compliance and data quality
  - Configure system settings and AI backend
  
- **Direct Management**:
  - Evaluate their own direct reports (HR team members)
  - Same workflow as department head managers for their team

**Current Challenges:**
- **Visibility Gap**: No way to track completion rates or identify bottlenecks in current Excel process
- **Content Maintenance**: Guidelines and targets scattered across documents, hard to keep updated
- **Inconsistency**: Different departments interpret evaluation criteria differently
- **Compliance Monitoring**: Can't ensure all reviews are completed on time
- **Data Access**: Cannot generate company-wide insights or trends from Excel files

**Goals:**
- Ensure consistent, fair evaluation process across company
- Maintain up-to-date guidance and business context for all users
- Monitor and drive completion rates during review cycles
- Generate insights to inform HR strategy and talent management
- Reduce admin overhead while improving data quality

**Success Criteria:**
1. **Centralized Content Management**: Single source of truth for guidelines and company goals
2. **Real-time Monitoring**: Dashboard showing completion status across all departments
3. **Easy Updates**: Can update guidance and targets without technical support
4. **Company-wide Analytics**: Performance trends, distribution patterns, comparative metrics
5. **Dual Role Support**: Seamlessly switch between admin view and manager view for own team

---

**Key Insight:**
All three user segments share a common need: **connecting individual work to broader company goals**. The solution must surface company and department objectives throughout the application to help employees understand business context and managers evaluate strategic alignment.

---

## Goals and Success Metrics

### Business Objectives

1. **Efficiency Gains:**
   - Reduce manager time per review cycle from 20-40 hours to 5-10 hours (75% reduction)
   - Reduce employee self-review time from 1-2 days to 2-4 hours (75% reduction)
   - Target: Save 500+ total work hours company-wide per review cycle

2. **Quality Improvement:**
   - Increase manager satisfaction with review quality to 80%+
   - Reduce employee complaints about fairness/consistency by 60%
   - Target: 90%+ of reviews include specific, actionable feedback (vs. generic comments)

3. **Adoption & Completion:**
   - Achieve 95%+ on-time completion rate
   - 100% of managers complete reviews within 2-week window
   - 90%+ employee self-review completion before deadline

4. **Employee Retention & Satisfaction:**
   - Improve employee satisfaction with review process to 75%+
   - Reduce voluntary turnover attributed to review dissatisfaction

5. **Cost Avoidance:**
   - Avoid need for external HR software (save $50-100K+ annually)
   - Reduce manager overtime during review season

### User Success Metrics

**For Managers:**
- **Time to Complete**: Average time per review < 15 minutes (down from 30-60 min)
- **Dashboard Usage**: 90%+ managers check dashboard at least weekly during review season
- **AI Acceptance**: 80%+ managers use AI synthesis feature
- **Consistency Score**: Standard deviation of review lengths/detail level < 20%

**For Employees:**
- **Self-Review Completion Time**: < 4 hours (down from 8-16 hours)
- **AI Usage Rate**: 70%+ employees use AI writing assistance
- **Business Context Awareness**: 80%+ employees view company/department goals during target setting
- **Confidence Score**: 75%+ employees feel their review accurately represents their work

**For HR Admin:**
- **Content Update Frequency**: Guidelines updated at least quarterly
- **Monitoring Efficiency**: Can generate completion report in < 5 minutes
- **System Configuration**: AI backend can be switched without developer support

### Key Performance Indicators (KPIs)

**Top 5 KPIs for Success Dashboard:**

1. **Time Savings Per Review Cycle**: Total hours saved company-wide (target: 500+ hours)
2. **On-Time Completion Rate**: % of reviews completed by deadline (target: 95%)
3. **User Satisfaction Score**: Average rating across all user types (target: 4.2/5.0)
4. **AI Adoption Rate**: % of users actively using AI features (target: 75%)
5. **Review Quality Score**: % of reviews meeting quality criteria - specific feedback, connected to goals (target: 85%)

---

## MVP Scope

### Core Features (Must Have)

**1. User Authentication & Role Management**
- Login for 3 roles: Employee, Manager, HR Admin
- Basic permissions and data access control
- Employee grade/level tracking (APE1/C4, APE2/D1, etc.)

Additional role management details:
- Multi-role accounts: The system allows assigning multiple roles to a single user account (for example: an HR Admin who is also a Manager and an Employee). Role assignments are configurable by HR Admins.
- Contextual active-role UI: The front-end shows the currently active role and provides quick switching where allowed (for example, to switch from performing HR admin tasks to reviewing a direct report). Role switching respects permission boundaries and is recorded in audit logs.
- Reviewer assignment rules: By default the assigned Manager in employee master data is the reviewer. If a manager is the reviewee, the manager's assigned higher-level manager becomes the reviewer. HR may override reviewer assignments in exceptional cases (delegation, temporary reorg) with changes recorded in the audit log.
- Permission boundaries: Reviewer permissions are limited to those records explicitly assigned; HR Admins can be granted broader visibility but all updates and approvals performed by HR are auditable and flagged in the UI to avoid conflicts of interest.
- Explicit consent and visibility: When HR or a Manager edits AI-assisted or derived content on behalf of someone else, the system indicates that the content was modified by a user acting in reviewer/admin capacity and preserves the original inputs for traceability.


**1a. Employee Data Management**
- **HR Admin Functions**:
  - Add employee records manually (one-by-one data entry)
  - Import employee data from CSV/Excel file (bulk import)
  - Edit existing employee information
  - View complete employee directory
- **Employee Data Fields**:
  - Employee ID (unique identifier)
  - Full Name
  - Start Working Date
  - Current Grade/Level (APE1/C4, APE2/D1, etc.)
  - Department
  - Manager Name (linked to manager account)
  - Email
  - Job Title/Position
  - Employment Status (Active/Inactive)
- **Auto-fill Functionality**:
  - When employee enters Employee ID on evaluation form
  - System automatically populates: Name, Grade, Department, Manager Name
  - Prevents data entry errors and saves time
  - Read-only display of auto-filled information

**2. Target Setting Workflow (April-May)**
- Employee creates 3-5 targets with structured fields:
  - Task description
  - Targets (KPI)
  - Weight (%) - auto-validated to total 100%
  - Difficulty Level (L1-L3, L1 = highest)
- Manager review and approval workflow
- Store approved targets for the year

**3. Performance Score Calculation & Rank System**
- **Automatic Score Calculation**: For each target: Total Points = Weight × Difficulty × Rating
- **Overall Score**: Sum of all target total points
- **Grade-Based Rank Conversion**: 
  - HR Admin configures score ranges per employee grade tier
  - System automatically converts final score to rank (A+, A, B+, B, C, etc.)
  - **Example Configuration**:
    - **Grade APE2/D1 & Above**: 3.75 < Score ≤ 4.5 → Rank A+
    - **Grade APE1/C4 & Below**: Score > 3.75 → Rank A+
- **Admin Configuration Panel**: HR can define multiple grade tiers and corresponding score-to-rank mappings
- **Real-time Display**: Show calculated score and rank to employee and manager during evaluation

**4. Self-Evaluation Workflow (March-April)**
- Employee fills evaluation table for each target:
  - Weight (W) - copied from target setting
  - Difficulty (D) - copied from target setting
  - Rating (R) - employee self-assessment
  - Total Point = W × D × R (auto-calculated)
  - **Result Explanation** ← **AI-ASSISTED WRITING**
- **AI Writing Assistant**:
  - Employee enters factual bullet points (projects, tasks, outcomes)
  - AI generates professional narrative
  - Clear "AI-assisted" marker displayed
  - Employee can edit AI output before submission
- **Auto-calculated Overall Score and Rank** displayed

**5. Manager Evaluation Workflow**
- Manager views employee's self-review side-by-side with their evaluation form
- Manager fills evaluation table per target:
  - Weight (W) - copied from target setting
  - Difficulty (D) - copied from target setting
  - Rating (R) - manager's assessment
  - Total Point = W × D × R (auto-calculated)
  - Manager's Comment per target
- **AI-Assisted Synthesis**:
  - Manager can add overall performance feedback
  - AI synthesizes employee's self-review + manager's per-target comments + overall feedback
  - Clear "AI-assisted" marker
  - Side-by-side view: original inputs vs AI-enhanced output
  - Manager reviews, edits, and approves final assessment
- **Final Score and Rank** auto-calculated and displayed based on manager's ratings

**6. Manager Dashboard - Basic**
- List of all direct reports with status indicators:
  - Not Started / In Progress / Pending Manager Review / Completed
- Completion percentage overview
- Click-through to individual reviews
- Flagged items: overdue or incomplete submissions

**7. Company/Department Goals Display**
- HR Admin can create and edit:
  - Company-level business objectives/OKRs
  - Department-level targets
- Goals visible to employees during target setting
- Goals visible to managers during evaluation
- Helps connect individual work to business context

**8. Basic Help & Guidelines System**
- Static help pages explaining:
  - Process flow (target setting → evaluation cycle)
  - Definitions: Task, KPI, Weight, Difficulty, Rating, Score, Rank
  - Examples of well-written vs poorly-written targets
  - How to use AI assistance features
- Accessible from all pages

**9. AI Backend Configuration (Admin)**
- Admin panel to configure AI provider:
  - **Option 1**: Ollama (local server) with model selection
  - **Option 2**: Cloud API (ChatGPT, Gemini, Grok) with API key input
  - **Option 3**: Web-based AI tool with auto-open and prompt generation
    - Configure AI website URL (e.g., https://chat.openai.com, https://gemini.google.com)
    - System auto-opens configured website in new tab
    - Auto-generates contextual prompt based on user's input
    - One-click copy-to-clipboard for user convenience
    - User pastes AI response back into application
- Test connection functionality
- Switch providers without code deployment

**HR Admin Configuration (expanded)**
- Review Fiscal Year (FY): HR Admin can create new FY entries (e.g., 2025) that set active windows for target-setting and evaluations. HR can close a FY to finalise the cycle; closed FYs lock further edits to target/evaluation fields except via HR Admin override (all overrides are auditable).
- Departments: HR Admin can create/edit company departments and assign a Head of Department. Departments are visible across target-setting screens and used to scope manager dashboards and reports.
- Employee Types & Grade Systems: HR Admin can define employee types (for example: "Engineer", "Back-Office") and configure the valid grade lists for each type. Example grade lists:
  - Engineer: E0, E1, E2, SE1, SE2, SE3, APE1, APE2, APE3
  - Back-Office: C0, C1, C2, C3, C4, APE1
- Score-to-Rank Conversion Tables: HR Admin can configure conversion mappings from final numeric score ranges to rank labels (A+, A, B+, B, C, etc.) per employee type/grade tier. These mappings are applied when finalising evaluations and visible to users during the review.


**10. Modern UI/UX Design**
- **Glassmorphism Design Language**:
  - Frosted glass effects with transparency and backdrop blur
  - Soft shadows, subtle gradients, and depth layering
  - Clean, minimalist aesthetic with professional polish
  - Light and airy feel to reduce HR process anxiety
- **Excel-Familiar Interface**:
  - Table-based data entry (similar to Excel spreadsheets)
  - Keyboard shortcuts for navigation (Tab, Enter, Arrow keys)
  - Inline editing with familiar input patterns
  - Column headers and row organization matching Excel structure
- **Interactive Wireframes**:
  - Excel-like table resizing (columns and rows)
  - Role-Based Access Control (RBAC) demonstration
  - HR Admin read-only access to all fields
  - Modal UI for Result Explanation with AI assistance
- **User-Friendly Features**:
  - Intuitive navigation with clear visual hierarchy
  - Contextual help tooltips throughout
  - Responsive feedback for all actions (loading states, success confirmations)
  - Progressive disclosure (show complexity only when needed)
  - Consistent design patterns across all workflows

**11. Basic Security & Data Privacy**
- Role-based access control (Employee, Manager, HR Admin)
- Data encryption at rest and in transit
- Audit logging for sensitive operations
- On-premise deployment on company infrastructure

### Out of Scope for MVP (Phase 2 Features)

**Post-MVP / Lower Priority:**
- ❌ Automated quarterly reminder emails (manual reminders for MVP)
- ❌ Employee dashboard with multi-year performance trends
- ❌ Manager analytics dashboard (team trends, aggregates, historical comparisons)
- ❌ Historical data visualization and year-over-year charts
- ❌ Peer feedback / 360-degree review integration
- ❌ Export to PDF/Excel functionality (employee data import/add is included in MVP)
- ❌ Advanced HR reporting and company-wide analytics
- ❌ Mobile responsive design (desktop-first for MVP)
- ❌ Multi-language support (English-only for MVP)
- ❌ Dark mode / theme customization (glassmorphism light theme for MVP)
- ❌ Advanced AI features:
  - Auto-suggested KPIs based on role
  - AI-recommended difficulty levels
  - Sentiment analysis of feedback
- ❌ Integration with existing HR/payroll systems (direct sync)
- ❌ Advanced employee data management (departmental transfers, role changes history)
- ❌ Advanced notification system
- ❌ Collaborative commenting/feedback threads
- ❌ Custom workflow configuration per department

### MVP Success Criteria

The MVP is successful if:
1. ✅ Employees complete self-reviews 50%+ faster using AI assistance
2. ✅ Managers complete reviews 50%+ faster using AI synthesis
3. ✅ 70%+ of users trust and actively use AI-assisted features
4. ✅ 80%+ completion rate in first live review cycle
5. ✅ Score-to-rank conversion works accurately for all grade tiers
6. ✅ Zero data security incidents
7. ✅ System handles 200 concurrent users without performance degradation
8. ✅ 75%+ user satisfaction rating (employees, managers, HR)
9. ✅ **Glassmorphism UI reduces HR process anxiety (validated in wireframes)**
10. ✅ **Excel-like table interactions feel familiar and efficient**
11. ✅ **Role-Based Access Control (RBAC) works correctly for all three roles**
12. ✅ **Modal UI approach for Result Explanation preferred by users**
13. ✅ **Accessibility standards met (WCAG 2.1 AA compliance)**
14. ✅ **Responsive design supports desktop-first usage patterns**

---

## Strategic Alignment and Financial Impact

### Financial Impact

**Development Investment:**
- **Development Approach**: Internal development with BMAD methodology
- **Timeline**: 2 months to MVP
- **Team**: Internal resources (developer time with BMAD guidance)
- **Infrastructure**: 
  - Local PC deployment for MVP testing
  - Ollama running on CPU or GPU (no cloud AI costs for MVP)
  - No additional server costs for pilot phase
- **Estimated Development Cost**: Internal labor cost only (developer time)

**Pilot Scope:**
- **Test Environment**: Local PC installation
- **User Base**: 10 test accounts (mix of employees, managers, HR admin)
- **AI Backend**: Ollama (local, no recurring costs)
- **Duration**: One review cycle for validation

**Cost Savings (Projected Annual - Full Deployment):**
- **Labor Cost Avoidance**: 500+ hours saved per review cycle
  - Assuming average hourly cost of $50-75: **$25K-$37.5K saved per review cycle**
  - Annual savings: **$25K-$37.5K** (one major cycle per year)
  
- **External Software Avoided**: 
  - Traditional HR performance management software: $50-150K annually for 200 users
  - **Savings: $50K-$150K per year**

- **Reduced Overtime During Review Season**: 
  - Managers currently work extra hours during March-April crunch
  - Estimated savings: **$10K-20K per year**

**Total Annual Value (Full Deployment): $85K-$207.5K in cost savings/avoidance**

**Break-even Analysis:**
- MVP development cost: Internal time only (2 months)
- Infrastructure cost: Minimal (local deployment, existing hardware)
- If full deployment after successful pilot: Break-even < 1 year
- ROI positive from first full review cycle

**Intangible Benefits:**
- **Employee Retention**: Improved satisfaction reduces turnover costs (each replacement costs 50-150% of salary)
- **Productivity Gain**: Better reviews → better performance management → improved output
- **Data-Driven Talent Decisions**: Analytics enable strategic workforce planning
- **Competitive Advantage**: Modern HR technology improves employer brand

### Company Objectives Alignment

**Strategic Initiatives Supported:**

1. ✅ **Operational Excellence**
   - Streamline core HR process that touches all 200 employees
   - Eliminate Excel-based workflow bottlenecks
   - Reduce administrative burden by 75%

2. ✅ **Employee Experience & Retention**
   - Address top employee complaint about review process
   - Improve satisfaction with performance management
   - Demonstrate company investment in fair, quality reviews

3. ✅ **Digital Transformation**
   - Modernize from Excel to intelligent web application
   - Leverage AI for business process improvement
   - Build internal capability for AI-assisted workflows

4. ✅ **Data-Driven Decision Making**
   - Enable performance analytics and trend analysis
   - Support strategic talent management with data
   - Identify skill gaps and training needs systematically

5. ✅ **Scalability & Growth Support**
   - Solution scales with company growth without proportional HR overhead
   - Current process breaks at scale; this enables continued expansion
   - Manager span of 30-40 becomes sustainable

6. ✅ **Cost Efficiency**
   - Avoid $50K-150K annual cost of external HR software
   - Reduce time waste equivalent to $85K+ annually
   - Internal development maximizes ROI

7. ✅ **Innovation & AI Adoption**
   - Practical, high-value AI use case
   - Builds organizational confidence in AI tools
   - Positions company as innovative employer

**Alignment with Japanese Business Calendar:**
- Supports fiscal year cycle (April-May target setting, March-April evaluation)
- Respects existing organizational rhythms and processes
- Minimal disruption to established HR practices

---

## Post-MVP Vision

### Phase 2 Features (Months 3-6)

**After successful pilot with 10 accounts, scale to full deployment with:**

1. **Automated Reminders & Notifications**
   - Quarterly email reminders for goal tracking
   - Deadline notifications for target setting and evaluations
   - Manager alerts for pending reviews

2. **Enhanced Dashboards & Analytics**
   - Employee dashboard with multi-year performance trends
   - Manager analytics: team trends, skill gap analysis, historical comparisons
   - HR executive dashboard with company-wide insights

3. **Full Production Infrastructure**
   - Deploy to company server infrastructure
   - Support 200+ concurrent users
   - Production-grade backup and disaster recovery

4. **Data Import & Export**
   - Import historical performance data from Excel
   - Export to PDF for archival and employee records
   - Bulk user management and data migration tools

5. **Mobile Responsive Design**
   - Access from tablets and mobile devices
   - Responsive UI for on-the-go review completion

### Long-term Vision (Year 2+)

**Expand Capabilities:**
- **360-Degree Review Integration**: Peer feedback collection and synthesis
- **Continuous Feedback**: Mid-year check-ins and ongoing feedback capture
- **Advanced AI Features**:
  - Auto-suggested KPIs based on role and department
  - AI-recommended difficulty levels based on historical data
  - Sentiment analysis to flag potential issues
- **Skills & Competency Tracking**: Map performance to skill development
- **Succession Planning**: Identify high-potential employees and readiness
- **Integration**: Connect with payroll/HR systems for seamless data flow

**Scale Across Organization:**
- Support multiple review cycles (annual, semi-annual, quarterly)
- Custom workflows per department or business unit
- Multi-language support if company expands internationally

### Expansion Opportunities

**Internal Expansion:**
- Adapt for contractor/vendor evaluations
- Use for probation period reviews
- Extend to project-based performance tracking

**Potential External Opportunity:**
- If successful internally, consider productizing for other software development companies
- Japanese market opportunity: many companies face same Excel-based review challenges
- Software-as-a-Service offering for similar-sized organizations

---

## Technical Considerations

### Platform Requirements

**MVP (Pilot Phase):**
- **Deployment**: Local PC installation (Windows/Mac/Linux)
- **Access**: Localhost web application
- **Capacity**: 10 concurrent test users
- **Database**: SQLite or lightweight database
- **AI Backend**: Ollama running locally (CPU or GPU)

**Production (Post-Pilot):**
- **Deployment**: Company on-premise server
- **Access**: Company intranet (internal network only)
- **Capacity**: 200+ concurrent users during peak periods
- **Browser Support**: Modern browsers (Chrome, Firefox, Edge, Safari)
- **Performance**: Page load < 2 seconds, AI response < 10 seconds

**UI/UX Requirements:**
- **Design Style**: Modern Glassmorphism aesthetic
  - Frosted glass effect with transparency and blur
  - Soft shadows and subtle gradients
  - Light/airy feel while maintaining professionalism
  - Clean, minimalist interface
- **Usability Principles**:
  - Friendly and approachable (reduce HR process intimidation)
  - Easy to use with minimal learning curve
  - **Familiar to Excel users**: Table-based layouts, similar data entry patterns
  - Intuitive navigation and clear visual hierarchy
  - Responsive feedback for all user actions
- **Accessibility**: 
  - **WCAG 2.1 AA compliance** for web accessibility standards
  - Keyboard navigation support
  - Clear contrast despite glassmorphism effects
  - Screen reader compatible
  - Tooltips and contextual help
- **Responsive Design**:
  - **Desktop-first approach** optimized for web browsers on desktop computers
  - Fixed layout with maximum width of 1200px
  - Horizontal scroll for wide tables when needed
  - No mobile/tablet optimization required for MVP

### Technology Preferences

**Recommended Technology Stack:**

**Frontend:**
- React or Vue.js for interactive UI
- **Glassmorphism UI Framework**: 
  - TailwindCSS with custom glassmorphism utilities
  - Or Material-UI with custom glassmorphism theme
  - CSS backdrop-filter for frosted glass effects
- Chart library for dashboards (Chart.js or Recharts)
- **Excel-like Components**: AG-Grid or Handsontable for familiar table editing experience

**Backend:**
- Node.js (Express) or Python (FastAPI/Django)
- RESTful API architecture
- WebSocket for real-time updates (optional for MVP)

**Database:**
- PostgreSQL for production (relational data, good for structured performance data)
- SQLite for MVP pilot (easy setup, no server required)

**AI Integration:**
- **Ollama Integration**: Direct API calls to local Ollama instance
- **Web-based AI Tool Integration**:
  - **Auto-open configured AI website** (ChatGPT, Gemini, Grok) in new browser tab
  - **Auto-generate prompt** based on employee's factual input
  - **Copy-to-clipboard** functionality for convenience
  - User workflow: Click "Get AI Help" → New tab opens with pre-filled prompt → Copy & paste result back
  - Configurable URL templates per AI provider
- Abstraction layer to support multiple AI backends
- Fallback mechanism between Ollama and web-based tools

**Authentication & Security:**
- JWT-based authentication
- bcrypt for password hashing
- Role-based access control (RBAC)
- HTTPS/TLS for all communications
- Data encryption at rest

**Deployment:**
- Docker containerization for easy deployment
- Docker Compose for multi-service orchestration
- Nginx for reverse proxy and load balancing

### Architecture Considerations

**Key Architectural Decisions:**

1. **Monolithic vs. Microservices**: 
   - **Recommendation**: Start with modular monolith for MVP
   - Easier to develop and deploy
   - Can split into microservices later if needed

2. **AI Processing**:
   - Async job queue for AI requests (don't block UI)
   - Cache common AI responses to reduce load
   - Rate limiting to prevent AI overload

3. **Data Model**:
   - User → Employee/Manager/HR Admin profiles
   - Employee Master Data → ID, name, grade, department, manager, start date, etc.
   - Review Cycle → Annual period definition
   - Target → Individual performance target
   - Evaluation → Employee and Manager assessments
   - Rank Configuration → Grade-based scoring rules
   - Manager-Employee Relationship → Hierarchical mapping

4. **Scalability Approach**:
   - Design for horizontal scaling (add servers, not bigger servers)
   - Stateless API (enables load balancing)
   - Database connection pooling
   - Caching strategy for frequently accessed data

5. **Security First**:
   - Principle of least privilege
   - Audit logging for all sensitive operations
   - Regular security updates and dependency scanning
   - Data retention and privacy policies

**Infrastructure Requirements (Production):**
- **Application Server**: 4+ CPU cores, 8GB+ RAM
- **Database Server**: 4+ CPU cores, 16GB+ RAM, SSD storage
- **AI Server (if Ollama)**: 8+ CPU cores, 16GB+ RAM, GPU recommended (RTX 3060 or better)
- **Storage**: 100GB+ for application and database
- **Network**: Gigabit internal network, isolated from external internet

---

## Constraints and Assumptions

### Constraints

**Technical Constraints:**
- Must deploy on-premise (company policy for sensitive HR data)
- Must support 200 users without external infrastructure investment
- AI must work with both CPU and GPU (hardware flexibility)
- English-only for MVP (no localization budget initially)
- Desktop-first (mobile optimization deferred to Phase 2)

**Resource Constraints:**
- 2-month development timeline for MVP
- Internal development team (limited external resources)
- Pilot testing with only 10 accounts before full rollout
- Budget limited to internal labor (no major capital expenditure)

**Process Constraints:**
- Must mirror existing Excel structure (minimize change management)
- Must align with Japanese fiscal year calendar (April-May, March-April)
- Performance reviews are annual (one major cycle per year)
- Manager span of 30-40 is organizational reality (can't reduce)

**Organizational Constraints:**
- Must gain manager buy-in ("productivity tool" not "cheating tool")
- Must comply with company data privacy policies
- Requires HR approval and sponsorship
- Change management for 200 users across multiple departments

### Key Assumptions

**User Behavior Assumptions:**
- Employees will trust AI assistance if transparency is maintained
- Managers will adopt tool if it demonstrably saves time
- Users prefer digital system over Excel (hypothesis to validate)
- Quarterly reminders will improve year-end recall (Phase 2)

**Technical Assumptions:**
- Ollama provides sufficient AI quality for professional writing assistance
- Local AI performance acceptable on CPU (GPU accelerates but not required)
- Company network infrastructure supports 200 concurrent users
- Existing company hardware adequate for hosting

**Business Assumptions:**
- Current Excel process pain is severe enough to drive adoption
- Time savings will justify development investment
- HR will support rollout and enforce usage
- Success in one review cycle leads to continued use

**Data Assumptions:**
- Historical Excel data can be migrated if needed (Phase 2)
- Performance review data retention: 5+ years
- No integration with external systems required for MVP
- Grade/rank configuration stable (infrequent changes)

**Validation Approach:**
- 10-user pilot validates core assumptions before full deployment
- Survey feedback after pilot informs Phase 2 priorities
- Measure actual time savings to confirm ROI projections
- Monitor adoption rates and satisfaction continuously

---

## Risks and Open Questions

### Key Risks

**Risk 1: AI Quality Concerns**
- **Risk**: AI-generated text not professional enough or contains errors
- **Impact**: HIGH - Undermines core value proposition
- **Mitigation**: 
  - Pilot test with 10 users to validate AI quality
  - Allow full editing of AI output
  - Test multiple Ollama models to find best fit
  - Maintain side-by-side view so managers can verify

**Risk 2: Low Adoption / Resistance**
- **Risk**: Users prefer familiar Excel, resist new system
- **Impact**: HIGH - Tool fails if not adopted
- **Mitigation**:
  - Mirror Excel structure closely
  - Strong HR sponsorship and mandate
  - Emphasize time savings in change management
  - Pilot with enthusiastic early adopters first
  - Gather and act on feedback quickly

**Risk 3: "Cheating Tool" Perception**
- **Risk**: Managers view AI assistance as undermining authenticity
- **Impact**: MEDIUM - Could block rollout or reduce usage
- **Mitigation**:
  - Position as "writing assistant" not "content generator"
  - Require factual input from employees
  - Show original inputs alongside AI output
  - Clear "AI-assisted" markers
  - Manager controls final output

**Risk 4: Performance/Scalability Issues**
- **Risk**: System slow with 200 concurrent users or AI requests
- **Impact**: MEDIUM - Frustration reduces adoption
- **Mitigation**:
  - Load testing before full deployment
  - Async AI processing (don't block UI)
  - Caching and optimization
  - GPU acceleration for Ollama if needed
  - Pilot validates performance with 10 users first

**Risk 5: Timeline Pressure**
- **Risk**: 2 months insufficient for MVP development
- **Impact**: MEDIUM - Delayed launch, rushed quality
- **Mitigation**:
  - Use BMAD methodology for structured development
  - Clear MVP scope (ruthlessly cut non-essential features)
  - Incremental development and testing
  - Buffer time for pilot feedback and fixes

**Risk 6: Data Security Incident**
- **Risk**: Performance data leaked or unauthorized access
- **Impact**: CRITICAL - Legal, reputational, employee trust damage
- **Mitigation**:
  - Security-first architecture
  - On-premise deployment (data never leaves company)
  - Role-based access control
  - Audit logging
  - Security review before production deployment

### Open Questions

**Product Questions:**
1. What happens to historical Excel data? Import to system or start fresh?
2. Should employees see their manager's evaluation before it's finalized?
3. Can employees revise targets mid-year if priorities change?
4. What permissions does HR Admin have vs. department managers?
5. How are rank distributions enforced? (e.g., forced curve, quotas per rank?)
6. What's the data format for employee data import? (CSV, Excel, specific column order?)
7. What happens when employee changes managers mid-year? Update retroactively or keep historical?
8. Should system validate manager-employee relationships? (Prevent circular reporting, orphaned employees)

**Technical Questions:**
1. Which Ollama model provides best balance of quality and performance?
2. What's the actual concurrent user load during peak evaluation period?
3. Does company have GPU hardware available or CPU-only?
4. What's the company's server infrastructure? (OS, virtualization, etc.)
5. Any existing authentication system to integrate with? (LDAP, SSO, etc.)

**Business/Process Questions:**
1. Who are the pilot test users? (Which departments, experience levels?)
2. What's the change management plan for full rollout?
3. Who provides user training and support?
4. What's the rollback plan if pilot fails?
5. How is success measured beyond the defined KPIs?
6. What's the governance model? (Who owns the system long-term?)

### Areas Needing Further Research

**Before Development Starts:**
- [ ] Benchmark Ollama model performance (quality and speed) with sample review text
- [ ] Survey potential pilot users about Excel pain points and desired features
- [ ] Review company security and data privacy policies for compliance requirements
- [ ] Inventory available hardware for hosting (CPU, RAM, GPU, storage)

**During Pilot:**
- [ ] Measure actual time savings vs. projected
- [ ] Collect qualitative feedback on AI quality and usefulness
- [ ] Identify unexpected usability issues or feature gaps
- [ ] Validate performance under realistic load

**Before Full Deployment:**
- [ ] Finalize training materials and change management plan
- [ ] Establish support model and escalation process
- [ ] Define success metrics dashboard for ongoing monitoring
- [ ] Plan Phase 2 roadmap based on pilot learnings

---

## Appendices

### A. Research Summary

**Primary Research Conducted:**
- Internal feedback from managers indicating performance review process is major pain point
- Employee complaints about fairness, consistency, and difficulty writing self-reviews
- Observation of current Excel-based workflow and time requirements

**Key Findings:**
1. **Manager Burden**: 30-60 minutes per review × 30-40 reports = 15-40 hours per manager per cycle
2. **Employee Struggle**: 1-2 days spent on self-reviews, with high uncertainty about what to write
3. **Scaling Crisis**: Company growth exponentially increasing burden on managers
4. **Quality Issues**: Rushed reviews lead to generic, boilerplate comments
5. **Fairness Concerns**: Employees report consistency and subjectivity concerns
6. **Business Impact**: Reviews determine salary/bonus, so quality issues have financial consequences

**Gap Analysis:**
- **No structured guidance**: Excel provides no help with what to write or how to write it
- **No synthesis support**: Managers manually consolidate multiple feedback sources
- **No business context**: Employees can't see company/department goals to connect their work
- **No analytics**: Cannot track completion or analyze trends
- **No assistance**: Writing burden falls entirely on users

### B. Stakeholder Input

**Key Stakeholders Consulted:**
- **Department Head Managers**: Expressed frustration with time burden and difficulty maintaining consistency
- **Software Engineers**: Highlighted struggle with professional writing and business connection
- **HR Leadership**: Identified need for better process visibility and completion tracking
- **Company Leadership**: Emphasized importance of fair, high-quality reviews for retention and performance

**Priority Requirements from Stakeholders:**
1. **Managers**: "Save time without sacrificing quality" + "Help me remember what people did all year"
2. **Employees**: "Help me write professionally" + "Show me what good looks like"
3. **HR**: "Track completion in real-time" + "Ensure consistency across departments"
4. **Leadership**: "Maintain data security" + "Avoid expensive external software"

**Concerns Raised:**
- **Trust in AI**: Managers concerned about "cheating tool" perception
- **Data Security**: Sensitive performance data must stay within company
- **Adoption Risk**: Will users actually use this vs. revert to Excel?
- **AI Quality**: Will AI-generated text be good enough for high-stakes reviews?

**Mitigation Strategies Incorporated:**
- Transparency through "AI-assisted" markers and side-by-side views
- On-premise deployment for data security
- Mirror Excel structure to minimize change
- Pilot with 10 users to validate quality before full rollout

### C. References

**Performance Management Best Practices:**
- SMART goals framework for target setting
- Competency-based evaluation models
- 360-degree feedback integration patterns (future consideration)

**AI Writing Assistant Precedents:**
- Grammarly: Professional writing enhancement
- Jasper/Copy.ai: Content generation with human editing
- GitHub Copilot: AI pair programming (code completion, not fabrication)

**HR Technology Landscape:**
- Workday, BambooHR, Lattice: Traditional performance management platforms (high cost, cloud-only)
- 15Five, Culture Amp: Continuous feedback tools (less relevant for annual cycle)
- Competitive gap: No AI-assisted writing for performance reviews in mainstream tools

**Technical References:**
- Ollama documentation for local AI deployment
- Performance management data models and schemas
- Role-based access control patterns for sensitive HR data

---

_This Product Brief serves as the foundational input for Product Requirements Document (PRD) creation._

_Next Steps: Handoff to Product Manager for PRD development using the BMM methodology PRD workflow._

---

**Document Version History:**
- v1.0 (2025-11-02): Initial draft created through interactive workflow with business analyst
- v1.1 (2025-11-04): Updated with UX/UI expert feedback - added comprehensive UX Design Specification, interactive wireframes with Excel-like resizing, detailed RBAC implementation, HR Admin read-only access, Modal UI for Result Explanation, color theme explorer, design direction mockups, accessibility considerations, and responsive design details
- Validated with stakeholder input and requirements
- Ready for PM review and PRD development

**Key Decisions Made:**
- ✅ MVP scope: 10 core must-have features
- ✅ Timeline: 2 months to MVP
- ✅ Pilot: 10 test accounts on local PC
- ✅ AI: Ollama (local) for MVP
- ✅ Deployment: On-premise for security
- ✅ Positioning: "Productivity tool" not "cheating tool"
- ✅ Differentiation: Transparency through "AI-assisted" markers and original input visibility
- ✅ **UX Design**: Glassmorphism aesthetic with Excel-like table interactions
- ✅ **Wireframes**: Interactive with Excel-like resizing and RBAC demonstration
- ✅ **UI Approach**: Modal UI for Result Explanation (chosen over Collapsible/Two-Panel)
- ✅ **Accessibility**: WCAG 2.1 AA compliance
- ✅ **Responsive Design**: Desktop-first approach for MVP

**Approval Required From:**
- [ ] HR Leadership
- [ ] Department Head Managers (representative sample)
- [ ] IT/Infrastructure (technical feasibility review)
- [ ] Executive Sponsor (budget and strategic alignment)


