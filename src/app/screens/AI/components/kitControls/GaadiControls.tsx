import UpIcon from '../../icons/upIcon'
import DownIcon from '../../icons/downIcon'
import LeftIcon from '../../icons/leftIcon'
import RightIcon from '../../icons/rightIcon'
import KitControlMapper from './KitControlMapper'
import type { KitAction, KitControlsProps } from './types'

function StopGlyph({ className = '' }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="28" height="28" rx="4" fill="black" />
    </svg>
  )
}

/** Drive actions a GAADI kit understands — they line up with the F/B/L/R
 *  directions its motor blocks send, plus a stop. */
const GAADI_ACTIONS: KitAction[] = [
  { id: '', label: ' -----', Icon: null },
  { id: 'forward', label: 'Forward', Icon: UpIcon },
  { id: 'backward', label: 'Backward', Icon: DownIcon },
  { id: 'left', label: 'Left', Icon: LeftIcon },
  { id: 'right', label: 'Right', Icon: RightIcon },
  { id: 'stop', label: 'Stop', Icon: StopGlyph }
]

export default function GaadiControls(props: KitControlsProps): React.JSX.Element {
  return <KitControlMapper title="Map each class to GAADI:" actions={GAADI_ACTIONS} {...props} />
}
