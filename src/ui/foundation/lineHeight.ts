export const lineHeight = {
    tight: 1,
    snug: 1.1,
    normal: 1.4,
    relaxed: 1.6,
} as const;

export type LineHeight = keyof typeof lineHeight;