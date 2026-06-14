import * as ort from 'onnxruntime-web';

import type { IService } from '../models/locator/locator_iservice';
import type Locator from '../core/locator';

export default class FastConformerService implements IService {
  private session: ort.InferenceSession | null = null;
  private vocab: Map<number, string> = new Map();
  private blankId: number = -1;

  // private model_path = '/models/fastconformer/model.q8.onnx';
  // private model_path = '/models/fastconformer/fastconformer_ar_ctc_q8.onnx';
  private model_path = '/models/fastconformer/model.int8.onnx'
  private vocab_path = '/models/fastconformer/tokens.txt';


  // private vocab_path = '/models/fastconformer/vocab.json';

  private SAMPLE_RATE = 16000;
  private N_FFT = 512;
  private HOP_LENGTH = 160;
  private WIN_LENGTH = 400;
  private N_MELS = 80;
  private PREEMPH = 0.97;
  private DITHER = 1e-5;
  private LOG_GUARD = 1e-5;

  private _melFilters: Float32Array | null = null;
  private _window: Float64Array | null = null;
  private _twiddles: any = null;

  // Streaming state (Simulated)
  private streamingAudio: Float32Array = new Float32Array(0);
  private readonly MAX_STREAMING_WINDOW = 16000 * 8; // 8 seconds sliding window

  serviceMember(): void { }

  async init(sl: Locator): Promise<void> {
    console.log('[FastConformerService] Initialized');
  }

  async loadModel() {
    if (this.session) return;

    console.log('[FastConformerService] Loading vocab...');
    try {
      const vocabRes = await fetch(this.vocab_path);
      this.vocab.clear();
      this.blankId = -1;

      if (this.vocab_path.endsWith('.json')) {
        const vocabJson = await vocabRes.json();
        for (const [id, token] of Object.entries(vocabJson)) {
          const numId = parseInt(id, 10);
          this.vocab.set(numId, token as string);
          if (token === '<blank>') {
            this.blankId = numId;
          }
        }
      } else {
        const vocabText = await vocabRes.text();
        const lines = vocabText.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Format: "token ID"
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            const idStr = parts.pop()!;
            const token = parts.join(' ');
            const numId = parseInt(idStr, 10);
            if (!isNaN(numId)) {
              this.vocab.set(numId, token);
              if (token === '<blank>') {
                this.blankId = numId;
              }
            }
          } else if (parts.length === 1) {
            // Fallback for simple line-based vocab (no IDs)
            const token = parts[0]!;
            const nextId = this.vocab.size;
            this.vocab.set(nextId, token);
            if (token === '<blank>') {
              this.blankId = nextId;
            }
          }
        }
      }

      // Fallback blankId: Tarteel style (max index) if not found by value
      if (this.blankId === -1) {
        let maxId = -1;
        for (const id of this.vocab.keys()) {
          if (id > maxId) maxId = id;
        }
        this.blankId = maxId;
      }

      console.log('[FastConformerService] Vocab loaded, blankId:', this.blankId);

      console.log('[FastConformerService] Loading ONNX model...');

      // Set wasm paths explicitly to the public folder
      ort.env.wasm.wasmPaths = '/wasm/';
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;

