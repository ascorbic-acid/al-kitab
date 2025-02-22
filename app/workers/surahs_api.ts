import { type Surah } from "../models/surah/surah_model";
import { uGetSurahsUrls } from "../utils/surah_utils"
import { Connection } from "jsstore";
import workerInjector from 'jsstore/dist/worker_injector'
import { openDB, type IDBPDatabase, type IDBPObjectStore } from 'idb';
import { Dexie, type EntityTable } from 'dexie';
import type { Ayah } from "~/models/ayah/ayah_model";
import { version } from "vue";
import { E } from "vitest/dist/chunks/reporters.6vxQttCV.js";

const DB_NAME = "alkitab_db"
const DB_VERSION = 1
const DB_QURAN_SAVE_ID = 1

let db: Dexie;
let loadedSurahs: Surah[] = []

export async function initSurahsApi() {

  await createDB()
  await loadAllSurahs()

}

async function createDB() {
  db = new Dexie('SurahsDB') as Dexie & {
    surahs: EntityTable<Ayah, 'number'>;
  };
  db.version(DB_VERSION).stores({
    surahs: '++id, number, name',
  })
}

function getDbSchema() {
  var table = {
    name: 'Surahs',
    columns: {
      id: {
        primaryKey: true,
        autoIncrement: true
      },
      number: {
        dataType: 'number'
      },
      name: {
        dataType: 'string'
      },


    }
  }

  var db = {
    name: DB_NAME,
    tables: [table]
  }
  return db;
}


async function loadAllSurahs() {
  let savedQuran = await db.surahs.get({ id: 1 })
  console.log("savedQuran: ", savedQuran);

  const fetchedSurahs = await fetchSurahs()

  if (!savedQuran) {
    console.log('S1');
    
    loadedSurahs = fetchedSurahs
    db.surahs.put({ save_id: DB_QURAN_SAVE_ID, quran: fetchedSurahs })
  } else {
    console.log('S2');

    if(savedQuran.save_id !== DB_QURAN_SAVE_ID) {
      console.log('S3');
      db.surahs.clear()
      loadedSurahs = fetchedSurahs
      db.surahs.put({ save_id: DB_QURAN_SAVE_ID, quran: fetchedSurahs })
    } else {
      console.log('S4');

      loadedSurahs = savedQuran.quran
    }
  }


}

export async function fetchSurahs(): Promise<Surah[]> {
  const urls = uGetSurahsUrls()
  let loadTasks: Promise<Surah>[] = []
  for (let url of urls) {
    loadTasks.push((await fetch(url)).json())
  }
  return await Promise.all(loadTasks)
}

// loadedSurahs = await db.surahs.toArray()

export async function getSurah(number: number) {
  return loadedSurahs.find((surah) => surah.number == number)
}

export async function getSurahs(fields: string[]) {
  const filteredSurahs = loadedSurahs.map(surah => {
    return surah
    // return fields.some(field => {
    //   return field in surah;
    // });
  })

  return filteredSurahs
}

export async function searchSurah(term: string) {
  const startTime = performance.now()

  for (let i = 0; i < loadedSurahs.length; i++) {
    const surah = loadedSurahs[i]

    for (let j = 0; j < surah!.ayahs.length; j++) {
      const ayah = surah!.ayahs[j]
      const clearText = sanitize(ayah!.text)

      if (clearText.includes(term)) {
        console.warn(`Surah: ${surah?.name} | Ayah (${ayah?.numberInSurah}): ${ayah?.text} | Clear Text: ${clearText}`);
      }
    }

  }
  const endTime = performance.now()
  console.log(`term: ${term}`);

  console.log(`Search Took ${endTime - startTime} milliseconds`)
}

const ARABIC_DIACRITICS = [
  "\u0610",
  // ( ؐ) arabic sign sallallahou alayhe wassallam
  "\u0611",
  // ( ؑ) arabic sign alayhe assallam
  "\u0612",
  // ( ؒ) arabic sign rahmatullah alayhe
  "\u0613",
  // ( ؓ) arabic sign radi allahou anhu
  "\u0614",
  // ( ؔ) arabic sign takhallus
  "\u0615",
  // ( ؕ) arabic small high tah
  "\u0616",
  // ( ؖ) arabic small high ligature alef with lam with yeh
  "\u0617",
  // ( ؗ) arabic small high zain
  "\u0618",
  // ( ؘ) arabic small fatha
  "\u0619",
  // ( ؙ) arabic small damma
  "\u061A",
  // ( ؚ) arabic small kasra
  "\u064B",
  // ( ً) arabic fathatan
  "\u064C",
  // ( ٌ) arabic dammatan
  "\u064D",
  // ( ٍ) arabic kasratan
  "\u064E",
  // ( َ) arabic fatha
  "\u064F",
  // ( ُ) arabic damma
  "\u0650",
  // ( ِ) arabic kasra
  "\u0651",
  // ( ّ) arabic shadda
  "\u0652",
  // ( ْ) arabic sukun
  "\u0653",
  // ( ٓ) arabic maddah above
  "\u0654",
  // ( ٔ) arabic hamza above
  "\u0655",
  // ( ٕ) arabic hamza below
  "\u0656",
  // ( ٖ) arabic subscript alef
  "\u0657",
  // ( ٗ) arabic inverted damma
  "\u0658",
  // ( ٘) arabic mark noon ghunna
  "\u065A",
  // ( ٚ) arabic vowel sign small v above
  "\u065B",
  // ( ٛ) arabic vowel sign inverted small v above
  "\u065C",
  // ( ٜ) arabic vowel sign dot below
  "\u065D",
  // ( ٝ) arabic reversed damma
  "\u065E", // ( ٞ) arabic fatha with two dots
  "\u0670", //	arabic letter superscript alef
  "\u064E", // arabic fatha	
  "\u0650", // arabic kasra
  "\u06E1", // 	arabic small high dotless head of khah
  "\u0640", // arabic tatweel
  "\u06E4", // arabic small high madda
  "\u06E3", // arabic two-dots vertical above
  "\u06E2", // arabic two-dots vertical below
  "\u06D2", // arabic small high looked-at superimposed lamba"
  "\u08F2", // kasra or meem ?
  "\u08F0", // fatha 2
  "\u06E5", // arabic small waw
  "\u06D6", // ARABIC SMALL HIGH LIGATURE SAD WITH LAM WITH ALEF MAKSURA
]

const REPLACE_CHARS = [
  { from: "\u0623", to: "\u0627" },
  { from: "\u0671", to: "\u0627" },
  { from: "\u06CC", to: "\u064A" },
  { from: "\u0623", to: "\u0627" },
  { from: "\u0625", to: "\u0627" }, // ARABIC LETTER ALEF WITH HAMZA BELOW
]


function sanitize(str: string) {
  let escapedCodes = ARABIC_DIACRITICS.map((t) => "\\" + t).join("|");
  const regex = new RegExp(escapedCodes, "g");
  str = str.replaceAll("\n", "")

  str = str.replaceAll(regex, "")


  escapedCodes = REPLACE_CHARS.map((t) => "\\" + t).join("|");
  for (let char of REPLACE_CHARS) {
    const regex = new RegExp(char.from, "g");
    str = str.replaceAll(regex, char.to)
  }
  return str;
}


