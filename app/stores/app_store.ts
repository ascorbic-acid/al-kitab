import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { Ayah, MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";
import lStore from "~/utils/lstore";
import type { Locator } from '~/services/locator';
import MainWorkerService from '~/services/mw_service';

interface Config {
  dark_mode: boolean
  db_version: number
  last_opened_surah: number
}

export const useAppStore = defineStore("appStore", () => {
  // const snackbar = useSnackbar();
  const { width } = useWindowSize()
  let loading = ref<boolean>(false)
  let drawer = ref(false)
  let settingsDrawer = ref(false)
  let loadedSurah = ref<Surah>()
  let loadedMarkedAyahData = ref<MarkedAyahData[]>()
  let fontSize = ref(50)
  let sl = inject<Locator>("sl")
  let mwSvc: MainWorkerService

  async function init(sl: Locator) {
    mwSvc = sl!.get(MainWorkerService)!

    setTimeout(() => {
      if (!import.meta.dev) {
        loadSurah(1)
      } else {
        loadSurah(500)
      }
    }, 500)
  }

  async function loadSurah(number: number) {
    try {
      loading.value = true
      loadedSurah.value = mwSvc.remote.api.getSurah(number)
      console.log(loadedSurah)
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
      for (let word of loadedSurah!.value!.ayahs[i]!.ayah_words) {
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
      for (let word of loadedSurah!.value!.ayahs[nextIdx]!.ayah_words) {
        if (word.hidden) {
          word.hidden = false
        }
      }
      loadedSurah!.value!.ayahs[nextIdx]!.hidden = false
    }
    else {
      for (let word of loadedSurah!.value!.ayahs[nextIdx]!.ayah_words) {
        if (word.hidden) {
          word.hidden = false
          break
        }
      }
      if (!loadedSurah!.value!.ayahs[nextIdx]!.ayah_words.some(el => el.hidden)) {
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


  return {
    // variables
    loading,
    drawer,
    settingsDrawer,
    loadedMarkedAyahData,
    loadedSurah,
    fontSize,

    // methods
    init,
    loadSurah,
    hideAyahsStartFromIdx,
    showNextHiddenAyah
  }

});