import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUser, authOptions } from '../../src/auth.config'

// Mock prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn()
  }
}

vi.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUser function', () => {
    it('should return user for valid email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User'
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      
      const result = await getUser('test@example.com')
      
      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
    })

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      
      const result = await getUser('nonexistent@example.com')
      
      expect(result).toBeNull()
    })

    it('should throw error on database error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB Error'))
      
      await expect(getUser('test@example.com')).rejects.toThrow('Failed to fetch user.')
    })
  })

  describe('authOptions configuration', () => {
    it('should have correct pages configuration', () => {
      expect(authOptions.pages?.signIn).toBe('/login')
    })

    it('should have credentials provider', () => {
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].name).toBe('Credentials')
    })

    it('should use jwt session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })
  })
})