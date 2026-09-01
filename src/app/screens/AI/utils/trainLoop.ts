import * as tf from '@tensorflow/tfjs'

export interface EarlyStopFitConfig {
  epochs: number
  batchSize: number
  validationSplit: number
  classWeight: Record<number, number>
  /** Stop once this many epochs pass without improving the best val_loss. */
  patience: number
  /** Polled each epoch; return true to abort the fit at the next boundary. */
  isCancelled: () => boolean
  setProgress: (pct: number) => void
  setAccuracy: (pct: number) => void
  /** Abort (reporting fatalLoss) if a training loss goes non-finite. Audio only. */
  guardNonFiniteLoss?: boolean
  /** Jump progress to 100% the moment early-stop triggers. Audio only. */
  markProgressOnStop?: boolean
}

export interface FitResult {
  /** Early stopping fired due to a val_loss plateau. */
  stopped: boolean
  /** A non-finite training loss aborted the fit (only when guardNonFiniteLoss). */
  fatalLoss: boolean
}

/**
 * Run `model.fit` with manual early stopping and cancellation. Implemented inline (not via
 * TF.js's EarlyStopping callback) so it survives whatever the callback dispatcher does to
 * plain-object callbacks. Shared by every teachable-machine classifier.
 */
export async function fitWithEarlyStopping(
  model: tf.LayersModel,
  xs: tf.Tensor,
  ys: tf.Tensor,
  cfg: EarlyStopFitConfig
): Promise<FitResult> {
  let bestValLoss = Infinity
  let stalledEpochs = 0
  let stopped = false
  let fatalLoss = false

  await model.fit(xs, ys, {
    epochs: cfg.epochs,
    batchSize: cfg.batchSize,
    validationSplit: cfg.validationSplit,
    shuffle: true,
    classWeight: cfg.classWeight,
    callbacks: {
      onEpochEnd: (epoch: number, logs?: tf.Logs) => {
        if (cfg.isCancelled()) { model.stopTraining = true; return }

        // Divergence guard — a NaN/Inf loss means this backend can't train reliably.
        if (cfg.guardNonFiniteLoss) {
          const loss = logs?.loss as number | undefined
          if (loss !== undefined && !isFinite(loss)) { fatalLoss = true; model.stopTraining = true; return }
        }

        cfg.setProgress(Math.round(((epoch + 1) / cfg.epochs) * 100))
        const acc = (logs?.val_acc ?? logs?.acc) as number | undefined
        if (acc !== undefined) cfg.setAccuracy(Math.round(acc * 100))

        const valLoss = logs?.val_loss as number | undefined
        if (typeof valLoss === 'number' && isFinite(valLoss)) {
          if (valLoss < bestValLoss - 1e-4) {
            bestValLoss = valLoss
            stalledEpochs = 0
          } else if (++stalledEpochs >= cfg.patience) {
            stopped = true
            model.stopTraining = true
            if (cfg.markProgressOnStop) cfg.setProgress(100)
          }
        }
      },
    },
  })

  return { stopped, fatalLoss }
}
