import { NextResponse } from 'next/server'

// GET: list targets for current user or by query
export async function GET(req: Request) {
  // TODO: Implement authentication, query params, DB fetch
  return NextResponse.json({ message: 'GET /api/targets - stub' })
}

// POST: create a draft target set
export async function POST(req: Request) {
  // TODO: Validate body and create TargetSetting record
  return NextResponse.json({ message: 'POST /api/targets - stub' })
}
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { CreateTargetSettingSchema } from '@/lib/validations/target-schema'

// GET /api/targets - List target settings for current user or filtered by cycleYear
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const cycleYear = searchParams.get('cycleYear')

    // Validate cycleYear if provided
    if (cycleYear && !/^\d{4}$/.test(cycleYear)) {
      return NextResponse.json(
        { error: 'Invalid cycleYear format. Must be YYYY' },
        { status: 400 }
      )
    }

    // Build query based on user role
    const isHRAdmin = await AuthService.hasRole(currentUser.id, 'hr_admin')
    const isManager = await AuthService.hasRole(currentUser.id, 'manager')

    let whereClause: {
      employeeId?: string | { in: string[] }
      cycleYear?: number
    } = {}

    if (isHRAdmin) {
      // HR Admin can see all targets
      if (cycleYear) {
        whereClause.cycleYear = parseInt(cycleYear)
      }
    } else if (isManager) {
      // Managers can see their direct reports' targets and their own
      const directReports = await prisma.user.findMany({
        where: { managerId: currentUser.id },
        select: { id: true },
      })

      const accessibleUserIds = [
        currentUser.id,
        ...directReports.map((u) => u.id),
      ]

      whereClause = {
        employeeId: { in: accessibleUserIds },
      }

      if (cycleYear) {
        whereClause.cycleYear = parseInt(cycleYear)
      }
    } else {
      // Regular employees can only see their own targets
      whereClause = {
        employeeId: currentUser.id,
      }

      if (cycleYear) {
        whereClause.cycleYear = parseInt(cycleYear)
      }
    }

    // Fetch targets
    const targets = await prisma.targetSetting.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            email: true,
            department: true,
            grade: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            email: true,
          },
        },
      },
      orderBy: [{ cycleYear: 'desc' }, { createdAt: 'desc' }],
    })

    // Parse targets JSON
    const parsedTargets = targets.map((target) => ({
      ...target,
      targets: JSON.parse(target.targets),
    }))

    return NextResponse.json({ targets: parsedTargets }, { status: 200 })
  } catch (error) {
    console.error('Get targets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/targets - Create a new target setting (draft)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Employees can only create their own targets
    if (!currentUser.managerId) {
      return NextResponse.json(
        { error: 'You must have a manager assigned to create targets' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { targets, currentRole, longTermGoal, cycleYear, isDraft } = body

    // For draft saves, use relaxed validation
    if (isDraft) {
      // Basic validation - just ensure targets is an array with objects
      if (!Array.isArray(targets)) {
        return NextResponse.json(
          { error: 'Targets must be an array' },
          { status: 400 }
        )
      }
    } else {
      // For final submission, use strict validation
      const validation = CreateTargetSettingSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.format(),
          },
          { status: 400 }
        )
      }
    }

    const targetCycleYearValue = cycleYear || new Date().getFullYear()

    // Use provided cycleYear or default to current year
    const targetCycleYear = targetCycleYearValue

    // Check if target setting already exists for this employee and year
    const existingTarget = await prisma.targetSetting.findUnique({
      where: {
        employeeId_cycleYear: {
          employeeId: currentUser.id,
          cycleYear: targetCycleYear,
        },
      },
    })

    if (existingTarget) {
      return NextResponse.json(
        {
          error: 'Target setting already exists for this year. Use PUT to update.',
          targetId: existingTarget.id,
        },
        { status: 409 }
      )
    }

    // Create target setting
    const targetSetting = await prisma.targetSetting.create({
      data: {
        employeeId: currentUser.id,
        managerId: currentUser.managerId,
        cycleYear: targetCycleYear,
        status: 'draft',
        targets: JSON.stringify(targets),
        currentRole: currentRole || null,
        longTermGoal: longTermGoal || null,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            email: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditEntry.create({
      data: {
        actorId: currentUser.id,
        actorRole: 'employee',
        action: 'create_target_draft',
        targetType: 'target_setting',
        targetId: targetSetting.id,
        details: JSON.stringify({
          cycleYear: targetCycleYear,
          targetCount: targets.length,
        }),
      },
    })

    return NextResponse.json(
      {
        ...targetSetting,
        targets: JSON.parse(targetSetting.targets),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create target error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
