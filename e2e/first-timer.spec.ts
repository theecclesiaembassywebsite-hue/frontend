import { test, expect } from '@playwright/test'

test.describe('First-Timer Form (/new-here)', () => {
  const firstTimerResponse = {
    id: 'ft-test-001',
    message: 'Thank you for visiting! Check your email for a welcome message.',
  }

  test.beforeEach(async ({ page }) => {
    // Intercept the POST so we don't create real records during testing
    await page.route('**/api/first-timer', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(firstTimerResponse),
      })
    )
    await page.goto('/new-here')
  })

  test('form fields are visible', async ({ page }) => {
    await expect(page.getByPlaceholder('Your full name')).toBeVisible()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('+234...')).toBeVisible()
  })

  test('successful submission shows welcome state', async ({ page }) => {
    await page.getByPlaceholder('Your full name').fill('Test User')
    await page.getByPlaceholder('your@email.com').fill('test@example.com')
    await page.getByPlaceholder('+234...').fill('+2348000000000')

    // Open the "How did you hear about us?" select and choose an option
    await page.locator('select[name="source"]').selectOption('social-media')

    await page.getByRole('button', { name: /submit/i }).click()

    await expect(page.getByText(/welcome to our family/i)).toBeVisible({ timeout: 5000 })
  })

  test('submit button is disabled while submitting', async ({ page }) => {
    // Slow the response so we can observe the loading state
    await page.route('**/api/first-timer', async (route) => {
      await new Promise((r) => setTimeout(r, 300))
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(firstTimerResponse),
      })
    })

    await page.getByPlaceholder('Your full name').fill('Test User')
    await page.getByPlaceholder('your@email.com').fill('test@example.com')
    await page.getByPlaceholder('+234...').fill('+2348000000000')
    await page.locator('select[name="source"]').selectOption('friend-family')

    const submitBtn = page.getByRole('button', { name: /submit/i })
    await submitBtn.click()

    await expect(submitBtn).toBeDisabled()
    await expect(page.getByText(/welcome to our family/i)).toBeVisible({ timeout: 5000 })
  })
})
