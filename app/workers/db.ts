// import { type Surah } from "../models/surah/surah_model";
// import type { Ayah } from "~/models/ayah/ayah_model";
// import { PGlite, IdbFs } from '@electric-sql/pglite'
// import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
// import { openDB, deleteDB, wrap, unwrap } from 'idb';

// import AppDB from "./pglite_db";
// import { query } from "@electric-sql/pglite/template";

// const DB_VERSION = 5


// let db: PGlite;
// let loadedSurahs: Surah[] = []


// export async function initDB() {
  
//   const pgLite = AppDB.Instance()
//   db = pgLite.getDB()

//   const res = await pgLite.getSettingsValue<String>("lastOpened")

//   if(DB_VERSION > config.db_version) {
//     console.log("loading and restoring quran.sql...")

//     // first we delete all indexeddbs by looping on them and delete them
//     const dbs = await indexedDB.databases();
//     for (const db of dbs) {
//       // await deleteDB(db.name);
//       console.log(`del: ${db.name}`);
//     }

//     let quranSQLRes = await fetch("/quran.sql")
//     let quranSql = await quranSQLRes.text()
  
//     await db.exec(quranSql)
//     console.log("db recreated from quran.sql!")
//   }

//   // let quranSQLRes = await fetch("/quran.sql")
//   // let quranSql = await quranSQLRes.text()

//   // await db.exec(quranSql)
//   console.log("db loaded by worker!")
// }

// export async function getSurah(number: number) : Promise<Surah | undefined> {
//   try {
//     let surahQuery = await db.query<Surah>(`
//         select number, name, english_name, english_name_translation, revelation_type, number_of_ayahs
//         from Surah
//         where number = ${number}
//     `)

//     let ayahQuery = await db.query<Ayah>(`
//         select surah_number_fk, number, text, imlaei_simple_text, qpc_tajweed_text, number_in_surah,
//         juz, manzil, page, ruku, hizb_quarter, sajda
  
//         from Ayah
//         where surah_number_fk = ${number}
//     `)

//     if(surahQuery.rows.length > 0) {
//       let surah = surahQuery.rows[0]
//       surah!["ayahs"] = []

//       for(let ayah of ayahQuery.rows) {
//         ayah["hidden"] = false
//         ayah["ayah_words"] = ayah.text.replace("\n", "").split(" ").map(word => {
//           return {
//             hidden: false,
//             word: word,
//           }
//         })
//         surah!.ayahs.push(ayah)
//       }
//       return surah
//     } else {
//       return undefined
//     }
//   } catch(e) {
//     console.error("Error fetching surah:", e)
//   }
// }

// export async function getSurahs(fields: string[]) {
//   const filteredSurahs = loadedSurahs.map(surah => {
//     return surah
//   })
//   return filteredSurahs
// }

// export async function searchSurahs(term: string) {
//   if (term.length < 2) return
//   const startTime = performance.now()

//   let ayahQuery = await db.query<Ayah>(`
//     select s.number surah_number, s.name surah_name, a.text, a.number_in_surah
//     from Ayah a

//     inner join Surah s
//     on s.number = a.surah_number_fk

//     where imlaei_simple_text like '%${term}%'
//   `)
  
//   const endTime = performance.now()

//   console.log(`Search Took ${endTime - startTime} milliseconds for term: ${term}`);
//   console.log("search: ", ayahQuery.rows);
//   console.log('search amount ww: ', ayahQuery.rows.length);

//   return ayahQuery.rows
// }


