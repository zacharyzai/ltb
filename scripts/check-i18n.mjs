// Checks that every locale has the same keys, no empty strings and the same {placeholders}. Run: npm run i18n:check
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const LOCALES = ['en', 'zh', 'ms', 'ta']
const flat = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]))
const load = (code) => Object.fromEntries(flat(JSON.parse(readFileSync(new URL(`../src/i18n/locales/${code}.json`, import.meta.url), 'utf8'))))
const placeholders = (s) => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(',') // plural forms repeat {n}

const en = load('en')
let problems = 0
for (const code of LOCALES.slice(1)) {
  const msgs = load(code)
  for (const key of Object.keys(en)) {
    if (!(key in msgs)) { problems++; console.log(`${code}: missing ${key}`) }
    else if (!msgs[key].trim()) { problems++; console.log(`${code}: empty ${key}`) }
    else if (placeholders(msgs[key]) !== placeholders(en[key])) { problems++; console.log(`${code}: placeholders differ in ${key}`) }
  }
  for (const key of Object.keys(msgs)) if (!(key in en)) { problems++; console.log(`${code}: extra key ${key}`) }
}

// Every static t('some.key') used in src/ must exist in English (dynamic keys like t(`status.${x}`) are covered by tests).
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))
const root = new URL('../src', import.meta.url).pathname
for (const file of walk(root).filter((f) => /\.(vue|js)$/.test(f))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([\w.-]+)['"]/g)) {
    if (!(m[1] in en)) { problems++; console.log(`${file.replace(root, 'src')}: unknown key ${m[1]}`) }
  }
}
console.log(problems ? `${problems} problem(s)` : `i18n OK: ${Object.keys(en).length} keys x ${LOCALES.length} locales`)
process.exit(problems ? 1 : 0)
