import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { getSvgPath } from "figma-squircle";

import { radius as radiusTokens } from "@/ui/foundation/radius";
import type { Radius } from "@/ui/foundation/radius";
 
interface SquircleProps {
    children: ReactNode;
    radius?: Radius | number;
    className?: string;
    style?: CSSProperties;
}

export default function Squircle({
    children,
    radius = "md",
    className,
    style,
}: SquircleProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgPath, setSvgPath] = useState("");

    const cornerRadius =
        typeof radius === "number"
            ? radius
            : radiusTokens[radius];

    useEffect(() => {
        if (!containerRef.current) return;

        const updatePath = () => {
            if (!containerRef.current) return;

            const { width, height } =
                containerRef.current.getBoundingClientRect();

            setSvgPath(
                getSvgPath({
                    width,
                    height,
                    cornerRadius,
                    cornerSmoothing: 0.8,
                })
            );
        };

        updatePath();

        const observer = new ResizeObserver(updatePath);

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [cornerRadius]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                clipPath: svgPath ? `path('${svgPath}')` : undefined,
                ...style,
            }}
        >
            {children}
        </div>
    );
}