// Store actions return a result instead of throwing: { ok: true, value } or { ok: false, error, params? }.
// `error` is a stable code (e.g. 'SLOT_FULL'); the UI shows t(`errors.${error}`, params).
export const ok = (value) => ({ ok: true, value })
export const fail = (error, params) => (params ? { ok: false, error, params } : { ok: false, error })
