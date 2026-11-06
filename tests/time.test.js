import { afterEach, describe, expect, it } from 'vitest'
import { addDays, at, dayOffset, daysBetween, isIsoDate, isTime, nowTime, setNow, todayISO } from '../src/utils/time'

afterEach(() => setNow(null))

describe('Singapore date handling', () => {
  it('uses the Singapore calendar date, not the UTC date', () => {
    setNow('2026-11-12T15:59:00Z') // 23:59 in Singapore
    expect(todayISO()).toBe('2026-11-12')
    setNow('2026-11-12T16:00:00Z') // midnight in Singapore
    expect(todayISO()).toBe('2026-11-13')
  })
  it('reads the Singapore time of day', () => {
    setNow('2026-11-12T10:00:00+08:00')
    expect(nowTime()).toBe('10:00')
    setNow('2026-11-12T23:05:00+08:00')
    expect(nowTime()).toBe('23:05')
  })
  it('adds days across month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    setNow('2026-11-12T10:00:00+08:00')
    expect(dayOffset(-1)).toBe('2026-11-11')
    expect(dayOffset(14)).toBe('2026-11-26')
    expect(daysBetween('2026-11-12', '2026-11-16')).toBe(4)
  })
  it('turns a Singapore date and time into a UTC timestamp', () => {
    expect(at('2026-11-12', '09:30')).toBe('2026-11-12T01:30:00.000Z')
  })
  it('validates ISO dates and HH:mm times', () => {
    expect(isIsoDate('2026-11-12')).toBe(true)
    expect(isIsoDate('2026-02-30')).toBe(false)
    expect(isIsoDate('12 Nov')).toBe(false)
    expect(isTime('09:30')).toBe(true)
    expect(isTime('24:00')).toBe(false)
  })
})
