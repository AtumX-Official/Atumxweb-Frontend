"use client";
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../../store/hooks'
import type { AppDispatch } from '../../../store/index'
import { setVersion } from '../../../store/websocketSlice'
import { sendSerialMessage } from '../../../store/serialSlice'
import * as Blockly from 'blockly'
import customGenerator from '../blockly/customgenerator'
import { DndContext } from '@dnd-kit/core'
import Header from '../components/Header'
import Sidebar from './Elements/Sidebar'
import TopLeftBar from './Elements/Topbar/Topleft'
import TopBarRight from './Elements/Topbar/TopRightBar'
import TopBarCenter from './Elements/Topbar/TopCenter'
import Models, { AddBlocks } from './Models'
import BackgroundImg from "../assets/Background.svg"
import Curriculum from './Elements/Topbar/Curriculumcomponent'
import ConvertToLanguagePopup, {
  RunPopup,
  UnderdevelopmentPopup,
  Savetokitpop,
} from '../components/supporting/Popups'
import {
  handleSave,
  handleImport,
  handleNewFileCreation,
  handleExitApp,
} from './CommonHelper/HelperFunctions'

import { useBlocklyWorkspace } from './Blocks/hooks/useBlocklyWorkspace'
import { useBlocklyActions } from './Blocks/hooks/useBlocklyActions'
import BlocklyControls from './Blocks/components/BlocklyControls'
import { registerAIClassBlocks, registerPlaceholderAIBlocks } from '../blockly/suboblocks/ai'
import { buildToolboxXml } from './toobox/toolboxBuilder'
import "../blockly";
declare global {
  interface Window {
    __aiLoadedModels?: Array<{
      fileName: string
      displayName: string
      classNames: string[]
      blockTypes: string[]
    }>
  }
}

const BlocksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter();
  const pathname = usePathname();

  // ── Redux state ──────────────────────────────────────────────────────────

  const selectedKit = useAppSelector((state) => state.kits.kit)
  const selectedCategory = useAppSelector((state) => state.kits.category)
  const themeMode = useAppSelector((state) => state.theme.mode)
  const { isConnected, mode } = useAppSelector((state) => state.websocketSlice)

  // ── File / project state ─────────────────────────────────────────────────

  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [projectName, setProjectName] = useState('project 1')
  const [filePath, setFilePath] = useState('')
  const [unsavedChanges, setUnsavedChanges] = useState(true)

  // ── UI overlay state ─────────────────────────────────────────────────────

  const [showKits, setShowKits] = useState(true)
  const [showPDF, setShowPDF] = useState(false)
  const [showaddBlock, setShowaddBlock] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showUnderDev, setShowUnderDev] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [animalMode, setAnimalMode] = useState<'Gripper' | 'Walker' | 'Crawler'>()
  const [pdfPosition, setPdfPosition] = useState({ x: 0, y: 0 })

  const kitsButtonRef = useRef<HTMLDivElement>(null)
  const bgColor = themeMode === 'dark' ? '#4D4D4D' : 'white'
  const bgyellow = themeMode === 'dark' ? "bg-[#FFDE21]" : "bg-[#EAC90F]"
  const modifiedToolboxes = useRef<Record<string, string>>({});
  const toolboxXmlRef = useRef<string>("");
  const [toolboxXml, setToolboxXml] = useState<string>('')
  const shouldShowModal = pathname.state?.showModal;
  // ── Workspace & actions ──────────────────────────────────────────────────

  const workspace = useBlocklyWorkspace({
    selectedKit,
    selectedCategory,
    themeMode,
    onCodeChange: setCode,
    onUnsavedChange: setUnsavedChanges,
    modifiedToolboxes
  })

  const actions = useBlocklyActions({ workspaceRef: workspace.workspaceRef, isConnected, mode })

  // ── Effects ──────────────────────────────────────────────────────────────

  // Hide kit selector once the user picks a kit
  useEffect(() => {
    if (selectedKit && selectedKit !== 'Default') setShowKits(false)
  }, [selectedKit])

  // Keep code-generator in sync with selected robot category
  useEffect(() => {
    const modeMap = { gripper: 'Arm', walker: 'Dog', crawler: 'Crab' } as const
    type Cat = keyof typeof modeMap
    customGenerator.__mode = selectedCategory ? (modeMap[selectedCategory as Cat] ?? 'Board') : 'Board'
  }, [selectedCategory])

  // Forward "open example file" events from the main process
  // useEffect(() => {
  //   window.api.file.onLoadExample(({ filePath, fileName }) => {
  //     navigate('/blocks', { state: { filePath, fileName } })
  //   })
  // })

  // Load a file passed via route state (e.g. from project page or example loader)
  useEffect(() => {
    if (shouldShowModal) {
      setShowKits(true);
    }
  }, [shouldShowModal]);

  // Parse firmware version from serial data
  // useEffect(() => {
  //   window.api.serial.onData((data: string) => {
  //     try {
  //       const parsed = JSON.parse(data)
  //       if (parsed.version) dispatch(setVersion(parsed.version))
  //     } catch {
  //       // non-JSON serial messages are expected — ignore
  //     }
  //   })
  // }, [])

  // Listen for model load from dropdown inside block to update the toolbox flyout dynamically
  useEffect(() => {
    const handleModelLoaded = () => {
      const ws = workspace.workspaceRef.current
      if (!ws) return
      const kitKey = selectedKitRef.current?.toUpperCase() || 'DEFAULT'
      const xml = buildToolboxXml(kitKey, 'AI')
      ws.updateToolbox(Blockly.utils.xml.textToDom(xml))
      ws.getFlyout()?.setVisible(true)
    }
    window.addEventListener('ai:modelLoaded', handleModelLoaded)
    return () => window.removeEventListener('ai:modelLoaded', handleModelLoaded)
  }, [workspace])

  // Keep a ref so the button callback always sees the latest kit, even if it
  // was selected after this effect ran.
  const selectedKitRef = useRef(selectedKit)
  useEffect(() => { selectedKitRef.current = selectedKit }, [selectedKit])

  // ── AI toolbox button callback ───────────────────────────────────────────

  useEffect(() => {
    const ws = workspace.workspaceRef.current
    if (!ws) return

    ws.registerButtonCallback('loadAIModel', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        try {
          const text = await file.text()
          const bundle = JSON.parse(text) as {
            classNames?: string[]
            [k: string]: unknown
          }

          const classNames = bundle.classNames ?? []
          bundle.classNames = classNames

          window.__aiModels = window.__aiModels ?? {}
          window.__aiModels[file.name] = bundle as never

          const blockTypes = registerAIClassBlocks(file.name, classNames)

          window.__aiLoadedModels = [
            {
              fileName: file.name,
              displayName: file.name.replace(/\.json$/i, ''),
              classNames,
              blockTypes,
            }
          ]

          // Blockly closes the flyout when a button is clicked.
          // Rebuild the toolbox XML then explicitly reopen the flyout.
          const kitKey = selectedKitRef.current?.toUpperCase() || 'DEFAULT'
          const xml = buildToolboxXml(kitKey, 'AI')
          ws.updateToolbox(Blockly.utils.xml.textToDom(xml))
          ws.getFlyout()?.setVisible(true)
        } catch (err) {
          console.error('[AI] Failed to load model for toolbox:', err)
        }
      }

      input.click()
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shared helper params (avoids repetition in JSX below) ───────────────

  const fileHelperBase = {
    workspaceRef: workspace.workspaceRef,
    originalSnapshotRef: workspace.originalSnapshotRef,
    savedWorkspaceStates: workspace.savedWorkspaceStates,
    importedSnapshotRef: workspace.importedSnapshotRef,
    setCode,
    setFilePath,
    setProjectName,
    setOutput,
    setUnsavedChanges,
    code,
    filePath,
    projectName,
    selectedKit,
    selectedCategory,
    sendSerialMessage,
  }
// In BlocksPage — add this effect

useEffect(() => {
  if (!workspace.workspaceRef.current) return;

  // RESTORE
  const saved = sessionStorage.getItem("blocklyWorkspace");

  if (saved) {
    const state = JSON.parse(saved);

    Blockly.serialization.workspaces.load(
      state,
      workspace.workspaceRef.current
    );
  }

  // SAVE ON CHANGE
  const listener = () => {
    const data =
      Blockly.serialization.workspaces.save(
        workspace.workspaceRef.current
      );

    sessionStorage.setItem(
      "blocklyWorkspace",
      JSON.stringify(data)
    );
  };

  workspace.workspaceRef.current.addChangeListener(listener);

  return () => {
    // SAVE BEFORE DESTROY
    const currentWorkspace = workspace.workspaceRef.current;

if (currentWorkspace) {
  const data =
    Blockly.serialization.workspaces.save(
      currentWorkspace
    );

  sessionStorage.setItem(
    "blocklyWorkspace",
    JSON.stringify(data)
  );
}
  };
}, [workspace.workspaceRef]);
  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      <DndContext
        onDragEnd={({ delta }) =>
          setPdfPosition((prev) => ({ x: prev.x + delta.x, y: prev.y + delta.y }))
        }
      >
           <div
  className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg-center bg-contain pointer-events-none opacity-30"
  style={{ backgroundImage: `url(${BackgroundImg})` }}
/>
        <div className={`w-full h-screen flex flex-col pt-6 ${bgyellow}`}>

          {/* ── Top Bar ─────────────────────────────────────────────────── */}
          <div className="w-full relative h-[75px] z-50">
            <div className="flex items-center justify-between ml-3 mr-3">

              {/* Left: file actions + mode switch */}
              <div className="flex-shrink-0 z-10">
                <TopLeftBar
                  saveToKit={actions.saveToKit}
                  handleLanguageClick={() => setShowUnderDev(true)}
                  unsavedChanges={unsavedChanges}
                  onOpenPDF={() => setShowPDF(true)}
                  runstatus={actions.runstatus}
                  animalMode={animalMode}
                  setAnimalMode={setAnimalMode}
                  selectedCategory={selectedCategory}
                  handleSave={(savemode) =>
                    handleSave({
                      ...fileHelperBase,
                      setrunStatus: actions.setRunStatus,
                      savemode,
                    })
                  }
                  handleImport={() =>
                    handleImport({
                      ...fileHelperBase,
                      unsavedChanges,
                      customGenerator,
                      setIsToolboxVisible: workspace.setIsToolboxVisible,
                      handleIconClick: workspace.handleIconClick,
                      setSelectedIcon: workspace.setSelectedIcon,
                      dispatch,
                      modifiedToolboxes,
                      toolboxXmlRef,
                      setToolboxXml                    
                    })
                  }
                  handleNewFileCreation={(unsaved) =>
                    handleNewFileCreation({
                      ...fileHelperBase,
                      unsavedChanges: unsaved,
                      setSelectedIcon: workspace.setSelectedIcon,
                      setIsToolboxVisible: workspace.setIsToolboxVisible,
                      setrunStatus: actions.setRunStatus,
                      setShowKits,
                    })
                  }
                  handleExitApp={() => {
                    if (actions.runstatus === 'Stop') {
                      actions.showRunPopup('RUNNING');
                      return;
                    }
                  
                    workspace.closeBlocklyEditors();
                  
                    handleExitApp({
                      workspaceRef: workspace.workspaceRef,
                      filePath,
                      unsavedChanges,
                      selectedKit,
                      setOutput,
                      router,
                      projectName,
                      selectedCategory,
                    });
                  }}
                />
              </div>

              {/* Center: kit name + project name */}
              <div className="flex-1 flex justify-center">
                <TopBarCenter
                  selectedKit={selectedKit}
                  setShowKits={setShowKits}
                  kitsButtonRef={kitsButtonRef}
                  projectName={projectName}
                  setProjectName={setProjectName}
                />
              </div>

              {/* Right: connection status + misc */}
              <div className="flex-shrink-0 flex justify-end">
                <TopBarRight setShowKits={setShowKits} />
                <ConvertToLanguagePopup
                  show={showPopup}
                  onClose={() => setShowPopup(false)}
                  language={selectedLanguage}
                />
              </div>

            </div>
          </div>

          {/* ── Main Workspace ──────────────────────────────────────────── */}
          <div
            className="relative flex-1 shadow-lg overflow-hidden dot-grid z-[20]"
            style={{ backgroundColor: bgColor }}
          >
            <div className="absolute inset-0 flex">

              {/* Icon sidebar (toolbox category selector) */}
              <Sidebar
                selectedIcon={workspace.selectedIcon}
                handleIconClick={workspace.handleIconClick}
                setBlocklyVisible={workspace.setBlocklyVisible}
                themeMode={themeMode}
                istoolboxVisible={workspace.isToolboxVisible}
                setShowaddBlock={setShowaddBlock}
              />

              {/* Blockly canvas + floating controls */}
              <div className="flex-1 relative">
                <BlocklyControls
                  workspaceRef={workspace.workspaceRef}
                  runstatus={actions.runstatus}
                  zoomPercent={workspace.zoomPercent}
                  themeMode={themeMode}
                  onRunStop={actions.handleRunStop}
                  onZoom={workspace.handleZoom}
                />

                {workspace.blocklyVisible && workspace.selectedIcon && (
                  <div className="absolute inset-0 overflow-visible z-0">
                    <div ref={workspace.blocklyDiv} className="absolute inset-0 rounded-xl" />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Overlays ────────────────────────────────────────────────── */}

          {showKits && (
            <div
              onClick={() => setShowKits(false)}
              className="fixed inset-0 z-50 flex items-start justify-center pt-[100px] bg-black/50 backdrop-blur-sm"
            >
              <Models />
            </div>
          )}

          {showaddBlock && (
            <div onClick={() => setShowaddBlock(false)}>
              <AddBlocks handleLanguageClick={() => setShowUnderDev(true)} />
            </div>
          )}

          {actions.runPopup && <RunPopup variant={actions.runPopup} />}
          {/* <AIRunnerOverlay /> */}

        </div>

        {showUnderDev && <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />}
        {actions.showSavetokitpop && <Savetokitpop type={actions.popupType} />}

        {/* {showPDF && (
          <Curriculum
            pdfUrl={samplePdf}
            position={pdfPosition}
            onClose={() => setShowPDF(false)}
            title="Blockly User Manual"
          />
        )} */}

      </DndContext>
    </>
  )
}

export default BlocksPage
