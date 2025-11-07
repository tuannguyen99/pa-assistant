# Architectural Patterns

This section documents the key architectural patterns and design principles used throughout the system to ensure consistency, maintainability, and scalability.

## 1. Layered Architecture Pattern

The application follows a strict layered architecture to separate concerns and maintain clean boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│         Presentation Layer (UI Components)                  │
│  - React Server Components (data fetching)                  │
│  - Client Components (interactivity)                        │
│  - Form components, dashboards, modals                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Uses
┌─────────────────────▼───────────────────────────────────────┐
│           API Layer (Next.js API Routes)                    │
│  - Request validation (Zod schemas)                         │
│  - Authentication/Authorization checks                      │
│  - Error handling and response formatting                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Delegates to
┌─────────────────────▼───────────────────────────────────────┐
│              Service Layer (Business Logic)                 │
│  - AuthService, AIService, ScoreCalculator                  │
│  - AuditLogger, BackupService                               │
│  - Domain-specific logic encapsulation                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Uses
┌─────────────────────▼───────────────────────────────────────┐
│           Data Access Layer (Prisma ORM)                    │
│  - Type-safe database queries                               │
│  - Transaction management                                   │
│  - Database abstraction                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Accesses
┌─────────────────────▼───────────────────────────────────────┐
│              Database Layer (SQLite/PostgreSQL)             │
│  - Data persistence                                         │
│  - ACID transactions                                        │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test each layer independently
- Changes in one layer don't cascade to others
- Business logic isolated from UI and data access

---

## 2. Repository Pattern (via Prisma)

Prisma ORM acts as a repository pattern implementation, abstracting database operations:

```typescript
// src/lib/db/prisma.ts - Singleton pattern
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Usage in service layer
export class ReviewService {
  async getReview(id: string) {
    return await prisma.review.findUnique({
      where: { id },
      include: { reviewee: true, reviewer: true }
    })
  }
}
```

**Benefits:**
- Database vendor independence (SQLite → PostgreSQL)
- Type-safe queries with TypeScript
- Centralized data access logic

---

## 3. Strategy Pattern (Authentication Providers)

NextAuth.js implements the Strategy pattern for pluggable authentication:

```typescript
// Current: Credentials Strategy
providers: [
  CredentialsProvider({ /* ... */ })
]

// Future: LDAP Strategy (no business logic changes)
providers: [
  LdapProvider({ /* ... */ })
]

// Application code remains unchanged
const user = await AuthService.getCurrentUser()
```

**Benefits:**
- Easy to swap authentication methods
- No business logic changes when switching providers
- Supports multiple authentication strategies simultaneously

---

## 4. Facade Pattern (Service Layer)

Service classes provide simplified interfaces to complex subsystems:

```typescript
// src/lib/auth/auth-service.ts
export class AuthService {
  // Facade hides complexity of NextAuth + Prisma + RBAC
  static async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    // Complex logic involving:
    // - Session validation
    // - Role checks
    // - Delegation lookup
    // - Archived status check
    // All hidden behind simple interface
  }
}

// Usage is simple
if (await AuthService.canAccessReview(userId, reviewId)) {
  // Allow access
}
```

**Benefits:**
- Simplified API for complex operations
- Encapsulates business rules
- Easy to mock for testing

---

## 5. Factory Pattern (API Response Creation)

Standardized response creation using factory functions:

```typescript
// src/lib/utils/api-response.ts
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(message: string, code: string): ApiResponse {
  return {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  }
}

// Usage in API routes
return NextResponse.json(createSuccessResponse(review))
return NextResponse.json(createErrorResponse('Not found', 'NOT_FOUND'), { status: 404 })
```

**Benefits:**
- Consistent API response format
- Easy to add cross-cutting concerns (logging, timing)
- Centralized response validation

---

## 6. Middleware Pattern (RBAC Enforcement)

Next.js middleware implements cross-cutting security concerns:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Chain of responsibility
  if (!token) return unauthorized()
  if (!hasRequiredRole(token, request.nextUrl)) return forbidden()
  
  return NextResponse.next()
}
```

**Benefits:**
- Centralized authentication/authorization
- Applied automatically to all routes
- No repeated security code in each API route

---

## 7. Observer Pattern (Audit Logging)

Audit logging observes and records sensitive operations:

```typescript
// src/lib/audit/audit-logger.ts
export class AuditLogger {
  static async logAction(params: {
    actorId: string
    actorRole: string
    action: string
    targetType: string
    targetId: string
    details?: any
  }) {
    await prisma.auditEntry.create({ data: params })
  }
}

// Usage after any sensitive operation
await AuditLogger.logAction({
  actorId: user.id,
  actorRole: currentRole,
  action: 'submit_review',
  targetType: 'review',
  targetId: review.id,
  details: { previousStatus: 'draft', newStatus: 'submitted' }
})
```

**Benefits:**
- Transparent audit trail
- Non-intrusive logging
- Complete compliance record

---

## 8. Adapter Pattern (AI Service)

AI Service adapts different AI providers to a common interface:

```typescript
// src/lib/ai/ai-service.ts
export class AIService {
  async getAIAssistance(context: AIContext): Promise<AIResult> {
    if (this.config.mode === 'web') {
      return this.webModeAdapter(context)
    } else {
      return this.ollamaAdapter(context)
    }
  }
  
  private async webModeAdapter(context: AIContext): Promise<AIResult> {
    // Adapt to copy/paste workflow
    return { type: 'prompt', content: this.generatePrompt(context) }
  }
  
