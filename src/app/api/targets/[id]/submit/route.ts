import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { TargetsArraySchema } from '@/lib/validations/target-schema'

// POST /api/targets/[id]/submit - Submit targets to manager for review
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
    })

    if (!targetSetting) {
      return NextResponse.json(
        { error: 'Target setting not found' },
        { status: 404 }
      )
    }

    // Only employee can submit their own targets
    if (targetSetting.employeeId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only submit your own targets' },
        { status: 403 }
      )
    }

    // Can only submit if in draft or revision_requested state
    if (
      targetSetting.status !== 'draft' &&
      targetSetting.status !== 'revision_requested'
    ) {
      return NextResponse.json(
        {
          error: `Cannot submit target in ${targetSetting.status} state. Only draft or revision_requested targets can be submitted.`,
        },
        { status: 409 }
      )
    }

    // Validate targets before submission
    const targetsData = JSON.parse(targetSetting.targets)
    const validation = TargetsArraySchema.safeParse(targetsData)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Target validation failed. Please fix the issues before submitting.',
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    // Update target setting to submitted_to_manager
    const updatedTargetSetting = await prisma.targetSetting.update({
      where: { id },
      data: {
        status: 'submitted_to_manager',
        submittedAt: new Date(),
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
        action: 'submit_targets_to_manager',
        targetType: 'target_setting',
        targetId: id,
        details: JSON.stringify({
          previousStatus: targetSetting.status,
          newStatus: 'submitted_to_manager',
          managerId: targetSetting.managerId,
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
    console.error('Submit target error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
