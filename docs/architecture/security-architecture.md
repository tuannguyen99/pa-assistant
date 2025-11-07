# Security Architecture

## Authentication & Authorization

**Multi-Layer Security:**

1. **Authentication** - NextAuth.js with JWT tokens (8-hour expiration)
2. **Authorization** - Role-based access control (RBAC) via middleware
3. **Session Management** - Secure HTTP-only cookies
4. **Password Security** - bcrypt hashing (12 rounds)

## RBAC Implementation

**Middleware Enforcement:**

```	ypescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api') && 
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin-only routes
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      if (!token.roles?.includes('hr_admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

## Data Protection

**Encryption:**
- **At Rest:** SQLite database file-level encryption (production: PostgreSQL TDE)
- **In Transit:** HTTPS/TLS for all API communication
- **Passwords:** bcrypt hashing (12 rounds, salted)
- **JWTs:** Signed with HS256 algorithm

**Audit Logging:**
- All sensitive operations logged to \AuditEntry\ table
- Includes: actor, role, action, target, timestamp, details
- Append-only audit trail for compliance

**Historical Data Protection (NFR007):**
- Archived reviews are read-only via API enforcement
- \rchived\ flag + \rchivedAt\ timestamp + \rchivedBy\ userId
- HR Admin edits of archived data create flagged audit entries

---
