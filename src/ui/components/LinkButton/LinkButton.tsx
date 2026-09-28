import type { MouseEvent, ReactNode } from "react";

import { useCursor } from "@/providers/CursorProvider";

import Squircle from "@/ui/primitives/Squircle";
import Text from "@/ui/primitives/Text";

import styles from "../Button/Button.module.css";
import { buttonRecipe } from "../Button/recipe";

import type { ButtonSize, ButtonVariant } from "../Button/recipe";

interface LinkButtonProps {
  children: ReactNode;

  href: string;

  variant?: ButtonVariant;
  size?: ButtonSize;

  target?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;

  // Extra class on the inner content box (the one that actually carries
  // the padding) — e.g. to drop the invisible padding a "ghost" variant
  // keeps on its unused side when it sits next to another button and
  // their pair needs to be optically centered as a group.
  contentClassName?: string;
}

export default function LinkButton({
  children,
  href,

  icon,
  iconPosition = "left",

  variant = "primary",
  size = "md",

  target,
  onClick,
  contentClassName,
}: LinkButtonProps) {
  const recipe = buttonRecipe({
    variant,
    size,
  });

  const { setVariant } = useCursor();

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={`${styles.button} ${recipe.variant}`}
      onMouseEnter={() => {
        setVariant("pointer");
      }}
      onMouseLeave={() => {
        setVariant("default");
      }}
    >
      <Squircle radius="lg">
        <span
          className={`${styles.content} ${recipe.size} ${
            icon && iconPosition === "right" ? styles.iconRight : ""
          } ${contentClassName ?? ""}`}
        >
          {icon && iconPosition === "left" ? (
            <span className={styles.icon} aria-hidden>
              {icon}
            </span>
          ) : null}

          <Text as="span" variant="button">
            {children}
          </Text>

          {icon && iconPosition === "right" ? (
            <span className={styles.icon} aria-hidden>
              {icon}
            </span>
          ) : null}
        </span>
      </Squircle>
    </a>
  );
}
