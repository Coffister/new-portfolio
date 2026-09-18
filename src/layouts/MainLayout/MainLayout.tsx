import type { ReactNode } from "react";

import Noise from "@/ui/effects/Noise";

import styles from "./MainLayout.module.css";


interface MainLayoutProps {
    children: ReactNode;
}


export default function MainLayout({
    children,
}: MainLayoutProps) {

    return (
        <div className={styles.layout}>

            <main>
                {children}
            </main>

            <Noise patternSize={370} patternScaleX={1} patternScaleY={1} patternRefreshInterval={2} patternAlpha={45} />

        </div>
    );
}