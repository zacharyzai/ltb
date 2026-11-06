// App-wide short messages ("Saved", "Language changed"). The state lives in the ui store; this keeps the call sites short.
import { storeToRefs } from 'pinia'
import { useUiStore } from '../stores/ui'

export function useToast() {
  const ui = useUiStore()
  const { toasts } = storeToRefs(ui)
  return { toasts, notify: ui.notify, dismiss: ui.dismissToast }
}
