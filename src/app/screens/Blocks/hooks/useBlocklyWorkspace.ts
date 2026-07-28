import { useEffect, useRef, useState, useMemo } from 'react'
import * as Blockly from 'blockly'
import 'blockly/blocks'
import 'blockly/msg/en'
import Swal from 'sweetalert2'
import { defineCustomBlocks } from '../../../blockly/trixblocks/variable'
import { buildToolboxXml } from '../../toobox/toolboxBuilder'
import customGenerator from '../../../blockly/customgenerator'
import { Variables } from '../../toobox/blocks/variable'

interface UseBlocklyWorkspaceOptions {
  selectedKit: string
  selectedCategory: string | null
  themeMode: 'light' | 'dark'
  onCodeChange: (code: string) => void
  onUnsavedChange: (unsaved: boolean) => void
  modifiedToolboxes: React.MutableRefObject<Record<string, string>>
}

export function useBlocklyWorkspace({
  selectedKit,
  selectedCategory,
  themeMode,
  onCodeChange,
  onUnsavedChange,
  modifiedToolboxes
}: UseBlocklyWorkspaceOptions) {
  // DOM / Blockly refs
  const blocklyDiv = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const toolboxXmlRef = useRef<string>('')
  const importedSnapshotRef = useRef<string | null>(null)
  const originalSnapshotRef = useRef<string>('')
  const savedWorkspaceStates = useRef<Record<string, string>>({})

  // Stable callback refs so the workspace listener never captures stale closures
  const onCodeChangeRef = useRef(onCodeChange)
  const onUnsavedChangeRef = useRef(onUnsavedChange)
  useEffect(() => { onCodeChangeRef.current = onCodeChange }, [onCodeChange])
  useEffect(() => { onUnsavedChangeRef.current = onUnsavedChange }, [onUnsavedChange])

  // State
  const [toolboxXml, setToolboxXml] = useState<string>('')
  const [isToolboxVisible, setIsToolboxVisible] = useState(true)
  const [selectedIcon, setSelectedIcon] = useState<string>('BASIC')
  const [blocklyVisible, setBlocklyVisible] = useState(true)
  const [zoomPercent, setZoomPercent] = useState(100)

  // ── Theme ────────────────────────────────────────────────────────────────

  const workspaceColor = themeMode === 'dark' ? '#4D4D4D' : '#ffffff'

  const customTheme = useMemo(
    () =>
      Blockly.Theme.defineTheme('customTheme', {
        name: 'customTheme',
        base: Blockly.Themes.Classic,
        componentStyles: { workspaceBackgroundColour: workspaceColor },
      }),
    [workspaceColor]
  )

  useEffect(() => {
    if (!workspaceRef.current) return
    workspaceRef.current.setTheme(customTheme)
    Blockly.svgResize(workspaceRef.current)
  }, [customTheme])

  // Expose theme to blocks that read window.appTheme
  useEffect(() => {
    ;(window as Window & { appTheme?: string }).appTheme = themeMode
  }, [themeMode])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const closeBlocklyEditors = () => {
    try {
      Blockly.WidgetDiv.hide()
      Blockly.DropDownDiv.hideWithoutAnimation?.()
      Blockly.DropDownDiv.hide?.()
    } catch (err) {
      console.warn('Failed to close Blockly floating editors:', err)
    }
  }

  // ── Workspace change listener ────────────────────────────────────────────

  const handleWorkspaceChange = (event: Blockly.Events.Abstract) => {
    if (event.isUiEvent) return

    // Enforce a single setup block
    if (
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.FINISHED_LOADING
    ) {
      const setups = workspaceRef.current?.getBlocksByType('setup', false) ?? []
      if (setups.length > 1) {
        setups.slice(1).forEach((b) => b.dispose(true))
        Swal.fire({ icon: 'warning', title: 'Only one Setup block allowed', text: 'Extra setup blocks were removed.' })
      }
    }

    // Close floating editors when a block is deleted
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      queueMicrotask(closeBlocklyEditors)
    }

    // Remove button_block immediately after creation
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      queueMicrotask(() => {
        workspaceRef.current
          ?.getBlocksByType('button_block', false)
          .forEach((b) => {
            if (b && !b.isDeadOrDying()) {
              closeBlocklyEditors()
              b.dispose(true)
            }
          })
      })
    }

    const userEditEvents = [
      Blockly.Events.BLOCK_CREATE,
      Blockly.Events.BLOCK_CHANGE,
      Blockly.Events.BLOCK_DELETE,
      Blockly.Events.BLOCK_MOVE,
    ]

    if (userEditEvents.includes(event.type)) {
      if (importedSnapshotRef.current) {
        const snapshot = JSON.stringify(
          Blockly.serialization.workspaces.save(workspaceRef.current!)
        )
        onUnsavedChangeRef.current(snapshot !== importedSnapshotRef.current)
      }
      onCodeChangeRef.current(customGenerator.workspaceToCode(workspaceRef.current!))
    }
  }

  // ── Blockly initialisation ───────────────────────────────────────────────

  useEffect(() => {
    if (!blocklyDiv.current || workspaceRef.current) return

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: Blockly.utils.xml.textToDom('<xml></xml>'),
      trashcan: true,
      theme: customTheme,
      toolboxPosition: 'start',
      horizontalLayout: false,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      move: { scrollbars: true, drag: true, wheel: true },
    })

    workspaceRef.current = workspace
    Blockly.svgResize(workspace)
    workspace.resize()
    workspace.addChangeListener(handleWorkspaceChange)
    workspaceRef.current.getCanvas().addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    return () => {
      closeBlocklyEditors()
      if (!workspace.isClearing) {
        workspace.removeChangeListener(handleWorkspaceChange)
        workspace.dispose()
      }
      workspaceRef.current = null
    }
  }, []) // intentionally empty — Blockly workspace must only initialise once

  // ── Custom blocks & variable toolbox ────────────────────────────────────

  useEffect(() => {

    // only initialize once
    if (!modifiedToolboxes.current['VARIABLE']) {
  
      modifiedToolboxes.current['VARIABLE'] =
        `<xml id="toolbox">
          ${Variables.VARIABLE_GENERIC}
        </xml>`;
    }
  
  }, []);

  useEffect(() => {
    defineCustomBlocks(workspaceRef, toolboxXmlRef, setToolboxXml, modifiedToolboxes)
  }, [])

  // ── Toolbox management ───────────────────────────────────────────────────

  const updateToolbox = (kit?: string, icon?: string, category?: string) => {
    if (!workspaceRef.current || !kit || !icon) return
    const xml = buildToolboxXml(
      kit.toUpperCase(),
      icon.toUpperCase(),
      category,
      modifiedToolboxes.current['VARIABLE']
    )
    try {
      workspaceRef.current.updateToolbox(Blockly.utils.xml.textToDom(xml))
      workspaceRef.current.getFlyout()?.setVisible(true)
      setIsToolboxVisible(true)
    } catch (err) {
      console.error('Invalid toolbox XML:', err)
    }
  }

  const initializeToolbox = (labelKey: string, kitKey: string) => {
    if (!workspaceRef.current) return
    const cat = selectedCategory?.toLowerCase()
    if (cat === 'gaadi' && labelKey === 'GAADI') { updateToolbox(kitKey, labelKey, 'gaadi'); return }
    if (cat === 'playmo' && labelKey === 'PLAYMO') { updateToolbox(kitKey, labelKey, 'playmo'); return }
    if (cat === 'Drone' && labelKey === 'DRONE') { updateToolbox(kitKey, labelKey, 'drone'); return }
    updateToolbox(kitKey, labelKey)
  }

  const handleIconClick = (label: string): Promise<void> =>
    new Promise((resolve) => {
      if (!workspaceRef.current) return resolve()
      const labelKey = label.toUpperCase()
      const kitKey = selectedKit?.toUpperCase() || 'DEFAULT'

      if (selectedIcon === label) {
        if (isToolboxVisible) {
          workspaceRef.current.updateToolbox(Blockly.utils.xml.textToDom('<xml></xml>'))
          workspaceRef.current.getFlyout()?.setVisible(false)
          setIsToolboxVisible(false)
        } else {
          initializeToolbox(labelKey, kitKey)
        }
        return resolve()
      }

      setSelectedIcon(label)
      initializeToolbox(labelKey, kitKey)
      resolve()
    })

  // Re-sync toolbox whenever kit / category / icon changes
  useEffect(() => {
    if (!workspaceRef.current || !selectedKit) return
    const label = selectedIcon?.toUpperCase()
    const category = selectedCategory?.toLowerCase()

    if (
      category &&
      ['gripper', 'walker', 'crawler'].includes(category) &&
      label &&
      ['GRIPPER', 'WALKER', 'CRAWLER'].includes(label)
    ) {
      updateToolbox(selectedKit, selectedIcon, category)
      return
    }
    if (category === 'gaadi' && label === 'GAADI') { updateToolbox(selectedKit, selectedIcon, 'gaadi'); return }
    if (category === 'playmo' && label === 'PLAYMO') { updateToolbox(selectedKit, selectedIcon, 'playmo'); return }

    updateToolbox(selectedKit, selectedIcon)
  }, [selectedKit, selectedCategory, selectedIcon])

  // ── Zoom ────────────────────────────────────────────────────────────────

  const handleZoom = (direction: 1 | -1) => {
    const ws = workspaceRef.current
    if (!ws) return
    setZoomPercent((prev) => {
      const next = Math.max(50, Math.min(150, prev + direction * 10))
      ws.setScale(next / 100)
      return next
    })
  }

  return {
    blocklyDiv,
    workspaceRef,
    toolboxXml,
    toolboxXmlRef,
    modifiedToolboxes,
    importedSnapshotRef,
    originalSnapshotRef,
    savedWorkspaceStates,
    isToolboxVisible,
    setIsToolboxVisible,
    selectedIcon,
    setSelectedIcon,
    blocklyVisible,
    setBlocklyVisible,
    zoomPercent,
    handleZoom,
    handleIconClick,
    closeBlocklyEditors,
  }
}