      this.session = await ort.InferenceSession.create(this.model_path, {
        executionProviders: ['wasm'],
      });
      console.log('[FastConformerService] Model loaded');
    } catch (error) {
      console.error('[FastConformerService] Error loading model/vocab:', error);
      throw error;
    }
  }

  private hzToMel(freq: number): number {
    return 2595 * Math.log10(1 + freq / 700);
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  private getMelFilters(): Float32Array {
    if (!this._melFilters) {
      const nFreqBins = this.N_FFT / 2 + 1;
      const fMin = 0;
      const fMax = this.SAMPLE_RATE / 2;

      const melMin = this.hzToMel(fMin);
      const melMax = this.hzToMel(fMax);

      const melPts = new Float64Array(this.N_MELS + 2);
      for (let i = 0; i < this.N_MELS + 2; i++) {
        melPts[i] = this.melToHz(melMin + ((melMax - melMin) * i) / (this.N_MELS + 1));
      }

      const filters = new Float32Array(this.N_MELS * nFreqBins);
      const fftFreqs = new Float64Array(nFreqBins);
      for (let i = 0; i < nFreqBins; i++) {
        fftFreqs[i] = (fMax * i) / (nFreqBins - 1);
      }

      for (let m = 0; m < this.N_MELS; m++) {
        const fLow = melPts[m]!;
        const fCenter = melPts[m + 1]!;
        const fHigh = melPts[m + 2]!;

        // Slaney-style normalization
        const enorm = 2.0 / (fHigh - fLow);

        const offset = m * nFreqBins;
        for (let k = 0; k < nFreqBins; k++) {
          const f = fftFreqs[k]!;
          if (f >= fLow && f <= fHigh) {
            if (f <= fCenter) {
              filters[offset + k] = ((f - fLow) / (fCenter - fLow)) * enorm;
            } else {
              filters[offset + k] = ((fHigh - f) / (fHigh - fCenter)) * enorm;
            }
          }
        }
      }
      this._melFilters = filters;
    }
    return this._melFilters;
  }

  private getWindow(): Float64Array {
    if (!this._window) {
      const win = new Float64Array(this.WIN_LENGTH);
      for (let i = 0; i < this.WIN_LENGTH; i++) {
        // Symmetric Hann window (Standard/Default)
        // win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (this.WIN_LENGTH - 1)));

        // Periodic Hann window (NeMo / Tarteel / transformers.js periodic=true)
        // matches w[n] = 0.5 - 0.5 * cos(2πn / N)
        win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / this.WIN_LENGTH));
      }
      this._window = win;
    }
    return this._window;
  }

  private getTwiddles() {
    if (!this._twiddles) {
      const N = this.N_FFT;
      const half = N >> 1;
      const cos = new Float64Array(half);
      const sin = new Float64Array(half);
      for (let i = 0; i < half; i++) {
        const angle = (-2 * Math.PI * i) / N;
        cos[i] = Math.cos(angle);
        sin[i] = Math.sin(angle);
      }
      const bitrev = new Uint32Array(N);
      const bits = Math.log2(N);
      for (let i = 0; i < N; i++) {
        let x = i;
        let r = 0;
        for (let b = 0; b < bits; b++) {
          r = (r << 1) | (x & 1);
          x >>= 1;
        }
        bitrev[i] = r;
      }
      this._twiddles = { cos, sin, bitrev };
    }
    return this._twiddles;
  }

  private fft(re: Float64Array, im: Float64Array) {
    const N = this.N_FFT;
    const tw = this.getTwiddles();
    const bitrev = tw.bitrev;

    for (let i = 0; i < N; i++) {
      const j = bitrev[i];
      if (i < j) {
        [re[i], re[j]] = [re[j]!, re[i]!];
        [im[i], im[j]] = [im[j]!, im[i]!];
      }
    }

    for (let len = 2; len <= N; len <<= 1) {
      const halfLen = len >> 1;
      const step = N / len;
      for (let i = 0; i < N; i += len) {
        for (let k = 0; k < halfLen; k++) {
          const twIdx = k * step;
          const wCos = tw.cos[twIdx];
          const wSin = tw.sin[twIdx];
          const p = i + k;
          const q = p + halfLen;
          const tRe = re[q]! * wCos - im[q]! * wSin;
          const tIm = re[q]! * wSin + im[q]! * wCos;
          re[q] = re[p]! - tRe;
          im[q] = im[p]! - tIm;
          re[p] = re[p]! + tRe;
          im[p] = im[p]! + tIm;
        }
      }
    }
  }

  async computeFeatures(audio: Float32Array) {
    // 1. Dither
    const dithered = new Float32Array(audio.length);
    for (let i = 0; i < audio.length; i++) {
      dithered[i] = audio[i]! + this.DITHER * (Math.random() * 2 - 1);
    }

    // 2. Pre-emphasis
    const preemphasized = new Float32Array(audio.length);
    preemphasized[0] = dithered[0]!;
    for (let i = 1; i < audio.length; i++) {
      preemphasized[i] = dithered[i]! - this.PREEMPH * dithered[i - 1]!;
    }

    const nFrames = Math.floor((audio.length - this.WIN_LENGTH) / this.HOP_LENGTH) + 1;
    if (nFrames <= 0) return { features: new Float32Array(0), timeFrames: 0 };

    const melFilters = this.getMelFilters();
    const win = this.getWindow();
    const nFreqBins = this.N_FFT / 2 + 1;
    const rawMel = new Float32Array(this.N_MELS * nFrames);

    const re = new Float64Array(this.N_FFT);
    const im = new Float64Array(this.N_FFT);
    const power = new Float32Array(nFreqBins);

    for (let t = 0; t < nFrames; t++) {
      const offset = t * this.HOP_LENGTH;

      // Windowing
      re.fill(0);
      im.fill(0);
      for (let i = 0; i < this.WIN_LENGTH; i++) {
        re[i] = preemphasized[offset + i]! * win[i]!;
      }

      // FFT
      this.fft(re, im);

      // Power spectrum
      for (let i = 0; i < nFreqBins; i++) {
        power[i] = (re[i]! * re[i]! + im[i]! * im[i]!);
      }

      // Mel Filterbank
      for (let m = 0; m < this.N_MELS; m++) {
        let melVal = 0;
        const fbOffset = m * nFreqBins;
        for (let k = 0; k < nFreqBins; k++) {
          melVal += power[k]! * melFilters[fbOffset + k]!;
        }
        // Log
        rawMel[m * nFrames + t] = Math.log(melVal + this.LOG_GUARD);
      }
    }

    // 4. Per-feature normalization
    const normalized = new Float32Array(rawMel.length);
    for (let m = 0; m < this.N_MELS; m++) {
      let sum = 0;
      for (let t = 0; t < nFrames; t++) {
        sum += rawMel[m * nFrames + t]!;
      }
      const mean = sum / nFrames;

      let sumSq = 0;
      for (let t = 0; t < nFrames; t++) {
        const diff = rawMel[m * nFrames + t]! - mean;
        sumSq += diff * diff;
      }
      const std = Math.sqrt(sumSq / nFrames) || 1e-10;

      for (let t = 0; t < nFrames; t++) {
        normalized[m * nFrames + t] = (rawMel[m * nFrames + t]! - mean) / std;
      }
    }

    return { features: normalized, timeFrames: nFrames };
  }

  async transcribe(audio: Float32Array, _options: any = {}) {
    if (!this.session) {
      await this.loadModel();
    }

    try {
      const startTime = performance.now();

      // 1. Feature extraction
      const { features, timeFrames } = await this.computeFeatures(audio);

      if (timeFrames === 0) return { text: '', stats: null };

      // 2. Inference
      const inputTensor = new ort.Tensor("float32", features, [1, this.N_MELS, timeFrames]);
      const lengthTensor = new ort.Tensor("int64", BigInt64Array.from([BigInt(timeFrames)]), [1]);

      const inputNames = this.session!.inputNames;
      const feeds: Record<string, ort.Tensor> = {};
      const inputName0 = inputNames[0];
      const inputName1 = inputNames[1];
      if (inputName0) feeds[inputName0] = inputTensor;
      if (inputName1) feeds[inputName1] = lengthTensor;

      const results = await this.session!.run(feeds);
      const outputName0 = this.session!.outputNames[0];
      const outputTensor = outputName0 ? results[outputName0] : null;
      if (!outputTensor) throw new Error("No output tensor");

      const dims = outputTensor.dims;
      const outTimeSteps = dims[1] as number;
      const vocabSize = dims[2] as number;
      const logprobs = outputTensor.data as Float32Array;

      // 3. Greedy CTC Decoding
      const ids: number[] = [];
      for (let t = 0; t < outTimeSteps; t++) {
        let maxIdx = 0;
        let maxVal = logprobs[t * vocabSize] ?? -Infinity;
        for (let v = 1; v < vocabSize; v++) {
          const val = logprobs[t * vocabSize + v] ?? -Infinity;
          if (val > maxVal) {
            maxVal = val;
            maxIdx = v;
          }
        }
        ids.push(maxIdx);
      }

      const tokens: string[] = [];
      let prev = -1;
      for (const id of ids) {
        if (id !== prev && id !== this.blankId) {
          const token = this.vocab.get(id) ?? "";
          if (token) tokens.push(token);
        }
        prev = id;
      }

      // Collapse tokens into text
      let text = "";
      for (const tok of tokens) {
        if (tok === "▁") {
          text += " ";
        } else if (tok.startsWith("▁")) {
          text += " " + tok.substring(1);
        } else {
          text += tok;
        }
      }
      text = text.trim();

      const endTime = performance.now();
      const durationMs = endTime - startTime;

      const numTokens = text.length > 0 ? text.split(/\s+/).length : 0;
      const tps = numTokens > 0 ? (numTokens / (durationMs / 1000)).toFixed(2) : "0.00";

      console.log('[FastConformerService] Transcribed text:', text);
      console.log('[FastConformerService] Stats:', { durationMs: durationMs.toFixed(0), tps, numTokens });

      return {
        text: text,
        stats: {
          durationMs: durationMs.toFixed(0),
          tps: tps,
          numTokens: numTokens
        }
      };
    } catch (error) {
      console.error('[FastConformerService] Transcription error:', error);
      return { text: '', stats: null };
    }
  }

  async transcribeStreaming(chunk: Float32Array, options: any = {}) {
    // 1. Accumulate audio
    const newAudio = new Float32Array(this.streamingAudio.length + chunk.length);
    newAudio.set(this.streamingAudio);
    newAudio.set(chunk, this.streamingAudio.length);
    this.streamingAudio = newAudio;

    // 2. Sliding window (FastConformer needs context, so we keep last N seconds)
    if (this.streamingAudio.length > this.MAX_STREAMING_WINDOW) {
      this.streamingAudio = this.streamingAudio.slice(-this.MAX_STREAMING_WINDOW);
    }

    // 3. Transcribe the current buffer (Simulated Streaming)
    return this.transcribe(this.streamingAudio, options);
  }

  resetStreaming() {
    this.streamingAudio = new Float32Array(0);
    console.log('[FastConformerService] Streaming buffer reset');
  }

  dispose(): void {
    this.session = null;
    this.vocab.clear();
  }
}
