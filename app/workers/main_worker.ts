import { expose } from "comlink";
import { getSurahs } from "./api"
import { type Surah } from "../models/surah/surah_model";
import { init, getSurah, searchSurahs } from "./api";
// import { search_surah } from "./search";

console.log("### Main WW Loaded ###");

const exposeObj = {
    init,
    api: {
        getSurah,
        getSurahs,
        searchSurahs
    }
}
expose(exposeObj)