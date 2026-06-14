<template>
  <v-container>
    <v-card class="pa-4 mx-auto" max-width="600">
      <v-card-title class="text-h5 text-center">اختبار تلاوة الفاتحة (FastConformer)</v-card-title>

      <v-card-text>
        <div class="d-flex justify-center mb-4 gap-2">
          <v-btn size="small" :loading="loadingModel" :disabled="isModelLoaded" color="primary" @click="loadModel">
            {{ isModelLoaded ? 'Model Ready' : 'Load Model' }}
          </v-btn>

          <v-btn size="small" :disabled="!isModelLoaded || isRecording" color="success" @click="startRecording">
            Start Rec
          </v-btn>

          <v-btn size="small" :disabled="!isRecording" color="error" @click="stopRecording">
            Stop Rec
          </v-btn>

          <v-btn size="small" :color="isVadActive ? 'warning' : 'grey'" @click="toggleVAD">
            {{ isVadActive ? 'Speech (Active)' : 'Silence (Inactive)' }}
          </v-btn>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="text-subtitle-1 mb-2">التحقق من التلاوة:</div>
        <v-sheet class="pa-3 bg-grey-lighten-4 rounded" min-height="120" style="overflow-y: auto;">
          <div class="text-h6 text-right" dir="rtl" style="line-height: 2;">
            <span v-for="(word, index) in surah1Words" :key="index" :class="getWordClass(index)" class="mx-1">
              {{ word }}
            </span>
          </div>
        </v-sheet>

        <div class="d-flex justify-space-between align-center mb-2 mt-4">
          <div class="text-subtitle-1 text-grey">التعرف المباشر:</div>
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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import MWSvc from '~/services/mw_service';
import Locator from '~/services/locator';

const snackbar = useSnackbar()
const mwSvc = Locator.Instance.get(MWSvc)

// State
const isModelLoaded = ref(false)
const loadingModel = ref(false)
const isRecording = ref(false)
const isVadActive = ref(false)
const isProcessing = ref(false)
const transcription = ref('')
const stats = ref<any>(null)
const currentWordPointer = ref(0)

// Al-Fatiha hardcoded word list (Simplified Arabic for matching)
const surah1Words = [
  "بسم", "الله", "الرحمن", "الرحيم",
  "الحمد", "لله", "رب", "العالمين",
  "الرحمن", "الرحيم",
  "مالك", "يوم", "الدين",
  "إياك", "نعبد", "وإياك", "نستعين",
  "اهدنا", "الصراط", "المستقيم",
  "صراط", "الذين", "أنعمت", "عليهم",
  "غير", "المغضوب", "عليهم", "ولا", "الضالين"
]

function normalizeArabic(text: string) {
  // Remove diacritics, small alef, kashida, and normalize alefs
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

// Optimized matching logic
watch(transcription, (newVal) => {
  if (!newVal || currentWordPointer.value >= surah1Words.length) return
  
  const words = newVal.trim().split(/\s+/).map(w => normalizeArabic(w))
  const targetWord = normalizeArabic(surah1Words[currentWordPointer.value]!)
  
  // Check if the current target word appears in the recent ASR output
  // We look at the last 3 words to avoid lag issues
  const recentWords = words.slice(-3)
  if (recentWords.some(w => w.includes(targetWord) || targetWord.includes(w))) {
     currentWordPointer.value++
  }
})

function getWordClass(index: number) {
  if (index < currentWordPointer.value) return 'text-success font-weight-bold'
  if (index === currentWordPointer.value) return 'text-primary border-bottom-1'
  return 'text-black opacity-30'
}

// Audio logic
let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
let processorNode: ScriptProcessorNode | null = null
let sourceNode: MediaStreamAudioSourceNode | null = null
let audioBuffer: number[] = []

const SAMPLE_RATE = 16000
const CHUNK_SIZE = SAMPLE_RATE * 1.5 // 1.5s chunks for faster feedback

async function loadModel() {
  loadingModel.value = true
  try {
    await mwSvc?.remote.api.loadFastConformerModel()
    isModelLoaded.value = true
    snackbar.add({ type: 'success', text: 'Model loaded successfully!' })
  } catch (error) {
    console.error('Failed to load model:', error)
    snackbar.add({ type: 'error', text: 'Failed to load FastConformer model.' })
  } finally {
    loadingModel.value = false
  }
}

async function startRecording() {
  if (!isModelLoaded.value) return

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext)
    audioContext = new AudioContextClass({ sampleRate: SAMPLE_RATE })

    sourceNode = audioContext.createMediaStreamSource(mediaStream)
    processorNode = audioContext.createScriptProcessor(4096, 1, 1)

    // Reset worker state and activate VAD by default
    isVadActive.value = true
    await mwSvc?.remote.api.resetFastConformerStreaming()

    processorNode.onaudioprocess = (e) => {
      if (!isRecording.value || !isVadActive.value) return // Only process if active
      const inputData = e.inputBuffer.getChannelData(0)
      for (let i = 0; i < inputData.length; i++) {
        audioBuffer.push(inputData[i]!)
      }

      if (audioBuffer.length >= CHUNK_SIZE) {
        const chunk = new Float32Array(audioBuffer)
        audioBuffer = []
        processStreamingChunk(chunk)
      }
    }

    sourceNode.connect(processorNode)
    processorNode.connect(audioContext.destination)

    isRecording.value = true
    transcription.value = ''
    currentWordPointer.value = 0
    stats.value = null
    audioBuffer = []
  } catch (error) {
    console.error('Error starting recording:', error)
    snackbar.add({ type: 'error', text: 'Microphone access denied.' })
  }
}

async function processStreamingChunk(chunk: Float32Array) {
  if (isProcessing.value || !isVadActive.value) return // Guard
  isProcessing.value = true
  try {
    const result = await mwSvc?.remote.api.transcribeFastConformerStreaming(chunk)
    if (result && result.text) {
      transcription.value = result.text
      stats.value = result.stats
    }
  } catch (error) {
    console.error('ASR Error:', error)
  } finally {
    isProcessing.value = false
  }
}

async function stopRecording() {
  isRecording.value = false
  if (processorNode) processorNode.disconnect()
  if (sourceNode) sourceNode.disconnect()
  if (audioContext) await audioContext.close()
  if (mediaStream) mediaStream.getTracks().forEach(track => track.stop())
  
  audioContext = null
  mediaStream = null
  processorNode = null
  sourceNode = null
}

async function toggleVAD() {
    if (!isRecording.value) return

    if (isVadActive.value) {
        // Transitioning to Silence: Final Flush and Reset
        if (audioBuffer.length > 0) {
            const chunk = new Float32Array(audioBuffer)
            audioBuffer = []
            await processStreamingChunk(chunk)
        }
        await mwSvc?.remote.api.resetFastConformerStreaming()
        isVadActive.value = false
        snackbar.add({ type: 'info', text: 'Silence: VAD reset.' })
    } else {
        // Transitioning to Speech
        isVadActive.value = true
        snackbar.add({ type: 'info', text: 'Speech: Resuming...' })
    }
}

onUnmounted(() => {
  stopRecording()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.border-bottom-1 {
  border-bottom: 2px solid currentColor;
}
</style>
