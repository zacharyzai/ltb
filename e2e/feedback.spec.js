import { test, expect } from '@playwright/test'

test('caregiver can send feedback from the header', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 700 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Feedback' }).click()
  await page.getByRole('button', { name: 'Send feedback' }).click()
  await expect(page.getByText('Please choose how')).toBeVisible()
  await page.getByRole('button', { name: /Great/ }).click()
  await page.getByRole('button', { name: 'Send feedback' }).click()
  await expect(page.getByText('Thank you!')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('staff portal has no feedback button', async ({ page }) => {
  await page.goto('/staff')
  await expect(page.getByRole('button', { name: 'Feedback' })).toHaveCount(0)
})

test('at 320px feedback is reachable from Settings', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Feedback' }).click()
  await expect(page.getByRole('heading', { name: 'Share your feedback' })).toBeVisible()
})
