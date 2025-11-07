# Coding Standards

This section defines the coding standards, conventions, and best practices for the pa-assistant project to ensure consistency, maintainability, and code quality across the entire codebase.

## General Principles

1. **Write code for humans first, computers second**
2. **Favor readability over cleverness**
3. **Keep functions small and focused (single responsibility)**
4. **Don't Repeat Yourself (DRY) - but prefer clarity over extreme abstraction**
5. **Fail fast and explicitly - avoid silent failures**
6. **Type everything - leverage TypeScript's type system fully**

---

## TypeScript Standards

**1. Type Safety**

```typescript
// ✅ Good: Explicit types
interface User {
  id: string
  email: string
  roles: Role[]
}

function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// ❌ Bad: Using 'any'
function getUserById(id: any): Promise<any> {
  return prisma.user.findUnique({ where: { id } })
}
```

**2. Strict Mode**

```json
// tsconfig.json - Always use strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**3. Interfaces vs Types**

```typescript
// ✅ Good: Use interfaces for object shapes (can be extended)
interface ReviewProps {
  review: Review
  currentUser: User
}

interface ExtendedReviewProps extends ReviewProps {
  showHistory: boolean
}

// ✅ Good: Use types for unions, intersections, primitives
type Role = 'employee' | 'manager' | 'hr_admin'
type ReviewStatus = 'draft' | 'submitted' | 'archived'
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ErrorResponse }
```

**4. Enum Usage**

```typescript
// ✅ Good: Use const objects for enums (better tree-shaking)
export const REVIEW_STATES = {
  SELF_EVAL_DRAFT: 'self_eval_draft',
  SELF_EVAL_SUBMITTED: 'self_eval_submitted',
  ARCHIVED: 'archived'
} as const

export type ReviewState = typeof REVIEW_STATES[keyof typeof REVIEW_STATES]

// ❌ Avoid: TypeScript enums (unless you need reverse mapping)
enum ReviewStates {
  SELF_EVAL_DRAFT = 'self_eval_draft',
  SELF_EVAL_SUBMITTED = 'self_eval_submitted'
}
```

**5. Null Handling**

```typescript
// ✅ Good: Explicit null checks
function processReview(review: Review | null) {
  if (!review) {
    throw new Error('Review not found')
  }
  // TypeScript knows review is not null here
  return review.status
}

// ✅ Good: Optional chaining
const managerName = review.reviewer?.fullName ?? 'Unassigned'

// ❌ Bad: Non-null assertion (use sparingly)
const userName = user!.name // Assumes user is not null without checking
```

---

## Naming Conventions

**1. Variables and Functions**

```typescript
// ✅ Good: camelCase for variables and functions
const currentUser = getCurrentUser()
const isAuthenticated = checkAuthentication()
const reviewCount = getReviewCount()

function calculateFinalScore(targets: Target[]): number {
  // Implementation
}

// ❌ Bad: Inconsistent naming
const Current_User = getCurrentUser()
const is_authenticated = checkAuthentication()
```

**2. Components**

```typescript
// ✅ Good: PascalCase for React components
export function ReviewWorkflow({ review }: ReviewWorkflowProps) {
  return <div>...</div>
}

export function UserAvatar({ user }: UserAvatarProps) {
  return <img src={user.avatar} alt={user.name} />
}

// ❌ Bad: camelCase for components
export function reviewWorkflow() {
  return <div>...</div>
}
```

**3. Constants**

```typescript
// ✅ Good: UPPER_SNAKE_CASE for true constants
const MAX_TARGETS = 5
const MIN_TARGETS = 3
const DEFAULT_REVIEW_STATUS = 'self_eval_draft'

// ✅ Good: camelCase for configuration objects
const apiConfig = {
  baseUrl: process.env.API_URL,
  timeout: 5000
}
```

**4. Files and Folders**

```
✅ Good: kebab-case for files
src/
├── components/
│   ├── review-workflow.tsx
│   ├── target-setting-form.tsx
│   └── user-avatar.tsx
├── lib/
│   ├── review-state-machine.ts
│   └── score-calculator.ts

❌ Bad: Inconsistent naming
src/
├── components/
│   ├── ReviewWorkflow.tsx
│   ├── target_setting_form.tsx
│   └── UserAvatar.tsx
```

**5. Boolean Variables**

```typescript
// ✅ Good: Prefix with is/has/can/should
const isLoading = true
const hasPermission = false
const canEdit = checkEditPermission()
const shouldShowModal = true

