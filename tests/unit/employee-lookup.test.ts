import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/users/[id]/route'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/auth/auth-service')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}))

describe('Employee Lookup API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users/[id]', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/users/EMP001')
      const response = await GET(request, { params: { id: 'EMP001' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should find user by employeeId', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      const mockUser = {
        id: '2',
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        grade: 'Senior',
        department: 'Engineering',
        jobTitle: 'Senior Engineer',
        employmentStatus: 'active',
        managerId: '3',
        manager: {
          id: '3',
          fullName: 'Jane Manager',
          employeeId: 'EMP003'
        },
        roles: ['employee']
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/users/EMP001')
      const response = await GET(request, { params: { id: 'EMP001' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.employeeId).toBe('EMP001')
      expect(data.user.fullName).toBe('John Doe')
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employeeId: 'EMP001' }
        })
      )
    })

    it('should find user by database id if not found by employeeId', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      const mockUser = {
        id: 'uuid-123',
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        grade: 'Senior',
        department: 'Engineering',
        jobTitle: 'Senior Engineer',
        employmentStatus: 'active',
        managerId: null,
        manager: null,
        roles: ['employee']
      }

      // First call with employeeId returns null
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
      // Second call with database id returns user
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any)

      const request = new NextRequest('http://localhost/api/users/uuid-123')
      const response = await GET(request, { params: { id: 'uuid-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe('uuid-123')
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2)
    })

    it('should return 404 if user not found', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/users/NOTFOUND')
      const response = await GET(request, { params: { id: 'NOTFOUND' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should parse roles correctly when stored as JSON string', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      const mockUser = {
        id: '2',
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        grade: 'Senior',
        department: 'Engineering',
        jobTitle: 'Senior Engineer',
        employmentStatus: 'active',
        managerId: null,
        manager: null,
        roles: '["employee","manager"]' // JSON string
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/users/EMP001')
      const response = await GET(request, { params: { id: 'EMP001' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.roles).toEqual(['employee', 'manager'])
    })

    it('should include manager information if available', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      const mockUser = {
        id: '2',
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        grade: 'Senior',
        department: 'Engineering',
        jobTitle: 'Senior Engineer',
        employmentStatus: 'active',
        managerId: '3',
        manager: {
          id: '3',
          fullName: 'Jane Manager',
          employeeId: 'MGR001'
        },
        roles: ['employee']
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/users/EMP001')
      const response = await GET(request, { params: { id: 'EMP001' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.manager).toBeDefined()
      expect(data.user.manager.fullName).toBe('Jane Manager')
      expect(data.user.manager.employeeId).toBe('MGR001')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)

      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/users/EMP001')
      const response = await GET(request, { params: { id: 'EMP001' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
