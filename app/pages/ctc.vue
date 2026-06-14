<template>
  <v-container>
    <v-card class="pa-4 mx-auto" max-width="600">
      <v-card-title class="text-h5 text-center">منطقة إختبار ASR</v-card-title>

      <v-card-text>
        <!-- Engine Selection -->
        <v-radio-group v-model="engine" inline label="محرك ASR:" class="mb-4">
          <v-radio label="Whisper (Tarteel)" value="whisper"></v-radio>
          <v-radio label="Parakeet (TDT)" value="parakeet"></v-radio>
          <v-radio label="FastConformer (CTC)" value="fastconformer"></v-radio>
        </v-radio-group>

        <div class="d-flex justify-center mb-4 gap-2">
          <v-btn size="small" :loading="loadingModel" :disabled="isCurrentModelLoaded" color="primary" @click="loadModel">
            {{ isCurrentModelLoaded ? 'Model Ready' : 'Load Model' }}
          </v-btn>

          <v-btn size="small" :disabled="!isCurrentModelLoaded || isRecording" color="success" @click="startRecording">
            Start Rec
          </v-btn>

          <v-btn size="small" :disabled="!isRecording" color="error" @click="stopRecording">
            Stop Rec
          </v-btn>

          <v-btn size="small" color="warning" @click="resetManualVAD">
            Manual Reset
          </v-btn>
          </div>

        <v-divider class="my-4"></v-divider>

        <div class="d-flex justify-space-between align-center mb-2 mt-4">
          <div class="text-subtitle-1">الناتج الخام ({{ engine }}):</div>
          <div v-if="stats" class="text-caption text-grey">
            {{ stats.tps }} tok/s | {{ stats.durationMs }}ms
          </div>
        </div>

        <v-sheet class="pa-3 bg-grey-lighten-4 rounded" min-height="50" max-height="150" style="overflow-y: auto;">
          <div v-if="transcription" class="text-body-1 text-right" dir="rtl">
            {{ transcription }}
          </div>
        </v-sheet>

        <v-progress-linear v-if="isProcessing" indeterminate color="secondary" class="mt-4"></v-progress-linear>
      </v-card-text>

      <v-card-actions v-if="audioUrl">
        <audio :src="audioUrl" controls class="w-100"></audio>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import MWSvc from '~/services/mw_service';
import Locator from '~/services/locator';
import { proxy } from 'comlink';

const snackbar = useSnackbar()
const mwSvc = Locator.Instance.get(MWSvc)

// State
const engine = ref<'whisper' | 'parakeet' | 'fastconformer'>('fastconformer')
const whisperLoaded = ref(false)
const parakeetLoaded = ref(false)
const fastconformerLoaded = ref(false)
const loadingModel = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const transcription = ref('')
const audioUrl = ref('')
const stats = ref<any>(null)


const asrWords = computed(() => transcription.value.trim().split(/\s+/))



const isCurrentModelLoaded = computed(() => {
  if (engine.value === 'whisper') return whisperLoaded.value
  if (engine.value === 'parakeet') return parakeetLoaded.value
  return fastconformerLoaded.value
})

// Audio context and nodes
let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
let processorNode: ScriptProcessorNode | null = null
let sourceNode: MediaStreamAudioSourceNode | null = null

// Buffer for real-time processing
let audioBuffer: number[] = []
const SAMPLE_RATE = 16000
const CHUNK_SIZE = SAMPLE_RATE * 2 // 2 seconds of audio


async function manual_reset_vad_sim() {
  mwSvc?.remote.api.resetFastConformerStreaming()
}

async function loadModel() {
  loadingModel.value = true
  try {
    const onProgress = proxy((p: any) => {
      // console.log('Loading progress:', p)
    })

    if (engine.value === 'whisper') {
      await mwSvc?.remote.api.loadWhisperModel(onProgress)
      whisperLoaded.value = true
    } else if (engine.value === 'parakeet') {
      await mwSvc?.remote.api.loadParakeetModel(onProgress)
      parakeetLoaded.value = true
    } else {
      await mwSvc?.remote.api.loadFastConformerModel()
      fastconformerLoaded.value = true
    }
    
    snackbar.add({ type: 'success', text: `${engine.value} model loaded successfully!` })
  } catch (error) {
    console.error('Failed to load model:', error)
    snackbar.add({ type: 'error', text: `Failed to load ${engine.value} model.` })
  } finally {
    loadingModel.value = false
  }
}

