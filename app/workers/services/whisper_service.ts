import {
  AutoTokenizer,
  AutoProcessor,
  WhisperForConditionalGeneration,
  full,
  env
} from '@huggingface/transformers';
import type { IService } from '../models/locator/locator_iservice';
import type Locator from '../core/locator';

export default class WhisperService implements IService {
  private tokenizer: any = null;
  private processor: any = null;
  private model: any = null;
  private model_id = 'tarteel-ai-onnx-whisper-base-ar-quran';

  serviceMember(): void {}

  async init(sl: Locator): Promise<void> {
    // Configure transformers.js
    // Using absolute path from root
    env.localModelPath = '/models/'; 
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    
    // Disable cache for debugging and to ensure local files are used
    env.useBrowserCache = false;
    env.useCustomCache = false;

    console.log('[WhisperService] Initialized with env:', {
        localModelPath: env.localModelPath,
        allowRemoteModels: env.allowRemoteModels,
        allowLocalModels: env.allowLocalModels
    });
  }

  async loadModel(progress_callback?: (progress: any) => void) {
    if (this.model) return;

    console.log('[WhisperService] Loading model...', this.model_id);
    console.log('[WhisperService] Full path would be:', `${env.localModelPath}${this.model_id}/config.json`);

    try {
        console.log('[WhisperService] Loading tokenizer...');
        this.tokenizer = await AutoTokenizer.from_pretrained(this.model_id, {
            progress_callback,
        });

        console.log('[WhisperService] Loading processor...');
        this.processor = await AutoProcessor.from_pretrained(this.model_id, {
            progress_callback,
        });

        console.log('[WhisperService] Loading model weights...');
        this.model = await WhisperForConditionalGeneration.from_pretrained(this.model_id, {
            dtype: {
                encoder_model: 'q4',
                decoder_model_merged: 'q4',
            },
            device: 'wasm',
            progress_callback,
        });

        // Warmup
        await this.model.generate({
            input_features: full([1, 80, 3000], 0.0),
            max_new_tokens: 1,
        });
        
        console.log('[WhisperService] Model loaded and warmed up');
    } catch (error) {
        console.error('[WhisperService] Error loading model:', error);
        throw error;
    }
  }

  async transcribe(audio: Float32Array, options: any = {}) {
    if (!this.model || !this.tokenizer || !this.processor) {
        await this.loadModel();
    }

    try {
        const startTime = performance.now();
        console.log('[WhisperService] Transcribe start. Audio length:', audio.length);

        const inputs = await this.processor(audio);
        console.log('[WhisperService] Processor inputs:', Object.keys(inputs));
        
        const outputs = await this.model.generate({
            ...inputs,
            max_new_tokens: options.max_new_tokens || 64,
        });

        console.log('[WhisperService] Model outputs tensor:', outputs);
        
        const endTime = performance.now();
        const durationMs = endTime - startTime;
        
        const numTokens = outputs.data ? outputs.data.length : (outputs.length || 0);
        const tps = numTokens > 0 ? (numTokens / (durationMs / 1000)).toFixed(2) : "0.00";

        const text = this.tokenizer.batch_decode(outputs, { skip_special_tokens: true });
        const rawText = this.tokenizer.batch_decode(outputs, { skip_special_tokens: false });
        
        console.log('[WhisperService] Decoded text (cleaned):', text[0]);
        console.log('[WhisperService] Decoded text (with special tokens):', rawText[0]);
        console.log('[WhisperService] Stats:', { durationMs: durationMs.toFixed(0), tps, numTokens });

        return {
            text: text[0],
            stats: {
                durationMs: durationMs.toFixed(0),
                tps: tps,
                numTokens: numTokens
            }
        };
    } catch (error) {
        console.error('[WhisperService] Transcription error:', error);
        return { text: '', stats: null };
    }
  }

  dispose(): void {
    this.tokenizer = null;
    this.processor = null;
    this.model = null;
  }
}
