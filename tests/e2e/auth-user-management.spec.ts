import { test, expect } from '@playwright/test'

// Helper function to login as HR Admin
async function loginAsHRAdmin(page: any) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'admin@prdcv.com')
  await page.fill('input[name="password"]', 'Pr&dcv@2025')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

// Helper function to login as regular user
async function loginAsEmployee(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

test.describe('HR Admin User Management', () => {
  test('HR Admin can access user management page', async ({ page }) => {
    await loginAsHRAdmin(page)
    
    // Navigate to user management
    await page.goto('/admin/users')
    
    // Should see user management page
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible()
    await expect(page.locator('button:has-text("Create User")')).toBeVisible()
    await expect(page.locator('button:has-text("Import Users")')).toBeVisible()
  })

  test('HR Admin can create a new user', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    
    // Click Create User button
    await page.click('button:has-text("Create User")')
    
    // Fill out the form
    await page.fill('input[name="fullName"]', 'Test Employee')
    await page.fill('input[name="email"]', `test.employee.${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'password123')
    
    // Select employee role
    await page.check('input[value="employee"]')
    
    // Fill optional fields
    await page.fill('input[name="grade"]', 'Senior')
    await page.fill('input[name="department"]', 'Engineering')
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Modal should close and user should appear in the list
    await expect(page.locator('text=Test Employee')).toBeVisible()
  })

  test('HR Admin can edit an existing user', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    
    // Find and click edit button for the first user
    const editButtons = page.locator('button:has-text("Edit")')
    await editButtons.first().click()
    
    // Wait for edit modal to appear
    await expect(page.locator('h2:has-text("Edit User")')).toBeVisible()
    
    // Update full name
    await page.fill('input[name="fullName"]', 'Updated User Name')
    
    // Update grade
    await page.fill('input[name="grade"]', 'Principal')
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Update")')
    
    // Modal should close
    await expect(page.locator('h2:has-text("Edit User")')).not.toBeVisible()
  })

  test('HR Admin can navigate to import users page', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    
    // Click Import Users button
    await page.click('button:has-text("Import Users")')
    
    // Should navigate to import page
    await page.waitForURL('/admin/users/import')
    await expect(page.locator('h1:has-text("Import Users")')).toBeVisible()
    await expect(page.locator('text=CSV Format Requirements')).toBeVisible()
  })

  test('Create user form validates required fields', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    
    // Click Create User button
    await page.click('button:has-text("Create User")')
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Should show validation errors (HTML5 validation)
    const fullNameInput = page.locator('input[name="fullName"]')
    await expect(fullNameInput).toHaveAttribute('required', '')
  })

  test('Create user form requires at least one role', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    
    // Click Create User button
    await page.click('button:has-text("Create User")')
    
    // Fill required fields but don't select a role
    await page.fill('input[name="fullName"]', 'No Role User')
    await page.fill('input[name="email"]', `norole.${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'password123')
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Should show error message
    await expect(page.locator('text=Please select at least one role')).toBeVisible()
  })

  test('Non-HR Admin cannot access user management page', async ({ page }) => {
    // First, create a regular employee user as HR Admin
    await loginAsHRAdmin(page)
    await page.goto('/admin/users')
    await page.click('button:has-text("Create User")')
    
    const testEmail = `employee.${Date.now()}@example.com`
    const testPassword = 'password123'
    
    await page.fill('input[name="fullName"]', 'Regular Employee')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.check('input[value="employee"]')
    await page.click('button[type="submit"]:has-text("Create")')
    
    // Wait for user to be created
    await page.waitForTimeout(1000)
    
    // Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('/login')
    
    // Login as the regular employee
    await loginAsEmployee(page, testEmail, testPassword)
    
    // Try to access user management page
    await page.goto('/admin/users')
    
    // Should be redirected or see unauthorized message
    // (Depends on middleware implementation - might redirect to login or show error)
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/admin/users')
  })
})

test.describe('User Profile View', () => {
  test('User can view their own profile (read-only)', async ({ page }) => {
    await loginAsHRAdmin(page)
    
    // Navigate to profile page
    await page.goto('/profile')
    
    // Should see profile information
    await expect(page.locator('h1:has-text("My Profile")')).toBeVisible()
    await expect(page.locator('text=Your profile is read-only')).toBeVisible()
    await expect(page.locator('text=Contact your HR Admin to update')).toBeVisible()
    
    // Should not see edit buttons or forms
    await expect(page.locator('button:has-text("Edit")')).not.toBeVisible()
    await expect(page.locator('button:has-text("Save")')).not.toBeVisible()
  })

  test('Profile displays user information correctly', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/profile')
    
    // Should display user fields
    await expect(page.locator('text=Full Name')).toBeVisible()
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Roles')).toBeVisible()
    await expect(page.locator('text=Grade')).toBeVisible()
    await expect(page.locator('text=Department')).toBeVisible()
  })
})

test.describe('User Import', () => {
  test('Import page displays format requirements', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users/import')
    
    // Should show format requirements
    await expect(page.locator('text=CSV Format Requirements')).toBeVisible()
    await expect(page.locator('text=Required columns: email, fullName, roles')).toBeVisible()
    await expect(page.locator('text=Optional columns: password, grade, department')).toBeVisible()
  })

  test('Import page has file upload input', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users/import')
    
    // Should have file input
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()
    await expect(fileInput).toHaveAttribute('accept', '.csv,.xlsx,.xls')
  })

  test('Can navigate back to user management from import page', async ({ page }) => {
    await loginAsHRAdmin(page)
    await page.goto('/admin/users/import')
    
    // Click back button
    await page.click('button:has-text("Back to Users")')
    
    // Should navigate back to user management
    await page.waitForURL('/admin/users')
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible()
  })
})