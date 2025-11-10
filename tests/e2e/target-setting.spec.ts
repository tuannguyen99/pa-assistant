import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Test users
const TEST_MANAGER = {
  email: 'manager.target@example.com',
  password: 'Manager@123',
  fullName: 'Test Manager',
  roles: ['manager', 'employee'],
  employeeId: 'MGR001',
  grade: 'Senior',
  department: 'Engineering',
}

const TEST_EMPLOYEE = {
  email: 'employee.target@example.com',
  password: 'Employee@123',
  fullName: 'Test Employee',
  roles: ['employee'],
  employeeId: 'EMP001',
  grade: 'Junior',
  department: 'Engineering',
}

test.describe('Target Setting Workflow', () => {
  let managerId: string
  let employeeId: string

  test.beforeAll(async () => {
    // Clean up any existing test users first
    await prisma.user.deleteMany({
      where: {
        email: { in: [TEST_MANAGER.email, TEST_EMPLOYEE.email] },
      },
    })

    // Create test users
    const managerHash = await bcrypt.hash(TEST_MANAGER.password, 10)
    const manager = await prisma.user.create({
      data: {
        email: TEST_MANAGER.email,
        passwordHash: managerHash,
        fullName: TEST_MANAGER.fullName,
        roles: JSON.parse(JSON.stringify(TEST_MANAGER.roles)),
        employeeId: TEST_MANAGER.employeeId,
        grade: TEST_MANAGER.grade,
        department: TEST_MANAGER.department,
      },
    })
    managerId = manager.id

    const employeeHash = await bcrypt.hash(TEST_EMPLOYEE.password, 10)
    const employee = await prisma.user.create({
      data: {
        email: TEST_EMPLOYEE.email,
        passwordHash: employeeHash,
        fullName: TEST_EMPLOYEE.fullName,
        roles: JSON.parse(JSON.stringify(TEST_EMPLOYEE.roles)),
        employeeId: TEST_EMPLOYEE.employeeId,
        grade: TEST_EMPLOYEE.grade,
        department: TEST_EMPLOYEE.department,
        managerId: managerId,
      },
    })
    employeeId = employee.id
  })

  test.afterAll(async () => {
    // Clean up test data
    if (employeeId) {
      await prisma.targetSetting.deleteMany({
        where: {
          employeeId: employeeId,
        },
      })
      await prisma.auditEntry.deleteMany({
        where: {
          actorId: employeeId,
        },
      })
      await prisma.user.delete({ where: { id: employeeId } })
    }
    if (managerId) {
      await prisma.auditEntry.deleteMany({
        where: {
          actorId: managerId,
        },
      })
      await prisma.user.delete({ where: { id: managerId } })
    }
    await prisma.$disconnect()
  })

  test('AC1: Target creation form with all required fields', async ({ page }) => {
    // Login as employee
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="password"]', TEST_EMPLOYEE.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate to create targets
    await page.goto('/targets/new')

    // Check page title
    await expect(page.locator('h1')).toContainText('Create Performance Targets')

    // Check initial 3 targets are visible
    await expect(page.locator('text=Target 1')).toBeVisible()
    await expect(page.locator('text=Target 2')).toBeVisible()
    await expect(page.locator('text=Target 3')).toBeVisible()

    // Check all form fields exist
    await expect(page.locator('textarea').first()).toBeVisible()
    await expect(page.locator('input[type="number"]').first()).toBeVisible()
  })

  test('AC2 & AC3: Weight validation and 3-5 targets constraint', async ({ page }) => {
    // Login as employee
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="password"]', TEST_EMPLOYEE.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/targets/new')

    // Fill in 3 targets with incorrect total weight
    const targets = page.locator('[class*="border rounded-lg"]')
    
    // Target 1
    await targets.nth(0).locator('textarea').fill('Implement core features for Q4 project delivery')
    await targets.nth(0).locator('input[placeholder*="KPI"]').fill('Complete 5 major features')
    await targets.nth(0).locator('input[type="number"]').fill('30')
    
    // Target 2
    await targets.nth(1).locator('textarea').fill('Improve code quality and test coverage metrics')
    await targets.nth(1).locator('input[placeholder*="KPI"]').fill('Achieve 80% test coverage')
    await targets.nth(1).locator('input[type="number"]').fill('30')
    
    // Target 3
    await targets.nth(2).locator('textarea').fill('Mentor junior developers and conduct code reviews')
    await targets.nth(2).locator('input[placeholder*="KPI"]').fill('Complete 20 code reviews')
    await targets.nth(2).locator('input[type="number"]').fill('30')

    // Check weight indicator shows 90% (not 100%)
    await expect(page.locator('text=90%')).toBeVisible()
    await expect(page.locator('text=Under by 10%')).toBeVisible()

    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled()

    // Add a 4th target to test max targets
    await page.click('text=Add Target')
    await expect(page.locator('text=Target 4')).toBeVisible()

    // Try to add a 5th target
    await page.click('text=Add Target')
    await expect(page.locator('text=Target 5')).toBeVisible()

    // Add Target button should now say "Maximum 5"
    await expect(page.locator('text=Add Target (Maximum 5)')).toBeDisabled()

    // Remove targets back to 3
    const removeButtons = page.locator('button:has-text("Remove")')
    await removeButtons.first().click()
    await removeButtons.first().click()

    // Adjust weight to equal 100%
    await targets.nth(2).locator('input[type="number"]').fill('40')
    
    // Check weight indicator shows 100%
    await page.waitForTimeout(500) // Wait for calculation
    await expect(page.locator('text=100%')).toBeVisible()

    // Submit button should now be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('Complete workflow: Create, submit, and manager approve', async ({ page, context }) => {
    // Employee creates and submits targets
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="password"]', TEST_EMPLOYEE.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/targets/new')

    // Fill in 3 targets with 100% weight
    const targets = page.locator('[class*="border rounded-lg"]')
    
    // Target 1 - L1 difficulty
    await targets.nth(0).locator('textarea').fill('Lead architecture design for new microservices platform')
    await targets.nth(0).locator('input[placeholder*="KPI"]').fill('Complete architecture documentation and 3 services')
    await targets.nth(0).locator('input[type="number"]').fill('40')
    
    // Target 2 - L2 difficulty
    await targets.nth(1).locator('textarea').fill('Improve system performance and reduce latency by 30%')
    await targets.nth(1).locator('input[placeholder*="KPI"]').fill('Achieve sub-100ms response times')
    await targets.nth(1).locator('input[type="number"]').fill('35')
    
    // Target 3 - L3 difficulty
    await targets.nth(2).locator('textarea').fill('Conduct weekly team meetings and maintain documentation')
    await targets.nth(2).locator('input[placeholder*="KPI"]').fill('100% attendance and updated docs')
    await targets.nth(2).locator('input[type="number"]').fill('25')

    // Wait for 100% weight
    await page.waitForTimeout(500)
    await expect(page.locator('text=100%')).toBeVisible()

    // Submit to manager
    await page.click('button[type="submit"]')

    // Should redirect to target detail page
    await page.waitForURL(/\/targets\/[a-f0-9-]+/)
    await expect(page.locator('text=Pending Manager Review')).toBeVisible()

    // Get the target ID from URL
    const url = page.url()
    const targetId = url.split('/').pop()

    // Logout employee
    await page.goto('/dashboard')
    await page.click('button:has-text("Logout")').catch(() => {})
    
    // Login as manager
    const managerPage = await context.newPage()
    await managerPage.goto('/login')
    await managerPage.fill('input[name="email"]', TEST_MANAGER.email)
    await managerPage.fill('input[name="password"]', TEST_MANAGER.password)
    await managerPage.click('button[type="submit"]')
    await managerPage.waitForURL('/dashboard')

    // Navigate to pending targets
    await managerPage.goto('/targets/pending')
    await expect(managerPage.locator('h1')).toContainText('Pending Target Approvals')

    // Should see employee's targets
    await expect(managerPage.locator(`text=${TEST_EMPLOYEE.fullName}`)).toBeVisible()

    // Click on employee to view targets
    await managerPage.click(`text=${TEST_EMPLOYEE.fullName}`)

    // Verify targets are displayed
    await expect(managerPage.locator('text=Target 1')).toBeVisible()
    await expect(managerPage.locator('text=Lead architecture design')).toBeVisible()

    // Approve targets
    await managerPage.click('button:has-text("Approve Targets")')

    // Should refresh and remove from pending list or show success
    await managerPage.waitForTimeout(1000)
    
    // Navigate to the target detail page to verify approval
    await managerPage.goto(`/targets/${targetId}`)
    await expect(managerPage.locator('text=Manager Approved')).toBeVisible()
  })

  test('AC4: Manager can request revisions with feedback', async ({ page, context }) => {
    // Create a new target as employee
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="password"]', TEST_EMPLOYEE.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Delete any existing targets for this test
    const existingTargets = await prisma.targetSetting.findMany({
      where: { employeeId: employeeId, cycleYear: new Date().getFullYear() + 1 },
    })
    for (const target of existingTargets) {
      await prisma.targetSetting.delete({ where: { id: target.id } })
    }

    // Create target via API with next year to avoid conflict
    const response = await page.request.post('/api/targets', {
      data: {
        cycleYear: new Date().getFullYear() + 1,
        targets: [
          {
            taskDescription: 'Task one with minimal description here for testing',
            kpi: 'KPI one',
            weight: 30,
            difficulty: 'L2',
          },
          {
            taskDescription: 'Task two with some more description for testing',
            kpi: 'KPI two',
            weight: 30,
            difficulty: 'L2',
          },
          {
            taskDescription: 'Task three with adequate description for testing',
            kpi: 'KPI three',
            weight: 40,
            difficulty: 'L2',
          },
        ],
      },
    })

    const targetData = await response.json()
    const targetId = targetData.id

    // Submit to manager
    await page.request.post(`/api/targets/${targetId}/submit`)

    // Login as manager
    const managerPage = await context.newPage()
    await managerPage.goto('/login')
    await managerPage.fill('input[name="email"]', TEST_MANAGER.email)
    await managerPage.fill('input[name="password"]', TEST_MANAGER.password)
    await managerPage.click('button[type="submit"]')
    await managerPage.waitForURL('/dashboard')

    await managerPage.goto('/targets/pending')

    // Click on employee
    await managerPage.click(`text=${TEST_EMPLOYEE.fullName}`)

    // Provide feedback
    await managerPage.fill('textarea', 'Please provide more detailed KPIs that are measurable and specific. Also consider adding concrete metrics for target 1.')

    // Request revision
    await managerPage.click('button:has-text("Request Revision")')

    await managerPage.waitForTimeout(1000)

    // Verify status changed
    await managerPage.goto(`/targets/${targetId}`)
    await expect(managerPage.locator('text=Revision Requested')).toBeVisible()
  })

  test('AC5: Target storage and year-long access', async ({ page }) => {
    // Login as employee
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="password"]', TEST_EMPLOYEE.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Fetch targets via API
    const response = await page.request.get(`/api/targets?cycleYear=${new Date().getFullYear()}`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.targets).toBeDefined()
    expect(Array.isArray(data.targets)).toBeTruthy()

    // Verify targets are accessible
    if (data.targets.length > 0) {
      const targetId = data.targets[0].id
      await page.goto(`/targets/${targetId}`)
      await expect(page.locator('h1')).toContainText('Performance Targets')
    }
  })
})
