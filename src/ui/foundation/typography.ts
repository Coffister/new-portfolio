import { fontFamily } from "./fontFamily";
import { fontSize } from "./fontSize";
import { fontWeight } from "./fontWeight";

export const typography = {
    sectionTitle: {
        fontFamily: fontFamily.display,
        fontSize: fontSize.sectionTitle,
        fontWeight: fontWeight.bold,
        lineHeight: 1,
    },

    sectionSubtitle: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.sectionSubtitle,
        fontWeight: fontWeight.medium,
        lineHeight: 1.4,
    },

    cardTitle: {
        fontFamily: fontFamily.display,
        fontSize: fontSize.cardTitle,
        fontWeight: fontWeight.bold,
        lineHeight: 1.1,
    },

    body: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.body,
        fontWeight: fontWeight.regular,
        lineHeight: 1.6,
    },

    button: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        lineHeight: 1,
    },

    caption: {
        fontFamily: fontFamily.body,
        fontSize: fontSize.caption,
        fontWeight: fontWeight.regular,
        lineHeight: 1.4,
    },
} as const;

export type Typography = keyof typeof typography;