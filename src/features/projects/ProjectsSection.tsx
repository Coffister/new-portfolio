import { useState } from "react";

import { Box, Container, Section, Stack, Text } from "@/ui/primitives";
import { Badge } from "@/ui/components";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./ProjectsSection.module.css";

import ProjectLogo from "./ProjectLogo/ProjectLogo";
import ProjectInfo from "./ProjectInfo/ProjectInfo";
import ProjectModal from "./ProjectModal/ProjectModal";
import LogoOverlay from "./LogoOverlay/LogoOverlay";

import PortfolioGallery from "@/features/portfolio-gallery/PortfolioGallery";

import { projects } from "./projects";
import type { Project } from "./projects";

export default function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });

  return (
    <>
    <Section id="projects" className={styles.section}>
      <Container >
        <Stack  ref={reveal} className={styles.content} gap="md">
          <Text as="h2" variant="sectionTitle" className={styles.heading}>
            BRANDING, KTORÝ
            <br />
            NEKONČÍ PRI LOGU
          </Text>

          <Box className={styles.subtitle}>
            <Text as="span" variant="sectionSubtitle">
              Projekty plné
            </Text>

            <Badge>značiek</Badge>
            <Text as="span" variant="sectionSubtitle">
              ,
            </Text>
            <Badge>moderných webov</Badge>
            <Text as="span" variant="sectionSubtitle">
              a
            </Text>
            <Badge>digitálnych riešení</Badge>
            <Text as="span" variant="sectionSubtitle">
              , ktoré fungujú.
            </Text>
          </Box>

          <div className={styles.projectPreview}>
            <Box className={styles.galleryWrapper}>
              <PortfolioGallery
                items={projects}
                onActiveChange={setActiveIndex}
              />

              <LogoOverlay>
                <ProjectLogo project={projects[activeIndex]} />
              </LogoOverlay>
            </Box>

              <ProjectInfo onOpen={() => setSelectedProject(projects[activeIndex])} project={projects[activeIndex]} />
          </div>
        </Stack>
      </Container>
    </Section>
    <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
