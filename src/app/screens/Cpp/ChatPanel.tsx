/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

type ChatMessage = {
  role: 'user' | 'assistant' | 'error'
  text: string
}

// One line in the live "what the AI is doing" timeline.
type Step = { id: number; text: string; kind: 'tool' | 'think' | 'build' | 'info' }

// Pick an icon category from the streamed status text.
function kindOf(text: string, type?: string): Step['kind'] {
  if (type === 'tool' || /looking up|reading|library/i.test(text)) return 'tool'
  if (/compil|recompil|build|flash|verif/i.test(text)) return 'build'
  if (/think|writing|generat|fix/i.test(text)) return 'think'
  return 'info'
}

const STEP_EMOJI: Record<Step['kind'], string> = {
  tool: '🔍',
  build: '🔧',
  think: '✦',
  info: '•',
}

// One row of the activity timeline. The active (last) row spins; finished rows dim.
function ActivityRow({ step, active, isDark }: { step: Step; active: boolean; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {active ? (
        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#2195FF] border-t-transparent animate-spin shrink-0" />
      ) : (
        <span className="w-3.5 text-center text-xs opacity-60 shrink-0">{STEP_EMOJI[step.kind]}</span>
      )}
      <span className={active ? `font-medium animate-pulse ${isDark ? 'text-white' : 'text-[#2195FF]'}` : 'opacity-50'}>
        {step.text}
      </span>
    </div>
  )
}

const EXAMPLE_PROMPTS = [
  'Blink the LEDs red and green',
  'Beep the buzzer when button L is pressed',
  'Sweep a servo from 0 to 180',
  'Read a potentiometer and print it',
]

