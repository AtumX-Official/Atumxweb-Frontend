import { useCallback, useState } from 'react'

export type NoticeTone = 'info' | 'success' | 'warning' | 'error'

export interface Notice {
  tone: NoticeTone
  title: string
  message: string
  /** Label for the dismiss button. Defaults to "GOT IT". */
  confirmLabel?: string
}

export interface NoticeState {
  notice: Notice | null
  showNotice: (n: Notice) => void
  dismissNotice: () => void
}

/**
 * One message at a time, rendered by `NoticePopup`. Screens and the classifier
 * hooks use this instead of `window.alert`, which can't be themed.
 */
export function useNotice(): NoticeState {
  const [notice, setNotice] = useState<Notice | null>(null)
  const showNotice = useCallback((n: Notice) => setNotice(n), [])
  const dismissNotice = useCallback(() => setNotice(null), [])
  return { notice, showNotice, dismissNotice }
}
