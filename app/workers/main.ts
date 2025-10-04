import { expose } from "comlink";
import { init_api, getSurah, getSurahs, search } from "./api"
import type { Config } from "~/models/config/config_model";
import Locator from "~/workers/core/locator";
import IDBSvc from "~/workers/services/idb_service";

let config: Config
const sl = Locator.Instance

async function init() {
    const sl2 = Locator.Instance
    sl.register(IDBSvc)

    await Promise.all([
        sl.get(IDBSvc)?.init(sl),
    ])

    init_api(sl)
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
        search
    }
}
expose(exposeObj)