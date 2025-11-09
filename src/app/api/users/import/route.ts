import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'

// Validation schema for employee data
const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  grade: z.string().min(1, 'Grade is required'),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().optional(),
  employmentStatus: z.enum(['active', 'inactive', 'on_leave']).default('active'),
  managerId: z.string().optional(),
  roles: z.array(z.string()).optional()
}).passthrough() // Allow extra fields

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
}

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

    // Parse the CSV data from the request body
    const body = await request.json()
    const { employees } = body

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of employees.' },
        { status: 400 }
      )
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    }

    // Process each employee
    for (let i = 0; i < employees.length; i++) {
      const row = i + 1
      const employeeData = employees[i]

      try {
        // Validate employee data
        const validatedData = employeeSchema.parse(employeeData)

        // Check if employee ID already exists
        const existingEmployee = await prisma.user.findUnique({
          where: { employeeId: validatedData.employeeId }
        })

        if (existingEmployee) {
          result.failed++
          result.errors.push({
            row,
            email: validatedData.email,
            error: `Employee ID ${validatedData.employeeId} already exists`
          })
          continue
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
          where: { email: validatedData.email }
        })

        if (existingEmail) {
          result.failed++
          result.errors.push({
            row,
            email: validatedData.email,
            error: `Email ${validatedData.email} already exists`
          })
          continue
        }

        // Validate manager ID if provided
        if (validatedData.managerId) {
          const manager = await prisma.user.findUnique({
            where: { id: validatedData.managerId }
          })

          if (!manager) {
            result.failed++
            result.errors.push({
              row,
              email: validatedData.email,
              error: `Manager ID ${validatedData.managerId} not found`
            })
            continue
          }
        }

        // Generate default password (employee ID)
        const defaultPassword = validatedData.employeeId
        const passwordHash = await bcrypt.hash(defaultPassword, 12)

        // Set default roles if not provided
        const roles = validatedData.roles && validatedData.roles.length > 0 
          ? validatedData.roles 
          : ['employee']

        // Create the user
        await prisma.user.create({
          data: {
            employeeId: validatedData.employeeId,
            fullName: validatedData.fullName,
            email: validatedData.email,
            grade: validatedData.grade,
            department: validatedData.department,
            jobTitle: validatedData.jobTitle || null,
            employmentStatus: validatedData.employmentStatus,
            managerId: validatedData.managerId || null,
            passwordHash,
            roles: JSON.parse(JSON.stringify(roles)),
            authProvider: 'credentials'
          }
        })

        result.imported++
      } catch (error) {
        result.failed++
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
          result.errors.push({
            row,
            email: employeeData.email || 'unknown',
            error: errorMessages
          })
        } else {
          result.errors.push({
            row,
            email: employeeData.email || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    if (result.failed > 0) {
      result.success = false
    }

    return NextResponse.json(result, { status: result.success ? 200 : 207 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    )
  }
}
