import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Fill out the form
    await page.fill('input[name="fullName"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Select a role
    await page.check('input[value="employee"]')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should redirect to login with success message
    await page.waitForURL('/login?message=Registration%20successful')
    expect(page.url()).toContain('/login?message=Registration%20successful')
  })

  test('should show error for existing email', async ({ page }) => {
    // First register a user
    await page.goto('/register')
    await page.fill('input[name="fullName"]', 'Existing User')
    await page.fill('input[name="email"]', 'existing@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.check('input[value="employee"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('/login?message=Registration%20successful')

    // Try to register again with same email
    await page.goto('/register')
    await page.fill('input[name="fullName"]', 'Another User')
    await page.fill('input[name="email"]', 'existing@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.check('input[value="employee"]')
    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=User with this email already exists')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/register')

    // Try to submit without filling fields
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('input[name="fullName"]:invalid')).toBeTruthy()
    await expect(page.locator('input[name="email"]:invalid')).toBeTruthy()
    await expect(page.locator('input[name="password"]:invalid')).toBeTruthy()
  })

  test('should require at least one role', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="fullName"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Don't select any role
    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=Please select at least one role')).toBeVisible()
  })
})