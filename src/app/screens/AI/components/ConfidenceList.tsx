// Per-class confidence bars shown while testing a trained model — the middle
// column of every AI screen's predict view (hand, pose, audio).

interface ConfidenceClass {
  id: string
  name: string
}

interface ConfidencePrediction {
  className: string
  probabilities: { name: string | undefined; prob: number }[]
}

interface ConfidenceListProps {
  classes: ConfidenceClass[]
  prediction: ConfidencePrediction | null
  colorOf: (id: string, idx: number) => string
  onViewLayers?: () => void
  /** Tooltip for the layers button, e.g. "Watch your gesture travel through…" */
  layersTitle?: string
}

export default function ConfidenceList({
  classes,
  prediction,
  colorOf,
  onViewLayers,
  layersTitle = "Watch your input travel through the model's layers"
}: ConfidenceListProps) {
  // Matched by name rather than row position: a model trained on a subset of the
  // classes (the rest disabled) has fewer output slots than the list being shown,
  // and a restored model's ids don't match the live ones either.
  function getConf(cls: ConfidenceClass) {
    if (!prediction || !prediction.className) return 0
    const entry = prediction.probabilities.find((p) => p.name === cls.name)
    return Math.round((entry?.prob ?? 0) * 100)
  }

  return (
    <>
      {classes.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-12 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
          Train a model first
        </div>
      )}
      {classes.map((cls, i) => {
        const conf = getConf(cls)
        const color = colorOf(cls.id, i)
        return (
          <div
            key={cls.id}
            className="bg-white dark:bg-[#1f1f1f] rounded-lg px-2 py-2 border-2 shadow-2xl mb-2"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-black text-xl text-black dark:text-white leading-tight">{cls.name}</span>
              <div className="text-right shrink-0">
                <div className="text-2xl text-black dark:text-white leading-none">{conf}%</div>
                <div className="text-[0.70rem] text-gray-500 dark:text-gray-300 tracking-[0.18em] mt-0.5">CONFIDENCE</div>
              </div>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700  overflow-hidden mt-3">
              <div
                className="h-full "
                style={{ width: `${conf}%`, background: color, transition: 'width 0.12s ease' }}
              />
            </div>
          </div>
        )
      })}

      {/* View the live prediction travel through the network */}
      {onViewLayers && classes.length > 0 && (
        <button
          onClick={onViewLayers}
          className="w-full mt-2 rounded-lg px-4 py-2.5 font-black tracking-wide text-white border-2 border-black cursor-pointer transition-transform hover:scale-[1.02]"
          style={{ background: '#04050d', boxShadow: '2px 4px 4px rgba(0,0,0,0.4)' }}
          title={layersTitle}
        >
          🔬 VIEW IN LAYERS
        </button>
      )}
    </>
  )
}
