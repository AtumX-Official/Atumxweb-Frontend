import type { GestureClass } from '../../hooks/useGestureClassifier'

/** One action a kit can perform, offered in the per-class dropdown. */
export interface KitAction {
  id: string
  label: string
  Icon: React.ComponentType<{ className?: string }> | null
}

/** Props every kit's controls component receives from the Controls tab. */
export interface KitControlsProps {
  classes: GestureClass[]
  /** classId → action id */
  mappings: Record<string, string>
  onMappingChange: (classId: string, actionId: string) => void
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
  getColor: (id: string, idx: number) => string
}
