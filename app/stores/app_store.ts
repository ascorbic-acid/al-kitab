import quranSurahs from "~/assets/quran-surahs.json"
import CustomStorage from "~/utils/custom_storage"
import { uGetSurahsUrls } from "~/utils/surah_utils"
import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { MarkedAyahData } from "~/models/ayah/ayah_model";

export const useAppStore = defineStore("appStore", () => {
  const snackbar = useSnackbar();
  const { width } = useWindowSize()
  let loading = ref<boolean>(false)
  let drawer = ref(true)
  let settingsDrawer = ref(true)
  let loadedSurah = ref<Surah>()
  let loadedSurahs = ref<Surah[]>([])
  let loadedMarkedAyahData = ref<MarkedAyahData[]>()
  let fontSize = ref(50)

  async function loadAllSurahs() {
    const urls = uGetSurahsUrls()
    let loadTasks: Promise<Surah>[] = []

    for(let url of urls) {
      loadTasks.push($fetch<Surah>(url))
    }
    const res = await Promise.all(loadTasks)
    loadedSurahs.value = res
  }

  async function loadSurah(number: number) {
    try {
      loading.value = true
        let foundSurah = loadedSurahs.value.find((surah) => surah.number == number)        
        loading.value = false
        loadedSurah.value = foundSurah
    } catch (e) {
      console.log(e);
      loading.value = false
    }
  }

  onBeforeMount(async () => {
    console.log("onBeforeMount");
    await loadAllSurahs()
    if(!import.meta.dev) {
      loadSurah(1)
    } else {
      loadSurah(500)
    }
  })

  onMounted(async () => {
    // TODO: move to better place
    if( width.value > 700) {
      drawer.value = true
    } else {
      drawer.value = false
    }

    loadedMarkedAyahData.value = uGetMarkedSurahsAyahsData()
  })



  return {
    // variables
    loading,
    drawer,
    settingsDrawer,
    quranSurahs,
    loadedMarkedAyahData,
    loadedSurah,
    loadedSurahs,
    fontSize,

    // methods
    loadAllSurahs,
    loadSurah,
    // getMarkedAyahData,
    // markAyah,
    // scrollToAyah
  }

});