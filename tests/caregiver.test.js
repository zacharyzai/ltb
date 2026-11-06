import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useCaregiver } from '../src/composables/useCaregiver'
import { useUiStore } from '../src/stores/ui'
import { freshStores, resetClock } from './helpers'

beforeEach(() => freshStores())
afterEach(resetClock)

describe('useCaregiver (selected resident)', () => {
  it('offers only the residents linked to the demo caregiver and defaults to the first', () => {
    const c = useCaregiver()
    expect(c.linked.value.map((r) => r.id)).toEqual(['res-tan', 'res-wong'])
    expect(c.selected.value.id).toBe('res-tan')
    expect(c.relationship(c.selected.value)).toBe('mother')
  })
  it('switches between linked residents and keeps the choice', () => {
    const c = useCaregiver()
    c.select('res-wong')
    expect(c.selected.value.id).toBe('res-wong')
    expect(c.relationship(c.selected.value)).toBe('aunt')
    expect(useCaregiver().selected.value.id).toBe('res-wong') // a different page asking again
  })
  it('refuses to select a resident the caregiver is not linked to', () => {
    const c = useCaregiver()
    c.select('res-lim')
    expect(c.selected.value.id).toBe('res-tan')
  })
  it('follows the caregiver', () => {
    const c = useCaregiver()
    useUiStore().setCaregiver('cg-david')
    expect(c.linked.value.map((r) => r.id)).toEqual(['res-lim'])
    expect(c.selected.value.id).toBe('res-lim')
  })
})
