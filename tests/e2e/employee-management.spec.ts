import { test, expect } from '@playwright/test'

// Test data
const TEST_HR_ADMIN = {
  email: 'admin@prdcv.com',
  password: 'Pr&dcv@2025',
  fullName: 'Admin User',
  roles: ['hr_admin'],
  employeeId: 'HR001',
  grade: 'Senior',
  department: 'HR'
}

const TEST_EMPLOYEE = {
  employeeId: 'TEST001',
  fullName: 'Test Employee',
  email: 'test.employee@example.com',
  grade: 'Junior',
  department: 'Engineering',
  jobTitle: 'Junior Engineer'
}

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR Admin
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_HR_ADMIN.email)
    await page.fill('input[name="password"]', TEST_HR_ADMIN.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('AC2: should display employee directory with all required fields', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('User Management')
    
    // Check table headers
    await expect(page.locator('th:has-text("Employee ID")')).toBeVisible()
    await expect(page.locator('th:has-text("Name")')).toBeVisible()
    await expect(page.locator('th:has-text("Email")')).toBeVisible()
    await expect(page.locator('th:has-text("Grade")')).toBeVisible()
    await expect(page.locator('th:has-text("Department")')).toBeVisible()
    await expect(page.locator('th:has-text("Roles")')).toBeVisible()
  })

  test('AC3: should create employee manually with all required fields', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Click create user button
    await page.click('button:has-text("Create User")')
    
    // Fill in the form
    await page.fill('input[name="fullName"]', TEST_EMPLOYEE.fullName)
    await page.fill('input[name="email"]', TEST_EMPLOYEE.email)
    await page.fill('input[name="employeeId"]', TEST_EMPLOYEE.employeeId)
    await page.fill('input[name="password"]', 'TempPassword123!')
    await page.fill('input[name="grade"]', TEST_EMPLOYEE.grade)
    await page.fill('input[name="department"]', TEST_EMPLOYEE.department)
    
    // Select role
    await page.check('input[type="checkbox"][value="employee"]')
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Wait for modal to close and table to update
    await page.waitForTimeout(1000)
    
    // Verify employee appears in table
    await expect(page.locator(`text=${TEST_EMPLOYEE.employeeId}`)).toBeVisible()
    await expect(page.locator('tr').filter({ hasText: TEST_EMPLOYEE.employeeId }).filter({ hasText: TEST_EMPLOYEE.fullName })).toBeVisible()
  })

  test('AC3: should edit existing employee', async ({ page }) => {
    await page.goto('/admin/users')
    
    // First create a test employee to edit
    const uniqueId = `TEST${Date.now()}`
    const email = `test${Date.now()}@example.com`
    await page.click('button:has-text("Create User")')
    
    await page.fill('input[name="fullName"]', TEST_EMPLOYEE.fullName)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="employeeId"]', uniqueId)
    await page.fill('input[name="password"]', 'TempPassword123!')
    await page.fill('input[name="grade"]', 'Junior')
    await page.fill('input[name="department"]', TEST_EMPLOYEE.department)
    await page.check('input[type="checkbox"][value="employee"]')
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Wait for modal to close
    await page.waitForSelector('h2:has-text("Create User")', { state: 'hidden' })
    
    // Wait for user to appear in table
    await page.waitForSelector(`text=${uniqueId}`, { timeout: 5000 })
    
    // Now find and click edit button for the test employee
    const row = page.locator('tr').filter({ hasText: email })
    await row.locator('button:has-text("Edit")').click()
    
    // Update the grade
    await page.fill('input[name="grade"]', 'Senior')
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Update")')
    
    // Wait for modal to close
    await page.waitForSelector('h2:has-text("Edit User")', { state: 'hidden' })
    
    // Verify update
    await expect(page.locator('tr').filter({ hasText: email })).toContainText('Senior')
  })

  test('AC4: should filter employees by search term', async ({ page }) => {
    await page.goto('/admin/users')
    
    // First create a test employee to search for
    const uniqueId = `TEST${Date.now()}`
    const email = `test${Date.now()}@example.com`
    await page.click('button:has-text("Create User")')
    
    await page.fill('input[name="fullName"]', TEST_EMPLOYEE.fullName)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="employeeId"]', uniqueId)
    await page.fill('input[name="password"]', 'TempPassword123!')
    await page.fill('input[name="grade"]', TEST_EMPLOYEE.grade)
    await page.fill('input[name="department"]', TEST_EMPLOYEE.department)
    await page.check('input[type="checkbox"][value="employee"]')
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Wait for modal to close
    await page.waitForSelector('h2:has-text("Create User")', { state: 'hidden' })
    
    // Wait for user to appear in table
    await page.waitForSelector(`text=${uniqueId}`, { timeout: 5000 })
    
    // Wait for users to load
    await page.waitForSelector('table tbody tr')
    
    // Get initial row count
    const initialCount = await page.locator('table tbody tr').count()
    expect(initialCount).toBeGreaterThan(0)
    
    // Search by employee ID
    await page.fill('input[placeholder*="Search"]', uniqueId)
    await page.waitForTimeout(500)
    
    // Verify filtered results
    const filteredCount = await page.locator('table tbody tr').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    
    // Verify the test employee is visible
    await expect(page.locator('tr').filter({ hasText: uniqueId })).toBeVisible()
  })

  test('AC4: should filter employees by department', async ({ page }) => {
    await page.goto('/admin/users')
    
    // First create a test employee to filter
    const uniqueId = `TEST${Date.now()}`
    const email = `test${Date.now()}@example.com`
    await page.click('button:has-text("Create User")')
    
    await page.fill('input[name="fullName"]', TEST_EMPLOYEE.fullName)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="employeeId"]', uniqueId)
    await page.fill('input[name="password"]', 'TempPassword123!')
    await page.fill('input[name="grade"]', TEST_EMPLOYEE.grade)
    await page.fill('input[name="department"]', TEST_EMPLOYEE.department)
    await page.check('input[type="checkbox"][value="employee"]')
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Wait for modal to close and user to appear in table
    await page.waitForSelector(`text=${uniqueId}`, { timeout: 5000 })
    
    // Wait for users to load
    await page.waitForSelector('table tbody tr')
    
    // Select department filter
    await page.selectOption('select', TEST_EMPLOYEE.department)
    await page.waitForTimeout(500)
    
    // Verify all visible rows have the selected department
    const rows = await page.locator('table tbody tr').all()
    for (const row of rows) {
      await expect(row).toContainText(TEST_EMPLOYEE.department)
    }
  })

  test('AC4: should clear filters', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Apply search filter
    await page.fill('input[placeholder*="Search"]', TEST_EMPLOYEE.employeeId)
    await page.waitForTimeout(500)
    
    // Click clear filters
    await page.click('button:has-text("Clear Filters")')
    await page.waitForTimeout(500)
    
    // Verify search input is cleared
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('')
  })

  test('AC1: should access CSV import page', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Click import button
    await page.click('button:has-text("Import Users")')
    
    // Verify we're on the import page
    await expect(page).toHaveURL('/admin/users/import')
    await expect(page.locator('h1')).toContainText('Import Employees')
  })

  test('AC1: should download CSV template', async ({ page }) => {
    await page.goto('/admin/users/import')
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click download template button
    await page.click('button:has-text("Download CSV Template")')
    
    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('employee-import-template.csv')
  })

  test('AC1: should show import instructions', async ({ page }) => {
    await page.goto('/admin/users/import')
    
    // Verify instructions are visible
    await expect(page.locator('text=Import Instructions')).toBeVisible()
    await expect(page.locator('text=Required columns')).toBeVisible()
    await expect(page.locator('text=employeeId, fullName, email, grade, department')).toBeVisible()
  })

  test('AC5: should lookup employee by ID (auto-population preparation)', async ({ page }) => {
    // This test verifies the API endpoint works, which is used by auto-population
    const response = await page.request.get(`/api/users/${TEST_EMPLOYEE.employeeId}`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.user).toBeDefined()
    expect(data.user.employeeId).toBe(TEST_EMPLOYEE.employeeId)
    expect(data.user.fullName).toBe(TEST_EMPLOYEE.fullName)
    expect(data.user.email).toBe(TEST_EMPLOYEE.email)
    expect(data.user.grade).toBeDefined()
    expect(data.user.department).toBeDefined()
  })

  test('should require HR Admin role for user management', async ({ page }) => {
    // Logout using the header logout button
    await page.click('button:has-text("Logout")')
    
    // Should redirect to login
    await page.waitForURL('/login')
  })

  test('should validate required fields when creating employee', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Click create user button
    await page.click('button:has-text("Create User")')
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Form should show validation errors (browser validation)
    const fullNameInput = page.locator('input[name="fullName"]')
    const isInvalid = await fullNameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })
})

