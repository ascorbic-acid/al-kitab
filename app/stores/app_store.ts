import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";

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
    // getMarkedAyahData,
    // markAyah,
    // scrollToAyah
    earlyInit
  }

});