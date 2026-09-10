export const spacing = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    "2xl": 48,
    "3xl": 64,
} as const;

export type Spacing = keyof typeof spacing;