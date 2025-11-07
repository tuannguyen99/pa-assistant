# Deployment Architecture

## Overview

The pa-assistant deployment architecture supports both MVP (pilot with 10 users) and production (200+ users) scenarios with clear migration paths. The architecture emphasizes simplicity for MVP while maintaining production-readiness.

---

## Production Deployment Configuration

This section provides complete production-ready deployment configuration including Docker, Nginx, security hardening, and monitoring setup.

### Production Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   Internet/LAN  │
                         └────────┬────────┘
                                  │ HTTPS (443)
                                  │
                         ┌────────▼────────┐
                         │  Load Balancer  │
                         │  (Nginx/HAProxy)│
                         │  - SSL Termination
                         │  - Health Checks │
                         │  - Rate Limiting │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
     │  App Server 1   │ │  App Server 2  │ │  App Server 3  │
     │  Next.js + PM2  │ │  Next.js + PM2 │ │  Next.js + PM2 │
     │  Port 3000      │ │  Port 3000     │ │  Port 3000     │
     └────────┬────────┘ └───────┬────────┘ └───────┬────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │   (Managed DB)  │
                        │   - Primary DB  │
                        │   - Read Replica│
                        │   - Auto Backup │
                        └─────────────────┘

     ┌─────────────────┐         ┌─────────────────┐
     │  Redis Cluster  │         │  File Storage   │
     │  (Cache/Session)│         │  (Backups/Logs) │
     └─────────────────┘         └─────────────────┘
```

### Docker Compose Production Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: pa-assistant:latest
    build:
      context: .
      dockerfile: Dockerfile.prod
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        max_attempts: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://pa_user:${DB_PASSWORD}@postgres:5432/pa_system
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://${DOMAIN}
    volumes:
      - app-logs:/app/logs
    networks:
      - pa-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=pa_system
      - POSTGRES_USER=pa_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - pa-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pa_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - pa-network

networks:
  pa-network:
    driver: bridge

volumes:
  postgres-data:
  app-logs:
```

### Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Nginx Production Configuration

