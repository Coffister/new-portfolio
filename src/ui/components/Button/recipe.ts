import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "label";
export type ButtonSize = "sm" | "md" | "lg" | "label";

interface ButtonRecipeProps {
    variant: ButtonVariant;
    size: ButtonSize;
}

export function buttonRecipe({
    variant,
    size,
}: ButtonRecipeProps) {
    return {
        variant: styles[variant],
        size: styles[size],
    };
}