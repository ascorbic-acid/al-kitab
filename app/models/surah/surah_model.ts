import { type Ayah } from "../ayah/ayah_model"

export interface Surah {
    number: number,
    name: string,
    englishName: string,
    englishNameTranslation: string,
    revelationType: string,
    numberOfAyahs: number,
    ayahs: Ayah[]
}