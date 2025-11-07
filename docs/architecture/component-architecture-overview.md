# Component Architecture Overview

This section documents the frontend component structure, organization patterns, and how components interact with the backend and each other.

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION COMPONENT TREE                             │
└─────────────────────────────────────────────────────────────────────────────┘

app/
├── layout.tsx (Root Layout)
│   ├── Providers (RSC)
│   │   ├── SessionProvider (NextAuth)
│   │   ├── QueryClientProvider (TanStack Query)
│   │   └── ThemeProvider (Tailwind)
│   │
│   └── RoleHeader (Client Component)
│       ├── UserAvatar
│       ├── RoleSelector
│       └── NotificationBadge
│
├── (auth)/
│   ├── login/page.tsx (Server Component)
│   │   └── LoginForm (Client Component)
│   │       ├── UsernameField (shadcn/ui Input)
│   │       ├── PasswordField (shadcn/ui Input)
│   │       └── SubmitButton (shadcn/ui Button)
│   │
│   └── logout/page.tsx
│
└── (dashboard)/
    ├── layout.tsx (Dashboard Layout)
    │   ├── Sidebar (Client Component)
    │   │   ├── Navigation Menu
    │   │   └── Quick Actions
    │   │
    │   └── MainContent (Server Component slot)
    │
    ├── dashboard/
    │   ├── employee/page.tsx (Server Component)
    │   │   ├── TargetOverviewCard
    │   │   ├── ReviewStatusCard
    │   │   └── ActionItemsList
    │   │
    │   ├── manager/page.tsx (Server Component)
    │   │   ├── TeamReviewTable (Client Component)
    │   │   │   ├── DataTable (shadcn/ui)
    │   │   │   ├── FilterBar
    │   │   │   └── BulkActions
    │   │   │
    │   │   └── PerformanceDistributionChart
    │   │
    │   └── hr-consolidation/page.tsx (Server Component)
    │       ├── ConsolidationTable (Client Component)
    │       ├── RankDistributionChart
    │       └── ExportActions
    │
    ├── targets/
    │   ├── new/page.tsx (Server Component)
    │   │   └── TargetSettingForm (Client Component)
    │   │       ├── TargetInputFields (Array Field)
    │   │       │   ├── TaskDescription (Textarea)
    │   │       │   ├── KPIField (Input)
    │   │       │   ├── WeightSlider (shadcn/ui Slider)
    │   │       │   ├── DifficultySelector (Select)
    │   │       │   └── RemoveTargetButton
    │   │       │
    │   │       ├── AddTargetButton
    │   │       └── WeightTotalIndicator
    │   │
    │   └── [id]/page.tsx (Server Component)
    │       └── TargetReviewView
    │
    ├── reviews/
    │   ├── [id]/
    │   │   ├── page.tsx (Server Component)
    │   │   │   └── ReviewWorkflow (Client Component)
    │   │   │       ├── StateIndicator
    │   │   │       ├── TabNavigation (Self-Eval / Manager Eval)
    │   │   │       │
    │   │   │       ├── SelfEvaluationTab
    │   │   │       │   ├── TargetRatingGrid (Client Component)
    │   │   │       │   │   ├── RatingStars (1-5)
    │   │   │       │   │   ├── ResultExplanation (Textarea)
    │   │   │       │   │   └── AIHelpButton
    │   │   │       │   │
    │   │   │       │   ├── JobDescriptionField
    │   │   │       │   └── CareerPathField
    │   │   │       │
    │   │   │       └── ManagerEvaluationTab
    │   │   │           ├── EmployeeRatingsReadOnly
    │   │   │           ├── ManagerRatingGrid
    │   │   │           ├── FeedbackFields (Per-target)
    │   │   │           ├── OverallSummary
    │   │   │           └── ScoreDisplay
    │   │   │
    │   │   └── submit/route.ts (API Route)
    │   │
    │   └── archived/[id]/page.tsx (Read-only view)
    │
    └── settings/
        ├── hr-config/page.tsx (Server Component)
        │   ├── FiscalYearManager
        │   ├── DepartmentManager
        │   ├── EmployeeTypeManager
        │   └── ScoreMappingEditor
        │
        └── ai-config/page.tsx (Server Component)
            └── AIConfigForm (Client Component)
                ├── ModeSelector (web/local)
                ├── OllamaSettings (Conditional)
                └── PromptTemplateEditor
