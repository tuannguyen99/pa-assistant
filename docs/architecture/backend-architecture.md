# Backend Architecture

This section details the backend architecture built on Next.js API Routes with a clean service layer pattern.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Routes Layer                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  app/api/                                                                   │
│  ├── auth/[...nextauth]/route.ts    ← NextAuth.js endpoint                │
│  │                                                                          │
│  ├── reviews/                                                              │
│  │   ├── route.ts                   ← GET /api/reviews, POST              │
│  │   ├── [id]/route.ts              ← GET, PATCH, DELETE by ID           │
│  │   ├── [id]/submit/route.ts       ← POST state transitions             │
│  │   └── [id]/self-eval/route.ts    ← PATCH self-evaluation              │
│  │                                                                          │
│  ├── targets/                                                              │
│  │   ├── route.ts                   ← Target CRUD operations              │
│  │   └── [id]/approve/route.ts      ← Manager approval                    │
│  │                                                                          │
│  ├── users/                                                                │
│  │   ├── route.ts                   ← User management                     │
│  │   └── [id]/route.ts              ← User details                        │
│  │                                                                          │
│  ├── fiscal-years/                                                         │
│  │   └── [year]/close/route.ts      ← Fiscal year operations              │
│  │                                                                          │
│  └── reports/                                                              │
│      └── multi-year/route.ts        ← Historical reporting                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/lib/                                                                   │
│  ├── auth/                                                                  │
│  │   ├── auth-service.ts            ← Authentication & authorization       │
│  │   └── permissions.ts             ← RBAC logic                          │
│  │                                                                          │
│  ├── scoring/                                                              │
│  │   └── score-calculator.ts        ← Performance score calculation        │
│  │                                                                          │
│  ├── workflows/                                                            │
│  │   ├── review-state-machine.ts    ← State transition logic              │
│  │   └── notification-service.ts    ← Email/in-app notifications          │
│  │                                                                          │
│  ├── ai/                                                                   │
│  │   └── ai-service.ts               ← AI integration (Ollama/web)        │
│  │                                                                          │
│  ├── audit/                                                                │
│  │   └── audit-logger.ts             ← Audit trail logging                │
│  │                                                                          │
│  └── backup/                                                               │
│      └── backup-service.ts           ← Database backup operations          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       Data Access Layer (Prisma)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/lib/db/                                                                │
│  ├── prisma.ts                       ← Singleton Prisma client             │
│  └── seed.ts                         ← Database seeding                    │
│                                                                             │
│  prisma/                                                                    │
│  ├── schema.prisma                   ← Database schema definition          │
│  └── migrations/                     ← Version-controlled migrations       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Database Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SQLite (MVP) / PostgreSQL (Production)                                    │
│  - 11 tables: User, Review, TargetSetting, RoleAssignment, etc.           │
│  - ACID transactions                                                        │
│  - Foreign key constraints                                                  │
│  - Performance indexes                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Route Structure

**Standard Route Pattern:**
```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'
import { AuditLogger } from '@/lib/audit/audit-logger'

// GET /api/reviews - List reviews
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'AUTH_REQUIRED'),
        { status: 401 }
      )
    }
    
    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'employee'
    const status = searchParams.get('status')
    
    // 3. Authorization check
    if (!session.user.roles.includes(role)) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'INVALID_ROLE'),
        { status: 403 }
      )
    }
    
    // 4. Build query based on role
    const where = role === 'employee'
      ? { revieweeId: session.user.id }
      : { reviewerId: session.user.id }
    
    if (status) {
      where.status = status
    }
    
    // 5. Database query
    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewee: { select: { id: true, fullName: true, employeeId: true } },
        reviewer: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 6. Return success response
    return NextResponse.json(createSuccessResponse(reviews))
    
  } catch (error) {
    // 7. Error handling
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error', 'SERVER_ERROR'),
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validation with Zod
    const validation = ReviewCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', 'VALIDATION_ERROR', validation.error),
        { status: 400 }
      )
    }
    
    // Business logic in transaction
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: validation.data
      })
      
      // Audit log
      await tx.auditEntry.create({
        data: {
          actorId: session.user.id,
          actorRole: 'hr_admin',
          action: 'create_review',
          targetType: 'review',
          targetId: created.id
        }
      })
      
      return created
    })
    
    return NextResponse.json(createSuccessResponse(review), { status: 201 })
    
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      createErrorResponse('Failed to create review', 'CREATE_ERROR'),
      { status: 500 }
    )
  }
}
```

