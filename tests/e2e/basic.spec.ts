import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PA System/)
})

test('login page is accessible', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('h2')).toContainText('Sign in')
})
