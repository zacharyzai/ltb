// Staff portal journeys, and the six cross-role journeys (A-F) driven through the browser with the demo role switch.
// Each test starts from a fresh page, so the in-memory mock state is back to its seed. Cross-role tests never reload.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const h1 = (page) => page.getByRole('heading', { level: 1 })
const open = async (page, path) => {
  await page.goto(path)
  await expect(h1(page)).toBeVisible()
}
const group = (page, name) => page.getByRole('group', { name })
const as = async (page, role) => {
  await group(page, 'Demo view').getByRole('button', { name: role }).click()
  await expect(page).toHaveURL(role === 'Staff' ? /\/staff$/ : /:\d+\/$/)
}
const dialog = (page) => page.getByRole('dialog')
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const photo = { name: 'walk.png', mimeType: 'image/png', buffer: PNG }
const slotRow = (page, start) => page.locator('li.slot').filter({ hasText: start })

test.describe('staff dashboard', () => {
  test('summary cards come from the stores and link to the right pages', async ({ page }) => {
    await open(page, '/staff')
    const card = (name) => page.getByRole('link', { name })
    await expect(card(/Pending inquiries/)).toContainText('3')
    await expect(card(/Resident updates/)).toContainText('2 still to update')
    await expect(card(/Today's visits/)).toContainText('2 of 4 checked in')
    await expect(card(/Upcoming events/)).toContainText('2')
    await card(/Pending inquiries/).click()
    await expect(page).toHaveURL(/\/staff\/inquiries$/)
  })

  test('quick actions and the needs-attention list', async ({ page }) => {
    await open(page, '/staff')
    await expect(page.getByRole('region', { name: 'Needs attention' })).toContainText('Mr Lim Boon Huat')
    for (const [name, url] of [['Update resident status', /updates$/], ['Post a Moment', /moment$/], ['Reply to inquiries', /inquiries$/], ['Manage visits & events', /visits-events$/]]) {
      await page.getByRole('main').getByRole('link', { name }).click()
      await expect(page).toHaveURL(url)
      await page.goBack()
    }
  })

  test('the four mobile tabs reach the staff pages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await open(page, '/staff')
    const tabs = page.locator('nav.tabs')
    await expect(tabs.getByRole('link')).toHaveCount(4)
    await tabs.getByRole('link', { name: 'Inquiries' }).click()
    await expect(page).toHaveURL(/\/staff\/inquiries$/)
  })
})

test.describe('resident updates', () => {
  test('search, validate, save and move on to the next resident', async ({ page }) => {
    await open(page, '/staff/updates')
    await page.getByLabel('Find a resident').fill('rahim')
    await expect(page.locator('.rows li')).toHaveCount(1)
    await page.getByRole('button', { name: /Mr Rahim/ }).click()
    await expect(page.getByRole('heading', { name: 'Update Mr Rahim' })).toBeVisible()
    await page.getByRole('button', { name: 'Save & next resident' }).click()
    await expect(page.getByText('Please choose a status.')).toBeVisible()
    await group(page, /How is Mr Rahim today/).getByRole('button', { name: /Resting/ }).click()
    await page.getByLabel(/Short note/).fill('Napping after lunch')
    await page.getByRole('button', { name: 'Save & next resident' }).click()
    await expect(page.getByText('Mr Rahim updated')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Update Mr Lim' })).toBeVisible() // next resident still waiting
    await page.getByLabel('Find a resident').fill('rahim')
    await expect(page.getByRole('button', { name: /Mr Rahim/ })).toContainText('Updated today')
    await expect(page.getByRole('button', { name: /Mr Rahim/ })).toContainText('Resting')
  })
})

test.describe('post a moment', () => {
  test('a text-only moment may tag a resident without photo consent; preview shows the title', async ({ page }) => {
    await open(page, '/staff/moment')
    await page.getByLabel('Mdm Wong', { exact: false }).or(page.getByLabel(/Madam Wong/)).check()
    await page.getByLabel(/^Title/).fill('Lantern making')
    await page.getByRole('button', { name: 'Preview' }).click()
    await expect(dialog(page).getByRole('heading', { name: 'Lantern making' })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Publish moment' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Moment published' }).first()).toBeVisible()
  })

  test('photos: consent residents are blocked, the confirmation is required, files are checked', async ({ page }) => {
    await open(page, '/staff/moment')
    const wong = page.getByLabel(/Madam Wong/)
    await wong.check()
    await page.locator('input[type=file]').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') })
    await expect(page.getByText('Please choose an image file')).toBeVisible()
    await page.locator('input[type=file]').setInputFiles(photo)
    await expect(page.getByAltText('Preview of the chosen photo')).toBeVisible()
    await expect(wong).toBeDisabled()
    await expect(wong).not.toBeChecked() // removed from the tags when the photo was added
    await page.getByLabel(/Madam Tan/).check()
    await page.getByLabel(/^Title/).fill('Garden walk')
    await page.getByRole('button', { name: 'Publish moment' }).click()
    await expect(page.getByText('Please confirm photo consent before publishing.')).toBeVisible()
    await page.getByLabel(/I confirm everyone/).check()
    await page.getByRole('button', { name: 'Publish moment' }).click()
    await expect(page.getByRole('heading', { name: 'Moment published' })).toBeVisible()
  })

  test('removing the photo frees residents without consent again', async ({ page }) => {
    await open(page, '/staff/moment')
    await page.locator('input[type=file]').setInputFiles(photo)
    await expect(page.getByLabel(/Madam Wong/)).toBeDisabled()
    await page.getByRole('button', { name: 'Remove photo' }).click()
    await expect(page.getByLabel(/Madam Wong/)).toBeEnabled()
  })
})

