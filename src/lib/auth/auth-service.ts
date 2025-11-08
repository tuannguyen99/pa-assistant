import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) return null

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      return user
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  static async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { roles: true }
      })
      if (!user?.roles) return false

      const roles = user.roles as string[]
      return roles.includes(role)
    } catch (error) {
      console.error('Failed to check role:', error)
      return false
    }
  }

  static async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { roles: true, id: true }
      })
      if (!user) return false

      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { revieweeId: true, reviewerId: true }
      })
      if (!review) return false

      // HR Admin can access all
      if (await this.hasRole(userId, 'hr_admin')) return true

      // Managers can access their direct reports' reviews
      if (await this.hasRole(userId, 'manager')) {
        const isManager = await prisma.user.findFirst({
          where: {
            id: review.revieweeId,
            managerId: userId
          }
        })
        if (isManager) return true
      }

      // Users can access their own reviews
      if (review.revieweeId === userId || review.reviewerId === userId) return true

      return false
    } catch (error) {
      console.error('Failed to check review access:', error)
      return false
    }
  }

  static async registerUser(data: {
    email: string
    password: string
    fullName: string
    roles: string[]
  }): Promise<User> {
    const { email, password, fullName, roles } = data

    // Hash password
    const bcrypt = await import('bcrypt')
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        roles: roles as any,
        grade: 'TBD', // Default
        department: 'TBD' // Default
      }
    })

    return user
  }
}