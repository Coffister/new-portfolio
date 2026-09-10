export const fontFamily = {
    display: "Bricolage Grotesque",
    body: "DM Sans",
} as const;

export type FontFamily = keyof typeof fontFamily;