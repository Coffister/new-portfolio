import type { ReactNode } from "react";

import { useCursor } from "@/providers/CursorProvider";

import Squircle from "@/ui/primitives/Squircle";
import Text from "@/ui/primitives/Text";

import { buttonRecipe } from "./recipe";
import type { ButtonSize, ButtonVariant } from "./recipe";

import styles from "./Button.module.css";

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  type?: "button" | "submit" | "reset";

  variant?: ButtonVariant;
  size?: ButtonSize;

  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",

  variant = "primary",
  size = "sm",

  disabled,
  onClick,
}: ButtonProps) {
  const recipe = buttonRecipe({
    variant,
    size,
  });

  const isLabelSize = size === "label";
  const { setVariant } = useCursor();

  return (
    <button
      type={type}
      className={`${styles.button} ${recipe.variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => {
        setVariant("pointer");
      }}
      onMouseLeave={() => {
        setVariant("default");
      }}
    >
      <Squircle radius="lg" className={styles.surface}>
        <span
          className={`${styles.content} ${recipe.size} ${
            icon && iconPosition === "right" ? styles.iconRight : ""
          }`}
        >
          {icon && iconPosition === "left" ? (
            <span className={styles.icon} aria-hidden>
              {icon}
            </span>
          ) : null}

          <Text
            as="span"
            variant="button"
            style={
              isLabelSize
                ? { fontSize: "var(--font-size-label)", lineHeight: 1.5 }
                : undefined
            }
          >
            {children}
          </Text>

          {icon && iconPosition === "right" ? (
            <span className={styles.icon} aria-hidden>
              {icon}
            </span>
          ) : null}
        </span>
      </Squircle>
    </button>
  );
}
