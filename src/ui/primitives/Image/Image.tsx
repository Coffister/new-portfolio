import type { ImgHTMLAttributes } from "react";

import styles from "./Image.module.css";


interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement> {
    ratio?: string;
}


export default function Image({
    ratio,
    className,
    ...props
}: ImageProps) {

    return (
        <img
            className={`${styles.image} ${className ?? ""}`}
            style={{
                aspectRatio: ratio,
            }}
            loading="lazy"
            {...props}
        />
    );
}