```nginx
# nginx/nginx.conf
http {
    upstream nextjs_backend {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Strict-Transport-Security "max-age=31536000" always;

        location / {
            proxy_pass http://nextjs_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Security Hardening Checklist

- [ ] SSL/TLS certificate installed and configured
- [ ] All secrets in environment variables
- [ ] Database password strong (32+ characters)
- [ ] Rate limiting enabled (10 req/s per IP)
- [ ] CORS restricted to your domain
- [ ] Security headers configured
- [ ] Firewall: only ports 80, 443, 22 open
- [ ] SSH: key-based authentication only
- [ ] OS and dependencies up to date
- [ ] Daily automated backups configured
- [ ] Health checks and monitoring active
- [ ] Root access disabled

### Deployment Commands

```bash
# 1. Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 2. Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 3. Check health
curl https://your-domain.com/api/health

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## Deployment Environments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ENVIRONMENTS                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Development (Local)                                                       │
├────────────────────────────────────────────────────────────────────────────┤
│  • Next.js Dev Server (localhost:3000)                                     │
│  • SQLite database (./dev.db)                                              │
│  • Hot reload, debugging enabled                                           │
│  • Mock Ollama or web-based AI                                             │
│  • No SSL required                                                          │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Staging (Optional)                                                        │
├────────────────────────────────────────────────────────────────────────────┤
│  • Docker container or VM                                                  │
│  • SQLite or PostgreSQL                                                    │
│  • Production build, no hot reload                                         │
│  • SSL certificate (Let's Encrypt)                                         │
│  • Used for UAT and integration testing                                    │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Production (MVP) - Phase 1: Pilot (10 users)                             │
├────────────────────────────────────────────────────────────────────────────┤
│  • Single server deployment (VM or Docker)                                 │
│  • SQLite database with daily backups                                      │
│  • Nginx reverse proxy                                                     │
│  • SSL certificate (Let's Encrypt or company cert)                         │
│  • Ollama on same server (optional)                                        │
│  • Basic monitoring (PM2 or systemd)                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Production (Scale) - Phase 2: Full Rollout (200+ users)                  │
├────────────────────────────────────────────────────────────────────────────┤
│  • Multi-server or container orchestration (Kubernetes)                    │
│  • PostgreSQL (managed service or dedicated server)                        │
│  • Load balancer (HAProxy, Nginx, or cloud LB)                            │
│  • Redis for session storage (optional)                                    │
│  • Ollama on dedicated GPU server (optional)                               │
│  • Full monitoring stack (Prometheus, Grafana)                             │
│  • Log aggregation (ELK or cloud logging)                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

## MVP Deployment (Single Server)

**Architecture Diagram:**

```
                              ┌─────────────────┐
                              │  Internet/LAN   │
                              └────────┬────────┘
                                       │ HTTPS (443)
                                       │
                              ┌────────▼────────┐
                              │  Nginx Reverse  │
                              │     Proxy       │
                              │  - SSL Termination
                              │  - Static Assets │
                              │  - Rate Limiting │
                              └────────┬────────┘
                                       │ HTTP (3000)
                                       │
┌──────────────────────────────────────▼───────────────────────────────────┐
│                          Application Server (VM/Docker)                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Next.js Application (PM2 Process Manager)                         │ │
│  │  - Port 3000                                                        │ │
│  │  - NODE_ENV=production                                             │ │
│  │  - 2-4 instances (cluster mode)                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  SQLite Database                                                   │ │
│  │  - /var/lib/pa-assistant/production.db                             │ │
│  │  - Daily backups to /backups/                                      │ │
│  │  - Write-ahead logging (WAL) enabled                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Ollama AI Service (Optional)                                      │ │
│  │  - Port 11434 (localhost only)                                     │ │
│  │  - llama2 model loaded                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Monitoring                                                        │ │
│  │  - PM2 monitoring dashboard                                        │ │
│  │  - Winston logs (/var/log/pa-assistant/)                          │ │
│  │  - Disk space monitoring                                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Server Requirements (MVP):**

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 2 cores | 4 cores | More cores for Ollama |
| **RAM** | 4 GB | 8 GB | 16 GB if running Ollama |
| **Storage** | 20 GB | 50 GB | 100 GB if running Ollama |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04 LTS | Or equivalent Linux |
| **Network** | 100 Mbps | 1 Gbps | Low latency preferred |

## Production Deployment (Scaled)

**Architecture Diagram:**

```
                         ┌─────────────────┐
                         │  Internet/LAN   │
                         └────────┬────────┘
                                  │ HTTPS (443)
                                  │
                         ┌────────▼────────┐
                         │  Load Balancer  │
                         │  (HAProxy/ALB)  │
                         │  - SSL Term     │
                         │  - Health Check │
                         │  - Session Affinity
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
     │   App Server 1  │ │  App Server 2  │ │  App Server 3  │
     │   Next.js (PM2) │ │  Next.js (PM2) │ │  Next.js (PM2) │
     │   Port 3000     │ │  Port 3000     │ │  Port 3000     │
     └────────┬────────┘ └───────┬────────┘ └───────┬────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │   (Managed DB)  │
                        │   - Primary     │
                        │   - Read Replica│
                        │   - Auto Backup │
                        └─────────────────┘

     ┌─────────────────┐         ┌─────────────────┐
     │  Redis Cluster  │         │  Ollama Server  │
     │  (Session Store)│         │  (GPU Enabled)  │
     │  - 3 nodes      │         │  - Port 11434   │
     │  - Sentinel     │         │  - LLaMA model  │
     └─────────────────┘         └─────────────────┘

     ┌──────────────────────────────────────────────┐
     │          Monitoring & Logging                │
     │  - Prometheus (metrics)                      │
     │  - Grafana (dashboards)                      │
     │  - ELK Stack (logs)                          │
     │  - AlertManager (alerts)                     │
     └──────────────────────────────────────────────┘
```

## Container Deployment (Docker)

**Docker Compose Configuration:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/data/production.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - ollama
    networks:
      - pa-assistant-network

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./ollama-models:/root/.ollama
    restart: unless-stopped
    networks:
      - pa-assistant-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/usr/share/nginx/html:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - pa-assistant-network

networks:
  pa-assistant-network:
    driver: bridge

volumes:
  data:
  logs:
  ollama-models:
```

**Dockerfile:**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Kubernetes Deployment (Advanced)

**Kubernetes Manifests:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pa-assistant
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pa-assistant
  template:
    metadata:
      labels:
        app: pa-assistant
    spec:
      containers:
      - name: app
        image: your-registry/pa-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: pa-assistant-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: pa-assistant-secrets
              key: nextauth-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pa-assistant-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: pa-assistant
  ports:
  - port: 80
    targetPort: 3000

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pa-assistant-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - pa-assistant.company.com
    secretName: pa-assistant-tls
  rules:
  - host: pa-assistant.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pa-assistant-service
            port:
              number: 80
```

## Nginx Configuration

```nginx
# nginx.conf
upstream pa_assistant {
    # Least connections load balancing
    least_conn;
    
    server app:3000 max_fails=3 fail_timeout=30s;
    # Add more servers for scaled deployment:
    # server app2:3000 max_fails=3 fail_timeout=30s;
    # server app3:3000 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

server {
    listen 80;
    server_name pa-assistant.company.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pa-assistant.company.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/pa-assistant-access.log;
    error_log /var/log/nginx/pa-assistant-error.log;

    # Static files (Next.js _next/static)
    location /_next/static {
        proxy_pass http://pa_assistant;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # API routes with rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=5 nodelay;
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main application
    location / {
        proxy_pass http://pa_assistant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://pa_assistant/api/health;
    }
}
```

## Database Backup Strategy

**SQLite Backup Script:**

```bash
#!/bin/bash
# backup-sqlite.sh

BACKUP_DIR="/backups/pa-assistant"
DB_PATH="/var/lib/pa-assistant/production.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
sqlite3 $DB_PATH ".backup '$BACKUP_FILE'"

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Crontab Entry:**

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-sqlite.sh >> /var/log/pa-assistant-backup.log 2>&1
```

**PostgreSQL Backup:**

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/pa-assistant"
DB_NAME="pa_assistant"
DB_USER="pa_assistant_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

## Monitoring Setup

**PM2 Ecosystem File:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pa-assistant',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data']
  }]
}
```

**Health Check Endpoint:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check disk space (optional)
    const diskUsage = process.memoryUsage()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(diskUsage.heapUsed / 1024 / 1024),
        total: Math.round(diskUsage.heapTotal / 1024 / 1024)
      },
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
```

## CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t pa-assistant:${{ github.sha }} .
          docker tag pa-assistant:${{ github.sha }} pa-assistant:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push pa-assistant:${{ github.sha }}
          docker push pa-assistant:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/pa-assistant
            docker-compose pull
            docker-compose up -d --no-deps app
            docker-compose exec app npx prisma migrate deploy
```

## Environment Variables

**Production .env Template:**

```bash
# .env.production
# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pa_assistant"
# Or for SQLite: DATABASE_URL="file:/data/production.db"

# Authentication
NEXTAUTH_URL="https://pa-assistant.company.com"
NEXTAUTH_SECRET="your-32-character-secret-key-here"

# AI Integration
AI_MODE="local"  # or "web"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# LDAP (if applicable)
LDAP_URL="ldap://ldap.company.com:389"
LDAP_BIND_DN="cn=admin,dc=company,dc=com"
LDAP_BIND_PASSWORD="your-ldap-password"
LDAP_SEARCH_BASE="ou=users,dc=company,dc=com"

# Logging
LOG_LEVEL="info"
LOG_DIR="/var/log/pa-assistant"

# Feature Flags
ENABLE_AI_ASSISTANCE=true
ENABLE_DELEGATION=true
ENABLE_COMPANY_GOALS=true
```

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy tested
- [ ] Monitoring configured
- [ ] Load testing completed

**Deployment:**
- [ ] Deploy to staging first
- [ ] Run database migrations
- [ ] Verify health check endpoint
- [ ] Check application logs
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify backup job running

**Post-Deployment:**
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify database connections
- [ ] Test from different networks
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review

## Rollback Strategy

**Quick Rollback Steps:**

```bash
# Docker deployment
docker-compose down
docker-compose up -d --scale app=0  # Stop all app containers
docker tag pa-assistant:previous pa-assistant:latest
docker-compose up -d

# PM2 deployment
pm2 stop pa-assistant
git checkout previous-release-tag
npm ci
npm run build
npx prisma migrate deploy
pm2 restart pa-assistant

# Database rollback
# Use Prisma migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

## Disaster Recovery

**Recovery Time Objectives (RTO):**
- MVP: 4 hours
- Production: 1 hour

**Recovery Point Objectives (RPO):**
- MVP: 24 hours (daily backups)
- Production: 15 minutes (continuous replication)

**Disaster Recovery Plan:**

1. **Database Corruption:**
   - Restore from last backup
   - Replay transaction logs (PostgreSQL)
   - Verify data integrity

2. **Server Failure:**
   - Spin up new server from backup
   - Restore database
   - Update DNS if needed
   - Verify application health

3. **Data Center Outage:**
   - Failover to secondary region
   - Update DNS to point to backup
   - Restore from off-site backups

---
