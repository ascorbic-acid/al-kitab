import quranSurahs from "~/assets/quran-surahs.json"
import CustomStorage from "~/utils/custom_storage"
import { uGetSurahsUrls } from "~/utils/surah_utils"
import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { MarkedAyahData } from "~/models/ayah/ayah_model";
import { proxy, type Remote, wrap } from "comlink"

export const useSwStore = defineStore("swStore", () => {
  const swProxy = ref<Remote<any>>();
  const appVersion = ref("1.0.0");
  async function test_sw() {
    console.log('test_sw', swProxy.value!);

    const p = proxy((ret: string) => {console.log('cb with comlink proxy: ' + ret)})
    const res = await swProxy.value!.transfer_test(p)
    console.log(res);
  }


  async function init() {
    if (navigator.serviceWorker.controller) {
      const { port1, port2 } = new MessageChannel();
      const msg = { comlinkInit: true, port: port1 };
      navigator.serviceWorker.controller!.postMessage(msg, [port1]);
      swProxy.value = wrap(port2);

      // load sw app version
      swProxy.value.getVersion().then(function (_appVersion: string) {        
        appVersion.value = _appVersion
      })
    }
  }

//   onBeforeMount(() => {
//     // init()
//   }
// )

//   onMounted(() => {
//   }
// )
  return {
    swProxy,
    appVersion,

    init,
    test_sw
  }

});