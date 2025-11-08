import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}))

describe('AuthService.registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register a user successfully', async () => {
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

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        passwordHash: expect.any(String), // Should be hashed
        fullName: 'Test User',
        roles: ['employee'] as any,
        grade: 'TBD',
        department: 'TBD'
      }
    })
    expect(result).toEqual(mockUser)
  })

  it('should hash the password', async () => {
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

    await AuthService.registerUser({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      roles: ['employee']
    })

    const createCall = (prisma.user.create as any).mock.calls[0][0]
    expect(createCall.data.passwordHash).not.toBe('password123')
    // Should be hashed (bcrypt hash is longer)
    expect(createCall.data.passwordHash.length).toBeGreaterThan(10)
  })

  it('should handle database errors', async () => {
    ;(prisma.user.create as any).mockRejectedValue(new Error('Database error'))

    await expect(AuthService.registerUser({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      roles: ['employee']
    })).rejects.toThrow('Database error')
  })
})