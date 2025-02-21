import { expose } from "comlink";
import { getSurahs, initSurahsApi } from "./surahs_api"
import { uGetSurahsUrls } from "../utils/surah_utils"
import { type Surah } from "../models/surah/surah_model";
import { getSurah, searchSurah } from "./surahs_api";
// import { search_surah } from "./search";


async function init() {
    console.log("### Main WW Init ###");
    await initSurahsApi()
}

const exposeObj = {
    init,
    api: {
        getSurah,
        getSurahs,
        searchSurah
    }
}
expose(exposeObj)