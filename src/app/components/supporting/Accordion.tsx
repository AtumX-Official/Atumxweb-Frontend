import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-neutral-700 shadow">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
      >
        {title}
        <ChevronDown
          className={`h-5 w-5 transform transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-screen p-4' : 'max-h-0'
        }`}
      >
        {open && children}
      </div>
    </div>
  )
}
