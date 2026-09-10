import type {
    CSSProperties,
    ElementType,
    ReactNode,
} from "react";

import { typography } from "@/ui/foundation/typography";
import type { Typography } from "@/ui/foundation/typography";

export interface TextProps {
    as?: ElementType;
    variant?: Typography;

    children: ReactNode;

    className?: string;
    style?: CSSProperties;
}

export default function Text({
    as: Component = "span",
    variant = "body",

    children,

    className,
    style,
}: TextProps) {
    return (
        <Component
            className={className}
            style={{
                ...typography[variant],
                ...style,
            }}
        >
            {children}
        </Component>
    );
}