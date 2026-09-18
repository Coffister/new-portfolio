export const fontSize = {
    label: "clamp(11px, 0.75vw, 12px)",
    caption: "clamp(14px, 1.1vw, 16px)",
    body: "clamp(17px, 1.4vw, 20px)",
    sectionSubtitle: "clamp(20px, 1.7vw, 24px)",
    cardTitle: "clamp(26px, 2.25vw, 32px)",
    sectionTitle: "clamp(52px, 6.5vw, 96px)",
    heroTitle: "clamp(48px, 8vw, 128px)",
} as const;

export type FontSize = keyof typeof fontSize;