import { expose } from "comlink";
import { initDB, getSurahs  } from "./db"
import { type Surah } from "../models/surah/surah_model";
import { getSurah, searchSurahs } from "./db";
// import { search_surah } from "./search";

console.log("### Main WW Loaded ###");

async function init() {
    initDB().then(() => {
        console.log("Surahs API initialized in WW");
        // loadAllSurahs().then(() => {
        //     console.log("All Surahs loaded in WW");
        // });
    });
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