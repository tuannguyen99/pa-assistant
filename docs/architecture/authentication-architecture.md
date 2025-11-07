# Authentication Architecture

## Pluggable Provider Pattern

The authentication system is designed to support **username/password** authentication now with a clear migration path to **LDAP** in the future, without requiring business logic changes.

**Architecture Layers:**

```
Application Layer (Reviews, Targets, Dashboards)
          uses
Auth Service (Abstraction Layer)
  - getCurrentUser()
  - hasRole(role)
  - canAccessReview(reviewId)
          delegates to
NextAuth.js (Provider Manager)
  - Session management
  - JWT handling
  - Provider routing
          uses configured provider

 Credentials      LDAP     
  (MVP)         (Future)   

```

## MVP Implementation (Username/Password)

**NextAuth.js Credentials Provider:**

```	ypescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/db/prisma"

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })
        
        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            roles: user.roles
          }
        }
        return null
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.roles = token.roles
      return session
    }
  },
  
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60 // 8 hours
  }
}

export default NextAuth(authOptions)
```

## Future LDAP Migration

**When switching to LDAP:** Simply uncomment the LDAP provider configuration. No business logic changes required.

```	ypescript
// Future: Add LDAP provider
import LdapProvider from "next-auth/providers/ldap"

providers: [
  LdapProvider({
    id: 'ldap',
    name: 'LDAP',
    server: {
      url: process.env.LDAP_URL,
      bindDN: process.env.LDAP_BIND_DN,
      bindCredentials: process.env.LDAP_BIND_PASSWORD,
      searchBase: process.env.LDAP_SEARCH_BASE,
      searchFilter: '(uid={{username}})'
    },
    async authorize(user) {
      // Map LDAP user to local user record
      return await syncLdapUser(user)
    }
  })
]
```

## Auth Service Abstraction

```	ypescript
// src/lib/auth/auth-service.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db/prisma"

export class AuthService {
  static async getCurrentUser() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null
    
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roleAssignments: true }
    })
  }
  
  static async hasRole(userId: string, role: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return user?.roles.includes(role) ?? false
  }
  
  static async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) return false
    
    const user = await this.getCurrentUser()
    if (!user) return false
    
    // Reviewee access
    if (review.revieweeId === userId) return true
    
    // Reviewer access
    if (review.reviewerId === userId) return true
    
    // HR Admin access (read-only)
    if (user.roles.includes('hr_admin')) return true
    
    // Delegated reviewer access
    const delegation = await prisma.roleAssignment.findFirst({
      where: {
        reviewerId: userId,
        revieweeId: review.revieweeId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ]
      }
    })
    
    return !!delegation
  }
}
```

## User Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String?  @unique  // For credentials auth
  passwordHash String?             // For credentials (nullable for LDAP)
  fullName     String
  roles        String[]            // ["employee", "manager", "hr_admin"]
  
  // LDAP fields (for future)
  ldapDN       String?  @unique   // LDAP Distinguished Name
  ldapSyncedAt DateTime?
  authProvider String   @default("credentials") // "credentials" | "ldap"
  
  managerId    String?
  manager      User?    @relation("ManagerEmployee", fields: [managerId], references: [id])
  directReports User[]  @relation("ManagerEmployee")
  
  grade        String
  department   String
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---
