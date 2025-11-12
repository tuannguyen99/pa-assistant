import { describe, it, expect } from 'vitest'

describe('Target validation - skeleton', () => {
  it('validates 3-5 targets and weight=100', () => {
    // TODO: implement unit tests using validation schema
    expect(true).toBeTruthy()
  })
})
import { describe, it, expect } from 'vitest'
import {
  TargetSchema,
  TargetsArraySchema,
  CreateTargetSettingSchema,
  ApproveTargetSettingSchema,
  validateWeightTotal,
  validateTargetCount,
  type Target,
} from '@/lib/validations/target-schema'

describe('Target Validation', () => {
  describe('TargetSchema', () => {
    it('should validate a valid target', () => {
      const validTarget = {
        taskDescription: 'Complete project documentation within deadline',
        kpi: 'Documentation completed by Q4',
        weight: 25,
        difficulty: 'L2' as const,
      }

      const result = TargetSchema.safeParse(validTarget)
      expect(result.success).toBe(true)
    })

    it('should reject task description that is too short', () => {
      const invalidTarget = {
        taskDescription: 'Too short',
        kpi: 'Valid KPI here',
        weight: 25,
        difficulty: 'L2' as const,
      }

      const result = TargetSchema.safeParse(invalidTarget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters')
      }
    })

    it('should reject task description that is too long', () => {
      const invalidTarget = {
        taskDescription: 'a'.repeat(501),
        kpi: 'Valid KPI here',
        weight: 25,
        difficulty: 'L2' as const,
      }

      const result = TargetSchema.safeParse(invalidTarget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('not exceed 500 characters')
      }
    })

    it('should reject KPI that is too short', () => {
      const invalidTarget = {
        taskDescription: 'Valid task description here',
        kpi: 'abc',
        weight: 25,
        difficulty: 'L2' as const,
      }

      const result = TargetSchema.safeParse(invalidTarget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 5 characters')
      }
    })

    it('should reject invalid weight values', () => {
      const invalidTarget1 = {
        taskDescription: 'Valid task description here',
        kpi: 'Valid KPI here',
        weight: 0,
        difficulty: 'L2' as const,
      }

      const result1 = TargetSchema.safeParse(invalidTarget1)
      expect(result1.success).toBe(false)

      const invalidTarget2 = {
        taskDescription: 'Valid task description here',
        kpi: 'Valid KPI here',
        weight: 101,
        difficulty: 'L2' as const,
      }

      const result2 = TargetSchema.safeParse(invalidTarget2)
      expect(result2.success).toBe(false)
    })

    it('should reject invalid difficulty levels', () => {
      const invalidTarget = {
        taskDescription: 'Valid task description here',
        kpi: 'Valid KPI here',
        weight: 25,
        difficulty: 'L4',
      }

      const result = TargetSchema.safeParse(invalidTarget)
      expect(result.success).toBe(false)
    })
  })

  describe('TargetsArraySchema', () => {
    const validTarget: Target = {
      taskDescription: 'Complete project documentation',
      kpi: 'Documentation completed by Q4',
      weight: 25,
      difficulty: 'L2',
    }

    it('should validate 3 targets with 100% total weight', () => {
      const targets = [
        { ...validTarget, weight: 30 },
        { ...validTarget, weight: 40 },
        { ...validTarget, weight: 30 },
      ]

      const result = TargetsArraySchema.safeParse(targets)
      expect(result.success).toBe(true)
    })

    it('should validate 5 targets with 100% total weight', () => {
      const targets = [
        { ...validTarget, weight: 20 },
        { ...validTarget, weight: 20 },
        { ...validTarget, weight: 20 },
        { ...validTarget, weight: 20 },
        { ...validTarget, weight: 20 },
      ]

      const result = TargetsArraySchema.safeParse(targets)
      expect(result.success).toBe(true)
    })

    it('should reject less than 3 targets', () => {
      const targets = [
        { ...validTarget, weight: 50 },
        { ...validTarget, weight: 50 },
      ]

      const result = TargetsArraySchema.safeParse(targets)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 3 targets')
      }
    })

    it('should reject more than 5 targets', () => {
      const targets = [
        { ...validTarget, weight: 16 },
        { ...validTarget, weight: 16 },
        { ...validTarget, weight: 17 },
        { ...validTarget, weight: 17 },
        { ...validTarget, weight: 17 },
        { ...validTarget, weight: 17 },
      ]

      const result = TargetsArraySchema.safeParse(targets)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot have more than 5 targets')
      }
    })

    it('should reject targets with total weight not equal to 100', () => {
      const targets = [
        { ...validTarget, weight: 30 },
        { ...validTarget, weight: 30 },
        { ...validTarget, weight: 30 },
      ]

      const result = TargetsArraySchema.safeParse(targets)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('must equal exactly 100%')
      }
    })
  })

  describe('CreateTargetSettingSchema', () => {
    const validTarget: Target = {
      taskDescription: 'Complete project documentation',
      kpi: 'Documentation completed by Q4',
      weight: 33,
      difficulty: 'L2',
    }

    it('should validate create request with valid targets', () => {
      const request = {
        targets: [
          { ...validTarget, weight: 34 },
          { ...validTarget, weight: 33 },
          { ...validTarget, weight: 33 },
        ],
      }

      const result = CreateTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should validate create request with optional cycleYear', () => {
      const request = {
        targets: [
          { ...validTarget, weight: 34 },
          { ...validTarget, weight: 33 },
          { ...validTarget, weight: 33 },
        ],
        cycleYear: 2025,
      }

      const result = CreateTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should reject invalid cycleYear', () => {
      const request = {
        targets: [
          { ...validTarget, weight: 34 },
          { ...validTarget, weight: 33 },
          { ...validTarget, weight: 33 },
        ],
        cycleYear: 2019,
      }

      const result = CreateTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })
  })

  describe('ApproveTargetSettingSchema', () => {
    it('should validate approve action without feedback', () => {
      const request = {
        action: 'approve' as const,
      }

      const result = ApproveTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should validate request_revision action with feedback', () => {
      const request = {
        action: 'request_revision' as const,
        feedback: 'Please provide more detailed KPIs for targets 2 and 3.',
      }

      const result = ApproveTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should reject feedback that is too short', () => {
      const request = {
        action: 'request_revision' as const,
        feedback: 'Too short',
      }

      const result = ApproveTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })

    it('should reject invalid action', () => {
      const request = {
        action: 'invalid_action',
      }

      const result = ApproveTargetSettingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })
  })

  describe('Helper Functions', () => {
    const validTarget: Target = {
      taskDescription: 'Complete project documentation',
      kpi: 'Documentation completed by Q4',
      weight: 25,
      difficulty: 'L2',
    }

    describe('validateWeightTotal', () => {
      it('should return true when total weight is 100', () => {
        const targets = [
          { ...validTarget, weight: 30 },
          { ...validTarget, weight: 40 },
          { ...validTarget, weight: 30 },
        ]

        expect(validateWeightTotal(targets)).toBe(true)
      })

      it('should return false when total weight is not 100', () => {
        const targets = [
          { ...validTarget, weight: 30 },
          { ...validTarget, weight: 30 },
          { ...validTarget, weight: 30 },
        ]

        expect(validateWeightTotal(targets)).toBe(false)
      })
    })

    describe('validateTargetCount', () => {
      it('should return true for 3 targets', () => {
        const targets = [validTarget, validTarget, validTarget]
        expect(validateTargetCount(targets)).toBe(true)
      })

      it('should return true for 5 targets', () => {
        const targets = [validTarget, validTarget, validTarget, validTarget, validTarget]
        expect(validateTargetCount(targets)).toBe(true)
      })

      it('should return false for less than 3 targets', () => {
        const targets = [validTarget, validTarget]
        expect(validateTargetCount(targets)).toBe(false)
      })

      it('should return false for more than 5 targets', () => {
        const targets = [
          validTarget,
          validTarget,
          validTarget,
          validTarget,
          validTarget,
          validTarget,
        ]
        expect(validateTargetCount(targets)).toBe(false)
      })
    })
  })
})
