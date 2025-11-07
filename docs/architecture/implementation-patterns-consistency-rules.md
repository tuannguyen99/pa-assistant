# Implementation Patterns & Consistency Rules

These patterns ensure all AI agents and developers write compatible, consistent code.

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **React Components** | PascalCase | \ReviewForm.tsx\, \TargetRow.tsx\ |
| **Utility Functions** | kebab-case | \uth-service.ts\, \pi-response.ts\ |
| **API Routes** | kebab-case folders | \iscal-years/route.ts\ |
| **Hooks** | camelCase with \use\ | \useAuth.ts\, \useReview.ts\ |
| **Types/Interfaces** | PascalCase | \User.ts\, \Review.ts\ |
| **Functions/Variables** | camelCase | \calculateScore()\, \userId\ |
| **Constants** | SCREAMING_SNAKE_CASE | \MAX_TARGETS = 5\ |
| **Database Tables** | PascalCase (singular) | \User\, \Review\, \AuditEntry\ |
| **Database Columns** | camelCase | \userId\, \createdAt\, \passwordHash\ |
| **Foreign Keys** | \{table}Id\ | \
eviewerId\, \managerId\ |
| **API Endpoints** | kebab-case, plural | \/api/reviews\, \/api/fiscal-years\ |

## Error Handling

**Unified API Response Format:**

```	ypescript
// src/lib/utils/api-response.ts
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

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: any
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  }
}
```

**Standard Error Codes:**

| Code | HTTP | Usage |
|------|------|-------|
| \UNAUTHORIZED\ | 401 | Not authenticated |
| \FORBIDDEN\ | 403 | Not authorized |
| \NOT_FOUND\ | 404 | Resource doesn't exist |
| \VALIDATION_ERROR\ | 400 | Invalid input |
| \CONFLICT\ | 409 | State conflict |
| \ARCHIVED_REVIEW\ | 403 | Modify archived review |
| \WEIGHT_TOTAL_ERROR\ | 400 | Weights  100% |
| \INTERNAL_ERROR\ | 500 | Server error |

## Logging Strategy

**Winston Configuration:**

```	ypescript
// src/lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pa-assistant' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
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

export default logger
```

**Logging Levels:**

- \error\: Critical failures (DB connection failed, API timeout)
- \warn\: Recoverable issues (missing optional field, deprecated usage)
- \info\: Important events (user login, review submission, FY closure)
- \debug\: Detailed debugging (SQL queries, API requests)

## Date/Time Handling

**Always use date-fns:**

```	ypescript
import { format, parseISO, isAfter, addDays } from 'date-fns'

// Storage: ISO 8601 strings in database
const createdAt = new Date().toISOString() // "2025-11-05T10:30:00.000Z"

// Display: Format for UI
const displayDate = format(parseISO(createdAt), 'PPP') // "November 5, 2025"

// Comparison: Use date-fns utilities
if (isAfter(deadline, new Date())) {
  // Deadline is future
}
```

**Pattern:** Store UTC in DB, display in user's local timezone.

## Validation with Zod

```	ypescript
// src/lib/utils/validation.ts
import { z } from 'zod'

export const TargetSchema = z.object({
  taskDescription: z.string().min(10).max(500),
  kpi: z.string().min(5).max(200),
  weight: z.number().int().min(1).max(100),
  difficulty: z.enum(['L1', 'L2', 'L3'])
})

export const TargetSetSchema = z.array(TargetSchema)
  .min(3)
  .max(5)
  .refine(
    (targets) => {
      const total = targets.reduce((sum, t) => sum + t.weight, 0)
      return total === 100
    },
    { message: 'Target weights must total exactly 100%' }
  )
```

---
