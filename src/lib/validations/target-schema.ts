import { z } from 'zod'

// Difficulty levels with multipliers
// L1 (highest complexity) = 1.25
// L2 (moderate) = 1.0
// L3 (lowest) = 0.75
export const DifficultyLevel = z.enum(['L1', 'L2', 'L3'])

export type DifficultyLevel = z.infer<typeof DifficultyLevel>

export const difficultyMultipliers: Record<DifficultyLevel, number> = {
  L1: 1.25,
  L2: 1.0,
  L3: 0.75,
}

// Individual target object schema
export const TargetSchema = z.object({
  taskDescription: z
    .string()
    .min(10, 'Task description must be at least 10 characters')
    .max(500, 'Task description must not exceed 500 characters')
    .trim(),
  kpi: z
    .string()
    .min(5, 'KPI must be at least 5 characters')
    .max(200, 'KPI must not exceed 200 characters')
    .trim(),
  weight: z
    .number()
    .min(1, 'Weight must be at least 1%')
    .max(100, 'Weight must not exceed 100%')
    .int('Weight must be an integer'),
  difficulty: DifficultyLevel,
})

export type Target = z.infer<typeof TargetSchema>

// Array of targets with validation
export const TargetsArraySchema = z
  .array(TargetSchema)
  .min(3, 'You must have at least 3 targets')
  .max(5, 'You cannot have more than 5 targets')
  .refine(
    (targets) => {
      const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0)
      return totalWeight === 100
    },
    {
      message: 'Total weight of all targets must equal exactly 100%',
    }
  )

export type TargetsArray = z.infer<typeof TargetsArraySchema>

// Create target setting request schema
export const CreateTargetSettingSchema = z.object({
  targets: TargetsArraySchema,
  cycleYear: z.number().int().min(2020).max(2100).optional(),
})

export type CreateTargetSettingRequest = z.infer<typeof CreateTargetSettingSchema>

// Update target setting request schema
export const UpdateTargetSettingSchema = z.object({
  targets: TargetsArraySchema,
})

export type UpdateTargetSettingRequest = z.infer<typeof UpdateTargetSettingSchema>

// Approve/Reject target setting request schema
export const ApproveTargetSettingSchema = z.object({
  action: z.enum(['approve', 'request_revision']),
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
})

export type ApproveTargetSettingRequest = z.infer<typeof ApproveTargetSettingSchema>

// Target setting status enum
export const TargetSettingStatus = z.enum([
  'draft',
  'submitted_to_manager',
  'revision_requested',
  'manager_approved',
  'submitted_to_hr',
  'target_setting_complete',
])

export type TargetSettingStatus = z.infer<typeof TargetSettingStatus>

// Validate weight total helper function
export function validateWeightTotal(targets: Target[]): boolean {
  const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0)
  return totalWeight === 100
}

// Validate target count helper function
export function validateTargetCount(targets: Target[]): boolean {
  return targets.length >= 3 && targets.length <= 5
}
