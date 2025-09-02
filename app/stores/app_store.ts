import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { Ayah, MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";
import lStore from "~/utils/lstore";

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
  let config = ref<Config>()
  let settingsDrawer = ref(false)
  let loadedSurah = ref<Surah>()
  let loadedMarkedAyahData = ref<MarkedAyahData[]>()
  let fontSize = ref(50)
  let wwLink = ref<Remote<any>>();

  async function loadSurah(number: number) {
    try {
      loading.value = true
      loadedSurah.value = await wwLink.value!.api.getSurah(number)
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
        if(word.hidden) {
          word.hidden = false
        }
      }
      loadedSurah!.value!.ayahs[nextIdx]!.hidden = false
    }
    else {      
      for (let word of loadedSurah!.value!.ayahs[nextIdx]!.ayah_words) {
        if(word.hidden) {
          word.hidden = false
          break
        }
      }
      if(!loadedSurah!.value!.ayahs[nextIdx]!.ayah_words.some(el => el.hidden)) {
        loadedSurah!.value!.ayahs[nextIdx]!.hidden = false
      }
    }

  }

  function getConfig() {
    return config.value;
  }

  function setConfig(_config: Config) {
    config.value = {
      ...config.value,
      ..._config
    };
    lstore.write("config", JSON.stringify(_config));
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

  // from app:created hook plugin
  async function earlyInit() {
    
    // load appconfig
    const data = lstore.read("config");
    if (data) {
      config.value = JSON.parse(data);
    } else {
      config.value = {
        dark_mode: false,
        db_version: 1,
        last_opened_surah: 1
      };
      lstore.write("config", JSON.stringify(config.value));
    }

    const _worker = new Worker(
      new URL('~/workers/main_worker.ts', import.meta.url), {
      type: 'module',
    })

    wwLink.value! = wrap(_worker)

    setTimeout(() => {
      if (!import.meta.dev) {
        loadSurah(1)
      } else {
        loadSurah(1)
      }
    }, 500)

  }


  return {
    // variables
    loading,
    config,
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
    getConfig,
    setConfig,
    earlyInit
  }

});