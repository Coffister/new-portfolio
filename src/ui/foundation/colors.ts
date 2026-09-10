export const colors = {
    background: {
        primary: "#F5F5F5",
    },

    text: {
        primary: "#0C0C0C",
        secondary: "#F5F5F5",
        muted: "#999999",
        inverse: "#FFFFFF",
    },

    surface: {
        primary: "#0C0C0C",
        secondary: "#F5F5F5",
    },

    border: {
        primary: "#FFFFFF",
    },

    accent: {
        primary: "#0099FF",
        secondary: "#F8513C",
    },
} as const;

export type Colors = typeof colors;