// Account, settings and the beginner's guide (Phase 6). Every test starts with an empty localStorage, so the guide is "first visit".
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const h1 = (page) => page.getByRole('heading', { level: 1 })
const open = async (page, path, prefs = {}) => {
  await page.goto('/')
  await page.evaluate((p) => Object.entries(p).forEach(([k, v]) => localStorage.setItem(k, v)), prefs)
  await page.goto(path)
  await expect(h1(page)).toBeVisible()
}
const group = (page, name) => page.getByRole('group', { name })
const dialog = (page) => page.getByRole('dialog')
const flag = (page, role) => page.evaluate((r) => localStorage.getItem(`sas.guide.${r}`), role)
const SEEN = { 'sas.guide.caregiver': 'skipped', 'sas.guide.staff': 'skipped' }

test.describe('account', () => {
  test('caregiver account shows the fictional profile and only linked residents', async ({ page }) => {
    await open(page, '/account', SEEN)
    await expect(page.getByText('Sarah Tan', { exact: true })).toBeVisible()
    await expect(page.getByText('Family caregiver')).toBeVisible()
    await expect(page.getByText('Demo account')).toBeVisible()
    const residents = page.getByRole('button', { name: /Mother|Aunt/ })
    await expect(residents).toHaveCount(2)
    await expect(page.getByText('Mr Lim Boon Huat')).toHaveCount(0) // linked to another caregiver
    await expect(page.getByText(/not a medical assessment/)).toBeVisible()
  })

  test('choosing a resident here changes who Home shows', async ({ page }) => {
    await open(page, '/account', SEEN)
    await page.getByRole('button', { name: /Madam Wong/ }).click()
    await expect(page.getByRole('button', { name: /Madam Wong/ })).toContainText('Viewing')
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: 'Madam Wong Siew Fong' })).toBeVisible()
  })

  test('staff account shows the staff member and no resident list', async ({ page }) => {
    await open(page, '/staff/account', SEEN)
    await expect(h1(page)).toHaveText('Staff Account')
    await expect(page.getByText('Aisha binte Rahman')).toBeVisible()
    await expect(page.getByText('Nurse', { exact: true })).toBeVisible()
    await expect(page.getByText('Demo account')).toBeVisible()
    await expect(page.getByText('About the staff portal')).toBeVisible()
    await expect(page.getByText('Linked residents')).toHaveCount(0)
  })

  test('the demo view switch moves between the two accounts', async ({ page }) => {
    await open(page, '/account', SEEN)
    await group(page, 'Demo view').last().getByRole('button', { name: 'Staff' }).click()
    await expect(page).toHaveURL(/\/staff$/)
    await page.getByRole('link', { name: 'Account' }).click()
    await expect(h1(page)).toHaveText('Staff Account')
    await group(page, 'Demo view').last().getByRole('button', { name: 'Caregiver' }).click()
    await expect(h1(page)).toContainText('Sarah')
  })
})

test.describe('settings preferences', () => {
  test('language applies everywhere and is remembered', async ({ page }) => {
    await open(page, '/account', SEEN)
    await group(page, 'Language').first().getByRole('button', { name: /Bahasa Melayu|BM/ }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ms')
    await expect(h1(page)).toHaveText('Akaun')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ms')
  })

  test('theme and text size apply immediately and are remembered', async ({ page }) => {
    await open(page, '/account', SEEN)
    await group(page, 'Theme').first().getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await group(page, 'Text size').first().getByRole('button', { name: 'Extra large' }).click()
    await expect(page.locator('html')).toHaveCSS('font-size', '21px')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('html')).toHaveCSS('font-size', '21px')
  })
})