```

## Component Categories

**1. Layout Components (Server Components)**
```typescript
// app/layout.tsx - Root Layout
import { Providers } from '@/components/providers'
import { RoleHeader } from '@/components/auth/role-header'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <RoleHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/(dashboard)/layout.tsx - Dashboard Layout
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
```

**2. Page Components (Server Components by Default)**
```typescript
// app/(dashboard)/reviews/[id]/page.tsx
import { prisma } from '@/lib/db/prisma'
import { ReviewWorkflow } from '@/components/reviews/review-workflow'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // Server-side data fetching
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      reviewee: true,
      reviewer: true
    }
  })
  
  // Authorization check
  if (!canAccessReview(session.user.id, review)) {
    redirect('/unauthorized')
  }
  
  // Pass data to Client Component
  return <ReviewWorkflow review={review} currentUser={session.user} />
}
```

**3. Interactive Components (Client Components)**
```typescript
// src/components/reviews/review-workflow.tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelfEvaluationTab } from './self-evaluation-tab'
import { ManagerEvaluationTab } from './manager-evaluation-tab'
import { useReviewStateMachine } from '@/hooks/use-review-state-machine'

interface ReviewWorkflowProps {
  review: Review
  currentUser: User
}

export function ReviewWorkflow({ review, currentUser }: ReviewWorkflowProps) {
  const [activeTab, setActiveTab] = useState('self-eval')
  const { canTransition, transitionTo } = useReviewStateMachine(review)
  
  return (
    <div className="container mx-auto p-6">
      <StateIndicator status={review.status} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="self-eval">Self-Evaluation</TabsTrigger>
          <TabsTrigger value="manager-eval">Manager Evaluation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="self-eval">
          <SelfEvaluationTab
            review={review}
            readOnly={review.status !== 'self_eval_draft'}
            onSubmit={() => transitionTo('self_eval_submitted')}
          />
        </TabsContent>
        
        <TabsContent value="manager-eval">
          <ManagerEvaluationTab
            review={review}
            readOnly={review.status !== 'manager_eval_in_progress'}
            onSubmit={() => transitionTo('manager_eval_complete')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**4. Form Components (Client Components with React Hook Form)**
```typescript
// src/components/targets/target-setting-form.tsx
'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TargetSetSchema } from '@/lib/validation/target-schemas'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export function TargetSettingForm({ initialData, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(TargetSetSchema),
    defaultValues: initialData || {
      targets: [{ taskDescription: '', kpi: '', weight: 20, difficulty: 'L1' }]
    }
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'targets'
  })
  
  const totalWeight = form.watch('targets').reduce((sum, t) => sum + t.weight, 0)
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4">
            <FormField
              control={form.control}
              name={`targets.${index}.taskDescription`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe the target..." />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`targets.${index}.kpi`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Measurable indicator..." />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`targets.${index}.weight`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove Target
              </Button>
            )}
          </div>
        ))}
        
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ taskDescription: '', kpi: '', weight: 20, difficulty: 'L1' })}
            disabled={fields.length >= 5}
          >
            Add Target
          </Button>
          
          <div className="text-sm">
            Total Weight: <span className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
              {totalWeight}%
            </span>
          </div>
        </div>
        
        <Button type="submit" disabled={totalWeight !== 100}>
          Save Targets
        </Button>
      </form>
    </Form>
  )
}
```

**5. Modal Components (Client Components)**
```typescript
// src/components/ai/ai-help-modal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAIService } from '@/hooks/use-ai-service'

interface AIHelpModalProps {
  open: boolean
  onClose: () => void
  context: {
    targetDescription: string
    kpi: string
    employeeRating: number
  }
  onAccept: (text: string) => void
}

export function AIHelpModal({ open, onClose, context, onAccept }: AIHelpModalProps) {
  const { generateSuggestion, isLoading } = useAIService()
  const [suggestion, setSuggestion] = useState('')
  const [userEdit, setUserEdit] = useState('')
  
  const handleGenerate = async () => {
    const result = await generateSuggestion('result_explanation', context)
    setSuggestion(result)
    setUserEdit(result)
  }
  
  const handleAccept = () => {
    onAccept(userEdit)
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Writing Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Your Input</h3>
            <div className="p-3 bg-muted rounded text-sm space-y-2">
              <p><strong>Target:</strong> {context.targetDescription}</p>
              <p><strong>KPI:</strong> {context.kpi}</p>
              <p><strong>Rating:</strong> {context.employeeRating}/5</p>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Explanation'}
            </Button>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">AI Suggestion</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                AI-assisted
              </span>
            </div>
            
            <Textarea
              value={userEdit}
              onChange={(e) => setUserEdit(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="AI suggestion will appear here..."
            />
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAccept} disabled={!userEdit}>
                Accept & Use
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**6. Shared UI Components (shadcn/ui)**
```typescript
// All shadcn/ui components in src/components/ui/
// - button.tsx
// - input.tsx
// - textarea.tsx
// - select.tsx
// - dialog.tsx
// - tabs.tsx
// - table.tsx
// - slider.tsx
// - form.tsx (React Hook Form integration)
// - toast.tsx
// - dropdown-menu.tsx
// - card.tsx
// - badge.tsx
// - avatar.tsx

// Usage example:
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Review Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter value..." />
    <Button>Submit</Button>
  </CardContent>
</Card>
```

## Component Communication Patterns

**1. Server to Client (Props)**
```typescript
// Server Component (page.tsx)
export default async function Page() {
  const data = await prisma.review.findMany()
  return <ClientComponent data={data} /> // Pass via props
}

// Client Component
'use client'
export function ClientComponent({ data }: { data: Review[] }) {
  // Use data in client component
}
```

**2. Client to Server (API Routes + TanStack Query)**
```typescript
// Client Component
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function ReviewForm() {
  const queryClient = useQueryClient()
  
  const submitReview = useMutation({
    mutationFn: async (data: ReviewData) => {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
  
  return <form onSubmit={(e) => {
    e.preventDefault()
    submitReview.mutate(formData)
  }} />
}
```

**3. Client to Client (Zustand State Management)**
```typescript
// src/stores/role-store.ts
import { create } from 'zustand'

interface RoleStore {
  currentRole: 'employee' | 'manager' | 'hr_admin'
  setRole: (role: string) => void
}

export const useRoleStore = create<RoleStore>((set) => ({
  currentRole: 'employee',
  setRole: (role) => set({ currentRole: role })
}))

// Usage in any Client Component
'use client'
import { useRoleStore } from '@/stores/role-store'

export function RoleSelector() {
  const { currentRole, setRole } = useRoleStore()
  
  return (
    <select value={currentRole} onChange={(e) => setRole(e.target.value)}>
      <option value="employee">Employee</option>
      <option value="manager">Manager</option>
      <option value="hr_admin">HR Admin</option>
    </select>
  )
}
```

**4. Parent to Child (Props + Callbacks)**
```typescript
// Parent Component
export function ReviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handleAccept = (text: string) => {
    // Handle accepted text
    setIsModalOpen(false)
  }
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Get AI Help</Button>
      
      <AIHelpModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
      />
    </>
  )
}
```

## Component Design Principles

**1. Server Components by Default**
- Use Server Components for data fetching, layout, and static content
- Only convert to Client Components when interactivity is needed
- Benefits: Better performance, smaller bundle size, SEO-friendly

**2. Composition Over Props Drilling**
```typescript
// Bad: Props drilling
<Layout user={user}>
  <Sidebar user={user}>
    <UserMenu user={user} />
  </Sidebar>
</Layout>

// Good: Context or Server Component data fetching
<Layout>
  <Sidebar>
    <UserMenu /> {/* Fetches user via getServerSession */}
  </Sidebar>
</Layout>
```

**3. Colocation**
```
src/components/
├── reviews/              # Feature-specific components
│   ├── review-workflow.tsx
│   ├── self-evaluation-tab.tsx
│   ├── manager-evaluation-tab.tsx
│   └── state-indicator.tsx
│
├── targets/              # Feature-specific components
│   ├── target-setting-form.tsx
│   └── target-rating-grid.tsx
│
├── ui/                   # Shared UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx
│
└── shared/               # Shared business components
    ├── data-table.tsx
    ├── error-boundary.tsx
    └── loading-spinner.tsx
```

**4. Single Responsibility**
```typescript
// Bad: God component
export function ReviewForm() {
  // 500 lines of logic + UI
}

// Good: Split responsibilities
export function ReviewForm() {
  // Orchestration only
  return (
    <>
      <TargetRatingSection />
      <FeedbackSection />
      <SubmitSection />
    </>
  )
}
```

**5. Type Safety**
```typescript
// Define props interface
interface ReviewWorkflowProps {
  review: Review              // Prisma-generated type
  currentUser: User           // Prisma-generated type
  onSubmit?: () => void
}

// Use in component
export function ReviewWorkflow({ review, currentUser, onSubmit }: ReviewWorkflowProps) {
  // TypeScript ensures type safety
}
```

---
