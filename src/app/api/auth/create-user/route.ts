import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/lib/auth/auth-service'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  roles: z.array(z.string()).min(1),
  grade: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().min(1),
  managerId: z.string().nullable().optional()
})

export async function POST(request: NextRequest) {
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
    const validatedData = createUserSchema.parse(body)

    // Create user via AuthService
    const user = await AuthService.createUser(validatedData)

    // Return user without sensitive fields
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      grade: user.grade,
      department: user.department,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('User creation error:', error)
    
    // Check for duplicate email or employee ID error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes('email')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      } else if (errorMsg.includes('employeeid')) {
        return NextResponse.json(
          { error: 'User with this employee ID already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'User with this email or employee ID already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}