export interface AyahSearchResult {
    surah: {
        name: string,
        number: number
    },
    ayah: {
        numberInSurah: number,
        text: string
    }
}