test.describe('inquiries', () => {
  test('filters, quick replies fill an editable box, sending answers the inquiry', async ({ page }) => {
    await open(page, '/staff/inquiries')
    const cards = page.locator('main article')
    const filter = (name) => group(page, 'Show inquiries').getByRole('button', { name, exact: true }).click()
    await expect(cards).toHaveCount(5)
    await filter('Pending')
    await expect(cards).toHaveCount(2)
    await filter('In Review')
    await expect(cards).toHaveCount(1)
    await filter('Answered')
    await expect(cards).toHaveCount(2)
    await filter('Pending')
    await cards.first().getByRole('button', { name: /Reply/ }).click()
    const dlg = dialog(page)
    await expect(dlg).toContainText('Sarah Tan')
    await dlg.getByRole('button', { name: /Thank you for checking in/ }).click()
    const box = dlg.getByLabel(/Your reply/)
    await expect(box).toHaveValue(/doing well today/)
    await box.fill('')
    await dlg.getByRole('button', { name: 'Send reply' }).click()
    await expect(dlg.getByText('Please type a reply.')).toBeVisible() // nothing is sent automatically
    await dlg.getByRole('button', { name: /We have received your question/ }).click()
    await box.fill('We have received your question. Nurse Aisha will update you this afternoon.')
    await dlg.getByRole('button', { name: 'Send reply' }).click()
    await expect(page.getByText('Reply sent')).toBeVisible()
    await filter('Answered')
    await expect(cards).toHaveCount(3)
    await expect(page.getByText('Nurse Aisha will update you this afternoon.')).toBeVisible()
  })

  test('opening a pending inquiry marks it In Review', async ({ page }) => {
    await open(page, '/staff/inquiries')
    await page.locator('main article').first().getByRole('button', { name: /Reply/ }).click()
    await dialog(page).getByRole('button', { name: 'Cancel' }).click()
    await group(page, 'Show inquiries').getByRole('button', { name: 'In Review', exact: true }).click()
    await expect(page.locator('main article')).toHaveCount(2)
  })
})

