import { test, expect } from '@playwright/test'

test.describe('Auth — Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('renders email and password fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('Google SSO button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i }).or(page.getByText(/continue with google/i))).toBeVisible()
  })

  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    // At least one error message should appear
    await expect(page.locator('[class*="error"], [class*="text-error"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('sign-up link navigates to /auth/signup', async ({ page }) => {
    await page.getByRole('link', { name: /sign up|create account|register/i }).click()
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})
