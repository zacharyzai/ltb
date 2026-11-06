// App-wide short messages ("Saved", "Language changed") shown by <AppToast />. Pass text that is already translated.
import { ref } from 'vue'

const toasts = ref([]) // { id, text, kind: 'info' | 'error' }
let nextId = 1

export function useToast() {
  const dismiss = (id) => (toasts.value = toasts.value.filter((t) => t.id !== id))
  // Shows a message for `ms`; a new message replaces any older one so the live region stays calm.
  function notify(text, { kind = 'info', ms = 3500 } = {}) {
    const id = nextId++
    toasts.value = [{ id, text, kind }]
    setTimeout(() => dismiss(id), ms)
  }
  return { toasts, notify, dismiss }
}
