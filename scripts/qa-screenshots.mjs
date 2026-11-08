// Phase 8 QA gallery: ./qa-output/<role>/<page>-<size>-<theme>.png. Run: node scripts/qa-screenshots.mjs
// Also reports horizontal overflow per page/size/language/text-size and writes qa-output/overflow.txt.
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const PAGES = {
  caregiver: { home: '/', moments: '/moments', visits: '/visits', 'booking-flow': '/visits/book', community: '/community', account: '/account' },
  staff: { dashboard: '/staff', updates: '/staff/updates', 'post-moment': '/staff/moment', inquiries: '/staff/inquiries', 'visits-events': '/staff/visits-events', account: '/staff/account' },
}
const SIZES = { desktop1440: [1440, 900], desktop1024: [1024, 768], tablet768: [768, 1024], mobile390: [390, 844], mobile320: [320, 640] }
const base = 'http://localhost:5199'
const out = 'qa-output'

const server = spawn('npm', ['run', 'dev', '--', '--port', '5199', '--strictPort'], { stdio: 'ignore' })
for (let i = 0; i < 60; i++) { try { await fetch(base); break } catch { await new Promise((r) => setTimeout(r, 1000)) } }
const browser = await chromium.launch()

async function ctx([width, height], { theme = 'light', locale = 'en', text = 'md' } = {}) {
  const context = await browser.newContext({ viewport: { width, height } })
  await context.addInitScript(([t, l, s]) => {
    localStorage.setItem('sas.theme', t); localStorage.setItem('sas.locale', l)
    if (s !== 'md') localStorage.setItem('sas.textSize', s)
    localStorage.setItem('sas.guide.caregiver', 'skipped'); localStorage.setItem('sas.guide.staff', 'skipped')
  }, [theme, locale, text])
  return context
}
const settle = async (page) => { await page.waitForSelector('h1'); await page.waitForTimeout(450) }
const shot = (page, role, name) => { mkdirSync(`${out}/${role}`, { recursive: true }); return page.screenshot({ path: `${out}/${role}/${name}.png`, fullPage: true }) }

// 1. Gallery: every page, 5 sizes, light; dark for desktop 1440 + mobile 390.
for (const [size, vp] of Object.entries(SIZES)) {
  for (const theme of size === 'desktop1440' || size === 'mobile390' ? ['light', 'dark'] : ['light']) {
    const page = await (await ctx(vp, { theme })).newPage()
    for (const [role, pages] of Object.entries(PAGES)) for (const [name, path] of Object.entries(pages)) {
      await page.goto(base + path); await settle(page); await shot(page, role, `${name}-${size}-${theme}`)
    }
    await page.context().close()
  }
}

// 2. Key states: Ask Care Team dialog, booking confirmation (desktop + mobile, light + dark).
for (const [size, vp] of [['desktop1440', SIZES.desktop1440], ['mobile390', SIZES.mobile390]]) {
  for (const theme of ['light', 'dark']) {
    const page = await (await ctx(vp, { theme })).newPage()
    await page.goto(base + '/moments'); await settle(page)
    await page.getByRole('button', { name: 'Ask a question' }).click(); await page.waitForTimeout(400)
    await page.screenshot({ path: `${out}/caregiver/ask-care-team-${size}-${theme}.png` })
    await page.goto(base + '/visits/book'); await settle(page)
    await page.locator('.calendar .day:not([disabled])').nth(1).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('.slot:not(.off)').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Confirm booking' }).click(); await page.waitForSelector('div.done'); await page.waitForTimeout(500)
    await shot(page, 'caregiver', `booking-confirmation-${size}-${theme}`)
    await page.context().close()
  }
}

// 3. Overflow matrix: every page x 4 languages x 3 text sizes at 320 px.
const lines = []
for (const locale of ['en', 'zh', 'ms', 'ta']) for (const text of ['md', 'lg', 'xl']) {
  const page = await (await ctx(SIZES.mobile320, { locale, text })).newPage()
  for (const pages of Object.values(PAGES)) for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path); await settle(page)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (over > 0) lines.push(`OVERFLOW ${over}px  ${locale} ${text} ${path}`)
    if (text === 'xl' && locale !== 'en') await shot(page, 'i18n-320-xl', `${name}-${locale}`)
  }
  await page.context().close()
}
writeFileSync(`${out}/overflow.txt`, lines.length ? lines.join('\n') : 'No horizontal overflow at 320 px (4 languages x 3 text sizes x 12 pages)')
console.log(lines.length ? lines.join('\n') : 'No horizontal overflow')

await browser.close()
server.kill()
process.exit(0)
