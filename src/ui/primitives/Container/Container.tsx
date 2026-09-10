import type { CSSProperties, ReactNode } from "react";
import Box from "../Box";
import { layout } from "@/ui/foundation/layout";

export interface ContainerProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

export default function Container({
    children,
    className,
    style,
}: ContainerProps) {
    return (
        <Box
            className={className}
            style={{
                width: "100%",
                maxWidth: layout.container.maxWidth,
                marginInline: "auto",
                paddingInline: "clamp(16px, 4vw, 32px)",
                ...style,
            }}
        >
            {children}
        </Box>
    );
}