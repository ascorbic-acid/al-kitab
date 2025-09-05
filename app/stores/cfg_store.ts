import { useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { Ayah, MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";
import lStore from "~/utils/lstore";
import { Locator } from '~/services/locator';
import type { Config } from '~/models/config/config_model';
import IDBService from '~/services/idb_service';

const KV_NAME = 'app-config'

export const useConfigStore = defineStore("configStore", () => {
  let idbSvc!: IDBService
  let config = ref<Partial<Config>>()
  let nuxtApp = useNuxtApp()
  // let sl = inject<Locator>("sl")

  async function init(sl: Locator) {
    console.log(sl);
    
    idbSvc = sl!.get(IDBService)!
    loadConfig()
  }

  async function loadConfig() {
    config.value = await idbSvc.get<Config>(KV_NAME)
    if(!config.value) {
      await resetConfig()
    }
    
    console.log("Config loaded:", config.value);
  }


  async function getConfig(): Promise<Config> {
    return config.value! as Promise<Config>;
  }

  async function setConfig(partialConfig: Partial<Config>): Promise<void> {
    if (!config.value) {
      config.value = await getConfig();
    }

    config.value = { ...config.value, ...partialConfig };
    console.log("new cfg to store: ", config.value);
    
    Locator.Instance.get(IDBService)?.set(KV_NAME, toRaw(config.value));
  }

  async function resetConfig(): Promise<void> {
    const defaultConfig = {
      dark_mode: false,
      db_version: 1,
      last_opened_surah: 1
    }

    config.value = defaultConfig    
    idbSvc.set(KV_NAME, defaultConfig);
    console.log("Reset Config");
  }

  return {
    // variables
    config,

    // methods
    init,
    loadConfig,
    getConfig,
    setConfig,
    resetConfig,
  }

});