test.describe('beginner guide', () => {
  test('first visit offers the guide on Home; Not now is remembered and it is not offered again', async ({ page }) => {
    await open(page, '/')
    await expect(dialog(page)).toHaveCount(0) // never pops up on its own
    await expect(page.getByRole('heading', { name: 'New here?' })).toBeVisible()
    await page.getByRole('button', { name: 'Not now' }).click()
    await expect(page.getByRole('heading', { name: 'New here?' })).toHaveCount(0)
    expect(await flag(page, 'caregiver')).toBe('skipped')
    await page.reload()
    await expect(h1(page)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'New here?' })).toHaveCount(0)
  })

  test('no offer on pages where a form could be in progress', async ({ page }) => {
    for (const path of ['/visits/book', '/moments', '/staff/moment', '/staff/inquiries']) {
      await open(page, path)
      await expect(page.getByRole('heading', { name: 'New here?' })).toHaveCount(0)
      await expect(dialog(page)).toHaveCount(0)
    }
  })

  test('caregiver guide: five steps, announced, Previous/Next/Finish, flagged as done', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'Start the tour' }).click()
    const dlg = dialog(page)
    await expect(dlg.getByRole('heading', { name: "Beginner's guide" })).toBeVisible()
    await expect(dlg.getByRole('heading', { name: 'Welcome to SAS Connect' })).toBeVisible()
    await expect(dlg.getByText('Step 1 of 5').first()).toBeVisible()
    await expect(dlg.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await dlg.getByRole('button', { name: 'Next' }).click()
    await expect(dlg.getByRole('status')).toHaveText('Step 2 of 5: Home: how are they today?')
    await dlg.getByRole('button', { name: 'Previous' }).click()
    await expect(dlg.getByRole('heading', { name: 'Welcome to SAS Connect' })).toBeVisible()
    await expect(dlg.getByRole('button', { name: 'Next' })).toBeFocused() // focus never falls out of the dialog
    for (const heading of ['Home: how are they today?', 'Moments and questions', 'Visits', 'Community']) {
      await dlg.getByRole('button', { name: 'Next' }).click()
      await expect(dlg.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
    await dlg.getByRole('button', { name: 'Finish' }).click()
    await expect(dialog(page)).toHaveCount(0)
    await expect(page.getByText('You are all set.')).toBeVisible()
    expect(await flag(page, 'caregiver')).toBe('done')
    expect(await flag(page, 'staff')).toBeNull() // separate flag per role
  })

  test('staff guide: four steps from the dashboard shortcut, then Skip, and it can be reopened', async ({ page }) => {
    await open(page, '/staff', { 'sas.guide.staff': 'done' })
    await expect(page.getByRole('heading', { name: 'New here?' })).toHaveCount(0)
    await page.getByRole('main').getByRole('button', { name: "Beginner's guide" }).click()
    const dlg = dialog(page)
    await expect(dlg.getByText('Step 1 of 4').first()).toBeVisible()
    for (let i = 0; i < 3; i++) await dlg.getByRole('button', { name: 'Next' }).click()
    await expect(dlg.getByRole('heading', { name: 'Inquiries, visits and events' })).toBeVisible()
    await expect(dlg.getByRole('button', { name: 'Finish' })).toBeVisible()
    await dlg.getByRole('button', { name: 'Skip guide' }).click()
    await expect(dialog(page)).toHaveCount(0)
    await page.getByRole('main').getByRole('button', { name: "Beginner's guide" }).click()
    await expect(dialog(page)).toBeVisible()
  })

  test('opened from Account: Escape closes it and focus returns to the opener; Tab stays inside', async ({ page }) => {
    await open(page, '/account', SEEN)
    const opener = page.getByRole('button', { name: "Open the beginner's guide" })
    await opener.click()
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      // A native modal makes the page inert: focus is inside the dialog (or briefly on the browser chrome), never on page content.
      expect(await page.evaluate(() => document.activeElement === document.body || Boolean(document.activeElement.closest('dialog')))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test('closing the guide with the X also counts as dismissed', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'Start the tour' }).click()
    await dialog(page).getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('heading', { name: 'New here?' })).toHaveCount(0)
    expect(await flag(page, 'caregiver')).toBe('skipped')
  })
})

const axe = async (page) => {
  await page.waitForTimeout(300) // let the dialog fade-in finish before measuring contrast
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
}
const report = (r) => r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)

test.describe('accessibility', () => {
  for (const theme of ['light', 'dark']) {
    test(`account pages, guides and settings dialog have no violations (${theme})`, async ({ page }) => {
      const prefs = { 'sas.theme': theme }
      await open(page, '/account', prefs)
      expect(report(await (await axe(page)).analyze()), 'caregiver account').toEqual([])
      await page.getByRole('button', { name: "Open the beginner's guide" }).click()
      expect(report(await (await axe(page)).analyze()), 'caregiver guide').toEqual([])
      await page.keyboard.press('Escape')
      await open(page, '/staff/account', prefs)
      expect(report(await (await axe(page)).analyze()), 'staff account').toEqual([])
      await page.getByRole('button', { name: "Open the beginner's guide" }).click()
      await dialog(page).getByRole('button', { name: 'Next' }).click()
      expect(report(await (await axe(page)).analyze()), 'staff guide').toEqual([])
      await page.keyboard.press('Escape')
      await page.setViewportSize({ width: 390, height: 800 })
      await page.getByRole('button', { name: 'Settings' }).click()
      expect(report(await (await axe(page)).analyze()), 'settings dialog').toEqual([])
      await open(page, '/', { ...prefs })
      expect(report(await (await axe(page)).analyze()), 'home with the guide offer').toEqual([])
    })
  }
})

test.describe('guide layout', () => {
  const LANGS = ['en', 'zh', 'ms', 'ta']
  for (const lang of LANGS) {
    test(`the guide fits at 320px with extra-large text in ${lang}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await open(page, '/account', { ...SEEN, 'sas.locale': lang, 'sas.textSize': 'xlarge' })
      await page.locator('main .app-btn.is-secondary').last().click()
      const dlg = dialog(page)
      for (let step = 0; step < 4; step++) {
        const m = await dlg.evaluate((d) => ({ over: d.scrollWidth - d.clientWidth, right: d.getBoundingClientRect().right, left: d.getBoundingClientRect().left, small: [...d.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().height < 47.5).length }))
        expect(m.over, `step ${step} horizontal overflow`).toBeLessThanOrEqual(0)
        expect(m.left).toBeGreaterThanOrEqual(0)
        expect(m.right).toBeLessThanOrEqual(320)
        expect(m.small, 'targets under 48px').toBe(0)
        await dlg.locator('[data-guide-next]').click()
      }
    })
  }
})
