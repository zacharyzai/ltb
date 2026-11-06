// Theme and text-size preferences: saved on this device and applied to <html> (data-theme / data-text).
// index.html applies the same saved values before first paint, so nothing flashes.
export const THEMES = ['light', 'dark', 'system']
export const TEXT_SIZES = ['standard', 'large', 'xlarge']

const KEYS = { theme: 'sas.theme', textSize: 'sas.textSize' }
const DEFAULTS = { theme: 'system', textSize: 'standard' }
const VALID = { theme: THEMES, textSize: TEXT_SIZES }

export function readPref(name) {
  try {
    const value = localStorage.getItem(KEYS[name])
    return VALID[name].includes(value) ? value : DEFAULTS[name]
  } catch {
    return DEFAULTS[name] // storage blocked (private mode)
  }
}

export function savePref(name, value) {
  try {
    localStorage.setItem(KEYS[name], value)
  } catch {
    // Not critical: the choice just won't persist.
  }
}

export const systemDarkQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null

// `shown` is always 'light' or 'dark' ('system' already resolved).
export const applyTheme = (shown) => (document.documentElement.dataset.theme = shown)
export const applyTextSize = (size) => (document.documentElement.dataset.text = size)
