import { type Ayah } from "../ayah/ayah_model"

export interface Surah {
    number: number,
    name: string,
    english_name: string,
    english_name_translation: string,
    revelation_type: string,
    number_of_ayahs: number,
    ayahs: Ayah[]
}