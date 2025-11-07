# Frontend Architecture

This section provides a comprehensive view of the frontend architecture, built on Next.js 14+ App Router with React Server Components and modern patterns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           Browser Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │  React Client  │  │    Zustand     │  │ TanStack Query │              │
│  │   Components   │  │  State Manager │  │  Cache Layer   │              │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘              │
│           │                   │                    │                       │
│           └───────────────────┴────────────────────┘                       │
│                               │                                            │
│                    Client-Side JavaScript                                  │
│                    (Minimal, only for interactivity)                       │
│                                                                             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                        Next.js Server Layer                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                  React Server Components (RSC)                        │ │
│  │  - Server-side rendering                                              │ │
│  │  - Direct database queries via Prisma                                 │ │
│  │  - Zero JavaScript to client                                          │ │
│  │  - Automatic code splitting                                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     App Router (File-based routing)                   │ │
│  │                                                                       │ │
│  │  app/                                                                 │ │
│  │  ├── (auth)/                  ← Route groups                         │ │
│  │  │   ├── login/page.tsx       ← Public routes                        │ │
│  │  │   └── logout/page.tsx                                             │ │
│  │  │                                                                    │ │
│  │  └── (dashboard)/             ← Protected routes                     │ │
│  │      ├── layout.tsx           ← Shared layout                        │ │
│  │      ├── dashboard/                                                  │ │
│  │      │   ├── employee/page.tsx                                       │ │
│  │      │   ├── manager/page.tsx                                        │ │
│  │      │   └── hr-consolidation/page.tsx                               │ │
│  │      │                                                                │ │
│  │      ├── targets/                                                    │ │
│  │      │   ├── new/page.tsx                                            │ │
│  │      │   └── [id]/page.tsx                                           │ │
│  │      │                                                                │ │
│  │      └── reviews/                                                    │ │
│  │          ├── [id]/page.tsx                                           │ │
│  │          └── archived/[id]/page.tsx                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       Middleware Layer                                │ │
│  │  - Authentication check (NextAuth.js)                                │ │
│  │  - RBAC enforcement                                                  │ │
│  │  - Route protection                                                  │ │
│  │  - Role validation                                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Rendering Strategy

**Server Components (Default)**
- Used for: Layouts, page shells, data display, static content
- Benefits: Zero JavaScript, faster initial load, better SEO
- Data fetching: Direct Prisma queries in component

```typescript
// app/(dashboard)/reviews/[id]/page.tsx
import { prisma } from '@/lib/db/prisma'

export default async function ReviewPage({ params }) {
  // Server-side data fetching
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { reviewee: true, reviewer: true }
  })
  
  // Render on server, send HTML to client
  return <ReviewDetails review={review} />
}
```

**Client Components ('use client')**
- Used for: Forms, modals, interactive widgets, state management
- Benefits: Rich interactivity, real-time updates, animations
- When to use: onClick, onChange, useState, useEffect

```typescript
// src/components/reviews/review-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function ReviewForm({ initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({ defaultValues: initialData })
  
  // Client-side interactivity
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

## State Management Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT LAYERS                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Server State (TanStack Query)                                             │
│  - API responses cached                                                    │
│  - Automatic refetching                                                    │
│  - Optimistic updates                                                      │
│  - Background sync                                                         │
│                                                                            │
│  Example: Reviews list, user data, target settings                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Global Client State (Zustand)                                             │
│  - Role switching (employee/manager/hr_admin)                              │
│  - Modal open/close state                                                 │
│  - Theme preferences                                                       │
│  - Notification state                                                      │
│                                                                            │
│  Example: currentRole, isModalOpen, theme                                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Local Component State (useState)                                          │
│  - Form input values                                                       │
│  - UI toggles                                                              │
│  - Temporary selections                                                    │
│                                                                            │
│  Example: searchQuery, isExpanded, selectedTab                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  URL State (Next.js Router)                                                │
│  - Filters, pagination                                                     │
│  - Search parameters                                                       │
│  - Shareable state                                                         │
│                                                                            │
│  Example: ?page=2&status=pending&role=manager                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Fetching Patterns

**Pattern 1: Server Component Direct Query**
```typescript
// Best for: Initial page load, SEO-critical content
export default async function Page() {
  const data = await prisma.review.findMany()
  return <List data={data} />
}
```

**Pattern 2: Client Component with TanStack Query**
```typescript
// Best for: Interactive lists, real-time updates, infinite scroll
'use client'
import { useQuery } from '@tanstack/react-query'

