import Image from "@/ui/primitives/Image";

import type { Project } from "../projects";

import styles from "./ProjectLogo.module.css";

interface ProjectLogoProps {
    project: Project;
}

export default function ProjectLogo({
    project,
}: ProjectLogoProps) {
    return (
        <Image
            className={styles.logo}
            src={project.logo}
            alt={project.title}
        />
    );
}