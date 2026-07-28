import React, { useEffect, useState, useRef } from 'react'
import { IoHome } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Settings from '../assets/icons/common/Settings'
import SortIcon from '../assets/icons/common/SortIcon'
import SearchIcon from '../assets/icons/common/SearchIcon'
import SettingModal from '../components/supporting/SettingModal'
import PrjPageIcon from '../assets/icons/common/PrjPageIcon'
import Bfile from "../assets/Filestructuresvg/Bfile.svg"
import Pfile from "../assets/Filestructuresvg/Pfile.svg"
import Pfolder from "../assets/Filestructuresvg/Pfolder.svg"
import Cfolder from "../assets/Filestructuresvg/Cfolder.svg"
import Cfile from "../assets/Filestructuresvg/Cfile.svg"



const BlockBox = ({ file }) => {
  const navigate = useNavigate()
  return (
    <button
      className="cursor-pointer hover:scale-110 transition-transform duration-300"
      onClick={() =>
        navigate('/blocks', { state: { filePath: file.filepath, fileName: file.filename } })
      }
    >
      <div className="flex flex-col items-center justify-center text-center text-xs">
        <img src={Bfile} alt="Block File" className="w-16 h-16" />
        <span className="text-center mt-1">{file.filename}</span>
      </div>
    </button>
  )
}

const PythonBox = ({ file , onOpen}) => {
  return (
    <button
      className="cursor-pointer hover:scale-110 transition-transform duration-300"
      onClick={() => onOpen('python', file)}
    >
      <div className="flex flex-col items-center justify-center text-center text-xs">
      <img src={Pfile} alt="Python File" className="w-16 h-16" />
        <span className="text-center">{file.filename}</span>
      </div>
    </button>
  )
}

const CppBox = ({ file ,onOpen}) => {
  return (
    <button
      className="cursor-pointer hover:scale-110 transition-transform duration-300"
      onClick={() => onOpen('cpp', file)}

    >
      <div className="flex flex-col items-center justify-center text-center text-xs">
      <img src={Cfile} alt="Python File" className="w-16 h-16" />
        <span className="text-center">{file.filename}</span>
      </div>
    </button>
  )
}

const AiBox = ({ file }) => {
  const navigate = useNavigate()
  return (
    <button
      className="cursor-pointer hover:scale-110 transition-transform duration-300"
      onClick={() =>
        navigate('/ai', { state: { filePath: file.filepath, fileName: file.filename } })
      }
    >
      <div className="flex flex-col items-center justify-center text-center text-xs">
        <div className="w-16 h-16 rounded-md" style={{ backgroundColor: '#00CCFF' }} />
        <span className="text-center">{file.filename}</span>
      </div>
    </button>
  )
}

