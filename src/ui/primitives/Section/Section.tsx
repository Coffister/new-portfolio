import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import styles from "./Section.module.css";

interface SectionProps {
    children: ReactNode;

    className?: string;
    style?: CSSProperties;

    id?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(function Section({
    children,
    className,
    style,
    id,
}, ref) {
    return (
        <section
            ref={ref}
            id={id}
            className={`${styles.section} ${className ?? ""}`}
            style={style}
        >
            {children}
        </section>
    );
});

export default Section;