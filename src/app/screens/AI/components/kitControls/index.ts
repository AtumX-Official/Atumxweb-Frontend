import GaadiControls from './GaadiControls'
import PlaymoControls from './PlaymoControls'
import RekkaControls from './RekkaControls'
import type { KitControlsProps } from './types'

/** Kit id (as shown on the Controls tab tiles) → that kit's controls UI. */
export const KIT_CONTROLS: Record<string, React.ComponentType<KitControlsProps>> = {
  gaadi: GaadiControls,
  playmo: PlaymoControls,
  rekka: RekkaControls
}

export type { KitControlsProps }