// A small toggle chip for the composer toolbar. Filled when active, outlined when off.
function Chip({
  active,
  onClick,
  disabled,
  icon,
  label,
  title,
  isDark,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  icon: string
  label: string
  title: string
  isDark: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 border transition-colors select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${
        active
          ? 'bg-[#2195FF] border-[#2195FF] text-white'
          : isDark
            ? 'border-white/20 text-gray-300 hover:bg-white/5'
            : 'border-black/15 text-gray-600 hover:bg-black/5'
      }`}
    >
      <span className="text-[11px] leading-none">{icon}</span>
      {label}
    </button>
  )
}

export default function ChatPanel({
  open,
  onClose,
  onGenerated,
  buildError,
  hasOpenCode,
  getEditContext,
  onFixBuild,
}: {
  open: boolean
  onClose: () => void
  /** Called with the generated C++ (the model's suggested project name, any external
   *  libraries it declared, and options). The parent saves it into a sensibly-named
   *  project, adds the libraries, and — when opts.verify is set — compiles + auto-fixes,
   *  returning whether it compiled so we can report it in the chat. */
  onGenerated: (
    files: { path: string; content: string }[],
    suggestedName?: string,
    libDeps?: string[],
    opts?: { verify?: boolean; prompt?: string; editInPlace?: boolean },
  ) => Promise<{ compiled?: boolean; verified?: boolean } | void>
  /** Latest failed-build log from the terminal (empty when the last Run succeeded). */
  buildError: string
  /** True when the active editor tab has code — enables the "Edit the open program" toggle. */
  hasOpenCode: boolean
  /** Build the edit-mode context (the open project's files) so the model can modify them. */
  getEditContext: () => Promise<string | undefined>
  /** Ask the model to fix the last build error in the open project (writes + refreshes). */
  onFixBuild: () => Promise<{ ok: boolean; error?: string }>
}) {
  const themeMode = useSelector((state: any) => state.theme.mode)
  const isDark = themeMode === 'dark'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  // Live "what the AI is doing" timeline (streamed status/tool events).
  const [steps, setSteps] = useState<Step[]>([])
  const stepId = useRef(0)
  // Opt-in compile-and-fix before flashing (off by default — costs extra model calls).
  const [verify, setVerify] = useState(false)
  // When a program is open, follow-up requests modify it (keep existing behaviour + add
  // the new bit) instead of starting from scratch. Defaults ON; only applies when code is
  // actually open. Untick to generate a brand-new program.
  const [editMode, setEditMode] = useState(true)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Stream status updates from the main-process agent into the activity timeline.
  useEffect(() => {
    window.api.agent.onOutput((d) => {
      if (d?.type !== 'status' && d?.type !== 'tool') return
      const text = (d.text || '').trim()
      if (!text) return
      setSteps((prev) => {
        if (prev.length && prev[prev.length - 1].text === text) return prev // dedupe repeats
        return [...prev, { id: ++stepId.current, text, kind: kindOf(text, d.type) }]
      })
    })
    return () => window.api.agent.removeAllListeners()
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, steps])

  // Append a step to the timeline (deduping immediate repeats).
  const pushStep = (text: string, kind: Step['kind'] = 'info') =>
    setSteps((prev) =>
      prev.length && prev[prev.length - 1].text === text
        ? prev
        : [...prev, { id: ++stepId.current, text, kind }],
    )

  const send = async () => {
    const prompt = input.trim()
    if (!prompt || busy) return

    setMessages((prev) => [...prev, { role: 'user', text: prompt }])
    setInput('')
    setBusy(true)
    setSteps([])
    pushStep('Thinking…', 'think')

    try {
      // Edit mode (only when a program is actually open): send the current files so the
      // model modifies them instead of starting over, and apply the result in place.
      const isEdit = editMode && hasOpenCode
      const editContext = isEdit ? await getEditContext() : undefined
      const res = await window.api.agent.generateCpp(prompt, editContext)
      const files =
        res?.files?.length ? res.files : res?.code ? [{ path: 'src/main.cpp', content: res.code }] : []
      if (res?.success && files.length) {
        const note = (res.notes || '').trim()
        const warn =
          (res.unverified
            ? '⚠ Generated without reading the library (tool lookups were failing) — double-check the API before flashing.\n\n'
            : '') + (res.pinWarning ? `⚠ ${res.pinWarning}\n\n` : '')

        // Hand the files to the parent: it saves config.h + main.cpp, adds libraries, and
        // (if verify is on) compiles + auto-fixes. In edit mode it writes back into the
        // open project in place (no new project, no overwrite prompt).
        pushStep(verify ? 'Saving & compiling…' : 'Saving to your project…', verify ? 'build' : 'info')
        const applied = await onGenerated(files, res.suggestedName?.trim() || prompt, res.libDeps, {
          verify,
          prompt,
          editInPlace: isEdit,
        })

        let tail = isEdit
          ? '✓ Updated your program. Click Run to flash it.'
          : '✓ Loaded into a new tab. Click Run to flash it.'
        if (verify && applied) {
          tail = applied.compiled
            ? '✅ Verified — it compiles. Click Run to flash it.'
            : "⚠ Tried to auto-fix build errors but it still doesn't compile cleanly — check the terminal, or click Run to see the errors."
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: warn + (note ? note + '\n\n' : '') + tail },
        ])
      } else {
        setMessages((prev) => [...prev, { role: 'error', text: res?.error || 'Generation failed.' }])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: err instanceof Error ? err.message : String(err) },
      ])
    } finally {
      setBusy(false)
      setSteps([])
    }
  }

  // #7 — ask the model to fix the last build error in the open project. The parent reads
  // the project files, fixes them, writes them back, and refreshes the tabs.
  const fixBuild = async () => {
    if (busy || !buildError.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text: '🔧 Fix the last build error.' }])
    setBusy(true)
    setSteps([])
    pushStep('Reading the build error…', 'build')
    try {
      const r = await onFixBuild()
      if (r?.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: '✓ Applied a fix to your project. Click Run to try again.' },
        ])
      } else {
        setMessages((prev) => [...prev, { role: 'error', text: r?.error || 'Could not fix it.' }])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: err instanceof Error ? err.message : String(err) },
      ])
    } finally {
      setBusy(false)
      setSteps([])
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!open) return null

  const panelBg = isDark ? 'bg-[#0D1F22]' : 'bg-white'
  const textCol = isDark ? 'text-white' : 'text-black'

  return (
    <div
      className={`flex flex-col h-full w-[340px] flex-shrink-0 border-l-2 border-black/20 ${panelBg} ${textCol} relative z-[25]`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 ${isDark ? 'bg-[#006DD1]' : 'bg-[#2195FF]'} text-white`}>
        <div className="flex items-center gap-2 font-bold">
          <span role="img" aria-label="robot">🤖</span>
          <span>AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="hover:text-[#F6EC24] font-bold text-lg leading-none px-1"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm custom-scrollbar">
        {messages.length === 0 && (
          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mt-6 leading-relaxed`}>
            <div className="text-3xl mb-2">🤖</div>
            Describe the program you want — I'll write the code for your board.
            <div className="flex flex-col gap-2 mt-4">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className={`text-left text-xs rounded-lg px-3 py-2 border transition-colors ${
                    isDark
                      ? 'border-white/10 bg-[#15323A] hover:bg-[#1d4250] text-gray-200'
                      : 'border-black/10 bg-[#F0F7FF] hover:bg-[#e2efff] text-gray-700'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-lg px-3 py-2 ${
              m.role === 'user'
                ? `ml-6 ${isDark ? 'bg-[#1B2B2D]' : 'bg-[#E8F5E9]'}`
                : m.role === 'error'
                  ? 'mr-6 bg-red-100 text-red-800 border border-red-300'
                  : `mr-6 ${isDark ? 'bg-[#15323A]' : 'bg-[#F0F7FF]'}`
            }`}
          >
            {m.text}
          </div>
        ))}

        {/* Live activity timeline — what the AI is doing right now */}
        {busy && (
          <div className={`mr-6 rounded-lg px-3 py-2.5 flex flex-col gap-1.5 ${isDark ? 'bg-[#15323A]' : 'bg-[#F0F7FF]'}`}>
            {steps.length === 0 ? (
              <ActivityRow step={{ id: 0, text: 'Working…', kind: 'think' }} active isDark={isDark} />
            ) : (
              steps.map((s, i) => (
                <ActivityRow key={s.id} step={s} active={i === steps.length - 1} isDark={isDark} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Fix-build-error banner (#7) — only when the last Run failed */}
      {buildError.trim() && !busy && (
        <div className={`px-2 pt-2`}>
          <button
            onClick={fixBuild}
            className="w-full text-left text-xs font-semibold rounded-md px-3 py-2 bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
            title="Send the last build error to the AI and apply its fix"
          >
            🔧 The last build failed — fix it with AI
          </button>
        </div>
      )}

      {/* Composer — textarea with a toolbar (option chips + Send) inside one box */}
      <div className={`p-2 border-t-2 ${isDark ? 'border-black/40' : 'border-black/10'}`}>
        <div
          className={`rounded-xl border transition-colors focus-within:border-[#2195FF] ${
            isDark ? 'border-white/15 bg-[#15323A]' : 'border-black/15 bg-white'
          }`}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            disabled={busy}
            placeholder={busy ? 'Generating…' : 'Ask for a program…'}
            className={`w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-sm focus:outline-none ${
              isDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'
            }`}
          />

          {/* Toolbar: option chips on the left, Send on the right */}
          <div className="flex items-center gap-1.5 px-2 pb-2">
            {hasOpenCode && (
              <Chip
                active={editMode}
                onClick={() => !busy && setEditMode((v) => !v)}
                disabled={busy}
                icon="✏️"
                label="Edit"
                title="On: add to the program you have open (keep what's there). Off: make a brand-new program."
                isDark={isDark}
              />
            )}
            <Chip
              active={verify}
              onClick={() => !busy && setVerify((v) => !v)}
              disabled={busy}
              icon="✓"
              label="Verify"
              title="Compile the program and let the AI auto-fix build errors before you flash. Slower and uses more tokens."
              isDark={isDark}
            />

            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className={`ml-auto px-3.5 py-1.5 rounded-lg font-bold text-sm text-black transition-colors ${
                busy || !input.trim() ? 'bg-[#F6EC24]/50 cursor-not-allowed' : 'bg-[#F6EC24] hover:bg-[#ffe94d]'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
