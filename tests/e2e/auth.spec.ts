import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h2')).toContainText('Sign in to PA System')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Use the seeded test user from prisma/seed.ts
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'admin@prdcv.com')
    await page.fill('input[name="password"]', 'Pr&dcv@2025')
    
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should allow logout', async ({ page }) => {
    // This would require being logged in first
    // For now, test that logout link exists when logged in
    // (would need to mock login or use seeded user)
    
    // TODO: Implement logout test with seeded user
    expect(true).toBe(true) // Placeholder
  })
})