## Service Layer Pattern

**Example: AuthService**
```typescript
// src/lib/auth/auth-service.ts
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'

export class AuthService {
  /**
   * Check if user can access a specific review
   */
  static async canAccessReview(
    userId: string,
    reviewId: string,
    role: string
  ): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { revieweeId: true, reviewerId: true, archived: true }
    })
    
    if (!review) return false
    
    // Employee can only access own review
    if (role === 'employee') {
      return review.revieweeId === userId
    }
    
    // Manager can access direct reports' reviews
    if (role === 'manager') {
      if (review.reviewerId === userId) return true
      
      // Check for delegation
      const delegation = await prisma.roleAssignment.findFirst({
        where: {
          reviewerId: userId,
          revieweeId: review.revieweeId,
          effectiveFrom: { lte: new Date() },
          effectiveTo: { gte: new Date() }
        }
      })
      
      return !!delegation
    }
    
    // HR Admin can access all reviews
    if (role === 'hr_admin') {
      return true
    }
    
    return false
  }
  
  /**
   * Check if user can modify a review
   */
  static async canModifyReview(
    userId: string,
    reviewId: string,
    role: string
  ): Promise<boolean> {
    // Archived reviews cannot be modified
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { archived: true, status: true, revieweeId: true, reviewerId: true }
    })
    
    if (!review || review.archived) return false
    
    // Check status-specific permissions
    if (role === 'employee') {
      return review.status === 'self_eval_draft' && review.revieweeId === userId
    }
    
    if (role === 'manager') {
      return review.status === 'manager_eval_in_progress' && review.reviewerId === userId
    }
    
    // HR Admin has limited modification rights
    if (role === 'hr_admin') {
      return ['submitted_to_hr_final', 'hr_review_complete'].includes(review.status)
    }
    
    return false
  }
}
```

**Example: ScoreCalculator Service**
```typescript
// src/lib/scoring/score-calculator.ts
export class ScoreCalculator {
  private static DIFFICULTY_MULTIPLIERS = {
    'L1': 1.0,
    'L2': 1.2,
    'L3': 1.5
  }
  
  /**
   * Calculate final review score
   */
  static calculateScore(
    targets: EmployeeTarget[],
    managerRatings: ManagerRating[]
  ): number {
    let totalScore = 0
    
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const rating = managerRatings[i]
      
      // Base score: rating × weight
      const baseScore = rating.managerRating * target.weight
      
      // Apply difficulty multiplier
      const multiplier = this.DIFFICULTY_MULTIPLIERS[target.difficulty]
      const targetScore = baseScore * multiplier
      
      totalScore += targetScore
    }
    
    return Math.round(totalScore)
  }
  
  /**
   * Map score to rank based on employee type and grade
   */
  static async mapToRank(
    score: number,
    employeeType: string,
    grade: string
  ): Promise<string> {
    const mapping = await prisma.scoreMapping.findUnique({
      where: {
        employeeType_grade: { employeeType, grade }
      }
    })
    
    if (!mapping) {
      throw new Error(`No score mapping found for ${employeeType} - ${grade}`)
    }
    
    const ranges = mapping.mappings as ScoreRange[]
    
    for (const range of ranges) {
      if (score >= range.min && score <= range.max) {
        return range.rank
      }
    }
    
    throw new Error(`Score ${score} outside valid ranges`)
  }
}
```

## Validation Layer (Zod Schemas)

