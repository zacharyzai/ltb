import { createPinia, setActivePinia } from 'pinia'
import { setNow } from '../src/utils/time'

// Thursday 12 Nov 2026, 10:00 in Singapore. Seed data is built relative to this "today".
export const FIXED_NOW = '2026-11-12T10:00:00+08:00'
export const TODAY = '2026-11-12'

export function freshStores(now = FIXED_NOW) {
  setNow(now)
  setActivePinia(createPinia())
}
export const resetClock = () => setNow(null)
