import { expose } from "comlink";
import { getSurahs, initSurahsApi } from "./surahs_api"
import { type Surah } from "../models/surah/surah_model";
import { getSurah, searchSurahs, loadCounter } from "./surahs_api";
// import { search_surah } from "./search";

console.log("### Main WW Loaded ###");

initSurahsApi().then(() => {
    console.log("Surahs API initialized in WW");
    // loadAllSurahs().then(() => {
    //     console.log("All Surahs loaded in WW");
    // });
});

const exposeObj = {
    api: {
        getSurah,
        getSurahs,
        searchSurahs,
        loadCounter
    }
}
expose(exposeObj)