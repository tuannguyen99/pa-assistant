import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/auth/auth-service'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  submitted_to_manager: 'bg-blue-500',
  revision_requested: 'bg-yellow-500',
  manager_approved: 'bg-green-500',
  submitted_to_hr: 'bg-purple-500',
  target_setting_complete: 'bg-green-700',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted_to_manager: 'Pending Manager Review',
  revision_requested: 'Revision Requested',
  manager_approved: 'Manager Approved',
  submitted_to_hr: 'Submitted to HR',
  target_setting_complete: 'Complete',
}

export default async function TargetDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await AuthService.getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  const targetSetting = await prisma.targetSetting.findUnique({
    where: { id: params.id },
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
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900">
              Target Setting Not Found
            </h2>
          </div>
        </div>
      </div>
    )
  }

  // Check authorization
  const isHRAdmin = await AuthService.hasRole(currentUser.id, 'hr_admin')
  const isEmployee = targetSetting.employeeId === currentUser.id
  const isManager = targetSetting.managerId === currentUser.id

  if (!isHRAdmin && !isEmployee && !isManager) {
    redirect('/dashboard')
  }

  const targets = JSON.parse(targetSetting.targets)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Targets - {targetSetting.cycleYear}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <Badge className={statusColors[targetSetting.status]}>
              {statusLabels[targetSetting.status]}
            </Badge>
            <span className="text-sm text-gray-600">
              Employee: {targetSetting.employee.fullName}
            </span>
          </div>
        </div>

        {/* Employee Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Full Name</div>
              <div className="font-medium">{targetSetting.employee.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Employee ID</div>
              <div className="font-medium">
                {targetSetting.employee.employeeId || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Department</div>
              <div className="font-medium">{targetSetting.employee.department}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Grade</div>
              <div className="font-medium">{targetSetting.employee.grade}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Manager</div>
              <div className="font-medium">{targetSetting.manager.fullName}</div>
            </div>
          </div>
        </Card>

        {/* Targets */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Targets</h2>
          {targets.map((target: any, index: number) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Target {index + 1}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">Weight: {target.weight}%</Badge>
                  <Badge variant="outline">{target.difficulty}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Task Description
                  </div>
                  <div className="text-gray-900 mt-1">
                    {target.taskDescription}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Key Performance Indicator
                  </div>
                  <div className="text-gray-900 mt-1">{target.kpi}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {new Date(targetSetting.createdAt).toLocaleString()}
              </span>
            </div>
            {targetSetting.submittedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">
                  {new Date(targetSetting.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
            {targetSetting.approvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Approved:</span>
                <span className="font-medium">
                  {new Date(targetSetting.approvedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