async function startRecording() {
 if (!isCurrentModelLoaded.value) return

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: SAMPLE_RATE
    })

    sourceNode = audioContext.createMediaStreamSource(mediaStream)
    processorNode = audioContext.createScriptProcessor(4096, 1, 1)

    // Reset streaming state in worker if using FastConformer
    if (engine.value === 'fastconformer') {
      await mwSvc?.remote.api.resetFastConformerStreaming()
    }

    processorNode.onaudioprocess = (e) => {
      if (!isRecording.value) return

      const inputData = e.inputBuffer.getChannelData(0)
      
      // For FastConformer streaming, we send chunks immediately when CHUNK_SIZE is reached
      // For others, we keep the old behavior of processing the whole buffer (batch)
      for (let i = 0; i < inputData.length; i++) {
        const sample = inputData[i]
        if (sample !== undefined) {
          audioBuffer.push(sample)
        }
      }

      if (audioBuffer.length >= CHUNK_SIZE) {
        if (engine.value === 'fastconformer') {
           // In streaming mode, we send the chunk and clear local buffer
           const chunk = new Float32Array(audioBuffer)
           audioBuffer = []
           processStreamingChunk(chunk)
        } else {
           processChunk()
        }
      }
    }

    sourceNode.connect(processorNode)
    processorNode.connect(audioContext.destination)

    isRecording.value = true
    transcription.value = ''
    stats.value = null
    audioBuffer = []
    snackbar.add({ type: 'info', text: 'Recording started...' })
  } catch (error) {
    console.error('Error starting recording:', error)
    snackbar.add({ type: 'error', text: 'Microphone access denied or error occurred.' })
  }
}

async function processStreamingChunk(chunk: Float32Array) {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const result = await mwSvc?.remote.api.transcribeFastConformerStreaming(chunk)
    if (result && result.text) {
      transcription.value = result.text
      stats.value = result.stats
    }
  } catch (error) {
    console.error('Streaming transcription error:', error)
  } finally {
    isProcessing.value = false
  }
}

async function processChunk() {
  if (isProcessing.value || audioBuffer.length === 0) return

  isProcessing.value = true
  const maxSamples = SAMPLE_RATE * 30
  const dataToProcess = audioBuffer.slice(-maxSamples)
  const float32Array = new Float32Array(dataToProcess)

  try {
    let result;
    if (engine.value === 'whisper') {
      result = await mwSvc?.remote.api.transcribe(float32Array, {
        max_new_tokens: 64
      })
    } else if (engine.value === 'parakeet') {
      result = await mwSvc?.remote.api.transcribeParakeet(float32Array)
    } else {
      result = await mwSvc?.remote.api.transcribeFastConformer(float32Array)
    }

    if (result && result.text) {
      transcription.value = result.text
      stats.value = result.stats
    }
  } catch (error) {
    console.error('Transcription error:', error)
  } finally {
    isProcessing.value = false
  }
}

async function stopRecording() {
  isRecording.value = false

  if (audioBuffer.length > 0) {
    await processChunk()
  }

  if (processorNode) {
    processorNode.disconnect()
    processorNode = null
  }
  if (sourceNode) {
    sourceNode.disconnect()
    sourceNode = null
  }
  if (audioContext) {
    await audioContext.close()
    audioContext = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  snackbar.add({ type: 'success', text: 'Recording stopped.' })
}

async function resetManualVAD() {
    audioBuffer = []
    transcription.value = ''
    if (engine.value === 'fastconformer') {
        await mwSvc?.remote.api.resetFastConformerStreaming()
    }
    snackbar.add({ type: 'info', text: 'Buffer reset (VAD simulated).' })
}

onMounted(async () => {

})

onUnmounted(() => {
  stopRecording()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
