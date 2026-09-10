export const layout = {
    container: {
        maxWidth: 1440,
        paddingInline: 32,
    },
} as const;

export type Layout = typeof layout;