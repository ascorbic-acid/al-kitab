import { expose, wrap } from "comlink";
import { init_api, getSurah, getSurahs, searchSurahs } from "./api"
import type { Config } from "~/models/config/config_model";

let config: Config

async function init() {
    init_api()
}

async function updateWorkerCfg(newConfig: Config) {
    console.log(newConfig);
    config = newConfig
}


const exposeObj = {
    init,
    updateWorkerCfg,
    api: {
        getSurah,
        getSurahs,
        searchSurahs
    }
}
expose(exposeObj)