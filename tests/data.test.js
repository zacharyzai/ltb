import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { caregivers, RELATIONSHIPS } from '../src/data/caregivers'
import { buildEvents, buildNews, buildVolunteers, EVENT_CATEGORIES, EVENT_STATUSES, VOLUNTEER_AVAILABILITY } from '../src/data/events'
import { buildInquiries, INQUIRY_STATUSES, INQUIRY_TOPICS, REPLY_TEMPLATES } from '../src/data/inquiries'
import { buildMoments, MOMENT_CATEGORIES } from '../src/data/moments'
import { buildResidents, WELLBEING_STATUSES } from '../src/data/residents'
import { staff, STAFF_ROLES } from '../src/data/staff'
import { BOOKING_STATUSES, buildBookings, SLOTS } from '../src/data/visits'
import { isIsoDate } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

beforeEach(() => freshStores())
afterEach(resetClock)

const unique = (list) => new Set(list.map((x) => x.id)).size === list.length
const flat = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
const locales = Object.fromEntries(['en', 'zh', 'ms', 'ta'].map((c) => [c, new Set(flat(JSON.parse(readFileSync(new URL(`../src/i18n/locales/${c}.json`, import.meta.url), 'utf8'))))]))
const everyLocaleHas = (key) => Object.entries(locales).filter(([, keys]) => !keys.has(key)).map(([code]) => `${code}:${key}`)

describe('mock data integrity', () => {
  const residents = buildResidents(), moments = buildMoments(), inquiries = buildInquiries(), bookings = buildBookings(), events = buildEvents()

  it('has unique ids and valid enumerations', () => {
    for (const list of [residents, caregivers, staff, moments, inquiries, bookings, events, buildNews(), buildVolunteers()]) expect(unique(list)).toBe(true)
    expect(residents.every((r) => WELLBEING_STATUSES.includes(r.status))).toBe(true)
    expect(moments.every((m) => MOMENT_CATEGORIES.includes(m.category))).toBe(true)
    expect(inquiries.every((q) => INQUIRY_STATUSES.includes(q.status) && INQUIRY_TOPICS.includes(q.topic))).toBe(true)
    expect(bookings.every((b) => BOOKING_STATUSES.includes(b.status) && SLOTS.some((s) => s.id === b.slotId))).toBe(true)
    expect(events.every((e) => EVENT_STATUSES.includes(e.status) && EVENT_CATEGORIES.includes(e.category))).toBe(true)
    expect(buildVolunteers().every((v) => VOLUNTEER_AVAILABILITY.includes(v.availability))).toBe(true)
    expect(staff.every((s) => STAFF_ROLES.includes(s.role))).toBe(true)
  })
  it('uses ISO dates and links records to real people', () => {
    expect(events.every((e) => isIsoDate(e.date))).toBe(true)
    expect(bookings.every((b) => isIsoDate(b.date))).toBe(true)
    for (const b of bookings) expect(residents.find((r) => r.id === b.residentId).caregiverIds).toContain(b.caregiverId)
    for (const q of inquiries) expect(residents.find((r) => r.id === q.residentId).caregiverIds).toContain(q.caregiverId)
    for (const c of caregivers) for (const [id, rel] of Object.entries(c.relationships)) expect(RELATIONSHIPS).toContain(rel) && expect(c.residentIds).toContain(id)
  })
  it('never tags a resident without photo consent in a photo moment', () => {
    for (const m of moments.filter((x) => x.image)) for (const id of m.residentIds) expect(residents.find((r) => r.id === id).photoConsent).toBe(true)
  })
  it('keeps drafts and past events in the right state', () => {
    expect(events.some((e) => e.status === 'draft')).toBe(true)
    expect(events.filter((e) => e.date < freshDate()).every((e) => e.status === 'published')).toBe(true)
  })
})
const freshDate = () => new Date().toISOString().slice(0, 10)

describe('every mock text and label exists in all four languages', () => {
  it('has seed content translations', () => {
    const missing = []
    for (const m of buildMoments()) for (const f of m.seeded) missing.push(...everyLocaleHas(`seed.${m.seedKey}.${f}`))
    for (const q of buildInquiries()) for (const f of q.seeded) missing.push(...everyLocaleHas(`seed.${q.seedKey}.${f}`))
    for (const e of buildEvents()) for (const f of e.seeded) missing.push(...everyLocaleHas(`seed.${e.seedKey}.${f}`))
    for (const n of buildNews()) for (const f of n.seeded) missing.push(...everyLocaleHas(`seed.${n.seedKey}.${f}`))
    for (const v of buildVolunteers()) for (const f of v.seeded) missing.push(...everyLocaleHas(`seed.${v.seedKey}.${f}`))
    for (const r of buildResidents().filter((x) => x.noteSeedKey)) missing.push(...everyLocaleHas(`seed.${r.noteSeedKey}`))
    expect(missing).toEqual([])
  })
  it('has labels for every stable id', () => {
    const groups = { status: WELLBEING_STATUSES, category: MOMENT_CATEGORIES, eventCategory: EVENT_CATEGORIES, topic: INQUIRY_TOPICS, inquiryStatus: INQUIRY_STATUSES, visitStatus: BOOKING_STATUSES, relationship: RELATIONSHIPS, staffRole: STAFF_ROLES, volunteerAvailability: VOLUNTEER_AVAILABILITY, replyTemplate: REPLY_TEMPLATES }
    const missing = Object.entries(groups).flatMap(([ns, list]) => list.flatMap((id) => everyLocaleHas(`${ns}.${id}`)))
    expect(missing).toEqual([])
  })
  it('has a message for every error code a store can return', () => {
    const files = ['residents', 'moments', 'inquiries', 'visits', 'events']
    const codes = new Set(files.flatMap((f) => [...readFileSync(new URL(`../src/stores/${f}.js`, import.meta.url), 'utf8').matchAll(/fail\('([A-Z_]+)'/g)].map((m) => m[1])))
    expect(codes.size).toBeGreaterThan(20)
    expect([...codes].flatMap((c) => everyLocaleHas(`errors.${c}`))).toEqual([])
  })
})

describe('the demo stays meaningful on any date', () => {
  it.each(['2026-12-31T10:00:00+08:00', '2028-02-29T10:00:00+08:00', '2026-03-01T00:30:00+08:00', '2027-07-04T23:50:00+08:00'])('at %s', async (when) => {
    freshStores(when)
    const { useEventsStore } = await import('../src/stores/events')
    const { useVisitsStore } = await import('../src/stores/visits')
    const { useResidentsStore } = await import('../src/stores/residents')
    const { useInquiriesStore } = await import('../src/stores/inquiries')
    const events = useEventsStore(), visits = useVisitsStore(), residents = useResidentsStore(), inquiries = useInquiriesStore()
    expect(events.upcoming.length).toBeGreaterThanOrEqual(2)
    expect(events.past.length).toBeGreaterThanOrEqual(2)
    expect(events.drafts).toHaveLength(1)
    expect(visits.todays).toHaveLength(4)
    expect(visits.upcoming.length).toBeGreaterThanOrEqual(5)
    expect(residents.updatedToday).toHaveLength(2)
    expect(inquiries.pendingCount).toBe(3)
    // every availability level is demonstrable and the fully booked day exists
    const levels = new Set(visits.bookingWindow().flatMap((d) => visits.slotsFor(d).map((s) => s.level)))
    expect(levels).toEqual(new Set(['available', 'limited', 'full']))
  })
})
