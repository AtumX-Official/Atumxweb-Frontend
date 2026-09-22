import UpIcon from '../../icons/upIcon'
import DownIcon from '../../icons/downIcon'
import LeftIcon from '../../icons/leftIcon'
import RightIcon from '../../icons/rightIcon'
import KitControlMapper from './KitControlMapper'
import type { KitAction, KitControlsProps } from './types'

function ThrustGlyph({ className = '' }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2L31 17H5L18 2Z" fill="black" />
      <path d="M18 19L31 34H5L18 19Z" fill="black" />
    </svg>
  )
}

/** Flight actions a REKKA drone understands — the directions its
 *  drone_move_direction block offers. */
const REKKA_ACTIONS: KitAction[] = [
  { id: '', label: ' -----', Icon: null },
  { id: 'thrustup', label: 'Thrust Up', Icon: ThrustGlyph },
  { id: 'forward', label: 'Forward', Icon: UpIcon },
  { id: 'backward', label: 'Backward', Icon: DownIcon },
  { id: 'left', label: 'Left', Icon: LeftIcon },
  { id: 'right', label: 'Right', Icon: RightIcon }
]

export default function RekkaControls(props: KitControlsProps): React.JSX.Element {
  return <KitControlMapper title="Map each class to REKKA:" actions={REKKA_ACTIONS} {...props} />
}
