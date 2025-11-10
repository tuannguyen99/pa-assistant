import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/lib/auth/auth-service'

const updateUserSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1).optional(),
  roles: z.array(z.string()).min(1).optional(),
  grade: z.string().optional(),
  department: z.string().optional(),
  password: z.string().min(6).optional(),
  employeeId: z.string().min(1).optional(),
  managerId: z.string().nullable().optional()
})

export async function PUT(request: NextRequest) {
  try {
    // Check if current user is HR Admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isHRAdmin = await AuthService.isHRAdmin(currentUser.id)
    if (!isHRAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - HR Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update user via AuthService
    const user = await AuthService.updateUser(validatedData.id, validatedData)

    // Return user without sensitive fields
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      grade: user.grade,
      department: user.department,
      employeeId: user.employeeId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('User update error:', error)
    
    // Check for duplicate employee ID error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User with this employee ID already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}