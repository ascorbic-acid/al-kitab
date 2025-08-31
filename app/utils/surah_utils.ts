// TODO: better quranSurahs structure to match mains surahs json 
import quranSurahs from "~/assets/quran-surahs.json"
import type { Surah } from "~/models/surah/surah_model";
import type { MarkedAyahData } from "~/models/ayah/ayah_model";
import CustomStorage from "./custom_storage";
import { SURA_IDS } from "./enums/surahs_ids"
import { type Store } from "pinia"
// const snackbar = useSnackbar();

export function uSleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function uGetSurahsUrls(): string[] {
    const surahs = [];
    for (let i = 1; i <= 114; i++) {
        surahs.push(uGetSurahUrl(i));
    }
    surahs.push(uGetSurahUrl(500)); // testing text for development
    return surahs;

}

export function uGetSurahUrl(number: number): string {
    return "/surahs/" + uGetSurahJsonName(number);

}

export function uGetSurahJsonName(number: number): string {
    return `${number}-${SURA_IDS[number]}.json`;
}

export function uGetAyahElFromAttrNr(number: number): HTMLElement {
    return document.getElementById(`akb-ayah-nr__${number}`)!
}

export function uGetAyahNrFromTarget(target?: HTMLElement): number {
    return Number(target!.getAttribute("kbt-ayah-nr"))
}

export function uGetSurahNameFromNr(number: number): string {
    return quranSurahs.find(surah => surah.id === number)?.name ?? "-" 
}


// UI Utils --------------------------------------------------

export async function uGlowAyah(number: number) {
    const el = uGetAyahElFromAttrNr(number)
    el.classList.add("ayah__highlight")
}

export function uUnglowAyah(number: number) {
    const el = uGetAyahElFromAttrNr(number)
    el.classList.remove("ayah__highlight")
}

export function uScrollToAyah(number: number) {
    const el = uGetAyahElFromAttrNr(number)
    document.addEventListener("scrollend", (ev: Event) => {
        console.log('scroll event ended');
    })
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function uMarkAyah(ayahNumber: number, surahNumber: number) {
    const markedAyahData = uGetMarkedSurahsAyahsData()

    const foundSurahMark: MarkedAyahData = markedAyahData.find(
        (data: MarkedAyahData) => data.surahNumber === surahNumber
    )
    if (foundSurahMark) {
        foundSurahMark.ayahNumber = ayahNumber
    } else {
        markedAyahData.push({ surahNumber, ayahNumber })
    }
    CustomStorage.write("ktb-marked-surahs-ayahs-data", JSON.stringify(markedAyahData))
}

export function uRemoveMarkedAyah(ayahNumber: number, surahNumber: number) {
    const markedAyahData = uGetMarkedSurahsAyahsData()

    const foundSurahMark: MarkedAyahData = markedAyahData.find(
        (data: MarkedAyahData) => data.surahNumber === surahNumber
    )
    if (foundSurahMark) {
        markedAyahData.splice(markedAyahData.indexOf(foundSurahMark), 1)
    }
    CustomStorage.write("ktb-marked-surahs-ayahs-data", JSON.stringify(markedAyahData))
}

export function uGetSurahMarkData(number: number): MarkedAyahData | undefined {
    const markedAyahData = uGetMarkedSurahsAyahsData()

    const foundSurahMark: MarkedAyahData = markedAyahData.find(
        (data: MarkedAyahData) => data.surahNumber === number
    )
    if (foundSurahMark) {
        return foundSurahMark
    }
}

export function uGetMarkedSurahsAyahsData(): MarkedAyahData[] {
    const rawMarkedAyahData = CustomStorage.read("ktb-marked-surahs-ayahs-data")
    if (rawMarkedAyahData) {
        return JSON.parse(rawMarkedAyahData)
    } else {
        return []
    }
}

export async function uGoToAyah(ayahNumber: number, surahNumber: number, appStore: Store<'appStore'>) {
    console.log(ayahNumber, surahNumber);
    
    if (appStore.loadedSurah?.number === surahNumber) {
        uScrollToAyah(ayahNumber)
        uGlowAyah(ayahNumber)
        await uSleep(2000)
        uUnglowAyah(ayahNumber)
      } else {
        await appStore.loadSurah(surahNumber)
        await uSleep(500)
        uScrollToAyah(ayahNumber)
        uGlowAyah(ayahNumber)
        await uSleep(2000)
        uUnglowAyah(ayahNumber)
      }
}