import type { ReactNode } from "react";

import Grain from "@/ui/effects/Grain";

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

            <Grain />

        </div>
    );
}