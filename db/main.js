import fs from 'fs';
import { exec } from 'child_process';
import quran from "./quran_data.json" with { type: "json" };

let json = []
let db = `
-- load extension trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP TABLE IF EXISTS surah;
DROP TABLE IF EXISTS ayah;

CREATE TABLE surah (
  number INT PRIMARY KEY,
  name TEXT,
  english_name TEXT,
  english_name_translation TEXT,
  revelation_type TEXT,
  number_of_ayahs INT
);

CREATE TABLE ayah (
  surah_number_fk INT NOT NULL REFERENCES surah(number),
  number INT PRIMARY KEY,
  text TEXT,
  imlaei_simple_text TEXT,
  qpc_tajweed_text TEXT,
  number_in_surah INT,
  juz INT,
  manzil INT,
  page INT,
  ruku INT,
  hizb_quarter INT,
  sajda JSONB
);

`
// let c = 1
for(let surah of quran) {
  delete surah["edition"]
  json.push(surah);
  db += `

-- Surah ${surah.englishName.replaceAll("'", '')}
INSERT INTO surah (number, name, english_name, english_name_translation, revelation_type, number_of_ayahs)
VALUES (${surah.number}, '${surah.name}', '${surah.englishName.replaceAll("'", '')}', '${surah.englishNameTranslation}', '${surah.revelationType}', ${surah.numberOfAyahs});
`;

//  let y = 0
 for(let ayah of surah.ayahs) {
  db += `
  -- Ayah ${ayah.numberInSurah} Surah ${surah.englishName.replaceAll("'", '')}
  INSERT INTO ayah (surah_number_fk, number, text, imlaei_simple_text, qpc_tajweed_text, number_in_surah, juz, manzil, page, ruku, hizb_quarter, sajda)
  VALUES (
    ${surah.number},
    ${ayah.number},
    '${ayah.text}',
    '${ayah.imlaei_simple_text}',
    '${ayah.qpc_tajweed_text.replaceAll("'", '').replaceAll('"', '')}',
    ${ayah.numberInSurah}, ${ayah.juz}, ${ayah.manzil}, ${ayah.page}, ${ayah.ruku}, ${ayah.hizbQuarter}, '${JSON.stringify(ayah.sajda)}'
  );
  `
} 
}

// Save json and db sql dump
fs.writeFileSync(`quran.sql`, db);
fs.writeFileSync(`quran.json`, JSON.stringify(json, null, 2));



// move to public folder
exec('mv quran.sql ../public/')