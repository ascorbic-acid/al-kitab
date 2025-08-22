export interface AyahWords {
    word: string,
    hidden?: boolean
}

export interface Ayah {
    number: number,
    hidden?: boolean,
    text: string,
    ayahWords: AyahWords[],
    numberInSurah: number,
    juz: number,
    manzil: number,
    page: number,
    ruku: number,
    hizbQuarter: number,
    sajda: boolean
}

export interface MarkedAyahData {
    surahNumber: number,
    ayahNumber: number
}

export interface AyahClickEvent {
    event: PointerEvent,
    ayah: Ayah
  }