  private async ollamaAdapter(context: AIContext): Promise<AIResult> {
    // Adapt to Ollama REST API
    const response = await fetch(this.config.ollamaUrl, { /* ... */ })
    return { type: 'result', content: response.data }
  }
}
```

**Benefits:**
- Consistent interface for different AI providers
- Easy to add new AI providers
- Configuration-driven behavior

---

## 9. Template Method Pattern (Form Validation)

Zod schemas define validation templates:

```typescript
// Base validation template
export const BaseTargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

// Extended template with custom validation
export const TargetSetSchema = z.array(BaseTargetSchema)
  .min(3)
  .max(5)
  .refine(
    (targets) => targets.reduce((sum, t) => sum + t.weight, 0) === 100,
    { message: 'Target weights must total exactly 100%' }
  )
```

**Benefits:**
- Reusable validation logic
- Type-safe validation
- Consistent error messages

---

## 10. Singleton Pattern (Database Connection)

Prisma client uses singleton to prevent connection exhaustion:

```typescript
// src/lib/db/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Benefits:**
- Single database connection pool
- Prevents connection leaks
- Optimized for serverless environments

---

## 11. Decorator Pattern (Logging & Timing)

Winston logger decorates operations with logging:

```typescript
// src/lib/logger.ts
import logger from '@/lib/logger'

export function withLogging(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      logger.info(`Starting ${operation}`, { args })
      try {
        const result = await originalMethod.apply(this, args)
        logger.info(`Completed ${operation}`, { result })
        return result
      } catch (error) {
        logger.error(`Failed ${operation}`, { error })
        throw error
      }
    }
    
    return descriptor
  }
}

// Usage
class ReviewService {
  @withLogging('review submission')
  async submitReview(reviewId: string) {
    // Method implementation
  }
}
```

**Benefits:**
- Non-intrusive logging
- Consistent log format
- Easy to add/remove logging

---

## 12. CQRS Light (Command Query Separation)

Separate read and write operations for clarity:

```typescript
// Query operations (src/lib/services/review-queries.ts)
export class ReviewQueries {
  static async getReview(id: string) {
    return await prisma.review.findUnique({ where: { id } })
  }
  
  static async listReviewsForManager(managerId: string) {
    return await prisma.review.findMany({
      where: { reviewerId: managerId }
    })
  }
}

// Command operations (src/lib/services/review-commands.ts)
export class ReviewCommands {
  static async submitReview(id: string, data: ReviewData) {
    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({ /* ... */ })
      await AuditLogger.logAction({ /* ... */ })
      return review
    })
  }
}
```

**Benefits:**
- Clear intent (read vs write)
- Easier to optimize separately
- Better testability

---

## 13. State Machine Pattern (Review Workflow)

Reviews follow a strict state machine:

```typescript
// src/lib/workflows/review-state-machine.ts
const REVIEW_TRANSITIONS = {
  'self_eval_draft': ['self_eval_submitted'],
  'self_eval_submitted': ['manager_eval_in_progress'],
  'manager_eval_in_progress': ['manager_eval_complete'],
  'manager_eval_complete': ['submitted_to_hr_final'],
  'submitted_to_hr_final': ['hr_review_complete'],
  'hr_review_complete': ['board_approved'],
  'board_approved': ['feedback_delivered'],
  'feedback_delivered': ['archived']
}

export class ReviewStateMachine {
  static canTransition(from: string, to: string): boolean {
    return REVIEW_TRANSITIONS[from]?.includes(to) ?? false
  }
  
  static async transition(reviewId: string, newStatus: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    
    if (!this.canTransition(review.status, newStatus)) {
      throw new Error(`Invalid transition: ${review.status} → ${newStatus}`)
    }
    
    return await prisma.review.update({
      where: { id: reviewId },
      data: { status: newStatus }
    })
  }
}
```

**Benefits:**
- Enforces valid workflow states
- Prevents invalid transitions
- Self-documenting business rules

---

## 14. Composition Over Inheritance

React components use composition instead of inheritance:

```typescript
// src/components/shared/modal.tsx
export function Modal({ children, title, onClose }: ModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Usage: Compose specific modals
export function AIHelpModal({ targetDescription, onAccept }: AIHelpModalProps) {
  return (
    <Modal title="AI Writing Assistant" onClose={() => {}}>
      <AIPromptDisplay target={targetDescription} />
      <AIResultInput onAccept={onAccept} />
    </Modal>
  )
}
```

**Benefits:**
- Flexible component reuse
- Easier to test
- Follows React best practices

---

## 15. Dependency Injection (Implicit via Imports)

Services receive dependencies through imports, enabling easy mocking:

```typescript
// src/lib/services/review-service.ts
import { prisma } from '@/lib/db/prisma'
import { AuditLogger } from '@/lib/audit/audit-logger'
import { ScoreCalculator } from '@/lib/scoring/calculator'

export class ReviewService {
  // Dependencies injected via imports
  async calculateAndSaveScore(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    const score = ScoreCalculator.calculate(review.targets)
    await prisma.review.update({ where: { id: reviewId }, data: { finalScore: score } })
    await AuditLogger.logAction({ /* ... */ })
  }
}

// Testing: Mock dependencies
jest.mock('@/lib/db/prisma')
jest.mock('@/lib/audit/audit-logger')
```

**Benefits:**
- Easy to test with mocks
- Clear dependency graph
- No complex DI container needed

---
