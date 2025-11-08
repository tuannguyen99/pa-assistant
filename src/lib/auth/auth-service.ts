import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'
import bcrypt from 'bcrypt'

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

      // Parse roles to ensure it's an array
      let roles: string[] = []
      if (Array.isArray(user.roles)) {
        roles = user.roles
      } else if (typeof user.roles === 'string') {
        try {
          roles = JSON.parse(user.roles)
          if (!Array.isArray(roles)) {
            roles = []
          }
        } catch (e) {
          console.error('Failed to parse roles JSON in hasRole:', e)
          roles = []
        }
      } else if (user.roles) {
        roles = [user.roles].filter(Boolean)
      }

      return roles.includes(role)
    } catch (error) {
      console.error('Failed to check role:', error)
      return false
    }
  }

  static async isHRAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'hr_admin')
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { fullName: 'asc' }
      })
      return users
    } catch (error) {
      console.error('Failed to get all users:', error)
      return []
    }
  }

  static async createUser(data: {
    email: string
    password: string
    fullName: string
    roles: string[]
    grade?: string
    department?: string
    employeeId?: string
  }): Promise<User> {
    const { email, password, fullName, roles, grade, department, employeeId } = data

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        roles: roles as any,
        grade: grade || 'TBD',
        department: department || 'TBD',
        employeeId: employeeId || undefined
      }
    })

    return user
  }

  static async updateUser(
    userId: string,
    data: {
      fullName?: string
      roles?: string[]
      grade?: string
      department?: string
      password?: string
      employeeId?: string
    }
  ): Promise<User> {
    const updateData: any = {}

    if (data.fullName) updateData.fullName = data.fullName
    if (data.roles) updateData.roles = data.roles as any
    if (data.grade !== undefined) updateData.grade = data.grade
    if (data.department !== undefined) updateData.department = data.department
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return user
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

  // Legacy method for backward compatibility - delegates to createUser
  static async registerUser(data: {
    email: string
    password: string
    fullName: string
    roles: string[]
  }): Promise<User> {
    return this.createUser(data)
  }
}