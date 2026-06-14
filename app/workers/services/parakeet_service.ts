import { fromUrls } from 'parakeet.js';
import type { IService } from '../models/locator/locator_iservice';
import type Locator from '../core/locator';

export default class ParakeetService implements IService {
  private model: any = null;
  private model_base_path = '/models/parakeet/';

  serviceMember(): void {}

  async init(sl: Locator): Promise<void> {
    console.log('[ParakeetService] Initialized');
  }

  async loadModel(progress_callback?: (progress: any) => void) {
    if (this.model) return;

    console.log('[ParakeetService] Loading model from:', this.model_base_path);

    try {
        this.model = await fromUrls({
            encoderUrl: `${this.model_base_path}encoder.onnx`,
            decoderUrl: `${this.model_base_path}decoder.onnx`,
            tokenizerUrl: `${this.model_base_path}vocab.txt`,
            backend: 'wasm',
            wasmPaths: '/wasm/',
            preprocessorBackend: 'js',
        });
        
        console.log('[ParakeetService] Model loaded');
    } catch (error) {
        console.error('[ParakeetService] Error loading model:', error);
        throw error;
    }
  }

  async transcribe(audio: Float32Array, options: any = {}) {
    if (!this.model) {
        await this.loadModel();
    }

    try {
        const startTime = performance.now();
        console.log('[ParakeetService] Transcribe start. Audio length:', audio.length);

        // Parakeet expects 16000Hz mono Float32Array
        const text = await this.model.transcribe(audio, 16000);
        
        const endTime = performance.now();
        const durationMs = endTime - startTime;
        
        // Approximate tokens (words) for stats
        const numTokens = text.trim().split(/\s+/).length;
        const tps = numTokens > 0 ? (numTokens / (durationMs / 1000)).toFixed(2) : "0.00";

        console.log('[ParakeetService] Transcribed text:', text);
        console.log('[ParakeetService] Stats:', { durationMs: durationMs.toFixed(0), tps, numTokens });

        return {
            text: text,
            stats: {
                durationMs: durationMs.toFixed(0),
                tps: tps,
                numTokens: numTokens
            }
        };
    } catch (error) {
        console.error('[ParakeetService] Transcription error:', error);
        return { text: '', stats: null };
    }
  }

  dispose(): void {
    this.model = null;
  }
}
