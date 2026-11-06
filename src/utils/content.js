// Mock records are language-independent: a seeded text field is null and listed in `seeded`, and its words live in the
// locale files under seed.<seedKey>.<field>. Text typed by a user is stored in the field as typed and never translated.
export const localized = (record, field, t) => (record.seeded?.includes(field) ? t(`seed.${record.seedKey}.${field}`) : record[field])

// Sets fields on a record and stops treating them as seeded text.
export const setFields = (record, changes) => {
  Object.assign(record, changes)
  if (record.seeded) record.seeded = record.seeded.filter((f) => !(f in changes))
  return record
}

// A resident's optional staff note: typed text, or seeded words, or null.
export const residentNote = (resident, t) => resident.note ?? (resident.noteSeedKey ? t(`seed.${resident.noteSeedKey}`) : null)

// Which illustration goes with a moment or event (a data URL / blob URL image is shown as a picture instead).
const MOMENT_ART = { gardening: 'gardening', crafts: 'crafts', music: 'music', exercise: 'exercise', celebration: 'celebration' }
const EVENT_ART = { festive: 'celebration', wellness: 'music', community: 'community', family: 'family' }
export const momentArt = (moment) => MOMENT_ART[moment.category] ?? 'community'
export const eventArt = (event) => EVENT_ART[event.category] ?? 'community'
export const isPhoto = (image) => typeof image === 'string' && /^(blob:|data:image|https?:)/.test(image)
