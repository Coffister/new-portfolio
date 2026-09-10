import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { spacing } from "@/ui/foundation/spacing";

type SpacingValue = keyof typeof spacing;

export interface StackProps {
    children?: ReactNode;

    direction?: "row" | "column";
    gap?: SpacingValue;

    align?: CSSProperties["alignItems"];
    justify?: CSSProperties["justifyContent"];
    wrap?: CSSProperties["flexWrap"];

    className?: string;
    style?: CSSProperties;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack({
    children,

    direction = "column",
    gap,

    align,
    justify,
    wrap,

    className,
    style: customStyle,
}, ref) {
    const style: CSSProperties = {
        display: "flex",
        flexDirection: direction,

        gap: gap ? spacing[gap] : undefined,

        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,

        ...customStyle,
    };

    return (
        <div ref={ref} className={className} style={style}>
            {children}
        </div>
    );
});

export default Stack;