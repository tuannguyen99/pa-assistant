# Security and Performance

## Security Architecture

**1. Authentication Security**

```typescript
// NextAuth.js configuration with security best practices
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            roles: true,
            passwordHash: true,
            employmentStatus: true
          }
        })

        if (!user || user.employmentStatus !== 'active') {
          throw new Error('Invalid credentials')
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60 // 8 hours
  },

  jwt: {
    maxAge: 8 * 60 * 60 // 8 hours
  },

  cookies: {
    sessionToken: {
      name: 'pa-assistant.session-token',
      options: {
        httpOnly: true,    // Prevent XSS attacks
        sameSite: 'lax',   // CSRF protection
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        path: '/'
      }
    }
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = token.roles as string[]
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**2. Authorization Middleware**

```typescript
// middleware.ts - Global route protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/logout', '/auth/error']

// Role-based route access
const routePermissions: Record<string, string[]> = {
  '/dashboard/employee': ['employee', 'manager', 'hr_admin'],
  '/dashboard/manager': ['manager', 'hr_admin'],
  '/dashboard/hr-consolidation': ['hr_admin'],
  '/admin': ['hr_admin']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  if (!token) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check authorization for protected routes
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const userRoles = token.roles as string[]
      const hasAccess = allowedRoles.some(role => userRoles.includes(role))
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

**3. Input Sanitization and Validation**

```typescript
// All API input validated with Zod schemas
import { z } from 'zod'

// Prevent XSS with sanitized strings
const sanitizedString = z.string()
  .trim()
  .min(1)
  .max(1000)
  .transform(str => 
    str.replace(/[<>]/g, '') // Remove < and > characters
  )

// Email validation
const emailSchema = z.string().email().toLowerCase()

// Review submission schema with comprehensive validation
export const reviewSubmissionSchema = z.object({
  targetRatings: z.array(z.object({
    targetId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    resultExplanation: sanitizedString.min(50).max(1000),
    aiAssisted: z.boolean()
  })).min(3).max(5),
  
  currentJobDescription: sanitizedString.max(2000),
  careerPath: sanitizedString.max(2000)
})

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input
    const validatedData = reviewSubmissionSchema.parse(body)
    
    // Safe to use validated data
    await saveReview(validatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: error.errors } },
        { status: 400 }
      )
    }
  }
}
```

**4. SQL Injection Prevention**

Prisma automatically prevents SQL injection through parameterized queries:

```typescript
// ✅ Safe: Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { username: userInput } // Automatically sanitized
})

// ✅ Safe: Query builder prevents injection
const reviews = await prisma.review.findMany({
  where: {
    revieweeId: userId,
    status: { in: ['submitted', 'completed'] }
  }
})

// ❌ Never use raw SQL with user input (unless absolutely necessary)
// If raw SQL is required, use parameterized queries:
const result = await prisma.$queryRaw`
  SELECT * FROM User WHERE username = ${userInput}
`
```

**5. CSRF Protection**

```typescript
// NextAuth.js provides built-in CSRF protection
// Additional protection for API routes:

// src/lib/security/csrf.ts
import { headers } from 'next/headers'

export function validateCSRFToken(request: NextRequest): boolean {
  const headersList = headers()
  const csrfToken = headersList.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  return csrfToken === cookieToken
}

// Usage in sensitive API routes
export async function POST(request: NextRequest) {
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_CSRF_TOKEN' } },
      { status: 403 }
    )
  }
  
  // Process request
}
```

**6. Rate Limiting**

```typescript
// src/lib/security/rate-limiter.ts
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number  // Time window in milliseconds
  uniqueTokenPerInterval: number // Max users to track
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number) || 0
        
        if (tokenCount >= limit) {
          reject(new Error('Rate limit exceeded'))
        } else {
          tokenCache.set(token, tokenCount + 1)
          resolve()
        }
      })
  }
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    await limiter.check(10, session.user.id) // Max 10 requests per minute
    
    // Process request
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
      { status: 429 }
    )
  }
}
```

**7. Sensitive Data Protection**

```typescript
// Never expose sensitive data in API responses
// src/lib/security/sanitize.ts

export function sanitizeUser(user: User) {
  const { passwordHash, ldapDN, ...safeUser } = user
  return safeUser
}

export function sanitizeReview(review: Review, userRole: string) {
  // Hide manager evaluation from employee until feedback delivered
  if (userRole === 'employee' && review.status !== 'feedback_delivered') {
    const { managerTargetRatings, managerFeedback, overallSummary, ...safeReview } = review
    return safeReview
  }
  
  return review
}

// Usage
const user = await prisma.user.findUnique({ where: { id: userId } })
return NextResponse.json({ success: true, data: sanitizeUser(user) })
```

**8. Environment Variables Security**

```typescript
// .env.local (never commit to Git)
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-recommended"
NEXTAUTH_URL="http://localhost:3000"

// Validate environment variables at startup
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  OLLAMA_BASE_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
})

// Validate on app startup
export const env = envSchema.parse(process.env)
```

## Performance Optimization

**1. Database Query Optimization**

```typescript
// Use select to limit returned fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    email: true
    // Don't fetch passwordHash, ldapDN, etc.
  }
})

// Use include for relations (avoid N+1 queries)
const reviews = await prisma.review.findMany({
  include: {
    reviewee: {
      select: { id: true, fullName: true, email: true }
    },
    reviewer: {
      select: { id: true, fullName: true }
    }
  }
})

// Add database indexes for frequently queried fields
// In schema.prisma:
model Review {
  // ... fields
  
  @@index([revieweeId, cycleYear])
  @@index([reviewerId, status])
  @@index([status])
}

// Use pagination for large datasets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count()
  ])

  return NextResponse.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}

// Use database transactions for consistency
const result = await prisma.$transaction([
  prisma.review.update({ where: { id }, data: { status: 'submitted' } }),
  prisma.auditEntry.create({ data: { actorId, action: 'submit_review' } })
])
```

**2. Caching Strategy**

```typescript
// TanStack Query client-side caching
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // Data fresh for 1 minute
      cacheTime: 5 * 60 * 1000,  // Cache for 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Use in components
'use client'
import { useQuery } from '@tanstack/react-query'

export function ReviewList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'list'],
    queryFn: async () => {
      const res = await fetch('/api/reviews')
      return res.json()
    },
    staleTime: 2 * 60 * 1000 // 2 minutes for review list
  })
}

// Server-side caching with Next.js
// app/(dashboard)/reviews/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany()
  return <ReviewList reviews={reviews} />
}

// Cache API responses with headers
export async function GET(request: NextRequest) {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

**3. Code Splitting and Lazy Loading**

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(
  () => import('@/components/charts/performance-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Don't render on server
  }
)

const AIHelpModal = dynamic(
  () => import('@/components/ai/ai-help-modal'),
  { ssr: false }
)

// Route-based code splitting (automatic with App Router)
// Each page.tsx is automatically a split point

// Component-level code splitting
export function ReviewPage() {
  const [showAI, setShowAI] = useState(false)
  
  return (
    <div>
      {/* AI modal only loaded when needed */}
      {showAI && <AIHelpModal />}
    </div>
  )
}
```

**4. Image Optimization**

```typescript
// Use Next.js Image component
import Image from 'next/image'

export function UserAvatar({ user }) {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={user.fullName}
      width={40}
      height={40}
      className="rounded-full"
      // Automatic optimization:
      // - WebP format
      // - Responsive sizes
      // - Lazy loading
      // - Placeholder blur
    />
  )
}
```

**5. React Performance Optimization**

```typescript
// Use React.memo for expensive components
import { memo } from 'react'

export const TargetRatingGrid = memo(function TargetRatingGrid({ targets }) {
  return (
    <div>
      {targets.map(target => (
        <TargetRow key={target.id} target={target} />
      ))}
    </div>
  )
})

// Use useMemo for expensive calculations
import { useMemo } from 'react'

export function ReviewSummary({ review }) {
  const finalScore = useMemo(() => {
    return calculateFinalScore(review.targetRatings)
  }, [review.targetRatings])
  
  return <div>Score: {finalScore}</div>
}

// Use useCallback for callback props
import { useCallback } from 'react'

export function ParentComponent() {
  const handleSubmit = useCallback((data) => {
    submitReview(data)
  }, []) // Dependencies array
  
  return <ChildComponent onSubmit={handleSubmit} />
}
```

**6. Bundle Size Optimization**

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Tree-shaking (automatic with ES modules)
# Use named imports instead of default imports
import { Button, Input } from '@/components/ui' // ✅ Good
import * as UI from '@/components/ui'           // ❌ Bad (imports everything)

# Use lightweight alternatives
# date-fns instead of moment.js (save ~200KB)
# zustand instead of redux (save ~30KB)
```

**7. Monitoring and Profiling**

```typescript
// Add performance monitoring
// src/lib/monitoring/performance.ts

export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async () => {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      logger.info('Performance metric', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('Performance metric (failed)', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

// Usage
const createReview = measurePerformance('create_review', async () => {
  return await prisma.review.create({ data: reviewData })
})

// Web Vitals tracking
// app/layout.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric)
    
    // Metrics tracked:
    // - FCP (First Contentful Paint)
    // - LCP (Largest Contentful Paint)
    // - CLS (Cumulative Layout Shift)
    // - FID (First Input Delay)
    // - TTFB (Time to First Byte)
  })
  
  return null
}
```

**8. Production Checklist**

- [ ] **HTTPS**: Enforce HTTPS in production
- [ ] **Security Headers**: Set CSP, X-Frame-Options, HSTS
- [ ] **Rate Limiting**: Implement on all API routes
- [ ] **Error Monitoring**: Integrate Sentry or similar
- [ ] **Log Aggregation**: Use Winston with external transport
- [ ] **Database Backups**: Automated daily backups
- [ ] **Environment Variables**: All secrets in environment, not code
- [ ] **Dependency Audit**: Run `npm audit` regularly
- [ ] **Bundle Analysis**: Optimize bundle size
- [ ] **Performance Testing**: Load test with expected traffic
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified

---
