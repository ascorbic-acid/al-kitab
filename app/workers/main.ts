import { expose } from "comlink";
import { init_api, getSurah, getSurahs, search, loadWhisperModel, transcribe, loadParakeetModel, transcribeParakeet, loadFastConformerModel, transcribeFastConformer, transcribeFastConformerStreaming, resetFastConformerStreaming } from "./api"
import type { Config } from "~/models/config/config_model";
import Locator from "~/workers/core/locator";
import IDBSvc from "~/workers/services/idb_service";
import WhisperService from "~/workers/services/whisper_service";
import ParakeetService from "~/workers/services/parakeet_service";
import FastConformerService from "~/workers/services/fastconformer_service";

let config: Config
const sl = Locator.Instance

async function init() {
    sl.register(IDBSvc)
    sl.register(WhisperService)
    sl.register(ParakeetService)
    sl.register(FastConformerService)

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
        search,
        loadWhisperModel,
        transcribe,
        loadParakeetModel,
        transcribeParakeet,
        loadFastConformerModel,
        transcribeFastConformer,
        transcribeFastConformerStreaming,
        resetFastConformerStreaming
    }
}
expose(exposeObj)