import { expose } from "comlink";
import { getSurahs, initSurahsApi } from "./surahs_api"
import { type Surah } from "../models/surah/surah_model";
import { getSurah, searchSurahs } from "./surahs_api";
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
        searchSurahs
    }
}
expose(exposeObj)