const ProjectPage: React.FC = () => {
  const [logoHovered, setLogoHovered] = useState(false)
  const [openSort, setOpenSort] = useState(false)
  const [selectedSort, setSelectedSort] = useState('Newest')
  const [showSettings, setShowSettings] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [sortedProjects, setSortedProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'blocks' | 'python' | 'cpp' | 'ai'
  >('all')
  const [switchPopup, setSwitchPopup] = useState<{open: boolean ,target: 'python' | 'cpp' | null, file: any | null}>({
    open: false,
    target: null,
    file: null
  })
  const navigate = useNavigate()
  const settingsRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const theme = useSelector((state: any) => state.theme)
  const isDarkMode = theme.mode === 'dark'
  const iconStroke = isDarkMode ? 'stroke-white' : 'stroke-black'
  const dispatch = useDispatch()
  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Click outside settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  // Click outside sort
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setOpenSort(false)
      }
    }
    if (openSort) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openSort])

  const handleSortSelect = (value: string) => {
    setSelectedSort(value)
    sortProjects(projects, value)
    setOpenSort(false)
  }

  const flattenProjects = (dataObj: Record<string, any>) => {
    const files: any[] = []
    Object.entries(dataObj).forEach(([category, items]) => {
      items.forEach((item: any) => {
        files.push({
          ...item,
          category
        })
      })
    })
  
    return files
  }

  const sortProjects = (dataObj: Record<string, any>, sortType: string) => {
    const files = flattenProjects(dataObj)
    const sorted = [...files]
    switch (sortType) {
      case 'Oldest':
        sorted.sort((a, b) => new Date(a.modified).getTime() - new Date(b.modified).getTime())
        break
      case 'Newest':
        sorted.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
        break
      case 'A to Z':
        sorted.sort((a, b) => a.filename.localeCompare(b.filename))
        break
      case 'Z to A':
        sorted.sort((a, b) => b.filename.localeCompare(a.filename))
        break
    }
    setSortedProjects(sorted)
  }

  useEffect(() => {
    const fetchAllProjects = async () => {
      const result = await window.api.file.fetchAll()
      if (result.success && result.data && typeof result.data === 'object') {
        setProjects(result.data)
        sortProjects(result.data, 'Newest') // default sort
      } else {
        console.error('❌ Error fetching all projects:', result.error)
      }
    }
    fetchAllProjects()
  }, [])

  const renderFileBox = (file: any) => {
    if (file.isDirectory) {
      return (
        <div
          key={file.created}
          className="flex flex-col items-center"
        >
          <img
            src={
              file.category === 'python'
                ? Pfolder
                : file.category === 'cpp'
                  ? Cfolder
                  : Pfolder
            }
            className="w-16 h-16"
          />
          <span>{file.filename}</span>
        </div>
      )
    }
    const ext = file.filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'blocks':
      case 'json':
        return <BlockBox key={file.created} file={file} />
      case 'py':
        return <PythonBox key={file.created} file={file} onOpen={handleModeNavigation}/>
      case 'cpp':
        return <CppBox key={file.created} file={file}       onOpen={handleModeNavigation}/>
      case 'ai':
        return <AiBox key={file.created} file={file} />
      default:
        return <div key={file.created} className="w-16 h-16 bg-gray-400 rounded-md" />
    }
  }
 
  interface PortInfo {
    port: string
    board: string
    mode: string
  }
  
  const BLOCKLY_USB_IDS = ['303a:1001', '2e8a:000a']
  const PYTHON_USB_IDS = ['303a:817a', '2e8a:0005']
  
  async function detectBoardMode(): Promise<PortInfo | null> {
    let result
    try {
      result = await window.api.mpRemote.listPorts()
    } catch (err) {
      console.error('listPorts threw:', err)
      return null
    }
  
    if (!result || !Array.isArray(result.ports)) return null
  
    const ports = [...result.ports]
    let detectedMode = ''
  
    const blocklyIndex = ports.findIndex((line) => BLOCKLY_USB_IDS.some((id) => line.includes(id)))
    const pythonIndex = ports.findIndex((line) => PYTHON_USB_IDS.some((id) => line.includes(id)))
  
    if (blocklyIndex !== -1) {
      const [blocklyPort] = ports.splice(blocklyIndex, 1)
      ports.unshift(blocklyPort)
      detectedMode = 'Blockly Mode'
    } else if (pythonIndex !== -1) {
      const [pythonPort] = ports.splice(pythonIndex, 1)
      ports.unshift(pythonPort)
      detectedMode = 'Python Mode'
    }
  
    const boardLine = ports.find((line) => {
      const parts = line.split(' ')
      return parts[1] && parts[1] !== 'None'
    })
  
    const parts = boardLine ? boardLine.split(' ') : []
  
    return {
      port: parts[0] || '',
      board: parts[1] || '',
      mode: detectedMode
    }
  }
  const handleModeNavigation = async (
    target: 'python' | 'cpp',
    file: any
  ) => {
    const boardInfo = await detectBoardMode()
  
    if (!boardInfo) {
      navigate(`/${target}`, {
        state: {
          filePath: file.filepath,
          fileName: file.filename
        }
      })
      return
    }
  
    const boardMode = boardInfo.mode
  
    if (
      (target === 'python' && boardMode === 'Blockly Mode') ||
      (target === 'cpp' && boardMode === 'Blockly Mode')
    ) {
      setSwitchPopup({
        open: true,
        target,
        file
      })
      return
    }
  
    navigate(`/${target}`, {
      state: {
        filePath: file.filepath,
        fileName: file.filename
      }
    })
  }
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white h-screen w-screen flex flex-col">
      <div className="flex flex-col border-8 border-[#3377f6] h-full overflow-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-end p-4 bg-[#3377f6]">
          {/* Left side: Logo + Search */}
          <div className="flex items-end gap-4">
            <div
              className="bg-black hover:bg-[#3377f6] p-4 rounded w-20 h-24 flex items-center justify-center cursor-pointer"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onClick={() => {
                setLogoHovered(false)
                navigate('/')
              }}
            >
              {logoHovered ? (
                <IoHome className="text-white w-16 h-16" />
              ) : (
                <PrjPageIcon className="w-full h-28 transition-transform duration-200 hover:scale-110" />
              )}
            </div>

            {/* Search */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pr-12 rounded-md border-2 border-black focus:outline-none bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <SearchIcon />
              </div>
            </div>
          </div>
          {/* Right side: Sort + Settings */}
          <div className="flex items-center gap-4 relative">
            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setOpenSort((prev) => !prev)}
                className="bg-black text-white p-1.5 rounded-md flex items-center gap-3"
              >
                {selectedSort}
                <SortIcon />
              </button>
              {openSort && (
                <div className="absolute left-0 top-[58px] w-24 bg-white border border-gray-300 rounded-md shadow-md z-50">
                  {['Oldest', 'Newest', 'A to Z', 'Z to A'].map((option) => (
                    <div
                      key={option}
                      className="px-2 py-2 cursor-pointer hover:border-2 border-[#66EC39] text-black rounded-md"
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings((prev) => !prev)}
                className={`p-2 rounded-md border ${isDarkMode ? 'bg-zinc-800' : 'bg-black'} border-zinc-700 hover:border-amber-400`}
              >
                <Settings className={`w-6 h-6 fill-none ${iconStroke} hover:stroke-amber-400`} />
              </button>
              {showSettings && (
                <div className="absolute top-[60px] right-0 z-50 drop-shadow-lg rounded-xl">
                  <SettingModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Boxes */}
        <div className="flex flex-wrap gap-4 p-4">
          {(() => {
            
            const filtered = sortedProjects.filter((file) => {
              const matchesSearch = file.filename
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            
              if (!matchesSearch) return false
            
              if (selectedCategory === 'all') return true
            
              // show folders belonging to the selected category
              if (file.isDirectory) {
                return file.category === selectedCategory
              }
            
              const ext = file.filename.split('.').pop()?.toLowerCase()
            
              if (selectedCategory === 'blocks')
                return ['blocks', 'json'].includes(ext!)
            
              if (selectedCategory === 'python')
                return ext === 'py'
            
              if (selectedCategory === 'cpp')
                return ext === 'cpp'
            
              if (selectedCategory === 'ai')
                return ext === 'ai'
            
              return true
            })

            if (filtered.length === 0) {
              return <div className="text-center w-full text-gray-500">No projects found</div>
            }

            return filtered.map((file) => renderFileBox(file))
          })()}
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-12">
          <div className="flex gap-6 bg-black text-white p-4 rounded-2xl">
            <button
              className={`cursor-pointer px-4 py-2 rounded ${selectedCategory === 'blocks' ? 'bg-[#f6ec24] text-black' : ''}`}
              onClick={
                selectedCategory !== 'blocks'
                  ? () => setSelectedCategory('blocks')
                  : () => setSelectedCategory('all')
              }
            >
              BLOCKS
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded ${selectedCategory === 'python' ? 'bg-[#a55bf7] text-black' : ''}`}
              onClick={
                selectedCategory !== 'python'
                  ? () => setSelectedCategory('python')
                  : () => setSelectedCategory('all')
              }
            >
              PYTHON
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded ${selectedCategory === 'cpp' ? 'bg-[#f6268b] text-black' : ''}`}
              onClick={
                selectedCategory !== 'cpp'
                  ? () => setSelectedCategory('cpp')
                  : () => setSelectedCategory('all')
              }
            >
              C++
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded ${selectedCategory === 'ai' ? 'bg-[#36f3ff] text-black' : ''}`}
              onClick={
                selectedCategory !== 'ai'
                  ? () => setSelectedCategory('ai')
                  : () => setSelectedCategory('all')
              }
            >
              AI/ML
            </button>
          </div>
        </div>
        {switchPopup.open && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
      <h2 className="text-xl font-semibold mb-3">
        Switch Board Mode
      </h2>

      <p className="text-gray-700 mb-6">
        Board is currently in <b>Blockly Mode</b>.<br />
        Click <b>OK</b> to switch to{' '}
        <b>
          {switchPopup.target === 'python' ? 'Python' : 'C++'}
        </b>{' '}
        mode.
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded bg-gray-300"
          onClick={() =>
            setSwitchPopup({
              open: false,
              target: null,
              file: null
            })
          }
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={async () => {
            try {
              if (switchPopup.target === 'python') {
                await window.api.serial.write(
                  JSON.stringify({ msg: 'switch' }) + '\n'
                )
              } else {
                await window.api.serial.write(
                  JSON.stringify({ msg: 'cswitch' }) + '\n'
                )
              }

              navigate(`/${switchPopup.target}`, {
                state: {
                  filePath: switchPopup.file.filepath,
                  fileName: switchPopup.file.filename
                }
              })
            } finally {
              setSwitchPopup({
                open: false,
                target: null,
                file: null
              })
            }
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  )
}

export default ProjectPage
