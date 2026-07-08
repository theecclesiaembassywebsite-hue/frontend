import { test, expect } from '@playwright/test'

test.describe('Service Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the API call to resolve so we see live data, not just defaults
    await page.waitForTimeout(1500)
  })

  test('renders exactly 5 service tabs', async ({ page }) => {
    const tabs = page.locator('button[aria-pressed]')
    await expect(tabs).toHaveCount(5)
  })

  test('Worship Service appears exactly once — not duplicated', async ({ page }) => {
    // Should appear once as a tab label; detail card only shows it when selected
    const tabs = page.locator('button[aria-pressed]')
    const allText = await tabs.allTextContents()
    const worshipMatches = allText.filter((t) => /worship service/i.test(t))
    expect(worshipMatches).toHaveLength(1)
  })

  test('no tab is active by default; clicking the first tab reveals its detail card', async ({ page }) => {
    const firstTab = page.locator('button[aria-pressed]').first()
    await expect(firstTab).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('article')).toHaveCount(0)

    await firstTab.click()
    await expect(firstTab).toHaveAttribute('aria-pressed', 'true')

    const cardHeading = page.locator('article h3')
    const firstTabText = await firstTab.textContent()
    // The detail card heading should match the active tab's service name
    await expect(cardHeading).not.toBeEmpty()
    const headingText = await cardHeading.textContent()
    expect(firstTabText?.toLowerCase()).toContain(headingText?.toLowerCase().trim() ?? '')
  })

  test('clicking each tab updates the detail card', async ({ page }) => {
    const tabs = page.locator('button[aria-pressed]')
    const count = await tabs.count()

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i)
      await tab.click()
      await expect(tab).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('article h3')).not.toBeEmpty()
    }
  })

  test('Worship Service tab shows correct detail on click', async ({ page }) => {
    const worshipTab = page.locator('button[aria-pressed]').filter({ hasText: /Worship Service/i })
    await worshipTab.click()

    await expect(page.locator('article h3')).toHaveText(/Worship Service/i)
    // Time is shown in the detail card
    await expect(page.locator('article')).toContainText('5:30 PM')
  })
})
