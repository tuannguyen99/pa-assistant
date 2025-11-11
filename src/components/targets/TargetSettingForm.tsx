'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmployeeInformationSection } from '@/components/targets/EmployeeInformationSection'
import type {
  Target,
} from '@/lib/validations/target-schema'
import { z } from 'zod'
import { Trash2, Plus, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

interface TargetSettingFormProps {
  initialTargets?: Target[]
  initialCurrentRole?: string
  initialLongTermGoal?: string
  onSubmit: (data: { targets: Target[], currentRole?: string, longTermGoal?: string }) => Promise<void>
  onSaveDraft?: (data: { targets: Target[], currentRole?: string, longTermGoal?: string }) => Promise<void>
  isSubmitting?: boolean
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
}

const difficultyOptions = [
  {
    value: 'L1',
    label: 'L1',
  },
  {
    value: 'L2',
    label: 'L2',
  },
  {
    value: 'L3',
    label: 'L3',
  },
]

// Form schema wrapper for react-hook-form
const formSchema = z.object({
  targets: z.array(
    z.object({
      taskDescription: z.string().min(10).max(500),
      kpi: z.string().min(5).max(200),
      weight: z.number().min(1).max(100).int(),
      difficulty: z.enum(['L1', 'L2', 'L3']),
    })
  ),
  currentRole: z.string().optional(),
  longTermGoal: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function TargetSettingForm({
  initialTargets,
  initialCurrentRole,
  initialLongTermGoal,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  currentUser,
}: TargetSettingFormProps) {
  const [totalWeight, setTotalWeight] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<string>('')
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  const lastChangeTime = useRef<number>(0)
  const currentFormData = useRef<string>('')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targets: initialTargets || [
        { taskDescription: '', kpi: '', weight: 0, difficulty: 'L2' },
        { taskDescription: '', kpi: '', weight: 0, difficulty: 'L2' },
        { taskDescription: '', kpi: '', weight: 0, difficulty: 'L2' },
      ],
      currentRole: initialCurrentRole || '',
      longTermGoal: initialLongTermGoal || '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'targets',
  })

  const watchedTargets = useWatch({
    control,
    name: 'targets',
  })

  const watchedCurrentRole = useWatch({
    control,
    name: 'currentRole',
  })

  const watchedLongTermGoal = useWatch({
    control,
    name: 'longTermGoal',
  })

  // Check if form has actual changes by comparing with last saved data
  const hasUnsavedChanges = useCallback(() => {
    const currentData = JSON.stringify({
      targets: watchedTargets,
      currentRole: watchedCurrentRole,
      longTermGoal: watchedLongTermGoal,
    })
    return isDirty || (currentData !== lastSavedData && lastSavedData !== '')
  }, [isDirty, watchedTargets, watchedCurrentRole, watchedLongTermGoal, lastSavedData])

  // Warn user about unsaved changes
  useUnsavedChangesWarning(
    hasUnsavedChanges(),
    'You have unsaved changes in your target settings. Do you want to leave without saving?'
  )

  // Calculate total weight
  useEffect(() => {
    const total = watchedTargets.reduce(
      (sum, target) => sum + (Number(target?.weight) || 0),
      0
    )
    setTotalWeight(total)
  }, [watchedTargets])

  // Set initial saved data on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const initialData = JSON.stringify({
        targets: initialTargets || [],
        currentRole: initialCurrentRole || '',
        longTermGoal: initialLongTermGoal || '',
      })
      setLastSavedData(initialData)
      isInitialMount.current = false
    }
  }, [initialTargets, initialCurrentRole, initialLongTermGoal])

  // Update form data ref whenever watched fields change
  useEffect(() => {
    currentFormData.current = JSON.stringify({
      targets: watchedTargets,
      currentRole: watchedCurrentRole,
      longTermGoal: watchedLongTermGoal,
    })
  }, [watchedTargets, watchedCurrentRole, watchedLongTermGoal])

  // Auto-save draft with 3-second debounce
  useEffect(() => {
    if (!onSaveDraft || isSaving) return

    // Skip if no actual changes
    if (currentFormData.current === lastSavedData) {
      return
    }

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    // Set new timer for 3 seconds from now
    autoSaveTimer.current = setTimeout(async () => {
      const savedData = currentFormData.current
      const parsedData = JSON.parse(savedData)

      // Save if there's content
      if (parsedData.targets && parsedData.targets.length > 0) {
        setIsSaving(true)
        const toastId = toast.loading('Auto-saving draft...')
        
        try {
          await onSaveDraft({
            targets: parsedData.targets as Target[],
            currentRole: parsedData.currentRole,
            longTermGoal: parsedData.longTermGoal,
          })
          
          // Update last saved data
          setLastSavedData(savedData)
          
          // Reset form dirty state
          reset({
            targets: parsedData.targets as Target[],
            currentRole: parsedData.currentRole,
            longTermGoal: parsedData.longTermGoal,
          })
          
          toast.success('✓ Draft auto-saved successfully', { id: toastId, duration: 3000 })
        } catch (error) {
          console.error('Auto-save error:', error)
          toast.error('Failed to auto-save draft. Please try manual save.', { id: toastId, duration: 5000 })
        } finally {
          setIsSaving(false)
        }
      }
    }, 3000) // 3-second interval

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [lastSavedData, onSaveDraft, isSaving, reset])

  const handleFormSubmit = async (data: FormData) => {
    // Clear auto-save timer if running
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    const toastId = toast.loading('Submitting to manager...')
    
    try {
      await onSubmit({
        targets: data.targets,
        currentRole: data.currentRole,
        longTermGoal: data.longTermGoal,
      })
      toast.success(' Target settings submitted successfully!', { id: toastId, duration: 4000 })
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit target settings. Please try again.',
        { id: toastId, duration: 5000 }
      )
      throw error
    }
  }

  const handleManualSaveDraft = async () => {
    if (!onSaveDraft) return
    
    // Clear auto-save timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    setIsSaving(true)
    const toastId = toast.loading('Saving draft...')
    
    try {
      await onSaveDraft({
        targets: watchedTargets as Target[],
        currentRole: watchedCurrentRole,
        longTermGoal: watchedLongTermGoal,
      })
      
      // Update last saved data
      const savedData = JSON.stringify({
        targets: watchedTargets,
        currentRole: watchedCurrentRole,
        longTermGoal: watchedLongTermGoal,
      })
      setLastSavedData(savedData)
      
      // Reset form dirty state
      reset({
        targets: watchedTargets as Target[],
        currentRole: watchedCurrentRole,
        longTermGoal: watchedLongTermGoal,
      })
      
      toast.success(' Draft saved successfully', { id: toastId, duration: 3000 })
    } catch (error) {
      console.error('Manual save error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save draft. Please try again.',
        { id: toastId, duration: 5000 }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const canAddTarget = fields.length < 5
  const canRemoveTarget = fields.length > 3

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Workflow State Indicator - Matches v1.7 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              <span></span>
              <span>Draft</span>
            </div>
            <span className="text-sm text-gray-600">Phase 1: Target Setting</span>
            {isSaving && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Auto-saving...
              </span>
            )}
          </div>

          {/* Timeline Steps */}
          <div className="hidden sm:flex items-center gap-4 flex-1 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold"></div>
              <span className="text-xs text-gray-600">Basic Info</span>
            </div>
            <div className="h-0.5 w-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-xs text-gray-700 font-medium">Targets</span>
            </div>
            <div className="h-0.5 w-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-xs text-gray-600">Review</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleManualSaveDraft}
              disabled={!hasUnsavedChanges() || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || totalWeight !== 100 || isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
               Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Information Section - Auto-fill */}
      <EmployeeInformationSection currentUser={currentUser} />

      {/* Period of Appraisal Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Period of Appraisal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="appraisalFrom" className="text-gray-700 font-medium mb-2 block">
              From
            </Label>
            <Input
              id="appraisalFrom"
              type="date"
              defaultValue="2025-04-01"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="appraisalTo" className="text-gray-700 font-medium mb-2 block">
              To
            </Label>
            <Input
              id="appraisalTo"
              type="date"
              defaultValue="2026-03-31"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Role Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Current Role</CardTitle>
          <CardDescription>Concretely describe your roles for this year</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('currentRole')}
            placeholder="Describe your current role and key responsibilities..."
            className="min-h-[120px] resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </CardContent>
      </Card>

      {/* Long-term Goal Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Long-term Goal</CardTitle>
          <CardDescription>Concretely describe your challenge targets for 3-5 years</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('longTermGoal')}
            placeholder="Describe your long-term career goals and development aspirations..."
            className="min-h-[120px] resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </CardContent>
      </Card>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Target Setting (Step 1.1)</h1>
        <p className="text-gray-600">Create 3-5 performance targets with a total weight of 100%. Each target must have a clear description, KPI, weight percentage, and difficulty level.</p>
      </div>

      {/* Company Core Values Info - Matches v1.7 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-sm text-blue-900">
          <strong className="text-blue-700">Company Core Values:</strong> Integrity, Result-driven, Commitment, Agility<br/>
          <em className="text-blue-800 text-xs">Each target should align with at least one core value to ensure organizational alignment.</em>
        </p>
      </div>

      {/* Performance Targets Section - Matches v1.7 */}
      <div className="space-y-4">

        {/* Targets Table */}
        <div className="border border-gray-300 rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-b from-gray-50 to-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300 flex-1">Dimension/Task</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300 flex-1">Targets (KPI)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300 w-24">Weight (%)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300 w-24">Difficulty</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-300 w-12">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No targets added yet. Click &quot;Add Target&quot; below to start.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr key={field.id} className="border-b border-gray-200 hover:bg-gray-50">
                    {/* Dimension/Task */}
                    <td className="px-4 py-3 align-top">
                      <Textarea
                        {...register(`targets.${index}.taskDescription`)}
                        placeholder="Describe the task or dimension..."
                        className="min-h-20 resize-vertical text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.targets?.[index]?.taskDescription && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.targets[index]?.taskDescription?.message}
                        </p>
                      )}
                    </td>

                    {/* Targets (KPI) */}
                    <td className="px-4 py-3 align-top">
                      <Textarea
                        {...register(`targets.${index}.kpi`)}
                        placeholder="Define the target KPI..."
                        className="min-h-20 resize-vertical text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.targets?.[index]?.kpi && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.targets[index]?.kpi?.message}
                        </p>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="px-4 py-3 align-top">
                      <Input
                        type="number"
                        {...register(`targets.${index}.weight`, {
                          valueAsNumber: true,
                        })}
                        min={1}
                        max={100}
                        placeholder="20"
                        className="text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
                      />
                      {errors.targets?.[index]?.weight && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.targets[index]?.weight?.message}
                        </p>
                      )}
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3 align-top">
                      <Select
                        value={watchedTargets?.[index]?.difficulty || 'L2'}
                        onValueChange={(value) => {
                          setValue(`targets.${index}.difficulty`, value as 'L1' | 'L2' | 'L3')
                        }}
                      >
                        <SelectTrigger className="text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="text-xs">{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.targets?.[index]?.difficulty && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.targets[index]?.difficulty?.message}
                        </p>
                      )}
                    </td>

                    {/* Delete Button */}
                    <td className="px-4 py-3 align-middle text-center">
                      {canRemoveTarget && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Weight Summary Row */}
        {fields.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Weight:</span>
            <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
              {totalWeight}%
            </span>
          </div>
        )}

        {/* Add Target Button */}
        {canAddTarget && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ taskDescription: '', kpi: '', weight: 0, difficulty: 'L2' })
            }
            className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 h-12 text-blue-600 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Target (Maximum 5)
          </Button>
        )}
      </div>

      {/* Form Errors */}
      {errors.targets?.root && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.targets.root.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleManualSaveDraft}
          disabled={!hasUnsavedChanges() || isSaving}
          className="px-6 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || totalWeight !== 100 || isSaving}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
               Submit to Manager
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
