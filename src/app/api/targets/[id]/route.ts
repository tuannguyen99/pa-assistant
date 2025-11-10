import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { UpdateTargetSettingSchema } from '@/lib/validations/target-schema'

// GET /api/targets/[id] - Get a specific target setting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Fetch target setting
    const targetSetting = await prisma.targetSetting.findUnique({
      where: { id },
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
    })

    if (!targetSetting) {
      return NextResponse.json(
        { error: 'Target setting not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const isHRAdmin = await AuthService.hasRole(currentUser.id, 'hr_admin')
    const isEmployee = targetSetting.employeeId === currentUser.id
    const isManager = targetSetting.managerId === currentUser.id

    if (!isHRAdmin && !isEmployee && !isManager) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this target setting' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        ...targetSetting,
        targets: JSON.parse(targetSetting.targets),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get target error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/targets/[id] - Update a target setting (only in draft or revision_requested state)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Fetch target setting
    const targetSetting = await prisma.targetSetting.findUnique({
      where: { id },
    })

    if (!targetSetting) {
      return NextResponse.json(
        { error: 'Target setting not found' },
        { status: 404 }
      )
    }

    // Only employee can update their own targets
    if (targetSetting.employeeId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own targets' },
        { status: 403 }
      )
    }

    // Can only update if in draft or revision_requested state
    if (
      targetSetting.status !== 'draft' &&
      targetSetting.status !== 'revision_requested'
    ) {
      return NextResponse.json(
        {
          error: `Cannot update target in ${targetSetting.status} state. Only draft or revision_requested targets can be edited.`,
        },
        { status: 409 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = UpdateTargetSettingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { targets } = validation.data

    // Update target setting
    const updatedTargetSetting = await prisma.targetSetting.update({
      where: { id },
      data: {
        targets: JSON.stringify(targets),
        status: 'draft', // Reset to draft when updating
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
        action: 'update_target_draft',
        targetType: 'target_setting',
        targetId: id,
        details: JSON.stringify({
          previousStatus: targetSetting.status,
          newStatus: 'draft',
          targetCount: targets.length,
        }),
      },
    })

    return NextResponse.json(
      {
        ...updatedTargetSetting,
        targets: JSON.parse(updatedTargetSetting.targets),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update target error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
