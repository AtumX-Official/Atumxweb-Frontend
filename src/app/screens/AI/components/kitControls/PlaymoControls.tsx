import UpIcon from '../../icons/upIcon'
import DownIcon from '../../icons/downIcon'
import GreetIcon from '../../icons/greetIcon'
import DanceIcon from '../../icons/danceIcon'
import KitControlMapper from './KitControlMapper'
import type { KitAction, KitControlsProps } from './types'

/** Moves a PLAYMO kit performs — the same set its Playmocmd blocks emit. */
const PLAYMO_ACTIONS: KitAction[] = [
  { id: '', label: ' -----', Icon: null },
  { id: 'hello', label: 'Hello', Icon: GreetIcon },
  { id: 'pushup', label: 'Push up', Icon: null },
  { id: 'wiggle', label: 'Wiggle', Icon: DanceIcon },
  { id: 'bow', label: 'Bow', Icon: DownIcon },
  { id: 'jump', label: 'Jump', Icon: UpIcon }
]

export default function PlaymoControls(props: KitControlsProps): React.JSX.Element {
  return <KitControlMapper title="Map each class to PLAYMO:" actions={PLAYMO_ACTIONS} {...props} />
}
