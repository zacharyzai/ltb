// Full-page screenshot of every route (desktop + mobile) into ./screenshots. Run: node scripts/screenshots.mjs
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'

const ROUTES = ['/', '/moments', '/visits', '/visits/book', '/community', '/account', '/staff', '/staff/updates',
  '/staff/moment', '/staff/inquiries', '/staff/visits-events', '/staff/account']
const SIZES = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } }
const base = 'http://localhost:5199'

const server = spawn('npm', ['run', 'dev', '--', '--port', '5199', '--strictPort'], { stdio: 'ignore' })
for (let i = 0; i < 60; i++) { try { await fetch(base); break } catch { await new Promise((r) => setTimeout(r, 1000)) } }

const browser = await chromium.launch()
for (const [name, viewport] of Object.entries(SIZES)) {
  const page = await (await browser.newContext({ viewport })).newPage()
  for (const route of ROUTES) {
    await page.goto(base + route)
    await page.waitForSelector('h1')
    await page.waitForTimeout(500)
    const file = `screenshots/${name}-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(file)
  }
}
await browser.close()
server.kill()
process.exit(0)
