import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}))

describe('AuthService.hasRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true if user has the role', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({
      roles: ['employee', 'hr_admin']
    })

    const result = await AuthService.hasRole('user-id', 'hr_admin')
    expect(result).toBe(true)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      select: { roles: true }
    })
  })

  it('should return false if user does not have the role', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({
      roles: ['employee']
    })

    const result = await AuthService.hasRole('user-id', 'hr_admin')
    expect(result).toBe(false)
  })

  it('should return false if user has no roles', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({
      roles: []
    })

    const result = await AuthService.hasRole('user-id', 'hr_admin')
    expect(result).toBe(false)
  })

  it('should return false if user not found', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)

    const result = await AuthService.hasRole('user-id', 'hr_admin')
    expect(result).toBe(false)
  })

  it('should handle database errors', async () => {
    ;(prisma.user.findUnique as any).mockRejectedValue(new Error('DB error'))

    const result = await AuthService.hasRole('user-id', 'hr_admin')
    expect(result).toBe(false)
  })
})