// High-Fidelity Speech Digital Signal Processing (DSP) Pipeline
// Replicates librosa.feature.melspectrogram in pure TypeScript

export const SAMPLE_RATE = 22050;
export const DURATION = 2; // seconds
export const N_FFT = 2048;
export const HOP_LENGTH = 512;
export const N_MELS = 64;
export const MEL_FRAMES = 130;

// Conversion helpers between Frequency (Hz) and Mel Scale
export function freqToMel(freq: number): number {
  return 2595.0 * Math.log10(1.0 + freq / 700.0);
}

export function melToFreq(mel: number): number {
  return 700.0 * (Math.pow(10.0, mel / 2595.0) - 1.0);
}

// Hamming Window function of size N
export function applyHammingWindow(slice: Float32Array) {
  const N = slice.length;
  for (let n = 0; n < N; n++) {
    const w = 0.54 - 0.46 * Math.cos((2.0 * Math.PI * n) / (N - 1));
    slice[n] *= w;
  }
}

// Standard In-Place Radix-2 Cooley-Tukey FFT
export function inPlaceFFT(real: Float32Array, imag: Float32Array) {
  const n = real.length;
  if (n <= 1) return;

  // Bit reversal permutation
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      let temp = real[i]; real[i] = real[j]; real[j] = temp;
      temp = imag[i]; imag[i] = imag[j]; imag[j] = temp;
    }
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
  }

  // Cooley-Tukey DIT butterfly operations
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (2 * Math.PI) / len;
    const wlen_r = Math.cos(angle);
    const wlen_i = -Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let w_r = 1.0;
      let w_i = 0.0;
      const halflen = len >> 1;
      for (let k = 0; k < halflen; k++) {
        const u_r = real[i + k];
        const u_i = imag[i + k];
        const targetIdx = i + k + halflen;
        const t_r = real[targetIdx] * w_r - imag[targetIdx] * w_i;
        const t_i = real[targetIdx] * w_i + imag[targetIdx] * w_r;

        real[i + k] = u_r + t_r;
        imag[i + k] = u_i + t_i;
        real[targetIdx] = u_r - t_r;
        imag[targetIdx] = u_i - t_i;

        const next_w_r = w_r * wlen_r - w_i * wlen_i;
        const next_w_i = w_r * wlen_i + w_i * wlen_r;
        w_r = next_w_r;
        w_i = next_w_i;
      }
    }
  }
}

// 64-Band Mel Filterbank with Slaney Normalization
let cachedFilterbank: number[][] | null = null;

export function getMelFilterbank(sampleRate: number = SAMPLE_RATE, nFft: number = N_FFT, nMels: number = N_MELS): number[][] {
  if (cachedFilterbank) return cachedFilterbank;

  const filters: number[][] = Array.from({ length: nMels }, () => new Array(nFft / 2 + 1).fill(0.0));
  const minMel = freqToMel(0.0);
  const maxMel = freqToMel(sampleRate / 2.0);

  // Get equally spaced Mel scale values
  const melPoints = new Float32Array(nMels + 2);
  for (let i = 0; i < nMels + 2; i++) {
    melPoints[i] = minMel + (i * (maxMel - minMel)) / (nMels + 1);
  }

  // Convert Mel points to Hz frequencies
  const freqPoints = new Float32Array(nMels + 2);
  for (let i = 0; i < nMels + 2; i++) {
    freqPoints[i] = melToFreq(melPoints[i]);
  }

  // Map frequencies to FFT bin indices
  const binPoints = new Int32Array(nMels + 2);
  for (let i = 0; i < nMels + 2; i++) {
    binPoints[i] = Math.floor(((nFft + 1) * freqPoints[i]) / sampleRate);
  }

  // Construct triangular filters
  for (let i = 0; i < nMels; i++) {
    const leftBin = binPoints[i];
    const centerBin = binPoints[i + 1];
    const rightBin = binPoints[i + 2];

    const freqLeft = freqPoints[i];
    const freqCenter = freqPoints[i + 1];
    const freqRight = freqPoints[i + 2];

    // Slaney Area Normalization factor
    const scaler = 2.0 / (freqRight - freqLeft);

    for (let k = 0; k <= nFft / 2; k++) {
      if (k >= leftBin && k <= centerBin) {
        const denom = centerBin - leftBin;
        filters[i][k] = (denom > 0 ? (k - leftBin) / denom : 0.0) * scaler;
      } else if (k >= centerBin && k <= rightBin) {
        const denom = rightBin - centerBin;
        filters[i][k] = (denom > 0 ? (rightBin - k) / denom : 0.0) * scaler;
      } else {
        filters[i][k] = 0.0;
      }
    }
  }

  cachedFilterbank = filters;
  return filters;
}

