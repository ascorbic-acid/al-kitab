import { now, useWindowSize } from '@vueuse/core'
import type { Surah } from "~/models/surah/surah_model";
import type { Ayah, MarkedAyahData } from "~/models/ayah/ayah_model";
import { wrap, type Remote } from "comlink";
import lStore from "~/utils/lstore";
import Locator from '~/services/locator';
import type { Config } from '~/models/config/config_model';
import IDBSvc from '~/services/idb_service';
import { sl } from 'vuetify/locale';
import MWSvc from '~/services/mw_service';

const KV_NAME = 'app-config'

export const useConfigStore = defineStore("configStore", () => {

  let config = ref<Partial<Config>>()
  let nuxtApp = useNuxtApp()


  async function init() {
    loadConfig()
  }

  async function loadConfig() {
    config.value = await useSGet(IDBSvc).get<Config>(KV_NAME)
    if(!config.value) {
      await resetConfig()
    }    
  }


  async function getConfig(): Promise<Config> {
    return config.value! as Promise<Config>;
  }

  async function setConfig(partialConfig: Partial<Config>): Promise<void> {
    if (!config.value) {
      config.value = await getConfig();
    }

    config.value = { ...config.value, ...partialConfig };    
    Locator.Instance.get(IDBSvc)?.set(KV_NAME, toRaw(config.value));
  }

  async function resetConfig(): Promise<void> {
    const defaultConfig = {
      dark_mode: false,
      db_version: 1,
      last_opened_surah: 1
    }

    config.value = defaultConfig    
    useSGet(IDBSvc).set(KV_NAME, defaultConfig);
  }

  // watch(config, (newValue, oldValue) => {
  //   // mwSvc.updateWorkerCfg(toRaw(newValue) as Config)
  // })

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