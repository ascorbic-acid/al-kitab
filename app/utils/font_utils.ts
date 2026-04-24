export const FONT_SIZE_MAP: Record<number, { text: string; num: number }> = {
    15: { text: "1.0rem", num: 10 },
    20: { text: "1.3rem", num: 11 },
    25: { text: "1.5rem", num: 11 },
    50: { text: "1.8rem", num: 13 },
    75: { text: "2.2rem", num: 15 },
    100: { text: "2.4rem", num: 18 },
};

export const getAyahFontSize = (size: number) => FONT_SIZE_MAP[size]?.text || "1.8rem";
export const getAyahNumFontSize = (size: number) => FONT_SIZE_MAP[size]?.num || 13;
