# Monitoring and Observability Architecture

## Overview

Comprehensive monitoring ensures system health, performance tracking, and rapid incident response.

## Observability Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Application Layer (pa-system)                                             │
│  • Winston logger (structured JSON logs)                                   │
│  • Custom metrics (request duration, error rates)                          │
│  • Health check endpoint (/api/health)                                     │
└────────────┬───────────────────────────────────────────────────────────────┘
             │
             ├─────────────────┬─────────────────┬─────────────────┐
             │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │   Logging    │  │   Metrics    │  │   Traces     │  │   Alerts     │
     │   (Logs)     │  │ (Time-series)│  │  (Spans)     │  │ (Incidents)  │
     └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
            │                 │                  │                 │
            ▼                 ▼                  ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  ELK Stack   │  │  Prometheus  │  │   Jaeger     │  │AlertManager │
     │  or Loki     │  │  + Grafana   │  │  (optional)  │  │  + Email    │
     └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Application Logging

**Structured Logging with Winston:**

```typescript
// src/lib/monitoring/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'pa-assistant',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  },
  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
})

// Log levels: error, warn, info, debug
logger.info('User logged in', { userId: '123', email: 'user@example.com' })
logger.error('Database connection failed', { error: error.message })
```

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      memory: {},
      uptime: 0
    }
  }
  
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = 'healthy'
  } catch (error) {
    checks.checks.database = 'unhealthy'
    checks.status = 'unhealthy'
  }
  
  // Memory check
  const memUsage = process.memoryUsage()
  checks.checks.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  }
  
  // Uptime
  checks.checks.uptime = Math.round(process.uptime())
  
  const statusCode = checks.status === 'healthy' ? 200 : 503
  return NextResponse.json(checks, { status: statusCode })
}
```

## Metrics Collection

```typescript
// src/lib/monitoring/metrics.ts
export class Metrics {
  private static metrics: Map<string, number[]> = new Map()
  
  // Record request duration
  static recordRequest(path: string, method: string, duration: number, status: number) {
    logger.info('Request completed', {
      type: 'metric',
      metric: 'http_request_duration_ms',
      path,
      method,
      duration,
      status
    })
  }
  
  // Record database query
  static recordQuery(operation: string, duration: number) {
    logger.info('Database query', {
      type: 'metric',
      metric: 'db_query_duration_ms',
      operation,
      duration
    })
  }
  
  // Record error
  static recordError(error: Error, context?: Record<string, any>) {
    logger.error('Error occurred', {
      type: 'error',
      message: error.message,
      stack: error.stack,
      ...context
    })
  }
}

// Middleware to measure request duration
// middleware.ts
import { Metrics } from '@/lib/monitoring/metrics'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  return NextResponse.next({
    onAfterResponse(response) {
      const duration = Date.now() - startTime
      Metrics.recordRequest(
        request.nextUrl.pathname,
        request.method,
        duration,
        response.status
      )
    }
  })
}
```

## Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **Response Time** | > 2s | > 5s | Scale app servers |
| **Error Rate** | > 1% | > 5% | Investigate errors immediately |
| **Database CPU** | > 70% | > 90% | Optimize queries or scale DB |
| **Memory Usage** | > 80% | > 95% | Restart or scale |
| **Disk Space** | < 20% free | < 10% free | Clean logs or expand storage |
| **Health Check Fails** | 2 consecutive | 3 consecutive | Restart service, notify on-call |

## Monitoring Dashboard (Grafana)

**Key Panels:**

1. **System Overview**
   - Active users count
   - Reviews in progress
   - API request rate (req/s)
   - Average response time

2. **Performance**
   - 95th percentile response time
   - Database query duration
   - Cache hit rate

3. **Errors**
   - Error rate (errors/min)
   - Top error types
   - Failed background jobs

4. **Infrastructure**
   - CPU usage per server
   - Memory usage per server
   - Database connections
   - Disk I/O

## Log Aggregation Setup

**Using Loki (Lightweight Alternative to ELK):**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  loki-data:
  grafana-data:
```

---