// ❌ Bad: Ambiguous names
const loading = true
const permission = false
const edit = checkEditPermission()
```

---

## Code Organization

**1. File Structure**

```typescript
// ✅ Good: Organize imports by category
// 1. External dependencies
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal dependencies (absolute imports)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ReviewService } from '@/lib/services/review-service'

// 3. Types
import type { Review, User } from '@prisma/client'

// 4. Constants
const MAX_RETRIES = 3

// 5. Component/function definition
export function ReviewList() {
  // Implementation
}
```

**2. Component Structure**

```typescript
// ✅ Good: Consistent component organization
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Review } from '@prisma/client'

// 1. Types/Interfaces
interface ReviewCardProps {
  review: Review
  onUpdate: (review: Review) => void
}

// 2. Component
export function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 4. Event handlers
  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
  // 5. Render helpers (if needed)
  const renderStatus = () => {
    return <span>{review.status}</span>
  }
  
  // 6. Return JSX
  return (
    <div>
      {renderStatus()}
      <Button onClick={handleExpand}>Expand</Button>
    </div>
  )
}
```

**3. API Route Structure**

```typescript
// ✅ Good: Consistent API route pattern
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response'

// 1. Validation schema
const submitReviewSchema = z.object({
  employeeTargets: z.array(z.object({
    id: z.string(),
    employeeRating: z.number().min(1).max(5),
    resultExplanation: z.string().min(50)
  }))
})

// 2. GET handler
export async function GET(request: NextRequest) {
  try {
    // 2a. Authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 }
      )
    }
    
    // 2b. Authorization
    // Check permissions...
    
    // 2c. Data fetching
    const reviews = await prisma.review.findMany({
      where: { revieweeId: session.user.id }
    })
    
    // 2d. Response
    return NextResponse.json(createSuccessResponse(reviews))
  } catch (error) {
    // 2e. Error handling
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Failed to fetch reviews'),
      { status: 500 }
    )
  }
}

// 3. POST handler
export async function POST(request: NextRequest) {
  // Similar structure...
}
```

---

## React Best Practices

**1. Component Types**

```typescript
// ✅ Good: Use Server Components by default
// app/reviews/page.tsx
export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany()
  return <ReviewList reviews={reviews} />
}

// ✅ Good: Use Client Components only when needed
// src/components/review-form.tsx
'use client'

export function ReviewForm() {
  const [data, setData] = useState({})
  return <form>...</form>
}
```

**2. Props Destructuring**

```typescript
// ✅ Good: Destructure props
export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  return <div>{review.title}</div>
}

// ❌ Bad: Using props object
export function ReviewCard(props: ReviewCardProps) {
  return <div>{props.review.title}</div>
}
```

**3. Conditional Rendering**

```typescript
// ✅ Good: Early returns for conditions
export function ReviewStatus({ review }: { review: Review }) {
  if (!review) {
    return <div>No review found</div>
  }
  
  if (review.archived) {
    return <ArchivedBadge />
  }
  
  return <StatusBadge status={review.status} />
}

// ❌ Bad: Nested ternaries
export function ReviewStatus({ review }: { review: Review }) {
  return review ? (
    review.archived ? (
      <ArchivedBadge />
    ) : (
      <StatusBadge status={review.status} />
    )
  ) : (
    <div>No review found</div>
  )
}
```

**4. Event Handlers**

```typescript
// ✅ Good: Named handler functions
export function ReviewForm() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // Handle submit
  }
  
  const handleCancel = () => {
    // Handle cancel
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={handleCancel}>Cancel</button>
      <button type="submit">Submit</button>
    </form>
  )
}

// ❌ Bad: Inline arrow functions (creates new function on each render)
export function ReviewForm() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); /* handle submit */ }}>
      <button onClick={() => { /* handle cancel */ }}>Cancel</button>
    </form>
  )
}
```

**5. Custom Hooks**

```typescript
// ✅ Good: Extract reusable logic into custom hooks
export function useReview(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => fetchReview(reviewId)
  })
}

