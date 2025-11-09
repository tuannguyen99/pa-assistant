import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from './lib/prisma'

declare module 'next-auth' {
  interface User {
    roles: string[]
  }
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[]
  }
}

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)
          if (!user || !user.isActive) return null
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash || '')

          if (passwordsMatch) {
            // Parse roles to ensure it's an array
            let roles: string[] = []
            if (Array.isArray(user.roles)) {
              roles = user.roles as string[]
            } else if (typeof user.roles === 'string') {
              try {
                roles = JSON.parse(user.roles)
                if (!Array.isArray(roles)) {
                  roles = []
                }
              } catch (e) {
                console.error('Failed to parse roles JSON in auth config:', e)
                roles = []
              }
            } else if (user.roles && typeof user.roles === 'object') {
              // Handle other JSON cases
              roles = []
            }

            return {
              ...user,
              roles: roles
            }
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (token.roles) {
        session.user.roles = token.roles
      }
      return session
    },
  },
}
