import {
  Section,
  Container,
  Stack,
  Box,
  Text,
  Image,
} from "@/ui/primitives";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";

import portrait2 from "@/assets/about/about2.png";

import styles from "./About.module.css";

export default function About() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  // Kept gentle: a larger drift would break the alignment of the paragraph
  // with the bottom of the figure.
  const portraitParallax = useParallax<HTMLDivElement>({ speed: -4 });
  return (
    <Section id="about">
      <Container>

        <Stack
          className={styles.content}
          gap="xl" ref={reveal}
        >

          <Box className={styles.hero}>

            <Text
              as="h2"
              variant="sectionTitle"
              className={styles.title}
            >
              KTO SOM?
            </Text>

            <div ref={portraitParallax} className={styles.imageParallax}>
              <Image
                src={portrait2}
                alt="Filip Várnik"
                className={styles.image}
              />
            </div>

          </Box>

          <Text
            variant="body"
            className={styles.description}
          >
            Ahoj, som Filip, dizajnér vystupujúci pod menom Coffister.
            Vyštudoval som priemyselný dizajn, no dnes sa venujem najmä
            vizuálnym identitám, webdizajnu a marketingovým materiálom.

            Som skôr človek, ktorý viac počúva ako rozpráva.
            Nemám potrebu predávať sa veľkými sľubmi ani komplikovanými
            prezentáciami. Radšej nechám hovoriť svoju prácu
            a otvorenú komunikáciu.
          </Text>

        </Stack>

      </Container>
    </Section>
  );
}