test.describe('visits and events', () => {
  test('check-in by button and by the demo scan', async ({ page }) => {
    await open(page, '/staff/visits-events')
    await page.getByRole('button', { name: 'Check in Sarah Tan' }).click()
    await expect(page.getByText('Sarah Tan checked in')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Check in Sarah Tan' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Scan a pass (demo)' }).click()
    await dialog(page).getByLabel(/Pass reference/).fill('SAS-V-0000')
    await dialog(page).getByRole('button', { name: 'Check in' }).click()
    await expect(dialog(page).getByText('No visit was found')).toBeVisible()
    await dialog(page).getByLabel(/Pass reference/).fill('sas-v-4822')
    await dialog(page).getByRole('button', { name: 'Check in' }).click()
    await expect(page.getByText('Wong Hui Min checked in')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Check in / })).toHaveCount(0)
  })

  test('capacity: never below booked places, applies to one date and slot only', async ({ page }) => {
    await open(page, '/staff/visits-events')
    const pm1 = slotRow(page, '2:00 pm –')
    await expect(pm1).toContainText('6 of 6 places taken')
    await pm1.getByRole('button', { name: /Decrease capacity/ }).click()
    await expect(page.getByText('Capacity cannot be lower than the 6 spaces already booked.')).toBeVisible()
    await pm1.getByRole('button', { name: /Increase capacity/ }).click()
    await expect(pm1).toContainText('Capacity 7')
    await expect(slotRow(page, '10:00 am')).toContainText('Capacity 6') // another slot, same day
    await page.getByLabel('Date').selectOption({ index: 1 })
    await expect(slotRow(page, '2:00 pm –')).toContainText('Capacity 6') // same slot, another day
  })

  test('event drafts and publishing', async ({ page }) => {
    await open(page, '/staff/visits-events?tab=events')
    const section = (name) => page.getByRole('region', { name, exact: true })
    await expect(section('Drafts')).toContainText('Family Appreciation Day')
    await page.getByRole('button', { name: 'Create an event' }).click()
    await dialog(page).getByLabel(/^Title/).fill('Tea with families')
    await dialog(page).getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Draft saved')).toBeVisible()
    await expect(section('Drafts')).toContainText('Tea with families')
    await expect(section('Upcoming events')).not.toContainText('Tea with families')
    await page.getByRole('button', { name: 'Publish Tea with families' }).click() // incomplete: no place yet
    await expect(page.getByText('Please add a place.')).toBeVisible()
    await page.getByRole('button', { name: 'Edit Tea with families' }).click()
    await dialog(page).getByLabel(/^Place/).fill('Dayroom')
    await dialog(page).getByRole('button', { name: 'Publish event' }).click()
    await expect(page.getByText('Event published')).toBeVisible()
    await expect(section('Upcoming events')).toContainText('Tea with families')
  })
})

