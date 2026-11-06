// Mock records are language-independent: a seeded text field is null and listed in `seeded`, and its words live in the
// locale files under seed.<seedKey>.<field>. Text typed by a user is stored in the field as typed and never translated.
export const localized = (record, field, t) => (record.seeded?.includes(field) ? t(`seed.${record.seedKey}.${field}`) : record[field])

// Sets fields on a record and stops treating them as seeded text.
export const setFields = (record, changes) => {
  Object.assign(record, changes)
  if (record.seeded) record.seeded = record.seeded.filter((f) => !(f in changes))
  return record
}
