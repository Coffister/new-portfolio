import {
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";

import { getSvgPath } from "figma-squircle";


type Radius = "sm" | "md" | "lg" | "xl" | number;


const radiusMap = {
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
};


interface SquircleProps {
    children: ReactNode;
    radius?: Radius;
    className?: string;
}


export default function Squircle({
    children,
    radius = "md",
    className,
}: SquircleProps) {

    const id = useId();

    const ref = useRef<HTMLDivElement>(null);

    const [clip, setClip] = useState({
        path: "",
        width: 0,
        height: 0,
    });


    const cornerRadius =
        typeof radius === "number"
            ? radius
            : radiusMap[radius];


    useEffect(() => {

        if (!ref.current) return;


        const update = () => {

            const rect =
                ref.current!.getBoundingClientRect();


            if (!rect.width || !rect.height) return;


            const path = getSvgPath({
                width: rect.width,
                height: rect.height,
                cornerRadius,
                cornerSmoothing: 0.8,
            });


            setClip({
                path,
                width: rect.width,
                height: rect.height,
            });

        };


        update();


        const observer = new ResizeObserver(update);

        observer.observe(ref.current);


        return () => observer.disconnect();

    }, [cornerRadius]);


    return (
        <div
            ref={ref}
            className={className}
            style={{
                clipPath: `url(#${id})`,
            }}
        >

            <svg
                width="0"
                height="0"
                style={{
                    position: "absolute",
                }}
            >
                <defs>
                    <clipPath id={id}>
                        <path d={clip.path} />
                    </clipPath>
                </defs>
            </svg>


            {children}

        </div>
    );
}