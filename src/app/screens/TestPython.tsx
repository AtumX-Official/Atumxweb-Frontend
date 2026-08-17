import React, { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import 'blockly/blocks'
import 'blockly/msg/en'
import customPythonGenerator from '../blockly/generator/python'
import { loadPyodide } from 'pyodide'
import { IoIosArrowBack, IoMdClose } from 'react-icons/io'
import { VscDebugStart } from 'react-icons/vsc'
import { FaSpinner } from 'react-icons/fa'

const PythonPage: React.FC = () => {
  const blocklyDiv = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  const [code, setCode] = useState('')
  const [pythonOutput, setPythonOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [panelY, setPanelY] = useState(0)
  const [dragStartY, setDragStartY] = useState<number | null>(null)

  // Init Blockly
  useEffect(() => {
    if (!blocklyDiv.current) return

    const toolboxXml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="custom_text" />
      <block type="if" />
      <block type="custom_compare" />
      <block type="logical_operator" />
      <block type="custom_not" />
      <block type="custom_boolean" />
      <block type="custom_null" />
      <block type="custom_if_else" />
      <block type="repeat" />
      <block type="repeat_while" />
      <block type="for_loop" />
      <block type="for_each" />
      <block type="break_continue" />
      <block type="setup" />
      <block type="move_arm"/>
      <block type="move_left"/>
      <block type="move_right"/>
      <block type="dance"/>
      <block type="fold"/>
      <block type="wave"/>
      <block type="walker_leg_control"/>
      <block type="led_control"/>
      <block type="all_led_control"/>
      <block type="testled_control"/>
      <block type="led_sequence"/>
      <block type="move_gripper"/>
      <block type="buzzer"/>
      <block type="buzzer_preset"/>
      <block type="move_forward"/>
      <block type="move_Backward"/>
      <block type="pushup"/>
      <block type="greet"/>
      <block type="stand"/>
      <block type="dogsitup"/>
      <block type="delay"/>
      <block type="calibrate"/>
      <block type="leg_control"/>
      <block type="play_note"/>
      <block type="cayosetup_DHT"/>
      <block type="cayosetup_HB"/>
      <block type="cayosensor_pin"/>
      <block type="cayoservo_init"/>
      <block type="cayoconnect_ldr"/>
      <block type="cayoconnect_us1"/>
      <block type="cayocolor_sensor_init"/>
      <block type="cayodigital_write"/>
      <block type="cayoanalog_write"/>
      <block type="cayopinmode"/>
    </xml>`
    const workspace = Blockly.inject(blocklyDiv.current, { toolbox: toolboxXml })
    workspaceRef.current = workspace

    const updateCode = () => {
      const generatedCode = customPythonGenerator.workspaceToCode(workspace)
      setCode(generatedCode)
    }

    workspace.addChangeListener(updateCode)

    return () => {
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  // Run Python Code
  const handleCodeExecution = async () => {
    if (!code) return
    setIsLoading(true)

    try {
      const pyodide = await loadPyodide({ indexURL: '/pyodide/' })
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        output = StringIO()
        sys.stdout = output
        sys.stderr = output
      `)

      await pyodide.runPythonAsync(code)
      const output = pyodide.runPython('output.getvalue()')
      setPythonOutput(output)
      setShowOutput(true)
    } catch (err: any) {
      setPythonOutput(`Error: ${err.message}`)
      setShowOutput(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePanel = () => {
    setShowOutput(false)
    setPythonOutput('')
  }

  // Drag events
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStartY(clientY)
  }

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (dragStartY === null) return
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
    const diff = currentY - dragStartY
    setPanelY(diff)
  }

  const handleDragEnd = () => {
    if (panelY > 100) {
      handleClosePanel()
    }
    setPanelY(0)
    setDragStartY(null)
  }

  useEffect(() => {
    if (dragStartY !== null) {
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
    }

    return () => {
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, [dragStartY])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Back Button */}
      <div className="p-4">
        <button onClick={() => window.history.back()}>
          <IoIosArrowBack size={24} />
        </button>
      </div>

      {/* Blockly Workspace */}
      <div
        ref={blocklyDiv}
        className="w-full"
        style={{
          height: showOutput ? '55vh' : 'calc(100vh - 80px)',
          transition: 'height 0.3s'
        }}
      />

      {/* Run Button */}
      <button
        onClick={handleCodeExecution}
        disabled={isLoading}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '9999px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
          cursor: 'pointer'
        }}
      >
        {isLoading ? <FaSpinner className="animate-spin" /> : <VscDebugStart />}
      </button>

      {/* Sliding Panel */}
      {showOutput && (
        <div
          className="fixed bottom-0 left-0 w-full bg-zinc-900 text-white shadow-xl rounded-t-2xl transition-transform duration-300 ease-in-out"
          style={{
            height: '45vh',
            transform: `translateY(${Math.max(0, panelY)}px)`,
            zIndex: 50
          }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center p-3 cursor-grab"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ touchAction: 'none' }}
          ></div>

          {/* Close Button */}
          <button
            className="absolute top-2 right-4 text-gray-400 hover:text-white text-xl"
            onClick={handleClosePanel}
          >
            <IoMdClose />
          </button>

          {/* Output */}
          <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-50px)]">
            <h3 className="text-lg font-bold mb-2">Generated Python Code:</h3>
            <pre className="bg-black text-green-400 p-3 rounded overflow-x-auto">{code}</pre>

            <h4 className="mt-4 mb-1 text-md font-semibold">Execution Output:</h4>
            <pre className="bg-zinc-800 text-white p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {pythonOutput || 'No output yet.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default PythonPage
