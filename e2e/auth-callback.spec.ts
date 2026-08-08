import { expect, test } from '@playwright/test'

/**
 * The OAuth callback screen.
 *
 * Two properties are worth holding onto here, because both were changed
 * deliberately and both are easy to regress:
 *
 *   1. The session arrives as the backend's httpOnly cookie. The callback URL
 *      no longer carries the JWT, so a 7-day bearer credential never lands in
 *      browser history or a proxy log.
 *
 *   2. `?redirect=` is attacker-controllable — it is a query parameter on a page
 *      anyone can link to — so it must only ever send the user to an in-app
 *      path, never off-site.
 */

test.describe('open redirect is not possible via ?redirect=', () => {
  const offSiteAttempts = [
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '\\/evil.example',
    'javascript:alert(document.domain)',
    '///evil.example',
  ]

  for (const attempt of offSiteAttempts) {
    test(`refuses to navigate to ${JSON.stringify(attempt)}`, async ({ page }) => {
      await page.goto(
        `/auth/callback?status=success&redirect=${encodeURIComponent(attempt)}`,
      )
      await page.waitForLoadState('networkidle')

      // Whatever happened, we must still be on this origin.
      const origin = new URL(page.url()).origin
      const expected = new URL(
        process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
      ).origin
      expect(origin).toBe(expected)
      expect(page.url()).not.toContain('evil.example')
    })
  }

  test('an in-app path is honoured', async ({ page }) => {
    await page.goto('/auth/callback?status=success&redirect=%2Fdashboard')
    await page.waitForLoadState('networkidle')

    // Either we reached /dashboard, or its own auth guard bounced us to login.
    // Both mean the redirect parameter was accepted and acted on in-app.
    expect(page.url()).toMatch(/\/(dashboard|auth\/login)/)
  })
})

test.describe('the session never travels in the URL', () => {
  test('a callback without a token still completes', async ({ page }) => {
    // The backend sets the cookie before redirecting; the page only needs the
    // success signal. If this regresses to requiring ?token=, sign-in breaks.
    await page.goto('/auth/callback?status=success&redirect=%2Fdashboard')
    await page.waitForLoadState('networkidle')

    expect(page.url()).not.toContain('/auth/login?error=google_failed')
  })

  test('a callback without a success signal is treated as a failure', async ({
    page,
  }) => {
    await page.goto('/auth/callback')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/auth\/login\?error=google_failed/)
  })

  test('no token is written to localStorage by default', async ({ page }) => {
    await page.goto('/auth/callback?status=success&redirect=%2Fdashboard')
    await page.waitForLoadState('networkidle')

    // NEXT_PUBLIC_STORE_TOKEN is off unless explicitly enabled, so the
    // JS-readable copy must not exist — the httpOnly cookie is the session.
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'))
    expect(token).toBeNull()
  })
})
