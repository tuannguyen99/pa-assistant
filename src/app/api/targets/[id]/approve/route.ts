import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { ApproveTargetSettingSchema } from '@/lib/validations/target-schema'

// POST /api/targets/[id]/approve - Manager approves or requests revision
export async function POST(
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

    // Only assigned manager can approve/reject
    if (targetSetting.managerId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden - You are not the assigned manager for these targets' },
        { status: 403 }
      )
    }

    // Can only approve/reject if in submitted_to_manager state
    if (targetSetting.status !== 'submitted_to_manager') {
      return NextResponse.json(
        {
          error: `Cannot review target in ${targetSetting.status} state. Only submitted_to_manager targets can be reviewed.`,
        },
        { status: 409 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = ApproveTargetSettingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { action, feedback } = validation.data

    // Validate feedback for revision requests
    if (action === 'request_revision' && !feedback) {
      return NextResponse.json(
        {
          error: 'Feedback is required when requesting revisions',
        },
        { status: 400 }
      )
    }

    // Determine new status
    const newStatus = action === 'approve' ? 'manager_approved' : 'revision_requested'

    // Update target setting
    const updatedTargetSetting = await prisma.targetSetting.update({
      where: { id },
      data: {
        status: newStatus,
        approvedAt: action === 'approve' ? new Date() : null,
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
        actorRole: 'manager',
        action: action === 'approve' ? 'approve_targets' : 'request_target_revision',
        targetType: 'target_setting',
        targetId: id,
        details: JSON.stringify({
          previousStatus: targetSetting.status,
          newStatus,
          feedback: feedback || null,
          employeeId: targetSetting.employeeId,
        }),
      },
    })

    return NextResponse.json(
      {
        ...updatedTargetSetting,
        targets: JSON.parse(updatedTargetSetting.targets),
        feedback: feedback || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Approve target error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
