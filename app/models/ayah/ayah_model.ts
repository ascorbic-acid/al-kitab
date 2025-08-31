export interface AyahWords {
    word: string,
    hidden?: boolean
}

export interface Ayah {
    surah_number_fk: number,
    number: number,
    hidden?: boolean,
    text: string,
    imlaei_simple_text: string,
    qpc_tajweed_text: string,
    ayah_words: AyahWords[],
    number_in_surah: number,
    juz: number,
    manzil: number,
    page: number,
    ruku: number,
    hizb_quarter: number,
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