// A-F: a change made in one role is visible in the other, through the shared stores (no reloads).
test.describe('cross-role journeys', () => {
  test('A. staff changes a resident status, the caregiver sees it on Home and Moments', async ({ page }) => {
    await open(page, '/staff/updates')
    await page.getByRole('button', { name: /Madam Tan/ }).click()
    await group(page, /How is Mdm Tan today/).getByRole('button', { name: /Please Contact Staff/ }).click()
    await page.getByLabel(/Short note/).fill('Slight cough, nurse is checking')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await as(page, 'Caregiver')
    await expect(page.getByText('Please Contact Staff')).toBeVisible()
    await expect(page.getByText('Slight cough, nurse is checking')).toBeVisible()
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page.getByText('Slight cough, nurse is checking')).toBeVisible()
  })

  test('B. staff publishes a moment, the caregiver sees it on Home and Moments', async ({ page }) => {
    await open(page, '/staff/moment')
    await page.getByLabel(/Madam Tan/).check()
    await page.getByLabel(/^Title/).fill('Afternoon bingo')
    await page.getByRole('button', { name: 'Publish moment' }).click()
    await expect(page.getByRole('heading', { name: 'Moment published' })).toBeVisible()
    await as(page, 'Caregiver')
    await expect(page.getByRole('heading', { name: 'Afternoon bingo' })).toBeVisible() // Home: latest moment
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page.getByRole('heading', { name: 'Afternoon bingo' })).toBeVisible()
  })

  test('C. a caregiver question appears in the staff queue and dashboard count', async ({ page }) => {
    await open(page, '/moments')
    await page.getByRole('button', { name: 'Ask a question' }).click()
    await dialog(page).getByLabel(/Your question/).fill('Can I bring homemade soup on Saturday?')
    await dialog(page).getByRole('button', { name: 'Send question' }).click()
    await page.keyboard.press('Escape')
    await as(page, 'Staff')
    await expect(page.getByRole('link', { name: /Pending inquiries/ })).toContainText('4')
    await page.getByRole('main').getByRole('link', { name: 'Reply to inquiries' }).click()
    await expect(page.getByText('Can I bring homemade soup on Saturday?')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(6)
  })

  test('D. a staff reply reaches the caregiver and lowers the pending count', async ({ page }) => {
    await open(page, '/staff/inquiries')
    await page.locator('main article').filter({ hasText: 'Sarah Tan' }).first().getByRole('button', { name: /Reply/ }).click()
    await dialog(page).getByRole('button', { name: /Please contact the nursing home directly/ }).click()
    await dialog(page).getByRole('button', { name: 'Send reply' }).click()
    await as(page, 'Caregiver')
    await page.getByRole('link', { name: 'All moments' }).click()
    await expect(page.getByText('Care team reply').first()).toBeVisible()
    await expect(page.getByText('Please contact the nursing home directly if you would like')).toBeVisible()
    await as(page, 'Staff')
    await expect(page.getByRole('link', { name: /Pending inquiries/ })).toContainText('2')
  })

  test('E. a caregiver booking appears in the staff schedule', async ({ page }) => {
    await open(page, '/visits/book')
    await page.locator('.calendar .day:not([disabled])').nth(1).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('.slot:not(.off)').first().click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Confirm booking' }).click()
    await expect(page.getByText(/SAS-V-/).first()).toBeVisible()
    await as(page, 'Staff')
    await page.getByRole('main').getByRole('link', { name: 'Manage visits & events' }).click()
    await expect(page.getByRole('region', { name: 'Upcoming bookings' }).locator('article')).toHaveCount(2) // the seeded one + this one
  })

  test('E2. cancelling frees the space on the staff capacity screen', async ({ page }) => {
    await open(page, '/visits')
    await page.getByRole('button', { name: 'Cancel visit' }).first().click() // today, 2:00 pm, 2 visitors
    await dialog(page).getByRole('button', { name: 'Yes, cancel visit' }).click()
    await as(page, 'Staff')
    await page.getByRole('link', { name: /Visits & Events/ }).first().click()
    await expect(slotRow(page, '2:00 pm –')).toContainText('4 of 6 places taken')
    await expect(page.getByRole('button', { name: 'Check in Sarah Tan' })).toHaveCount(0)
  })

  test('F. staff drafts stay hidden from caregivers; a published event appears', async ({ page }) => {
    await open(page, '/staff/visits-events?tab=events')
    await page.getByRole('button', { name: 'Create an event' }).click()
    await dialog(page).getByLabel(/^Title/).fill('Hidden planning session')
    await dialog(page).getByRole('button', { name: 'Save draft' }).click()
    await page.getByRole('button', { name: 'Create an event' }).click()
    await dialog(page).getByLabel(/^Title/).fill('Mid-Autumn Tea')
    await dialog(page).getByLabel(/^Place/).fill('Dayroom')
    await dialog(page).getByRole('button', { name: 'Publish event' }).click()
    await as(page, 'Caregiver')
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Community' }).click()
    await expect(page.getByRole('heading', { name: 'Mid-Autumn Tea' })).toBeVisible()
    await expect(page.getByText('Hidden planning session')).toHaveCount(0)
    await expect(page.getByText('Family Appreciation Day')).toHaveCount(0) // the seeded draft
  })
})

// Let the dialog fade-in finish first, or contrast is measured mid-animation.
const axe = async (page) => {
  await page.waitForTimeout(300)
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
}
const report = (r) => r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)

test.describe('staff dialogs and flows have no axe violations', () => {
  for (const theme of ['light', 'dark']) {
    test(`reply, scan, event form and preview dialogs (${theme})`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate((th) => localStorage.setItem('sas.theme', th), theme)
      await open(page, '/staff/inquiries')
      await page.waitForTimeout(250)
      await page.locator('main article').first().getByRole('button', { name: /Reply/ }).click()
      await dialog(page).getByRole('button', { name: 'Send reply' }).click() // with the validation error
      expect(report(await (await axe(page)).analyze()), 'reply').toEqual([])
      await page.keyboard.press('Escape')
      await expect(page.getByRole('button', { name: /Reply/ }).first()).toBeFocused() // focus returns to the opener
      await open(page, '/staff/visits-events')
      await page.getByRole('button', { name: 'Scan a pass (demo)' }).click()
      expect(report(await (await axe(page)).analyze()), 'scan').toEqual([])
      await page.keyboard.press('Escape')
      await open(page, '/staff/visits-events?tab=events')
      await page.getByRole('button', { name: 'Create an event' }).click()
      await dialog(page).getByRole('button', { name: 'Publish event' }).click()
      expect(report(await (await axe(page)).analyze()), 'event form').toEqual([])
      await page.keyboard.press('Escape')
      await open(page, '/staff/moment')
      await page.locator('input[type=file]').setInputFiles(photo)
      await page.getByRole('button', { name: 'Preview' }).click()
      expect(report(await (await axe(page)).analyze()), 'preview').toEqual([])
    })
  }
})
