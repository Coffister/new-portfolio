import type { ReactNode } from "react";

import Squircle from "@/ui/primitives/Squircle";
import Text from "@/ui/primitives/Text";

import styles from "./Badge.module.css";

interface BadgeProps {
    children: ReactNode;
}

export default function Badge({
    children,
}: BadgeProps) {
    return (
        <Squircle radius="xl">

            <div className={styles.badge}>

                <Text
                    as="span"
                    variant="sectionSubtitle"
                >
                    {children}
                </Text>

            </div>

        </Squircle>
    );
}