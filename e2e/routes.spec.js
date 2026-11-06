// Every route still renders its page heading (caregiver pages are real; staff pages and Account are still placeholders).
import { expect, test } from '@playwright/test'

const ROUTES = [
  ['/', /Good (morning|afternoon|evening), Sarah/], ['/moments', 'Moments'], ['/visits', 'Visits'], ['/visits/book', 'Book a Visit'],
  ['/community', 'Community'], ['/account', 'Account'], ['/staff', 'Staff Dashboard'], ['/staff/updates', 'Resident Updates'],
  ['/staff/moment', 'Post a Moment'], ['/staff/inquiries', 'Inquiries'], ['/staff/visits-events', 'Visits & Events'],
  ['/staff/account', 'Staff Account'], ['/no-such-page', 'Page not found'],
]

for (const [path, heading] of ROUTES) {
  test(`${path} renders`, async ({ page }) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    expect(errors).toEqual([])
  })
}

test('the staff view still shows the staff navigation', async ({ page }) => {
  await page.goto('/staff')
  await expect(page.getByRole('navigation', { name: 'Staff navigation' }).getByRole('link')).toHaveCount(5)
})