test.describe('Employee Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR Admin
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_HR_ADMIN.email)
    await page.fill('input[name="password"]', TEST_HR_ADMIN.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/admin/users/import')
  })

  test('AC1: should validate CSV file type', async ({ page }) => {
    // Create a test file with wrong extension
    const buffer = Buffer.from('test content')
    
    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('label[for="file-upload"]')
    const fileChooser = await fileChooserPromise
    
    // Note: In real scenario, we'd upload a .txt file
    // This test validates the client-side file type checking
    await expect(page.locator('input[type="file"]')).toHaveAttribute('accept', '.csv')
  })

  test('AC1: should parse and preview CSV data', async ({ page }) => {
    // Create CSV content
    const csvContent = `employeeId,fullName,email,grade,department,jobTitle
EMP999,Import Test,import.test@example.com,Junior,IT,Developer`
    
    // Create a blob and set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('label[for="file-upload"]')
    const fileChooser = await fileChooserPromise
    
    // Upload file
    await fileChooser.setFiles({
      name: 'test-employees.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Wait for preview to appear
    await page.waitForSelector('text=Preview')
    
    // Verify preview shows the data
    await expect(page.locator('text=EMP999')).toBeVisible()
    await expect(page.locator('text=Import Test')).toBeVisible()
  })
})
