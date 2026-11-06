import { describe, expect, it } from 'vitest'
import { makeFormat } from '../src/i18n/format'

// Display formatting in Singapore time, per language. Dates have no time zone; timestamps are UTC instants.
describe('locale-aware formatting', () => {
  const iso = '2026-11-12' // a Thursday
  const ts = '2026-11-12T01:30:00.000Z' // 09:30 in Singapore

  it('formats dates in each language without shifting the day', () => {
    expect(makeFormat('en').dateLong(iso)).toMatch(/Thursday.*12.*November.*2026/)
    expect(makeFormat('zh').dateLong(iso)).toMatch(/2026.*11.*12.*星期四/)
    expect(makeFormat('ms').dateLong(iso)).toMatch(/Khamis.*12.*November.*2026/)
    expect(makeFormat('ta').dateLong(iso)).toMatch(/வியாழன்.*12.*2026/)
  })
  it('keeps the calendar date at the end of the day (no time-zone shift)', () => {
    for (const code of ['en', 'zh', 'ms', 'ta']) expect(makeFormat(code).dayNumber('2026-12-31')).toBe('31')
  })
  it('formats times of day in Singapore time', () => {
    expect(makeFormat('en').time('14:00')).toMatch(/^2:00\s?pm$/i)
    expect(makeFormat('zh').time('14:00')).toMatch(/下午2:00/)
    expect(makeFormat('en').stampTime(ts)).toMatch(/^9:30\s?am$/i)
    expect(makeFormat('ta').time('14:00')).toMatch(/2:00/)
  })
  it('builds time ranges and short stamps', () => {
    expect(makeFormat('en').timeRange('10:00', '11:00')).toMatch(/10:00\s?am\s?–\s?11:00\s?am/i)
    expect(makeFormat('en').stampShort(ts)).toMatch(/12 Nov.*9:30/i)
    expect(makeFormat('ms').stampShort(ts)).toMatch(/12.*Nov.*9:30/i)
  })
  it('names weekdays and months for the calendar', () => {
    expect(makeFormat('en').weekdayShort('2026-11-09')).toMatch(/Mon/)
    expect(makeFormat('zh').weekdayShort('2026-11-09')).toMatch(/周一|星期一/)
    expect(makeFormat('en').monthShort(iso)).toBe('Nov')
    expect(makeFormat('en').monthYear(iso)).toMatch(/November 2026/)
  })
  it("uses Singapore's date for a timestamp near midnight", () => {
    // 16:30 UTC on the 12th is 00:30 on the 13th in Singapore.
    expect(makeFormat('en').stampDate('2026-11-12T16:30:00Z')).toBe('2026-11-13')
  })
  it('falls back to English for an unknown language', () => {
    expect(makeFormat('xx').dateShort(iso)).toBe(makeFormat('en').dateShort(iso))
  })
})
