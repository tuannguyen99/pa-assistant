'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Target } from '@/lib/validations/target-schema'

interface TargetSetting {
  id: string
  employeeId: string
  managerId: string
  cycleYear: number
  status: string
  targets: Target[]
  submittedAt: Date | null
  approvedAt: Date | null
  submittedToHRAt: Date | null
  createdAt: Date
  updatedAt: Date
  employee: {
    id: string
    fullName: string
    employeeId: string | null
    email: string
    department: string
    grade: string
  }
}

interface PendingTargetsClientProps {
  initialTargets: TargetSetting[]
}

export function PendingTargetsClient({
  initialTargets,
}: PendingTargetsClientProps) {
  const router = useRouter()
  const [targets] = useState(initialTargets)
  const [selectedTarget, setSelectedTarget] = useState<TargetSetting | null>(
    initialTargets[0] || null
  )
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    if (!selectedTarget) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/targets/${selectedTarget.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve targets')
      }

      // Refresh the page
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!selectedTarget || !feedback.trim()) {
      setError('Please provide feedback for revision request')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/targets/${selectedTarget.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'request_revision',
            feedback: feedback.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request revision')
      }

      // Refresh the page
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (targets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-600">
          <p className="text-lg font-medium mb-2">No Pending Approvals</p>
          <p className="text-sm">
            You don't have any pending target approvals at this time.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Targets List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Direct Reports ({targets.length})</h2>
        {targets.map((target) => (
          <Card
            key={target.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedTarget?.id === target.id
                ? 'bg-blue-50 border-blue-300'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedTarget(target)}
          >
            <div className="font-medium">{target.employee.fullName}</div>
            <div className="text-sm text-gray-600">
              {target.employee.department} • {target.employee.grade}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Submitted:{' '}
              {target.submittedAt
                ? new Date(target.submittedAt).toLocaleDateString()
                : 'N/A'}
            </div>
          </Card>
        ))}
      </div>

      {/* Target Review Panel */}
      {selectedTarget && (
        <div className="md:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedTarget.employee.fullName}'s Targets
            </h2>
            <div className="mb-4">
              <Badge>Cycle Year: {selectedTarget.cycleYear}</Badge>
            </div>

            <div className="space-y-4">
              {selectedTarget.targets.map((target, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">Target {index + 1}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">Weight: {target.weight}%</Badge>
                      <Badge variant="outline">{target.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium text-gray-600">
                        Task Description
                      </div>
                      <div className="text-gray-900">{target.taskDescription}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">KPI</div>
                      <div className="text-gray-900">{target.kpi}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback/Action Panel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Manager Actions</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (optional for approval, required for revision request)
                </label>
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback or suggestions..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Processing...' : 'Approve Targets'}
                </Button>
                <Button
                  onClick={handleRequestRevision}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  {isSubmitting ? 'Processing...' : 'Request Revision'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
