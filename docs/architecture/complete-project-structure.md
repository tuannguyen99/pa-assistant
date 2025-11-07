# Complete Project Structure

```
pa-system/
 src/
    app/                          # Next.js App Router
       (auth)/                   # Auth route group
          login/
             page.tsx
          layout.tsx
      
       (dashboard)/              # Protected route group
          dashboard/
             page.tsx          # Main dashboard
             manager/
                page.tsx      # Manager dashboard (Story 2.1)
             hr-consolidation/
                page.tsx      # HR consolidation (Story 2.6)
             employee/
                 page.tsx      # Employee dashboard (Story 3.1)
         
          analytics/            # Analytics & Insights (Epic 3)
             employee/
                page.tsx      # Personal performance trends (Story 3.1)
             manager/
                page.tsx      # Team analytics (Story 3.3)
             hr/
                page.tsx      # Company-wide analytics (Story 3.4)
             historical/
                 page.tsx      # Historical data visualization (Story 3.2)
         
          reviews/              # Review workflows
             [id]/
                page.tsx      # Evaluation screen (Story 1.5, 1.6)
                edit/
                    page.tsx
             new/
                 page.tsx
         
          targets/              # Target setting
             [id]/
                page.tsx      # Target form (Story 1.4)
             new/
                 page.tsx
         
          admin/                # HR Admin (Story 1.9, 1.12)
             page.tsx
             users/
                page.tsx      # User mgmt (Story 1.2, 1.3)
             fiscal-years/
                page.tsx      # FY mgmt (Story 1.12)
             departments/
                page.tsx      # Dept config (Story 1.12)
             grade-systems/
                page.tsx      # Grade config (Story 1.12)
             ai-config/
                page.tsx      # AI config (Story 1.9)
             goals/
                 page.tsx      # Company goals (Story 2.2)
         
          help/
              page.tsx          # Help system (Story 1.7)
      
       api/                      # API routes
          auth/
             [...nextauth]/
                 route.ts      # NextAuth (Story 1.2)
         
          users/
             route.ts          # GET, POST users
             [id]/
                route.ts      # GET, PUT, DELETE
             import/
                 route.ts      # CSV import (Story 1.3)
         
          reviews/
             route.ts
             [id]/
                 route.ts
                 submit/
                    route.ts  # State transitions
                 calculate/
                     route.ts  # Score calc (Story 1.8)
         
          targets/
             route.ts
             [id]/
                 route.ts
         
          ai/
             generate-prompt/
                route.ts      # Web-based mode
             generate/
                 route.ts      # Local Ollama
         
          admin/                # Admin endpoints
             fiscal-years/
                route.ts      # FY CRUD
             departments/
                route.ts      # Dept CRUD
             employee-types/
                route.ts      # Grade systems
             score-mappings/
                route.ts      # Score→rank
             goals/
                 route.ts      # Goals (Story 2.2)
         
          analytics/            # Analytics endpoints (Epic 3)
             employee/
                [id]/
                   route.ts   # Personal trends (Story 3.1)
             manager/
                [id]/
                   route.ts   # Team analytics (Story 3.3)
             hr/
                route.ts      # Company-wide (Story 3.4)
             historical/
                route.ts      # Y-o-Y comparisons (Story 3.2)
             transfers/
                 route.ts      # Transfer history (Story 3.5)
         
          audit/
              route.ts
      
       globals.css
       layout.tsx
       page.tsx
   
    components/                   # React components
       ui/                       # shadcn/ui
          button.tsx
          input.tsx
          table.tsx
          modal.tsx
          ...
      
       auth/
          login-form.tsx
          role-header.tsx       # Story 1.11, 1.14
      
       reviews/
          review-form.tsx
          target-row.tsx
          ai-help-modal.tsx
          result-explanation-modal.tsx
          workflow-state-indicator.tsx  # Story 1.13
      
       targets/
          target-form.tsx
          target-table.tsx
      
       dashboard/
          manager-dashboard.tsx  # Story 2.1
          department-submission.tsx  # Story 2.5
          hr-consolidation.tsx   # Story 2.6
          employee-dashboard.tsx # Story 3.1
      
       analytics/               # Analytics components (Epic 3)
          performance-trend-chart.tsx    # Story 3.1, 3.2
          year-over-year-comparison.tsx  # Story 3.2
          team-analytics-dashboard.tsx   # Story 3.3
          rank-distribution-chart.tsx    # Story 3.4
          department-comparison-table.tsx # Story 3.4
          transfer-history-timeline.tsx  # Story 3.5
      
       charts/                  # Reusable chart components
          line-chart.tsx        # Multi-year trends
          bar-chart.tsx         # Rank distribution
          pie-chart.tsx         # Performance breakdown
          area-chart.tsx        # Historical comparisons
      
       admin/
          user-import.tsx
          fy-manager.tsx
          grade-config.tsx
          ai-config.tsx
      
       shared/
           navbar.tsx
           sidebar.tsx
           loading.tsx
   
    lib/                          # Utilities & services
       auth/
          auth-service.ts       # Auth abstraction
          rbac.ts
      
       db/
          prisma.ts             # Singleton
          seed.ts
      
       ai/
          ai-service.ts
          ollama-client.ts
          prompt-templates.ts
      
       scoring/
          calculator.ts         # Story 1.8
          rank-converter.ts
      
       audit/
          audit-logger.ts
      
       backup/
          backup-service.ts     # Story 2.3a
      
       analytics/               # Analytics services (Epic 3)
          trend-calculator.ts   # Multi-year trend analysis
          aggregation-service.ts # Team/company aggregations
          comparison-service.ts # Y-o-Y comparisons
          transfer-service.ts   # Transfer tracking (Story 3.5)
      
       utils/
          date.ts
          validation.ts
          api-response.ts
      
       logger.ts
   
    hooks/
       use-auth.ts
       use-review.ts
       use-role-switch.ts
       use-ai-assistance.ts
   
    types/
       auth.ts
       review.ts
       target.ts
       user.ts
       audit.ts
   
    middleware.ts                 # RBAC enforcement

 prisma/
    schema.prisma
    migrations/
    seed.ts

 public/
    images/
    fonts/

 tests/
    unit/
    integration/
    e2e/

 docs/                             # Documentation
    PRD.md
    epics.md
    ux-design-specification.md
    rbac-spec.md
    architecture.md               # This document

 .env
 .env.example
 .gitignore
 next.config.js
 tailwind.config.js
 tsconfig.json
 package.json
 vitest.config.ts
 playwright.config.ts
 README.md
```

---
