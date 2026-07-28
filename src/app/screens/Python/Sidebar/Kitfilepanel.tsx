import React from 'react'
import { IoIosStar } from 'react-icons/io'
import fileicon from './assets/File.svg'
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from 'react-redux'

interface KitFilesPanelProps {
  textColor: string
  boardFiles: string[]
  handleDeleteClick: (file: string, e: React.MouseEvent<HTMLSpanElement>) => void
  onOpenBoardFile:(file: string) => void
}

const KitFilesPanel = ({
  textColor,
  boardFiles,
  handleDeleteClick,
  onOpenBoardFile
}: KitFilesPanelProps) => {
  const themeMode = useSelector((state: any) => state.theme.mode);

  return (
    <div className={`w-[250px] h-[450px] rounded-md overflow-hidden flex flex-col z-10 ${themeMode === "dark" ? "bg-black" : "bg-white" }`}>
      <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold mt-2">
        <div className="flex items-center gap-2">
          <IoIosStar className={`w-5 h-5 ${themeMode === "dark" ? "text-white" : "text-black"}`}/>
          <span className={`text-lg ${themeMode === "dark" ? "text-white" : "text-black"}`}>Kit Files</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 custom-scrollbar">
        {boardFiles.filter(file => file !== 'boot.py').length === 0 ? (
          <div className="italic text-xs text-gray-500">No files found on board</div>
        ) : (
          <ul className="flex flex-col gap-1 mt-2">
            {boardFiles
              .filter(file => file !== 'boot.py')
              .map((file, i) => (
                <li
                  key={i}
                  className={`px-2 py-1 rounded cursor-pointer flex justify-between gap-2
                    ${themeMode === 'dark'
                      ? 'bg-[#561DBC]'
                      : 'bg-[#722CF0]'
                    }`}
                  onClick={() => onOpenBoardFile(file)}
                >
                  <div>
                    <img src={fileicon} className="inline-block w-4 h-4" />
                    <span className={`${textColor} px-1`}>{file}</span>
                  </div>

                  <button
                    onClick={e => handleDeleteClick(file, e)}
                  >
                  <RiDeleteBin6Line className={`w-4 h-4   ${themeMode === 'dark'
                      ? 'text-white'
                      : 'text-back'
                    }`}/>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default React.memo(KitFilesPanel)