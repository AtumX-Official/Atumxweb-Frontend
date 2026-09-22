/**
 * Round trip AI screen → Blocks → back to the same AI screen.
 *
 * Exporting to Blocks is a route change, so the AI screen unmounts and its state
 * (trained model, classes, sample pictures) would be gone when the user comes back.
 * Before navigating, the screen stashes a snapshot here; when it mounts again it
 * takes the snapshot and restores it. The Blocks page learns where to return from
 * the `from` query param.
 *
 * Module-level on purpose: it lives exactly as long as this browser tab's JS, which
 * is what a client-side round trip needs. A full reload starts clean.
 */

export type AiRoute = '/ai' | '/pose' | '/audio'

const AI_ROUTES: readonly AiRoute[] = ['/ai', '/pose', '/audio']

export interface AiSnapshot {
  /** Project bundle as JSON — the same format Save writes. */
  json: string
  projectName: string
  /** Custom class colours by class name (class ids are regenerated on restore). */
  colorsByName?: Record<string, string>
}

const snapshots = new Map<AiRoute, AiSnapshot>()

export function stashAiSnapshot(route: AiRoute, snapshot: AiSnapshot): void {
  snapshots.set(route, snapshot)
}

/** Read without removing: a screen's mount effect runs twice under React Strict
 *  Mode (dev), and both runs must see the snapshot or the second would reset the
 *  screen to its defaults. Call clearAiSnapshot once it has been restored. */
export function peekAiSnapshot(route: AiRoute): AiSnapshot | undefined {
  return snapshots.get(route)
}

export function clearAiSnapshot(route: AiRoute): void {
  snapshots.delete(route)
}

/** URL for the Blocks page that remembers which AI screen to return to. */
export function blocksUrlFrom(route: AiRoute): string {
  return `/blocks?from=${encodeURIComponent(route)}`
}

/** Where the Blocks back button should go: the originating AI screen, else home. */
export function blocksExitRoute(): string {
  if (typeof window === 'undefined') return '/'
  const from = new URLSearchParams(window.location.search).get('from')
  return AI_ROUTES.includes(from as AiRoute) ? (from as string) : '/'
}