export function ReviewList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => fetch('/api/reviews').then(r => r.json())
  })
  
  if (isLoading) return <Skeleton />
  return <List data={data} />
}
```

**Pattern 3: Server Component + Client Component Composition**
```typescript
// Best for: Combining static shell with dynamic content
// page.tsx (Server Component)
export default async function Page() {
  const staticData = await prisma.fiscalYear.findMany()
  
  return (
    <>
      <StaticHeader data={staticData} />
      <DynamicReviewList /> {/* Client Component */}
    </>
  )
}
```

## Styling Architecture

**Tailwind CSS + shadcn/ui System**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STYLING LAYERS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Design Tokens (tailwind.config.js)                               │
│  - Colors: primary, secondary, accent, muted                               │
│  - Spacing: 4px base unit                                                  │
│  - Typography: font families, sizes, weights                               │
│  - Breakpoints: sm, md, lg, xl, 2xl                                        │
│  - Animation: duration, easing                                             │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 2: Component Primitives (shadcn/ui)                                 │
│  - Button, Input, Select, Dialog                                           │
│  - Table, Card, Badge, Avatar                                              │
│  - Pre-configured with accessibility                                       │
│  - Customizable via className                                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 3: Composite Components                                             │
│  - ReviewCard, TargetGrid, DashboardWidget                                 │
│  - Built from primitives                                                   │
│  - Domain-specific styling                                                 │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Layer 4: Glassmorphism Theme                                              │
│  - Backdrop blur effects                                                   │
│  - Translucent surfaces                                                    │
│  - Gradient overlays                                                       │
│  - Modern aesthetic                                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

**Example Implementation:**
```typescript
// Glassmorphism card component
<div className="
  backdrop-blur-md
  bg-white/80 dark:bg-gray-900/80
  border border-white/20
  shadow-xl
  rounded-xl
  p-6
">
  <h2 className="text-2xl font-semibold mb-4">Review Details</h2>
  <ReviewContent />
</div>
```

## Form Handling Architecture

```typescript
// Complete form pattern with React Hook Form + Zod
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define validation schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  explanation: z.string().min(50).max(1000)
})

// 2. Infer TypeScript types
type ReviewFormData = z.infer<typeof reviewSchema>

// 3. Form component
export function ReviewForm() {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 3, explanation: '' }
  })
  
  // 4. Submit handler
  const onSubmit = async (data: ReviewFormData) => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      toast.success('Review submitted')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <RatingStars {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}
```

## Error Handling & Loading States

**Error Boundaries:**
```typescript
// app/error.tsx - Route-level error boundary
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

**Loading States:**
```typescript
// app/loading.tsx - Route-level loading UI
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

**Suspense Boundaries:**
```typescript
// Granular loading for specific components
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header /> {/* Loads immediately */}
      
      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewList /> {/* Streams in when ready */}
      </Suspense>
    </>
  )
}
```

## Frontend Performance Optimizations

1. **Code Splitting**: Automatic via Next.js App Router
2. **Image Optimization**: `next/image` with lazy loading
3. **Font Optimization**: `next/font` for self-hosted fonts
4. **Route Prefetching**: Links prefetch on hover
5. **Bundle Analysis**: `@next/bundle-analyzer`

```typescript
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/charts/performance-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Don't render on server
})
```

---
