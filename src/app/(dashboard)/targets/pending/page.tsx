import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { PendingTargetsClient } from './PendingTargetsClient'

export default async function PendingTargetsPage() {
  const currentUser = await AuthService.getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  // Check if user is a manager
  const isManager = await AuthService.hasRole(currentUser.id, 'manager')
  if (!isManager) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Manager Access Required
            </h2>
            <p className="text-yellow-700">
              This page is only accessible to managers. You do not have
              permission to view pending target approvals.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch pending targets for manager's direct reports
  const pendingTargets = await prisma.targetSetting.findMany({
    where: {
      managerId: currentUser.id,
      status: 'submitted_to_manager',
    },
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
    },
    orderBy: { submittedAt: 'asc' },
  })

  // Parse targets JSON
  const parsedTargets = pendingTargets.map((target) => ({
    ...target,
    targets: JSON.parse(target.targets),
  }))

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Target Approvals
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve or request revisions for your direct reports'
            performance targets.
          </p>
        </div>

        <PendingTargetsClient initialTargets={parsedTargets} />
      </div>
    </div>
  )
}
