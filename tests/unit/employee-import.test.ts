import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/users/import/route'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/auth/auth-service')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashedpassword')
  }
}))

describe('Employee Import API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/users/import', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees: [] })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-HR Admin users', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(false)

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees: [] })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden - HR Admin access required')
    })

    it('should reject invalid data format', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees: 'invalid' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid data format')
    })

    it('should successfully import valid employees', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: '2',
        employeeId: 'EMP001',
        fullName: 'Test Employee',
        email: 'test@example.com',
        grade: 'Senior',
        department: 'Engineering'
      } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Test Employee',
          email: 'test@example.com',
          grade: 'Senior',
          department: 'Engineering',
          jobTitle: 'Software Engineer',
          employmentStatus: 'active'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.imported).toBe(1)
      expect(data.failed).toBe(0)
      expect(data.errors).toEqual([])
    })

    it('should handle validation errors', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)

      const employees = [
        {
          employeeId: '',
          fullName: 'Test Employee',
          email: 'invalid-email',
          grade: 'Senior',
          department: 'Engineering'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(207)
      expect(data.success).toBe(false)
      expect(data.imported).toBe(0)
      expect(data.failed).toBe(1)
      expect(data.errors.length).toBeGreaterThan(0)
    })

    it('should detect duplicate employee IDs', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: '2',
        employeeId: 'EMP001'
      } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Test Employee',
          email: 'test@example.com',
          grade: 'Senior',
          department: 'Engineering'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(207)
      expect(data.success).toBe(false)
      expect(data.imported).toBe(0)
      expect(data.failed).toBe(1)
      expect(data.errors[0].error).toContain('already exists')
    })

    it('should detect duplicate emails', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      // First call for employeeId check returns null
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
      // Second call for email check returns existing user
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: '2',
        email: 'test@example.com'
      } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Test Employee',
          email: 'test@example.com',
          grade: 'Senior',
          department: 'Engineering'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(207)
      expect(data.success).toBe(false)
      expect(data.imported).toBe(0)
      expect(data.failed).toBe(1)
      expect(data.errors[0].error).toContain('Email')
      expect(data.errors[0].error).toContain('already exists')
    })

    it('should handle multiple employees with mixed success', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      
      // First employee: success
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null).mockResolvedValueOnce(null)
      vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: '2' } as any)
      
      // Second employee: duplicate employeeId
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '3', employeeId: 'EMP002' } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Employee One',
          email: 'emp1@example.com',
          grade: 'Senior',
          department: 'Engineering'
        },
        {
          employeeId: 'EMP002',
          fullName: 'Employee Two',
          email: 'emp2@example.com',
          grade: 'Junior',
          department: 'Marketing'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(207)
      expect(data.success).toBe(false)
      expect(data.imported).toBe(1)
      expect(data.failed).toBe(1)
      expect(data.errors).toHaveLength(1)
    })

    it('should set default password to employeeId', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      
      const createMock = vi.mocked(prisma.user.create)
      createMock.mockResolvedValue({ id: '2' } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Test Employee',
          email: 'test@example.com',
          grade: 'Senior',
          department: 'Engineering'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      await POST(request)

      const createCall = createMock.mock.calls[0][0]
      expect(createCall.data.passwordHash).toBe('hashedpassword')
    })

    it('should set default roles to employee if not provided', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@example.com'
      } as any)
      vi.mocked(AuthService.isHRAdmin).mockResolvedValue(true)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      
      const createMock = vi.mocked(prisma.user.create)
      createMock.mockResolvedValue({ id: '2' } as any)

      const employees = [
        {
          employeeId: 'EMP001',
          fullName: 'Test Employee',
          email: 'test@example.com',
          grade: 'Senior',
          department: 'Engineering'
        }
      ]

      const request = new NextRequest('http://localhost/api/users/import', {
        method: 'POST',
        body: JSON.stringify({ employees })
      })

      await POST(request)

      const createCall = createMock.mock.calls[0][0]
      expect(createCall.data.roles).toEqual(['employee'])
    })
  })
})
