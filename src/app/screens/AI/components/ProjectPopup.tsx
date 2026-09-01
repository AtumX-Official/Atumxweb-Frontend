import { useState, useEffect } from 'react'

interface ProjectPopupProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string) => void
}

export default function ProjectPopup({ isOpen, onClose, onCreate }: ProjectPopupProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-2xl flex flex-col gap-4 border-2 border-black">
        <h2 className="text-xl font-black text-black">New AI Project</h2>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Project Name</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 rounded-lg border-2 border-transparent focus:border-black focus:outline-none font-semibold text-black"
            placeholder="e.g., Cool Hand Gestures"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-100 rounded-lg border-2 border-transparent focus:border-black focus:outline-none font-medium text-gray-800 resize-none"
            placeholder="What will this model be used for?"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onCreate(name.trim(), description.trim())
              }
            }}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-xl font-bold bg-[#F6EC24] text-black border-2 border-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[2px_3px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
