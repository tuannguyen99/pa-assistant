import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashedpassword')
  }
}))

describe('AuthService User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isHRAdmin', () => {
    it('should return true for HR Admin user', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue({
        id: '1',
        roles: ['hr_admin']
      })

      const result = await AuthService.isHRAdmin('1')
      expect(result).toBe(true)
    })

    it('should return false for non-HR Admin user', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue({
        id: '1',
        roles: ['employee']
      })

      const result = await AuthService.isHRAdmin('1')
      expect(result).toBe(false)
    })

    it('should return false if user not found', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue(null)

      const result = await AuthService.isHRAdmin('1')
      expect(result).toBe(false)
    })
  })

  describe('getAllUsers', () => {
    it('should return all users sorted by full name', async () => {
      const mockUsers = [
        { id: '1', fullName: 'Alice', email: 'alice@example.com' },
        { id: '2', fullName: 'Bob', email: 'bob@example.com' }
      ]
      ;(prisma.user.findMany as any).mockResolvedValue(mockUsers)

      const result = await AuthService.getAllUsers()
      
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { fullName: 'asc' }
      })
      expect(result).toEqual(mockUsers)
    })

    it('should return empty array on error', async () => {
      ;(prisma.user.findMany as any).mockRejectedValue(new Error('DB error'))

      const result = await AuthService.getAllUsers()
      expect(result).toEqual([])
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'Senior',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.create as any).mockResolvedValue(mockUser)

      const result = await AuthService.createUser({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'Senior',
        department: 'Engineering'
      })

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          fullName: 'Test User',
          roles: ['employee'] as any,
          grade: 'Senior',
          department: 'Engineering',
          managerId: null
        }
      })
      expect(result).toEqual(mockUser)
    })

    it('should use default values for optional fields', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'TBD',
        department: 'TBD',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.create as any).mockResolvedValue(mockUser)

      await AuthService.createUser({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        roles: ['employee']
      })

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          fullName: 'Test User',
          roles: ['employee'] as any,
          grade: 'TBD',
          department: 'TBD',
          managerId: null
        }
      })
    })

    it('should handle multiple roles', async () => {
      const mockUser = {
        id: '1',
        email: 'manager@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Manager User',
        roles: ['employee', 'manager'],
        grade: 'TBD',
        department: 'TBD',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.create as any).mockResolvedValue(mockUser)

      await AuthService.createUser({
        email: 'manager@example.com',
        password: 'password123',
        fullName: 'Manager User',
        roles: ['employee', 'manager']
      })

      const createCall = (prisma.user.create as any).mock.calls[0][0]
      expect(createCall.data.roles).toEqual(['employee', 'manager'])
    })
  })

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Updated Name',
        roles: ['employee', 'manager'],
        grade: 'Principal',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      const result = await AuthService.updateUser('1', {
        fullName: 'Updated Name',
        roles: ['employee', 'manager'],
        grade: 'Principal',
        department: 'Engineering'
      })

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          fullName: 'Updated Name',
          roles: ['employee', 'manager'] as any,
          grade: 'Principal',
          department: 'Engineering'
        }
      })
      expect(result).toEqual(mockUser)
    })

    it('should update password if provided', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'newhash',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'Senior',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      await AuthService.updateUser('1', {
        password: 'newpassword123'
      })

      const updateCall = (prisma.user.update as any).mock.calls[0][0]
      expect(updateCall.data.passwordHash).toBe('hashedpassword')
    })

    it('should not update password if not provided', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'existinghash',
        fullName: 'Updated Name',
        roles: ['employee'],
        grade: 'Senior',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      await AuthService.updateUser('1', {
        fullName: 'Updated Name'
      })

      const updateCall = (prisma.user.update as any).mock.calls[0][0]
      expect(updateCall.data.passwordHash).toBeUndefined()
    })

    it('should handle partial updates', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'Updated Grade',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      await AuthService.updateUser('1', {
        grade: 'Updated Grade'
      })

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          grade: 'Updated Grade'
        }
      })
    })
  })

  describe('registerUser (legacy method)', () => {
    it('should delegate to createUser', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        fullName: 'Test User',
        roles: ['employee'],
        grade: 'TBD',
        department: 'TBD',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.create as any).mockResolvedValue(mockUser)

      const result = await AuthService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        roles: ['employee']
      })

      expect(prisma.user.create).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['employee'],
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      const result = await AuthService.deactivateUser('1')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false }
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('reactivateUser', () => {
    it('should reactivate a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['employee'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.user.update as any).mockResolvedValue(mockUser)

      const result = await AuthService.reactivateUser('1')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: true }
      })
      expect(result).toEqual(mockUser)
    })
  })
})