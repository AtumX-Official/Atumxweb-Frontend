/**
 * Shared Tailwind class strings for the AI screens so light/dark stay in sync.
 * Dark values come from the dark-theme mockup (#151515 page, #1f1f1f panels).
 */

// Dotted canvas behind every AI screen.
export const DOTTED_BG =
  'bg-[#efefef] dark:bg-[#151515] bg-[image:radial-gradient(circle,#c0c0c0_1.5px,transparent_1.5px)] bg-[length:20px_20px]'

// Large panel surface (camera card, controls panel, settings).
export const PANEL = 'bg-white dark:bg-[#1f1f1f] text-black dark:text-white'
