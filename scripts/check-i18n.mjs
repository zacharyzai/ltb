// Checks that every locale has the same keys, no empty strings and the same {placeholders}. Run: npm run i18n:check
import { readFileSync } from 'node:fs'

const LOCALES = ['en', 'zh', 'ms', 'ta']
const flat = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]))
const load = (code) => Object.fromEntries(flat(JSON.parse(readFileSync(new URL(`../src/i18n/locales/${code}.json`, import.meta.url), 'utf8'))))
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

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
console.log(problems ? `${problems} problem(s)` : `i18n OK: ${Object.keys(en).length} keys x ${LOCALES.length} locales`)
process.exit(problems ? 1 : 0)
