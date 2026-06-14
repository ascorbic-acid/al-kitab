import { type Surah } from "../models/surah/surah_model";
import type { AyahSearchResult } from "~/models/ayah/ayah_search_result"
import Locator from "~/workers/core/locator";
import IDBSvc from "./services/idb_service";
import WhisperService from "./services/whisper_service";
import ParakeetService from "./services/parakeet_service";
import FastConformerService from "./services/fastconformer_service";

const DB_VERSION = 5

let loadedSurahs: Surah[] = []
let serviceLocator: Locator


export async function init_api(sl: Locator) {
  serviceLocator = sl
  const idbSvc = sl.get(IDBSvc)
  console.log(sl);
  
  let quranJson = await idbSvc?.get("quran-json")

  if (!quranJson) {
    let quranJsonRes = await fetch("/quran.json")
    quranJson = await quranJsonRes.json()
    idbSvc?.set("quran-json", quranJson)
  }

  loadedSurahs = quranJson as Surah[]
}

export async function loadWhisperModel(cb?: any) {
  const whisperSvc = serviceLocator.get(WhisperService)
  if (whisperSvc) {
    await whisperSvc.loadModel(cb)
  }
}

export async function transcribe(audio: Float32Array, options?: any) {
  const whisperSvc = serviceLocator.get(WhisperService)
  if (whisperSvc) {
    return await whisperSvc.transcribe(audio, options)
  }
}

export async function loadParakeetModel(cb?: any) {
  const parakeetSvc = serviceLocator.get(ParakeetService)
  if (parakeetSvc) {
    await parakeetSvc.loadModel(cb)
  }
}

export async function transcribeParakeet(audio: Float32Array, options?: any) {
  const parakeetSvc = serviceLocator.get(ParakeetService)
  if (parakeetSvc) {
    return await parakeetSvc.transcribe(audio, options)
  }
}

export async function loadFastConformerModel(cb?: any) {
  const fastConformerSvc = serviceLocator.get(FastConformerService)
  if (fastConformerSvc) {
    await fastConformerSvc.loadModel()
  }
}

export async function transcribeFastConformer(audio: Float32Array, options?: any) {
  const fastConformerSvc = serviceLocator.get(FastConformerService)
  if (fastConformerSvc) {
    return await fastConformerSvc.transcribe(audio, options)
  }
}

export async function transcribeFastConformerStreaming(audio: Float32Array, options?: any) {
  const fastConformerSvc = serviceLocator.get(FastConformerService)
  if (fastConformerSvc) {
    return await fastConformerSvc.transcribeStreaming(audio, options)
  }
}

export async function resetFastConformerStreaming() {
  const fastConformerSvc = serviceLocator.get(FastConformerService)
  if (fastConformerSvc) {
    fastConformerSvc.resetStreaming()
  }
}

export async function getSurah(number: number): Promise<Surah | undefined> {

  let surah = loadedSurahs.find(surah => surah.number === number)

  if (surah) {
    for (let ayah of surah.ayahs) {
      ayah["hidden"] = false
      ayah["ayah_words"] = ayah.text.replace("\n", "").split(" ").map(word => {
        return {
          hidden: false,
          word: word,
        }
      })
    }
    return surah
  }
}

export async function getSurahs() {
  const filteredSurahs = loadedSurahs.map(surah => {
    return surah
  })
  return filteredSurahs
}

export async function search(term: string): Promise<AyahSearchResult[] | undefined> {
  if (term.length < 2) return
  const startTime = performance.now()

  let results: AyahSearchResult[] = []

  for (let surah of loadedSurahs) {
    for (let ayah of surah.ayahs) {
      if (ayah.imlaei_simple_text.includes(term)) {
        // console.warn(`Surah: ${surah?.name} | Ayah (${ayah?.numberInSurah}): ${ayah?.text} | Clear Text: ${clearText}`);
        results.push(
          {
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            surahName: surah.name,
            surahNumber: surah.number,
          }
        )
      }
    }
  }


  const endTime = performance.now()

  console.log(`Search Took ${endTime - startTime} milliseconds for term: ${term}`);
  console.log("search: ", results);
  console.log('search amount ww: ', results.length);

  return results
}


