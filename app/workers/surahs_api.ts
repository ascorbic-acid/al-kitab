import { type Surah } from "../models/surah/surah_model";
import { uGetSurahsUrls } from "../utils/surah_utils"
import type { Ayah } from "~/models/ayah/ayah_model";
import { PGlite, IdbFs } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import AppDB from "./app_db";
import { query } from "@electric-sql/pglite/template";

const DB_NAME = "alkitab_db"
const DB_VERSION = 1

let db: PGlite;
// let db: Dexie;
let loadedSurahs: Surah[] = []
export let loadCounter = 5


export async function initSurahsApi() {

  await initDB()
  // await loadAllSurahs()

}

async function initDB() {
  
  const appDB = AppDB.Instance()

  db = appDB.getDB()

  // await appDB.setSettingsValue("lastOpened", new Date().toISOString())

  const res = await appDB.getSettingsValue<String>("lastOpened")
  // console.log("lastOpened: ", res?.length);

  // console.log(await appDB.getAllSettings());
  
  // let quranSQLRes = await fetch("/quran.sql")
  // let quranSql = await quranSQLRes.text()

  // await db.exec(quranSql)
  // console.log("db loaded by worker!")
}

export async function getSurah(number: number) : Promise<Surah | undefined> {
  try {
    let surahQuery = await db.query<Surah>(`
        select number, name, english_name, english_name_translation, revelation_type, number_of_ayahs
        from Surah
        where number = ${number}
    `)

    let ayahQuery = await db.query<Ayah>(`
        select surah_number_fk, number, text, imlaei_simple_text, qpc_tajweed_text, number_in_surah,
        juz, manzil, page, ruku, hizb_quarter, sajda
  
        from Ayah
        where surah_number_fk = ${number}
    `)

    if(surahQuery.rows.length > 0) {
      let surah = surahQuery.rows[0]
      surah!["ayahs"] = []

      for(let ayah of ayahQuery.rows) {
        ayah["hidden"] = false
        ayah["ayah_words"] = ayah.text.replace("\n", "").split(" ").map(word => {
          return {
            hidden: false,
            word: word,
          }
        })
        surah!.ayahs.push(ayah)
      }
      return surah
    } else {
      return undefined
    }
  } catch(e) {
    console.error("Error fetching surah:", e)
  }
}

export async function getSurahs(fields: string[]) {
  const filteredSurahs = loadedSurahs.map(surah => {
    return surah
  })

  return filteredSurahs
}

export async function searchSurahs(term: string) {
  if (term.length < 2) return
  const startTime = performance.now()

  let results = []


  let ayahQuery = await db.query<Ayah>(`
    select s.number surah_number, s.name surah_name, a.text, a.number_in_surah
    from Ayah a

    inner join Surah s
    on s.number = a.surah_number_fk

    where imlaei_simple_text like '%${term}%'
  `)
  

  const endTime = performance.now()

  console.log(`Search Took ${endTime - startTime} milliseconds for term: ${term}`);
  console.log("search: ", ayahQuery.rows);
  console.log('search amount ww: ', ayahQuery.rows.length);

  return ayahQuery.rows
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
  "\u08F1", // ARABIC OPEN DAMMATAN	
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


