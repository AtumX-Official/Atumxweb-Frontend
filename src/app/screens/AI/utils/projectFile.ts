/**
 * Open / save an AI project (.json bundle).
 *
 * The desktop build exposes `window.api.file` (Electron preload), which shows a
 * native dialog rooted in Projects/ai/<type>. In the browser that bridge doesn't
 * exist, so fall back to a file picker for open and a download for save — without
 * this, Open/Save on the AI screens silently did nothing on the web.
 */

type OpenResult = { success: boolean; data?: string; fileName?: string; error?: string }
type SaveResult = { success: boolean; error?: string }

function hasBridge(): boolean {
  return typeof window !== 'undefined' && typeof window.api?.file?.open === 'function'
}

/** Ask the user for a project file. Resolves `{ success: false }` if they cancel. */
export async function openProjectFile(type: string): Promise<OpenResult> {
  if (hasBridge()) {
    const res = await window.api.file.open(type)
    return res ?? { success: false }
  }

  return new Promise<OpenResult>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    // No `accept` filter — any file can be picked (like the desktop dialog's
    // "All Files"); a non-project file fails the bundle check with a clear error.
    input.style.display = 'none'
    document.body.appendChild(input)

    let settled = false
    const finish = (result: OpenResult) => {
      if (settled) return
      settled = true
      input.remove()
      resolve(result)
    }

    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) return finish({ success: false })
      try {
        finish({ success: true, data: await file.text(), fileName: file.name })
      } catch (err) {
        finish({ success: false, error: String(err) })
      }
    })
    // Fired by current browsers when the picker is dismissed without a file.
    input.addEventListener('cancel', () => finish({ success: false }))

    input.click()
  })
}

/** Save a project bundle. On the web this downloads `<name>.json`. */
export async function saveProjectFile(type: string, name: string, json: string): Promise<SaveResult> {
  if (typeof window !== 'undefined' && typeof window.api?.file?.save === 'function') {
    const res = await window.api.file.save('', json, type, name, '', '')
    return { success: !!res?.success, error: res?.error }
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name.endsWith('.json') ? name : `${name}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { success: true }
}

/** Project name from a picked file name ("my-proj.json" → "my-proj"). */
export function projectNameFromFile(fileName?: string): string {
  return (fileName ?? '').replace(/\.json$/i, '')
}
