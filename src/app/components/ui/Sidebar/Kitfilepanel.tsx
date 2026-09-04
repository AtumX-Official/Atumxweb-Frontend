import React from 'react'
import { IoIosStar } from 'react-icons/io'
import FileIconAsset from '../assets/File.svg'
import { RiDeleteBin6Line } from "react-icons/ri";

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
  return (
    <div className="w-[250px] h-[480px] rounded-md overflow-hidden bg-white dark:bg-[#272727] flex flex-col">
      <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold">
        <div className="flex items-center gap-2">
          <IoIosStar className="w-5 h-5 text-black dark:text-white" />
          <span className="text-lg text-black dark:text-white">Kit Files</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 custom-scrollbar">
        {boardFiles.filter(file => file !== 'boot.py').length === 0 ? (
          <div className="italic text-xs text-gray-500">No files found on board</div>
        ) : (
          <ul className="flex flex-col gap-1">
            {boardFiles
              .filter(file => file !== 'boot.py')
              .map((file, i) => (
                <li
                  key={i}
                  className="px-2 py-1 rounded cursor-pointer bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800 flex justify-between gap-2"
                  onClick={() => onOpenBoardFile(file)}
                >
                  <div>
                    <FileIconAsset className="inline-block w-4 h-4" />
                    <span className={`${textColor} px-1`}>{file}</span>
                  </div>

                  <button
                    onClick={e => handleDeleteClick(file, e)}
                  >
                  <RiDeleteBin6Line className='w-4 h-4 text-black dark:text-white'/>
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