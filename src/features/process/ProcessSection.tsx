import { Box, Container, Section, Stack, Text } from "@/ui/primitives";
import styles from "./ProcessSection.module.css";

import { useScrollReveal } from "@/hooks/useScrollReveal";

import ProcessCard from "./ProcessCard/ProcessCard";
import { processSteps } from "./process";

export default function ProcessSection() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  return (
    <Section id="process" className={styles.section}>
      <Container>
        <Stack ref={reveal} className={styles.content} gap="xl">
          <Text as="h2" variant="sectionTitle" className={styles.heading}>
            SPOLUPRÁCA V
            <br />
            TROCH KROKOCH
          </Text>
          <Text as="p" variant="sectionSubtitle" className={styles.subtitle}>
            Bez zbytočných komplikácií. Od prvého kontaktu až po finálne
            odovzdanie vás prevediem celým procesom.
          </Text>

          <Box className={styles.cards}>
            {processSteps.map((step) => (
              <Box key={step.number} className={styles.cardItem}>
                <ProcessCard {...step} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </Section>
  );
}
