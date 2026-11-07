// Accessibility (axe) and responsive checks for the caregiver portal.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const CAREGIVER_ROUTES = ['/', '/moments', '/visits', '/visits/book', '/community']
const STAFF_ROUTES = ['/staff', '/staff/updates', '/staff/moment', '/staff/inquiries', '/staff/visits-events', '/staff/visits-events?tab=events']
const ROUTES = [...CAREGIVER_ROUTES, ...STAFF_ROUTES]
const WIDTHS = [320, 390, 768, 1024, 1440]
const LANGS = [['en', 'English'], ['zh', '中文'], ['ms', 'Bahasa Melayu'], ['ta', 'தமிழ்']]
const h1 = (page) => page.getByRole('heading', { level: 1 })

async function open(page, path, { theme = 'light', lang = 'en', size = 'standard' } = {}) {
  await page.goto('/')
  await page.evaluate(([th, l, sz]) => { localStorage.setItem('sas.theme', th); localStorage.setItem('sas.locale', l); localStorage.setItem('sas.textSize', sz) }, [theme, lang, size])
  await page.goto(path)
  await expect(h1(page)).toBeVisible()
  await page.waitForTimeout(250) // let the page fade-in finish before measuring contrast
}
const axe = (page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
const report = (results) => results.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)

test.describe('accessibility (axe, WCAG 2.1 A/AA)', () => {
  for (const theme of ['light', 'dark']) {
    for (const route of ROUTES) {
      test(`${route} in ${theme} theme has no violations`, async ({ page }) => {
        await open(page, route, { theme })
        expect(report(await axe(page).analyze())).toEqual([])
      })
    }
  }

  test('booking steps 2 and 3 have no violations', async ({ page }) => {
    await open(page, '/visits/book')
    await page.locator('.calendar .day:not([disabled])').nth(1).click()
    await page.getByRole('button', { name: 'Next' }).click()
    expect(report(await axe(page).analyze())).toEqual([])
    await page.locator('.slot:not(.off)').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    expect(report(await axe(page).analyze())).toEqual([])
  })

  test('community tabs have no violations', async ({ page }) => {
    for (const tab of ['news', 'past', 'volunteering']) {
      await open(page, `/community?tab=${tab}`)
      expect(report(await axe(page).analyze()), tab).toEqual([])
    }
  })

  for (const theme of ['light', 'dark']) {
    test(`dialogs (ask, event, pass) have no violations in ${theme} theme`, async ({ page }) => {
      await open(page, '/moments', { theme })
      await page.getByRole('button', { name: 'Ask a question' }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Send question' }).click() // show the validation error too
      expect(report(await axe(page).analyze()), 'ask').toEqual([])
      await page.keyboard.press('Escape')
      await open(page, '/community?event=ev-1', { theme })
      expect(report(await axe(page).analyze()), 'event').toEqual([])
      await open(page, '/visits', { theme })
      await page.getByRole('button', { name: 'View pass' }).first().click()
      expect(report(await axe(page).analyze()), 'pass').toEqual([])
    })
  }

  test('the largest text size has no violations', async ({ page }) => {
    for (const route of ['/', '/visits/book']) {
      await open(page, route, { size: 'xlarge' })
      expect(report(await axe(page).analyze()), route).toEqual([])
    }
  })
})

// One page's layout problems: horizontal overflow, content beyond the screen, targets under 48px, clipped tab labels.
const measure = (page) => page.evaluate(() => {
  const vw = innerWidth
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const off = [...document.querySelectorAll('main *, header *, nav *')].filter((e) => visible(e) && e.getBoundingClientRect().right > vw + 1 && !e.closest('.toast-host')).slice(0, 3).map((e) => `${e.tagName}.${String(e.className).slice(0, 30)}`)
  const small = [...document.querySelectorAll('button, a[href], select, textarea, input:not([type=radio]):not([type=checkbox])')]
    .filter((e) => visible(e) && !e.classList.contains('skip') && e.getBoundingClientRect().height < 47.5)
    .map((e) => (e.textContent || e.getAttribute('aria-label') || e.id).trim().slice(0, 24))
  const clipped = [...document.querySelectorAll('.tab .label, .seg-btn, .app-btn, .status')].filter((e) => visible(e) && e.scrollWidth > e.clientWidth + 1 && !e.querySelector('.visually-hidden')).map((e) => e.textContent.trim().slice(0, 24))
  const nav = document.querySelector('nav.tabs')
  const tabsOnScreen = !nav || getComputedStyle(nav).display === 'none' || nav.getBoundingClientRect().bottom <= innerHeight + 1
  // On phones the brand must not run under the settings and account buttons.
  const top = document.querySelector('header.top')
  const brand = top && getComputedStyle(top).display !== 'none' ? top.querySelector('.name') : null
  const firstButton = top?.querySelector('button, a.icon-btn')
  const brandCollides = Boolean(brand && firstButton && (brand.getBoundingClientRect().right > firstButton.getBoundingClientRect().left + 1 || brand.scrollWidth > brand.clientWidth + 1))
  return { scrollWidth: document.documentElement.scrollWidth, vw, off, small, clipped, tabsOnScreen, brandCollides }
})
const expectClean = (m, label) => {
  expect(m.scrollWidth, `${label} horizontal overflow`).toBeLessThanOrEqual(m.vw)
  expect(m.off, `${label} content beyond screen`).toEqual([])
  expect(m.small, `${label} targets under 48px`).toEqual([])
  expect(m.clipped, `${label} clipped text`).toEqual([])
  expect(m.tabsOnScreen, `${label} bottom tabs on screen`).toBe(true)
  expect(m.brandCollides, `${label} brand collides with header buttons`).toBe(false)
}

test.describe('responsive layout', () => {
  for (const width of WIDTHS) {
    test(`all pages fit at ${width}px (standard and extra-large text)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const size of ['standard', 'xlarge']) {
        for (const route of ROUTES) {
          await open(page, route, { size })
          expectClean(await measure(page), `${width}px ${size} ${route}`)
        }
      }
    })
  }

  test('desktop uses the sidebar and a wide content area, phones use the tab bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page, '/')
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
    await expect(page.locator('nav.tabs')).toBeHidden()
    expect((await page.locator('#main').boundingBox()).width).toBeGreaterThan(900)
    await page.setViewportSize({ width: 768, height: 900 })
    await expect(page.locator('nav.tabs')).toBeVisible()
    await expect(page.locator('aside.side')).toBeHidden()
  })

  for (const [code, name] of LANGS) {
    test(`all pages fit at 320px in ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 })
      for (const route of ROUTES) {
        await open(page, route, { lang: code })
        expectClean(await measure(page), `320px ${code} ${route}`)
      }
    })
  }
})
