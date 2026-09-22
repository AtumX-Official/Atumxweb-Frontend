import { useEffect, useState } from 'react'
import trainmodel from '../icons/trainhand.gif'
import trainsucessgif from '../icons/readyhandgif.gif'
import modelready from '../icons/handpng.png'

interface TrainingStatusPopupProps {
  open: boolean
  isTraining: boolean
  isTrained: boolean
  onClose: () => void
  /** Per-modality artwork — defaults to the hand set. */
  trainingGif?: string
  successGif?: string
  resultPng?: string
}

// How long the success gif plays before switching to the "Tap OK" screen.
const SUCCESS_GIF_MS = 2000
// Extra pause after the confetti finishes, before the result screen appears.
const RESULT_DELAY_MS = 500

/**
 * Training feedback popup (same flow as the hand screen):
 * training gif + "Training Model..." → confetti + "Model Ready!" →
 * 0.5s later the hand png + "Tap OK to see results" with the OK button.
 */
export default function TrainingStatusPopup({
  open, isTraining, isTrained, onClose,
  trainingGif = trainmodel.src,
  successGif = trainsucessgif.src,
  resultPng = modelready.src,
}: TrainingStatusPopupProps) {
  const [showResultScreen, setShowResultScreen] = useState(false)

  useEffect(() => {
    if (!open || !isTrained) {
      setShowResultScreen(false)
      return
    }
    const timer = setTimeout(() => setShowResultScreen(true), SUCCESS_GIF_MS + RESULT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [open, isTrained])

  // Training can end in 'error' or be reset to 'idle' — close instead of
  // hanging as an empty box (the training panel shows the error message).
  useEffect(() => {
    if (open && !isTraining && !isTrained) onClose()
  }, [open, isTraining, isTrained, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className="
          relative
          w-[60%] md:w-[40%] lg:w-[30%]
          min-w-[280px] max-w-[600px]
          rounded-lg
          overflow-visible
          shadow-2xl border border-white/10
        "
      >
        <div className="flex flex-col w-full rounded-lg overflow-hidden bg-[#f0f0f0] py-4">

          {/* TRAINING */}
          {isTraining && (
            <>
              <div className="flex items-start justify-center px-6 pt-0 h-[180px] overflow-hidden">
                <img
                  src={trainingGif}
                  alt="Training Model"
                  className="h-60 max-w-none object-contain drop-shadow-lg"
                />
              </div>
              <div className="text-center text-black font-bold text-[28px] font-['Nunito'] mt-2">
                Training Model...
              </div>
            </>
          )}

          {/* SUCCESS GIF */}
          {isTrained && !showResultScreen && (
            <div className="relative flex items-start justify-center px-6 pt-0 h-[180px] overflow-hidden">
              <img
                src={successGif}
                alt="Confetti"
                className="h-60 max-w-none object-contain drop-shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[32px] font-bold text-center">
                  Model Ready!
                </div>
              </div>
            </div>
          )}

          {/* FINAL PNG */}
          {isTrained && showResultScreen && (
            <>
              <div className="flex items-start justify-center px-6 pt-0 h-[180px] overflow-hidden">
                <img
                  src={resultPng}
                  alt="Results Ready"
                  className="h-60 max-w-none object-contain drop-shadow-lg"
                />
              </div>
              <div className="text-center text-black font-bold text-[24px] font-['Nunito'] mt-2">
                Tap "OK" to see results
              </div>
              <div className="flex items-center justify-center mt-4 mb-2">
                <button
                  className="bg-[#2EED08] rounded-2xl px-6 py-3 text-white text-[18px] font-bold"
                  onClick={onClose}
                >
                  OK
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