// Usage
function ReviewPage({ params }: { params: { id: string } }) {
  const { data: review, isLoading, error } = useReview(params.id)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!review) return <NotFound />
  
  return <ReviewDetails review={review} />
}
```

---

## Error Handling

**1. API Error Responses**

```typescript
// ✅ Good: Consistent error structure
export interface ErrorResponse {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_STATE_TRANSITION'
  | 'INTERNAL_ERROR'

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): { success: false; error: ErrorResponse } {
  return {
    success: false,
    error: { code, message, details }
  }
}
```

**2. Try-Catch Blocks**

```typescript
// ✅ Good: Specific error handling
try {
  const review = await prisma.review.update({
    where: { id },
    data: { status: 'submitted' }
  })
  return createSuccessResponse(review)
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return createErrorResponse('NOT_FOUND', 'Review not found')
    }
  }
  
  console.error('Failed to update review:', error)
  return createErrorResponse('INTERNAL_ERROR', 'Failed to update review')
}
```

**3. Validation Errors**

```typescript
// ✅ Good: Use Zod for validation with detailed errors
const result = reviewSchema.safeParse(data)

if (!result.success) {
  return NextResponse.json(
    createErrorResponse('VALIDATION_ERROR', 'Invalid request data', {
      errors: result.error.flatten()
    }),
    { status: 400 }
  )
}
```

---

## Database Best Practices

**1. Prisma Queries**

```typescript
// ✅ Good: Use include for relations
const review = await prisma.review.findUnique({
  where: { id },
  include: {
    reviewee: {
      select: { id: true, fullName: true, email: true }
    },
    reviewer: {
      select: { id: true, fullName: true }
    }
  }
})

// ✅ Good: Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    fullName: true,
    roles: true
  },
  where: { employmentStatus: 'active' }
})

// ❌ Bad: Fetching unnecessary data
const users = await prisma.user.findMany() // Gets all fields
```

**2. Transactions**

```typescript
// ✅ Good: Use transactions for multiple operations
await prisma.$transaction(async (tx) => {
  // Update review
  const review = await tx.review.update({
    where: { id },
    data: { status: 'submitted', employeeSubmittedAt: new Date() }
  })
  
  // Create audit log
  await tx.auditEntry.create({
    data: {
      actorId: userId,
      actorRole: 'employee',
      action: 'submit_review',
      targetType: 'review',
      targetId: id,
      details: { previousStatus: 'draft' }
    }
  })
  
  return review
})
```

**3. Query Optimization**

```typescript
// ✅ Good: Use indexes for common queries
// In schema.prisma
model Review {
  id        String @id @default(cuid())
  revieweeId String
  cycleYear  Int
  status     String
  
  @@unique([revieweeId, cycleYear])
  @@index([revieweeId, status])
  @@index([status])
}

// ✅ Good: Batch queries instead of N+1
const reviews = await prisma.review.findMany({
  include: { reviewee: true }
})

// ❌ Bad: N+1 queries
const reviews = await prisma.review.findMany()
for (const review of reviews) {
  const reviewee = await prisma.user.findUnique({ 
    where: { id: review.revieweeId } 
  })
}
```

---

## Security Standards

**1. Authentication Checks**

```typescript
// ✅ Good: Always check authentication in API routes
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      createErrorResponse('UNAUTHORIZED', 'Not authenticated'),
      { status: 401 }
    )
  }
  
  // Continue with authorized logic
}
```

**2. Authorization Checks**

```typescript
// ✅ Good: Check permissions before operations
const canEdit = await AuthService.canModifyReview(session.user, reviewId)
if (!canEdit) {
  return NextResponse.json(
    createErrorResponse('FORBIDDEN', 'You do not have permission to modify this review'),
    { status: 403 }
  )
}
```

**3. Input Sanitization**

```typescript
// ✅ Good: Validate and sanitize all inputs
const submitReviewSchema = z.object({
  employeeTargets: z.array(z.object({
    id: z.string().cuid(),
    employeeRating: z.number().int().min(1).max(5),
    resultExplanation: z.string().min(50).max(1000).trim()
  })).min(3).max(5)
})

const result = submitReviewSchema.safeParse(data)
if (!result.success) {
  return NextResponse.json(
    createErrorResponse('VALIDATION_ERROR', 'Invalid input'),
    { status: 400 }
  )
}
```

**4. Sensitive Data**

```typescript
// ✅ Good: Exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    fullName: true,
    roles: true
    // passwordHash excluded
  }
})

