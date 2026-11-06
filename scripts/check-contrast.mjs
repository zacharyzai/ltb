// Checks WCAG contrast of the token pairs the interface uses, in both themes. Run: npm run contrast
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/styles/global/tokens.css', import.meta.url), 'utf8')
const block = (re) => Object.fromEntries([...(css.match(re)?.[0] ?? '').matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]))
const light = block(/:root \{[\s\S]*?\n\}/)
const dark = { ...light, ...block(/:root\[data-theme='dark'\] \{[\s\S]*?\n\}/) }

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

// [foreground, background, minimum ratio]: 4.5 for text, 3 for large text and UI boundaries
const PAIRS = [
  ['text', 'page', 4.5], ['text', 'card', 4.5], ['text', 'surface-2', 4.5], ['text', 'tint', 4.5],
  ['text-muted', 'page', 4.5], ['text-muted', 'card', 4.5], ['text-muted', 'surface-2', 4.5], ['text-muted', 'tint', 4.5],
  ['on-primary', 'primary', 4.5], ['on-primary', 'primary-hover', 4.5],
  ['primary-text', 'card', 4.5], ['primary-text', 'page', 4.5], ['primary-text', 'tint', 4.5],
  ['tint-text', 'tint', 4.5], ['tint-text', 'tint-strong', 4.5],
  ['green-text', 'card', 4.5], ['green-text', 'green-tint', 4.5],
  ['link', 'page', 4.5], ['link', 'card', 4.5], ['link-hover', 'card', 4.5],
  ['sas-red-text', 'card', 4.5], ['sas-red-text', 'danger-bg', 4.5],
  ['on-primary', 'sas-red-solid', 4.5],
  ['success-text', 'success-bg', 4.5], ['warning-text', 'warning-bg', 4.5], ['danger-text', 'danger-bg', 4.5], ['info-text', 'info-bg', 4.5],
  ['status-well-fg', 'status-well-bg', 4.5], ['status-resting-fg', 'status-resting-bg', 4.5],
  ['status-contact-fg', 'status-contact-bg', 4.5], ['status-full-fg', 'status-full-bg', 4.5],
  ['status-well-fg', 'card', 4.5], ['status-resting-fg', 'card', 4.5], ['status-contact-fg', 'card', 4.5],
  ['control-border', 'card', 3], ['control-border', 'page', 3],
  ['focus', 'page', 3], ['focus', 'card', 3], ['focus', 'tint', 3],
  ['brand', 'card', 3], // decorative / large only
]
const get = (t, n) => t[`color-${n}`] ?? t[n]
let failed = 0
for (const [theme, t] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min] of PAIRS) {
    if (!get(t, fg) || !get(t, bg)) { console.log(`MISSING ${theme}: ${fg} / ${bg}`); failed++; continue }
    const r = ratio(get(t, fg), get(t, bg))
    if (r < min) { failed++; console.log(`FAIL ${theme}: ${fg} ${get(t, fg)} on ${bg} ${get(t, bg)} = ${r.toFixed(2)} (need ${min})`) }
  }
}
console.log(failed ? `${failed} problem(s)` : `All ${PAIRS.length * 2} pairs pass (light + dark)`)
process.exit(failed ? 1 : 0)
