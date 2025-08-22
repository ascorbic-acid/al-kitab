import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { Ayah, MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";
import { AppConfig } from '~/service-worker/config';

export const useAppStore = defineStore("appStore", () => {
  // const snackbar = useSnackbar();
  const { width } = useWindowSize()
  let loading = ref<boolean>(false)
  let drawer = ref(false)
  let settingsDrawer = ref(false)
  let loadedSurah = ref<Surah>()
  let loadedMarkedAyahData = ref<MarkedAyahData[]>()
  let fontSize = ref(50)
  let wwLink = ref<Remote<any>>();

  async function loadSurah(number: number) {
    try {
      loading.value = true
      loadedSurah.value = await wwLink.value!.api.getSurah(number)
      loading.value = false
    } catch (e) {
      console.log(e);
      loading.value = false
    }
  }


  async function hideAyahsStartFromIdx(startFromIdx: number) {

    for (let i = startFromIdx; i < loadedSurah!.value!.ayahs.length; i++) {
      const ayah = loadedSurah.value!.ayahs[i]
      ayah!.hidden = true
      for (let word of loadedSurah!.value!.ayahs[i]!.ayahWords) {
        word.hidden = true
      }
    }
  }

  async function showNextHiddenAyah(startFromIdx: number, showWholeAyah: boolean) {
    let nextIdx = -1

    for (let i = startFromIdx; i >= 0; i--) {
      if (!loadedSurah!.value!.ayahs[i]?.hidden) break
      nextIdx = i
    }

    if (showWholeAyah) {
      for (let word of loadedSurah!.value!.ayahs[nextIdx]!.ayahWords) {
        if(word.hidden) {
          word.hidden = false
        }
      }
      loadedSurah!.value!.ayahs[nextIdx]!.hidden = false
    }
    else {      
      for (let word of loadedSurah!.value!.ayahs[nextIdx]!.ayahWords) {
        if(word.hidden) {
          word.hidden = false
          break
        }
      }
      if(!loadedSurah!.value!.ayahs[nextIdx]!.ayahWords.some(el => el.hidden)) {
        loadedSurah!.value!.ayahs[nextIdx]!.hidden = false
      }
    }

  }

  onBeforeMount(async () => {
  })

  onMounted(async () => {
    // TODO: move to better place
    if (width.value > 700) {
      drawer.value = true
    } else {
      drawer.value = false
    }
  })

  // direct top call from app.vue
  // TODO: find better early place to preload "head script"?
  async function earlyInit() {
    (window as any)['alkitab'] = {
      version: AppConfig.VERSION
    }
    const _worker = new Worker(new URL('~/workers/main_worker.ts', import.meta.url), {
      type: 'module',
    })
    wwLink.value! = wrap(_worker)
    await wwLink.value!.init()
    // wwLink!.value.api.getSurahs(['name']).then((surahs: Surah[]) => loadedSurahs.value = surahs)
    setTimeout(() => {
      if (!import.meta.dev) {
        loadSurah(1)
      } else {
        loadSurah(500)
      }
    }, 500)

  }


  return {
    // variables
    loading,
    drawer,
    settingsDrawer,
    loadedMarkedAyahData,
    loadedSurah,
    wwLink,
    fontSize,

    // methods
    loadSurah,
    hideAyahsStartFromIdx,
    showNextHiddenAyah,
    // getMarkedAyahData,
    // markAyah,
    // scrollToAyah
    earlyInit
  }

});