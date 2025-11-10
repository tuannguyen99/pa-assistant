'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TargetSettingForm } from '@/components/targets/TargetSettingForm'
import type { Target } from '@/lib/validations/target-schema'

interface TargetCreationClientProps {
  currentUser?: {
    id: string
    email: string
    fullName: string
    employeeId: string | null
    grade: string | null
    department: string | null
    manager: {
      id: string
      fullName: string
      employeeId: string
    } | null
  }
  initialTargets?: any[]
  initialCurrentRole?: string
  initialLongTermGoal?: string
  targetSettingId?: string
}

export function TargetCreationClient({ 
  currentUser, 
  initialTargets, 
  initialCurrentRole,
  initialLongTermGoal,
  targetSettingId 
}: TargetCreationClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: { targets: Target[], currentRole?: string, longTermGoal?: string }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create target setting
      const createResponse = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create targets')
      }

      const { id } = await createResponse.json()

      // Submit to manager
      const submitResponse = await fetch(`/api/targets/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json()
        throw new Error(errorData.error || 'Failed to submit targets')
      }

      // Redirect to target detail page
      router.push(`/targets/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async (data: { targets: Target[], currentRole?: string, longTermGoal?: string }) => {
    try {
      // Use PUT if we have an existing draft, POST for new drafts
      const method = targetSettingId ? 'PUT' : 'POST'
      const url = targetSettingId 
        ? `/api/targets/${targetSettingId}`
        : '/api/targets'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data,
          isDraft: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Draft save error:', errorData)
        throw new Error(errorData.error || 'Failed to save draft')
      }

      // Revalidate the page to reload draft from database
      router.refresh()
    } catch (err) {
      console.error('Draft save error:', err)
      // Don't throw - silently fail for auto-save to avoid blocking user input
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900">Error</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <TargetSettingForm
        initialTargets={initialTargets}
        initialCurrentRole={initialCurrentRole}
        initialLongTermGoal={initialLongTermGoal}
        currentUser={currentUser}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
