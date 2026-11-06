// Caregiver portal journeys. Every test starts from a fresh page, so the in-memory mock state is back to its seed.
import { expect, test } from '@playwright/test'

const h1 = (page) => page.getByRole('heading', { level: 1 })
const open = async (page, path) => {
  await page.goto(path)
  await expect(h1(page)).toBeVisible()
}
const group = (page, name) => page.getByRole('group', { name })

test.describe('navigation and resident switching', () => {
  test('Home links lead to the right pages (desktop)', async ({ page }) => {
    await open(page, '/')
    await expect(h1(page)).toContainText('Sarah')
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page).toHaveURL(/\/moments$/)
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click()
    await page.getByRole('link', { name: 'All visits' }).click()
    await expect(page).toHaveURL(/\/visits$/)
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click()
    await page.getByRole('link', { name: 'All events' }).click()
    await expect(page).toHaveURL(/\/community$/)
  })

  test('the four mobile tabs navigate and highlight the current page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await open(page, '/')
    const tabs = page.locator('nav.tabs')
    for (const [name, url] of [['Moments', /\/moments$/], ['Visits', /\/visits$/], ['Community', /\/community$/], ['Home', /\/$/]]) {
      await tabs.getByRole('link', { name }).click()
      await expect(page).toHaveURL(url)
      await expect(tabs.getByRole('link', { name })).toHaveAttribute('aria-current', 'page')
    }
    await expect(tabs.getByRole('link')).toHaveCount(4)
  })

  test('switching resident updates Home and the choice follows to Moments', async ({ page }) => {
    await open(page, '/')
    await expect(page.getByRole('heading', { name: 'Madam Tan Mei Ling' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Morning Garden Walk' })).toBeVisible()
    await group(page, 'Viewing updates for').getByRole('button', { name: /Mdm Wong/ }).click()
    await expect(page.getByRole('heading', { name: 'Madam Wong Siew Fong' })).toBeVisible()
    await expect(page.getByText('Please Contact Staff')).toBeVisible()
    await expect(page.getByText('Had a restless night')).toBeVisible()
    await expect(page.getByText('Paper Lantern Craft')).toBeVisible() // her latest moment
    await expect(page.getByText('Morning Garden Walk')).toHaveCount(0) // Mdm Tan's content is gone
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page.getByRole('heading', { name: 'Madam Wong Siew Fong' })).toBeVisible() // selection preserved
  })
})

test.describe('moments and questions', () => {
  test('moment filters work and drafts stay hidden', async ({ page }) => {
    await open(page, '/moments')
    const cards = page.locator('article h3')
    const feed = page.getByRole('region', { name: 'Moments', exact: true })
    await expect(feed.locator('article')).toHaveCount(3) // Latest
    await group(page, 'Show moments').getByRole('button', { name: 'This week' }).click()
    await expect(feed.locator('article')).toHaveCount(4)
    await group(page, 'Show moments').getByRole('button', { name: 'All' }).click()
    await expect(feed.locator('article')).toHaveCount(4)
    await expect(page.getByText('Evening Singalong')).toHaveCount(0) // a draft that tags Mdm Tan
    await expect(cards.first()).toBeVisible()
  })

  test('asking the care team: validation, success, history and focus return', async ({ page }) => {
    await open(page, '/moments')
    const ask = page.getByRole('button', { name: 'Ask a question' })
    await ask.click()
    const dialog = page.getByRole('dialog', { name: 'Ask the care team' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('call the nursing home directly')).toBeVisible()
    await dialog.getByRole('button', { name: 'Send question' }).click()
    await expect(dialog.getByRole('alert').filter({ hasText: 'Please type your question.' })).toBeVisible() // empty question rejected
    await dialog.getByLabel('Your question').fill('Does she need new slippers?')
    await dialog.getByRole('button', { name: 'Send question' }).click()
    await expect(dialog.getByRole('status')).toContainText('Your question has been sent')
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
    await expect(ask).toBeFocused()
    const history = page.getByRole('region', { name: 'Your questions' })
    await expect(history.getByText('Does she need new slippers?')).toBeVisible()
    await expect(history.locator('article').first()).toContainText('Pending')
  })

  test('a question about the second resident appears in her history', async ({ page }) => {
    await open(page, '/moments')
    await page.getByRole('button', { name: 'Ask a question' }).click()
    const dialog = page.getByRole('dialog', { name: 'Ask the care team' })
    await dialog.getByLabel('About which resident?').selectOption({ label: 'Madam Wong Siew Fong' })
    await dialog.getByLabel('Your question').fill('Is she sleeping better?')
    await dialog.getByRole('button', { name: 'Send question' }).click()
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByRole('heading', { name: 'Madam Wong Siew Fong' })).toBeVisible() // view moved to her
    await expect(page.getByRole('region', { name: 'Your questions' }).getByText('Is she sleeping better?')).toBeVisible()
  })
})

