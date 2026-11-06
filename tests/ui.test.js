import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUiStore } from '../src/stores/ui'

beforeEach(() => { vi.useFakeTimers(); setActivePinia(createPinia()) })
afterEach(() => vi.useRealTimers())

describe('ui store', () => {
  it('starts as the default caregiver and staff member', () => {
    const ui = useUiStore()
    expect(ui.currentCaregiver.name).toBe('Sarah Tan')
    expect(ui.currentStaff.name).toBe('Aisha binte Rahman')
    expect(ui.role).toBe('caregiver')
  })
  it('only switches to a known caregiver', () => {
    const ui = useUiStore()
    ui.setCaregiver('cg-david')
    expect(ui.currentCaregiverId).toBe('cg-david')
    ui.setCaregiver('cg-nobody')
    expect(ui.currentCaregiverId).toBe('cg-david')
  })
  it('remembers the resident being viewed, and forgets it when the caregiver changes', () => {
    const ui = useUiStore()
    expect(ui.selectedResidentId).toBeNull()
    ui.setSelectedResident('res-wong')
    expect(ui.selectedResidentId).toBe('res-wong')
    ui.setCaregiver('cg-david')
    expect(ui.selectedResidentId).toBeNull()
  })
  it('shows one toast at a time and hides it after its time', () => {
    const ui = useUiStore()
    ui.notify('One')
    ui.notify('Two', { kind: 'error' })
    expect(ui.toasts).toHaveLength(1)
    expect(ui.toasts[0]).toMatchObject({ text: 'Two', kind: 'error' })
    vi.advanceTimersByTime(3600)
    expect(ui.toasts).toHaveLength(0)
  })
  it('ignores unknown theme and text-size values', () => {
    const ui = useUiStore()
    ui.setTheme('dark'); ui.setTheme('neon')
    ui.setTextSize('large'); ui.setTextSize('huge')
    expect([ui.themeChoice, ui.textSize]).toEqual(['dark', 'large'])
  })
})