// ❌ Bad: Exposing password hash
const user = await prisma.user.findUnique({
  where: { id }
  // Returns all fields including passwordHash
})
```

---

## Testing Standards

**1. Test File Organization**

```typescript
// ✅ Good: Descriptive test names
describe('ReviewStateMachine', () => {
  describe('canTransition', () => {
    it('allows transition from draft to submitted', () => {
      expect(
        ReviewStateMachine.canTransition('self_eval_draft', 'self_eval_submitted')
      ).toBe(true)
    })
    
    it('prevents transition from archived to any state', () => {
      expect(
        ReviewStateMachine.canTransition('archived', 'self_eval_draft')
      ).toBe(false)
    })
  })
})
```

**2. Test Data**

```typescript
// ✅ Good: Use factories for test data
function createMockReview(overrides?: Partial<Review>): Review {
  return {
    id: 'review-1',
    revieweeId: 'user-1',
    reviewerId: 'user-2',
    cycleYear: 2025,
    status: 'self_eval_draft',
    employeeTargets: [],
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

// Usage
const review = createMockReview({ status: 'submitted' })
```

**3. Assertions**

```typescript
// ✅ Good: Specific assertions
expect(response.status).toBe(200)
expect(response.data).toHaveProperty('review')
expect(response.data.review.status).toBe('submitted')

// ❌ Bad: Vague assertions
expect(response).toBeTruthy()
```

---

## Performance Standards

**1. Memoization**

```typescript
// ✅ Good: Memoize expensive calculations
import { useMemo } from 'react'

export function ReviewSummary({ review }: { review: Review }) {
  const finalScore = useMemo(() => {
    return calculateFinalScore(review.employeeTargets)
  }, [review.employeeTargets])
  
  return <div>Final Score: {finalScore}</div>
}
```

**2. Lazy Loading**

```typescript
// ✅ Good: Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/charts/performance-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

**3. Database Query Limits**

```typescript
// ✅ Good: Always paginate large datasets
const reviews = await prisma.review.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' }
})

// ❌ Bad: Fetching all records
const reviews = await prisma.review.findMany()
```

---

## Documentation Standards

**1. Function Documentation**

```typescript
/**
 * Calculates the final score for a review based on target ratings and difficulty.
 * 
 * @param targets - Array of target ratings with difficulty levels
 * @returns Final weighted score (0-300 range)
 * @throws {Error} If targets array is empty or invalid
 * 
 * @example
 * const score = calculateFinalScore([
 *   { rating: 4, weight: 50, difficulty: 'L2' },
 *   { rating: 5, weight: 30, difficulty: 'L1' },
 *   { rating: 3, weight: 20, difficulty: 'L3' }
 * ])
 * // Returns: 237.5
 */
export function calculateFinalScore(targets: TargetRating[]): number {
  if (!targets || targets.length === 0) {
    throw new Error('Targets array cannot be empty')
  }
  
  // Implementation
}
```

**2. Component Documentation**

```typescript
/**
 * ReviewWorkflow component manages the review submission process.
 * 
 * Features:
 * - Tab-based navigation (Self-Eval, Manager Eval, History)
 * - State machine enforcement
 * - Auto-save functionality
 * - AI assistance integration
 * 
 * @param review - The review object to display and edit
 * @param currentUser - The authenticated user viewing the review
 */
export function ReviewWorkflow({ review, currentUser }: ReviewWorkflowProps) {
  // Implementation
}
```

**3. Complex Logic Comments**

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate weighted score with difficulty multipliers
// L1=1.0, L2=1.2, L3=1.5 as per NFR004 scoring requirements
const weightedScore = targets.reduce((total, target) => {
  const multiplier = DIFFICULTY_MULTIPLIERS[target.difficulty]
  return total + (target.rating * target.weight * multiplier / 100)
}, 0)

// ❌ Bad: Obvious comments
// Loop through targets
for (const target of targets) {
  // Add score to total
  total += target.rating
}
```

---

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] **TypeScript**: No `any` types, all functions typed
- [ ] **Tests**: Unit tests for business logic, integration tests for API routes
- [ ] **Error Handling**: All errors caught and handled appropriately
- [ ] **Security**: Authentication/authorization checks in place
- [ ] **Performance**: No N+1 queries, appropriate pagination
- [ ] **Naming**: Consistent naming conventions followed
- [ ] **Documentation**: Complex functions documented
- [ ] **Lint**: No ESLint warnings or errors
- [ ] **Format**: Code formatted with Prettier
- [ ] **Accessibility**: ARIA labels, keyboard navigation for interactive elements

---