// The first selectable calendar day other than today, then the first open time on it.
async function pickDayAndTime(page) {
  await page.locator('.calendar .day:not([disabled])').nth(1).click()
  await page.getByRole('button', { name: 'Next' }).click()
  const slot = page.locator('.slot:not(.off)').first()
  await slot.click()
  return slot
}
const spacesIn = async (slot) => Number((await slot.innerText()).match(/(\d+) spaces? left/)[1])

test.describe('visits', () => {
  test('booking: four steps, back keeps choices, confirmation with reference and demo pass', async ({ page }) => {
    await open(page, '/visits/book')
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Step 1 of 4')
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
    await pickDayAndTime(page)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Step 3 of 4')
    await expect(page.locator('dd', { hasText: 'Madam Tan Mei Ling' })).toBeVisible()
    await page.getByRole('button', { name: 'More visitors' }).click()
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.locator('.slot input:checked')).toHaveCount(1) // time kept
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.locator('.calendar .day[aria-pressed="true"]')).toHaveCount(1) // date kept
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.count')).toHaveText('3') // visitors kept
    await page.getByRole('button', { name: 'Confirm booking' }).click()
    await expect(page.locator('div.done')).toContainText('Your visit is booked.')
    await expect(page.getByText('SAS-V-4832').first()).toBeVisible()
    await expect(page.getByText('Demo pass: not a real, scannable code')).toBeVisible()
    await page.getByRole('link', { name: 'Back to my visits' }).click()
    await expect(page.getByRole('region', { name: 'Upcoming visits' }).getByText('SAS-V-4832')).toBeVisible()
  })

  test('past dates and fully booked days cannot be chosen', async ({ page }) => {
    await open(page, '/visits/book')
    const disabled = page.locator('.calendar .day:disabled')
    expect(await disabled.count()).toBeGreaterThan(3)
    await expect(page.locator('.calendar .day[aria-label*="fully booked" i]:disabled').first()).toBeVisible()
    await expect(page.locator('.calendar .day[aria-label*="past date" i]:disabled').first()).toBeVisible()
  })

  test('cancelling a visit moves it to Cancelled and releases its space', async ({ page }) => {
    await open(page, '/visits/book')
    const before = await spacesIn(await pickDayAndTime(page))
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Confirm booking' }).click()
    await page.getByRole('link', { name: 'Back to my visits' }).click()

    // 2 visitors are booked, so the same time now has 2 fewer spaces
    await page.getByRole('link', { name: 'Book a visit' }).first().click()
    expect(await spacesIn(await pickDayAndTime(page))).toBe(before - 2)

    await page.getByRole('link', { name: 'Visits', exact: true }).click()
    const mine = page.getByRole('region', { name: 'Upcoming visits' }).locator('article', { hasText: 'SAS-V-4832' })
    const cancel = mine.getByRole('button', { name: 'Cancel visit' })
    await cancel.click()
    const dialog = page.getByRole('dialog', { name: 'Cancel this visit?' })
    await expect(dialog).toContainText('released for other families')
    await dialog.getByRole('button', { name: 'Yes, cancel visit' }).click()
    await expect(page.getByRole('status').getByText('Visit cancelled')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Cancelled visits' }).getByText('SAS-V-4832')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Upcoming visits' }).getByText('SAS-V-4832')).toHaveCount(0)

    await page.getByRole('link', { name: 'Book a visit' }).first().click()
    expect(await spacesIn(await pickDayAndTime(page))).toBe(before) // space released
  })

  test('rescheduling moves a booking through the same steps', async ({ page }) => {
    await open(page, '/visits')
    const card = page.getByRole('region', { name: 'Upcoming visits' }).locator('article', { hasText: 'SAS-V-4830' })
    await expect(card).toBeVisible()
    const oldDate = await card.locator('h3').innerText()
    await card.getByRole('link', { name: 'Reschedule' }).click()
    await expect(h1(page)).toHaveText('Reschedule a Visit')
    await page.locator('.calendar .day:not([disabled])').nth(1).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('.slot:not(.off)').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Confirm new time' }).click()
    await expect(page.locator('div.done')).toContainText('Your visit has been moved.')
    await page.getByRole('link', { name: 'Back to my visits' }).click()
    const moved = page.getByRole('region', { name: 'Upcoming visits' }).locator('article', { hasText: 'SAS-V-4830' })
    await expect(moved).toBeVisible()
    expect(await moved.locator('h3').innerText()).not.toBe(oldDate)
  })

  test('the visit pass opens as a labelled demo', async ({ page }) => {
    await open(page, '/visits')
    await page.getByRole('button', { name: 'View pass' }).first().click()
    const dialog = page.getByRole('dialog', { name: 'Visit pass' })
    await expect(dialog.getByText('Demo pass: not a real, scannable code')).toBeVisible()
    await expect(dialog.getByText(/not connected to SAS's check-in system/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})

test.describe('community', () => {
  test('event details open as a dialog with sharing, and drafts are never reachable', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, '/community')
    await expect(page.getByText('Family Appreciation Day')).toHaveCount(0) // draft
    const first = page.getByRole('button', { name: /^View details:/ }).first()
    await first.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Where')).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/)
    await expect(dialog.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', /facebook\.com\/sharer/)
    await dialog.getByRole('button', { name: 'Copy link' }).click()
    await expect(page.getByRole('status').getByText('Link copied')).toBeVisible()
    await expect(dialog.getByText('Resident updates are never shared')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(first).toBeFocused()
    // a draft id in the URL opens nothing
    await page.goto('/community?event=ev-3')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('tabs: news, past events and volunteering', async ({ page }) => {
    await open(page, '/community')
    const tabs = group(page, 'Community sections')
    await tabs.getByRole('button', { name: 'News' }).click()
    await expect(page.getByText('New seated exercise programme')).toBeVisible()
    await tabs.getByRole('button', { name: 'Past events' }).click()
    await expect(page.getByText('Volunteer Appreciation Tea')).toBeVisible()
    await tabs.getByRole('button', { name: 'Volunteering' }).click()
    await expect(page.locator('article.vol')).toHaveCount(3)
  })

  test('expressing interest in volunteering shows a simulated confirmation', async ({ page }) => {
    await open(page, '/community?tab=volunteering')
    const first = page.locator('article.vol').first()
    await first.getByRole('button', { name: /Express interest/ }).click()
    await expect(page.getByRole('status').getByText(/has been noted/)).toBeVisible()
    await expect(first.getByText('Interest noted')).toBeVisible()
    await expect(first.getByText(/nothing was sent/)).toBeVisible()
    await expect(first.getByRole('button')).toHaveCount(0)
  })

  test('the Support SAS link points to the official donation page', async ({ page }) => {
    await open(page, '/community')
    await expect(page.getByRole('link', { name: /Donate on the SAS website/ })).toHaveAttribute('href', 'https://www.societyagedsick.org.sg/donation/')
  })
})

test.describe('language, theme and text size', () => {
  test('language switching changes content, dates and the page language', async ({ page }) => {
    await open(page, '/')
    await group(page, 'Language').getByRole('button', { name: '中文' }).click()
    await expect(h1(page)).toContainText(/(早上|下午|晚上)好/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    await expect(page.getByText(/星期|周/).first()).toBeVisible() // dates in Chinese
    await page.goto('/moments')
    await expect(page.getByRole('heading', { name: '晨间花园漫步' })).toBeVisible() // translated mock content
    await group(page, '语言').getByRole('button', { name: 'BM' }).click()
    await expect(page.getByRole('heading', { name: 'Berjalan di Taman Pagi' })).toBeVisible()
    await group(page, 'Bahasa').getByRole('button', { name: 'தமிழ்' }).click()
    await expect(page.getByRole('heading', { name: 'காலைத் தோட்ட நடை' })).toBeVisible()
    await group(page, 'மொழி').getByRole('button', { name: 'EN' }).click()
    await expect(page.getByRole('heading', { name: 'Morning Garden Walk' })).toBeVisible()
  })

  test('theme switching applies and persists across pages', async ({ page }) => {
    await open(page, '/')
    await group(page, 'Theme').getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 22, 21)')
    await group(page, 'Theme').getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('text size scales the interface and persists', async ({ page }) => {
    await open(page, '/moments')
    await expect(page.locator('html')).toHaveCSS('font-size', '17px')
    await group(page, 'Text size').getByRole('button', { name: 'Large', exact: true }).click()
    await expect(page.locator('html')).toHaveCSS('font-size', '19px')
    await group(page, 'Text size').getByRole('button', { name: 'Extra large' }).click()
    await expect(page.locator('html')).toHaveCSS('font-size', '21px')
    await page.reload()
    await expect(page.locator('html')).toHaveCSS('font-size', '21px')
  })
})