// Peak Normalization and Silent Trim Helper
export function preprocessWaveform(audio: Float32Array): Float32Array {
  // Peak Amplitude Normalization
  let maxVal = 0.0;
  for (let i = 0; i < audio.length; i++) {
    const absVal = Math.abs(audio[i]);
    if (absVal > maxVal) maxVal = absVal;
  }

  let normalized = new Float32Array(audio.length);
  if (maxVal > 0.015) {
    for (let i = 0; i < audio.length; i++) {
      normalized[i] = audio[i] / maxVal;
    }
  } else {
    normalized.set(audio);
  }

  // Leading & trailing silence trimming (equivalent to top_db = 20)
  // Scan starting threshold: 0.08 of peak normalized amplitude
  const threshold = 0.08;
  let startIdx = 0;
  while (startIdx < normalized.length && Math.abs(normalized[startIdx]) < threshold) {
    startIdx++;
  }

  let endIdx = normalized.length - 1;
  while (endIdx > startIdx && Math.abs(normalized[endIdx]) < threshold) {
    endIdx--;
  }

  // Extract trimmed portion
  const trimmed = normalized.subarray(startIdx, endIdx + 1);

  // Always pad or truncate to exact 2-second buffer (44100 samples)
  const targetLen = SAMPLE_RATE * DURATION; // 44100
  const finalAudio = new Float32Array(targetLen);
  if (trimmed.length >= targetLen) {
    // Truncate from the middle or center of speech
    const start = Math.floor((trimmed.length - targetLen) / 2);
    finalAudio.set(trimmed.subarray(start, start + targetLen));
  } else {
    // Zero-pad at the end
    finalAudio.set(trimmed);
  }

  return finalAudio;
}

// Convert audio waveform buffer to flat 64x130 Mel-Spectrogram DB matrix
export function generateMelSpectrogram(rawWaveform: Float32Array): Float32Array {
  // Step 1: Preprocess (Normalize + Trim + Fix Size to 44100)
  const audio = preprocessWaveform(rawWaveform);

  const filterbank = getMelFilterbank();
  const melSpectrogram = new Float32Array(N_MELS * MEL_FRAMES);

  const realSlice = new Float32Array(N_FFT);
  const imagSlice = new Float32Array(N_FFT);
  const powerSpectrum = new Float32Array(N_FFT / 2 + 1);

  // Step 2: Compute Mel spectrogram frame-by-frame (Centered frames like librosa)
  for (let frame = 0; frame < MEL_FRAMES; frame++) {
    const center = frame * HOP_LENGTH;
    const start = center - N_FFT / 2; // -1024 ... 65024

    // Extract frame slice with zero-padding for boundary overflows
    realSlice.fill(0.0);
    imagSlice.fill(0.0);
    for (let k = 0; k < N_FFT; k++) {
      const idx = start + k;
      if (idx >= 0 && idx < audio.length) {
        realSlice[k] = audio[idx];
      }
    }

    // Apply Hamming window to frame
    applyHammingWindow(realSlice);

    // Run FFT
    inPlaceFFT(realSlice, imagSlice);

    // Compute Power Spectrum (DC to Nyquist)
    for (let k = 0; k <= N_FFT / 2; k++) {
      powerSpectrum[k] = realSlice[k] * realSlice[k] + imagSlice[k] * imagSlice[k];
    }

    // Multiply power spectrum by each Mel filter
    for (let m = 0; m < N_MELS; m++) {
      let melEnergy = 0.0;
      for (let k = 0; k <= N_FFT / 2; k++) {
        melEnergy += powerSpectrum[k] * filterbank[m][k];
      }

      // Convert power to decibels (log-mel)
      // Standard Librosa style: log-mel DB
      const db = 10.0 * Math.log10(Math.max(1e-8, melEnergy));
      
      // Store in channels-last order [mels, frames]
      // index is mel * MEL_FRAMES + frame
      melSpectrogram[m * MEL_FRAMES + frame] = db;
    }
  }

  // Peak amplitude scaling of spectrogram DB values with silence safeguard
  let maxDB = -Infinity;
  for (let i = 0; i < melSpectrogram.length; i++) {
    if (melSpectrogram[i] > maxDB) maxDB = melSpectrogram[i];
  }
  const targetMax = Math.max(-35.0, maxDB);
  if (isFinite(targetMax)) {
    for (let i = 0; i < melSpectrogram.length; i++) {
      melSpectrogram[i] = melSpectrogram[i] - targetMax;
    }
  }

  return melSpectrogram;
}
