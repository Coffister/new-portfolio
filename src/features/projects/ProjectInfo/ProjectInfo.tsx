import Stack from "@/ui/primitives/Stack";
import Text from "@/ui/primitives/Text";
import Button from "@/ui/components/Button";

import type { Project } from "../projects";

import styles from "./ProjectInfo.module.css";

interface ProjectInfoProps {
    project: Project;
    onOpen: () => void;
}

export default function ProjectInfo({
    project,
    onOpen,
}: ProjectInfoProps) {
    return (
        <Stack
            className={styles.root}
            gap="xs"
        >
            <Text
                as="h3"
                variant="cardTitle"
            >
                {project.title}
            </Text>

            <Text
                variant="body"
                className={styles.categoryText}
            >
                {project.category}
            </Text>
            <Button className={styles.infoButton} onClick={onOpen}>
                Zobraziť projekt
            </Button>
        </Stack>
    );
}