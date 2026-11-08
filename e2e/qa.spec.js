// Phase 8 gap tests: skip link, and deep links with refresh.
import { expect, test } from '@playwright/test'

const h1 = (page) => page.getByRole('heading', { level: 1 })

test('skip link becomes visible on focus and moves focus to the main content', async ({ page }) => {
  await page.goto('/moments')
  await expect(h1(page)).toBeVisible()
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await skip.focus() // the heading already has focus after load, so go straight to the link
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

for (const [path, heading] of [['/visits/book', /Book a Visit/], ['/community?tab=news', /Community/], ['/staff/inquiries', /Inquiries/], ['/staff/visits-events?tab=events', /Visits/]]) {
  test(`direct load and refresh of ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(h1(page)).toHaveText(heading)
    await page.reload()
    await expect(h1(page)).toHaveText(heading)
  })
}
