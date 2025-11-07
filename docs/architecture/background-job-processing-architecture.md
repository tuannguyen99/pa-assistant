# Background Job Processing Architecture

## Overview

pa-system uses a background job processing system for async tasks that would otherwise block HTTP requests or require long processing times. This architecture ensures responsive UX and scalability.

## Background Job Use Cases

| Task | Trigger | Processing Time | Priority |
|------|---------|-----------------|----------|
| **Email Notifications** | Review state transitions | 2-5 seconds | High |
| **PDF Report Generation** | HR export request | 10-60 seconds | Medium |
| **Multi-Year Analytics** | Dashboard load (>1000 reviews) | 5-30 seconds | Medium |
| **Database Backups** | Scheduled (daily) | 1-10 minutes | Low |
| **Bulk User Import** | CSV upload | 30-300 seconds | Medium |
| **Review Archive** | Fiscal year close | 5-60 minutes | Low |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BACKGROUND JOB PROCESSING ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Web Request (User Action)                                                 │
│  • Manager clicks "Submit to HR"                                           │
│  • HR clicks "Generate Report"                                             │
│  • Admin uploads CSV file                                                  │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  API Route Handler                                                         │
│  1. Validate request                                                       │
│  2. Enqueue job to Redis/database                                          │
│  3. Return job ID immediately (< 100ms)                                    │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Job Queue (Redis or Database)                                             │
│  • Job ID, type, payload, status                                           │
│  • Priority queues (high/medium/low)                                       │
│  • Retry configuration                                                     │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Job Worker Process(es)                                                    │
│  • Polls queue for pending jobs                                            │
│  • Executes job logic                                                      │
│  • Updates job status (processing → completed/failed)                      │
│  • Sends notifications on completion                                       │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Completion                                                                │
│  • User polls job status via API                                           │
│  • Real-time notification (optional)                                       │
│  • Download result (for reports)                                           │
└────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Strategy

**Phase 1: Simple Database Queue (MVP)**

For MVP with <200 users, use a simple database-backed queue:

```typescript
// src/lib/jobs/job-queue.ts
import { prisma } from '@/lib/db/prisma'

export type JobType = 
  | 'email_notification'
  | 'generate_report'
  | 'bulk_import'
  | 'archive_reviews'

export interface JobPayload {
  type: JobType
  data: Record<string, any>
  userId: string
}

export class SimpleJobQueue {
  // Enqueue job
  static async enqueue(payload: JobPayload): Promise<string> {
    const job = await prisma.job.create({
      data: {
        type: payload.type,
        payload: JSON.stringify(payload.data),
        userId: payload.userId,
        status: 'pending',
        priority: this.getPriority(payload.type),
        createdAt: new Date()
      }
    })
    
    return job.id
  }
  
  // Get job status
  static async getStatus(jobId: string) {
    return await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        type: true,
        status: true,
        result: true,
        error: true,
        createdAt: true,
        startedAt: true,
        completedAt: true
      }
    })
  }
  
  // Worker: Process next job
  static async processNext(): Promise<boolean> {
    const job = await prisma.job.findFirst({
      where: { status: 'pending' },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    })
    
    if (!job) return false
    
    // Mark as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'processing', startedAt: new Date() }
    })
    
    try {
      // Execute job
      const result = await this.executeJob(job)
      
      // Mark as completed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          result: JSON.stringify(result),
          completedAt: new Date()
        }
      })
      
      return true
    } catch (error) {
      // Mark as failed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date()
        }
      })
      
      throw error
    }
  }
  
  private static async executeJob(job: any) {
    const payload = JSON.parse(job.payload)
    
    switch (job.type) {
      case 'email_notification':
        return await EmailService.send(payload)
      
      case 'generate_report':
        return await ReportService.generate(payload)
      
      case 'bulk_import':
        return await ImportService.processCSV(payload)
      
      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  }
  
  private static getPriority(type: JobType): number {
    const priorities = {
      email_notification: 10,
      generate_report: 5,
      bulk_import: 5,
      archive_reviews: 1
    }
    return priorities[type] || 5
  }
}

// Database schema addition (prisma/schema.prisma)
model Job {
  id          String   @id @default(cuid())
  type        String
  payload     String   // JSON
  userId      String
  status      String   @default("pending") // pending, processing, completed, failed
  priority    Int      @default(5)
  result      String?  // JSON
  error       String?
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  
  @@index([status, priority, createdAt])
}
```

**Worker Script:**

```typescript
// scripts/job-worker.ts
import { SimpleJobQueue } from '@/lib/jobs/job-queue'
import { logger } from '@/lib/logger'

async function worker() {
  logger.info('Job worker started')
  
  while (true) {
    try {
      const processed = await SimpleJobQueue.processNext()
      
      if (!processed) {
        // No jobs available, wait before polling again
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    } catch (error) {
      logger.error('Job processing error', { error })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

worker()
```

**Usage in API Routes:**

```typescript
// app/api/reviews/[id]/submit-to-hr/route.ts
import { SimpleJobQueue } from '@/lib/jobs/job-queue'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Enqueue notification job
  const jobId = await SimpleJobQueue.enqueue({
    type: 'email_notification',
    data: {
      reviewId: params.id,
      recipientRole: 'hr_admin',
      subject: 'New review submitted for HR review'
    },
    userId: session.user.id
  })
  
  return NextResponse.json({
    success: true,
    message: 'Review submitted successfully',
    jobId // Client can poll this for status
  })
}

// app/api/jobs/[id]/route.ts
export async function GET(request: NextRequest, { params }) {
  const status = await SimpleJobQueue.getStatus(params.id)
  return NextResponse.json({ success: true, data: status })
}
```

**Phase 2: Bull/BullMQ with Redis (Production)**

For production with >200 users or high job volume, upgrade to Bull/BullMQ:

```bash
npm install bullmq ioredis
```

```typescript
// src/lib/jobs/bull-queue.ts
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
})

export const emailQueue = new Queue('email', { connection })
export const reportQueue = new Queue('reports', { connection })

// Worker
export const emailWorker = new Worker('email', async (job) => {
  const { reviewId, recipientRole, subject } = job.data
  // Send email logic
}, { connection })
```

## Performance Thresholds

**When to Use Background Jobs:**

- ❌ **Sync**: Operations < 2 seconds (simple database queries)
- ⚠️ **Consider**: Operations 2-5 seconds (complex queries, single emails)
- ✅ **Required**: Operations > 5 seconds (PDF generation, bulk operations)

---