```typescript
// src/lib/validation/review-schemas.ts
import { z } from 'zod'

// Base target schema
export const BaseTargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

// Target set validation (3-5 targets, total weight = 100%)
export const TargetSetSchema = z.array(BaseTargetSchema)
  .min(3, 'Minimum 3 targets required')
  .max(5, 'Maximum 5 targets allowed')
  .refine(
    (targets) => targets.reduce((sum, t) => sum + t.weight, 0) === 100,
    { message: 'Target weights must total exactly 100%' }
  )

// Employee self-evaluation schema
export const SelfEvaluationSchema = z.object({
  employeeTargets: z.array(
    z.object({
      ...BaseTargetSchema.shape,
      employeeRating: z.number().int().min(1).max(5),
      resultExplanation: z.string().min(50).max(1000),
      aiAssisted: z.boolean().optional()
    })
  ),
  currentJobDesc: z.string().min(10).max(500),
  careerPath: z.string().max(500).optional()
})

// Manager evaluation schema
export const ManagerEvaluationSchema = z.object({
  managerTargetRatings: z.array(
    z.object({
      targetIndex: z.number().int().min(0),
      managerRating: z.number().int().min(1).max(5),
      disagreeReason: z.string().max(500).optional()
    })
  ),
  managerFeedback: z.array(
    z.object({
      targetIndex: z.number().int().min(0),
      feedback: z.string().min(50).max(1000),
      aiAssisted: z.boolean().optional()
    })
  ),
  overallSummary: z.string().min(100).max(2000)
})
```

## Transaction Patterns

**Pattern 1: Simple Transaction**
```typescript
// Single operation with audit log
const result = await prisma.$transaction(async (tx) => {
  const review = await tx.review.update({
    where: { id },
    data: { status: 'submitted' }
  })
  
  await tx.auditEntry.create({
    data: { /* audit data */ }
  })
  
  return review
})
```

**Pattern 2: Complex Multi-Step Transaction**
```typescript
// Multiple related operations
const result = await prisma.$transaction(async (tx) => {
  // 1. Update review
  const review = await tx.review.update({
    where: { id },
    data: { status: 'manager_eval_complete', finalScore, finalRank }
  })
  
  // 2. Create notification
  await tx.notification.create({
    data: { userId: review.revieweeId, message: 'Review completed' }
  })
  
  // 3. Update manager stats
  await tx.user.update({
    where: { id: review.reviewerId },
    data: { reviewsCompleted: { increment: 1 } }
  })
  
  // 4. Audit log
  await tx.auditEntry.create({
    data: { /* audit data */ }
  })
  
  return review
})
```

## Error Handling Strategy

```typescript
// Unified error response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// Error codes
export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  REVIEW_ARCHIVED = 'REVIEW_ARCHIVED',
  SERVER_ERROR = 'SERVER_ERROR'
}

// Factory functions
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(
  message: string,
  code: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  }
}
```

## Middleware Pattern

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Public routes
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login')
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Authentication check
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Role validation for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const roleParam = request.nextUrl.searchParams.get('role')
    
    if (roleParam && !token.roles.includes(roleParam)) {
      return NextResponse.json(
        { error: 'Forbidden: Role not assigned' },
        { status: 403 }
      )
    }
    
    // Check archived review modification
    if (request.method !== 'GET' && request.nextUrl.pathname.includes('/reviews/')) {
      // Archived review protection logic
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
```

## Logging & Monitoring

```typescript
// src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// Usage in API routes
import { logger } from '@/lib/logger'

logger.info('Review submitted', {
  userId: session.user.id,
  reviewId: review.id,
  status: review.status
})

logger.error('Failed to calculate score', {
  error: error.message,
  reviewId: review.id
})
```

## Caching Strategy

```typescript
// Next.js route caching
export const revalidate = 3600 // Revalidate every hour

// TanStack Query caching (client-side)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
})

// Redis caching (future production)
// import { redis } from '@/lib/redis'
// 
// const cached = await redis.get(`review:${id}`)
// if (cached) return JSON.parse(cached)
// 
// const review = await prisma.review.findUnique({ where: { id } })
// await redis.set(`review:${id}`, JSON.stringify(review), 'EX', 300)
```

---
