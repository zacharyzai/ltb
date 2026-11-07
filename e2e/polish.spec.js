// Phase 7: not-found page, empty states with actions, reduced motion.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const h1 = (page) => page.getByRole('heading', { level: 1 })

test('404: friendly page with a way home, in the caregiver shell', async ({ page }) => {
  await page.goto('/no-such-page')
  await expect(h1(page)).toHaveText('Page not found')
  await expect(page.getByText(/could not find the page/)).toBeVisible()
  await page.getByRole('link', { name: 'Back to Home' }).click()
  await expect(page).toHaveURL(/:\d+\/$/)
})

test('404 under /staff keeps the staff shell and goes back to the Dashboard', async ({ page }) => {
  await page.goto('/staff/no-such-page')
  await expect(page.getByRole('navigation', { name: 'Staff navigation' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to Dashboard' }).click()
  await expect(page).toHaveURL(/\/staff$/)
})

for (const theme of ['light', 'dark']) {
  test(`404 has no axe violations (${theme})`, async ({ page }) => {
    await page.goto('/')
    await page.evaluate((t) => localStorage.setItem('sas.theme', t), theme)
    await page.goto('/no-such-page')
    await expect(h1(page)).toBeVisible()
    await page.waitForTimeout(300)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(r.violations.map((v) => v.id)).toEqual([])
  })
}

test('cancelling every upcoming visit shows a friendly empty state with a Book a visit button', async ({ page }) => {
  await page.goto('/visits')
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Cancel visit' }).first().click()
    await page.getByRole('dialog').getByRole('button', { name: 'Yes, cancel visit' }).click()
  }
  const section = page.getByRole('region', { name: 'Upcoming visits' })
  await expect(section.getByText('No upcoming visits')).toBeVisible()
  await expect(section.getByText('When you book a visit, it will appear here.')).toBeVisible()
  await section.getByRole('link', { name: 'Book a visit' }).click()
  await expect(page).toHaveURL(/\/visits\/book$/)
})

test('a caregiver with no questions can ask one straight from the empty state', async ({ page }) => {
  await page.goto('/moments')
  await page.getByRole('button', { name: /Mdm Wong/ }).click()
  const empty = page.getByRole('region', { name: 'Your questions' })
  await expect(empty.getByText('You have not asked anything about this resident yet.')).toBeVisible()
  await empty.getByRole('button', { name: 'Ask a question' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('reduced motion switches the page entrance off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(h1(page)).toBeVisible()
  const ms = await page.locator('.page').evaluate((e) => parseFloat(getComputedStyle(e).animationDuration) * 1000)
  expect(ms).toBeLessThan(1)
})
