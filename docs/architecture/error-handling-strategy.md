# Error Handling Strategy

## Error Categories

**1. Client-Side Errors**

```typescript
// Form validation errors
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Network errors
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Usage in components
'use client'
import { toast } from '@/components/ui/use-toast'

export function ReviewForm() {
  const handleSubmit = async (data: ReviewFormData) => {
    try {
      await submitReview(data)
      toast({ title: 'Success', description: 'Review submitted' })
    } catch (error) {
      if (error instanceof ValidationError) {
        // Show field-specific error
        form.setError(error.field, { message: error.message })
      } else if (error instanceof NetworkError) {
        // Show network error toast
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: `Failed to connect to server (${error.statusCode})`
        })
      } else {
        // Generic error fallback
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.'
        })
      }
    }
  }
}
```

**2. Server-Side Errors (API Routes)**

```typescript
// src/lib/errors/api-errors.ts
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  
  // Business logic errors (422)
  REVIEW_ALREADY_SUBMITTED = 'REVIEW_ALREADY_SUBMITTED',
  TARGETS_NOT_APPROVED = 'TARGETS_NOT_APPROVED',
  FISCAL_YEAR_CLOSED = 'FISCAL_YEAR_CLOSED',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper factory functions
export const ApiErrors = {
  unauthorized: (message = 'Authentication required') =>
    new ApiError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Insufficient permissions') =>
    new ApiError(ErrorCode.FORBIDDEN, message, 403),
  
  invalidInput: (message: string, details?: Record<string, any>) =>
    new ApiError(ErrorCode.INVALID_INPUT, message, 400, details),
  
  notFound: (resource: string) =>
    new ApiError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),
  
  businessLogic: (code: ErrorCode, message: string) =>
    new ApiError(code, message, 422),
  
  internal: (message = 'Internal server error') =>
    new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500)
}
```

**3. Global Error Handler (API Routes)**

```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server'
import { ApiError } from '@/lib/errors/api-errors'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'

export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', { errors: error.errors })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      },
      { status: 400 }
    )
  }

  // API errors (our custom errors)
  if (error instanceof ApiError) {
    logger.warn('API error', {
      code: error.code,
      message: error.message,
      details: error.details
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Database error', { code: error.code, meta: error.meta })
    
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this data already exists',
            details: { fields: error.meta?.target }
          }
        },
        { status: 409 }
      )
    }
    
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Referenced record does not exist',
            details: { field: error.meta?.field_name }
          }
        },
        { status: 400 }
      )
    }
    
    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found'
          }
        },
        { status: 404 }
      )
    }
  }

  // Unknown errors
  logger.error('Unexpected error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  )
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw ApiErrors.unauthorized()
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    const result = await createReview(validatedData)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
```

**4. Database Transaction Error Handling**

```typescript
// src/lib/db/transaction-wrapper.ts
import { prisma } from './prisma'
import { logger } from '@/lib/logger'

export async function withTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  options?: { maxRetries?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        return await operation(tx)
      })
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on validation or business logic errors
      if (
        error instanceof ApiError ||
        error instanceof ZodError
      ) {
        throw error
      }

      // Retry on transient errors
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2034' || // Transaction conflict
         error.code === 'P1001')   // Connection error
      ) {
        logger.warn(`Transaction attempt ${attempt} failed, retrying...`, {
          code: error.code,
          attempt
        })
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        )
        continue
      }

      // Don't retry other errors
      throw error
    }
  }

  logger.error('Transaction failed after max retries', { maxRetries })
  throw lastError
}

// Usage example
export async function submitReview(reviewId: string, userId: string) {
  return withTransaction(async (tx) => {
    // Update review
    const review = await tx.review.update({
      where: { id: reviewId },
      data: { status: 'submitted', submittedAt: new Date() }
    })

    // Log audit entry
    await tx.auditEntry.create({
      data: {
        actorId: userId,
        action: 'submit_review',
        targetType: 'review',
        targetId: reviewId
      }
    })

    return review
  })
}
```

**5. Frontend Error Boundaries**

```typescript
// app/error.tsx - Root-level error boundary
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}

// app/(dashboard)/reviews/error.tsx - Route-specific error boundary
'use client'

export default function ReviewError({ error, reset }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <h3 className="font-semibold mb-2">Failed to load review</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button variant="outline" onClick={reset}>Retry</Button>
    </div>
  )
}
```

**6. Logging Strategy**

```typescript
// src/lib/logger.ts
import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'pa-assistant',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console logging (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File logging (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// Usage examples
logger.info('User logged in', { userId: '123', email: 'user@example.com' })
logger.warn('Review submission attempted in closed fiscal year', { reviewId: '456' })
logger.error('Database connection failed', { error: error.message, stack: error.stack })

// Audit logging helper
export function logAudit(
  action: string,
  actorId: string,
  targetType: string,
  targetId: string,
  details?: Record<string, any>
) {
  logger.info('Audit event', {
    type: 'audit',
    action,
    actorId,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  })
}
```

## Error Response Format

**Standard API Error Response:**

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string          // Machine-readable error code
    message: string       // Human-readable message
    details?: {           // Optional additional context
      field?: string      // For validation errors
      fields?: string[]   // For multiple field errors
      [key: string]: any  // Custom error data
    }
  }
}

// Examples:
// 1. Authentication error
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 2. Validation error
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [
      { "field": "rating", "message": "Rating must be between 1 and 5" },
      { "field": "explanation", "message": "Explanation is required" }
    ]
  }
}

// 3. Business logic error
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot submit review in current state",
    "details": {
      "currentState": "archived",
      "attemptedState": "submitted"
    }
  }
}
```

## Error Monitoring Best Practices

1. **Structured Logging**: Always log errors with context (user ID, request ID, timestamp)
2. **Error Tracking**: Integrate with services like Sentry or LogRocket for production
3. **User-Friendly Messages**: Never expose internal errors to users
4. **Recovery Paths**: Provide actionable steps (retry, contact support)
5. **Rate Limiting**: Prevent error spam from affecting legitimate users

```typescript
// Example: Add request ID for tracing
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const requestId = uuidv4()
  
  try {
    // ... operation
  } catch (error) {
    logger.error('Request failed', {
      requestId,
      url: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred. Please contact support with this ID.',
          details: { requestId }
        }
      },
      { status: 500 }
    )
  }
}
```

---

---
