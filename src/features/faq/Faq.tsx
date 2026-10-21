import { useState } from "react";

import { qna } from "./qna";
import FaqItem from "./FaqItem";

import { Box, Container, Section, Stack, Text } from "@/ui/primitives";
import Button from "@/ui/components/Button";

import styles from "./Faq.module.css";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { scrollToSection } from "@/lib/scroll";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const customItem = qna.find((item) => item.isCustom);
  const regularQna = qna.filter((item) => !item.isCustom);
  const middle = Math.ceil(regularQna.length / 2);

  const leftColumn = regularQna.slice(0, middle);
  const rightColumn = regularQna.slice(middle);

  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const leftColumnReveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.16 });
  const rightColumnReveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.16 });
  const ctaReveal = useScrollReveal<HTMLDivElement>({
    target: "children",
    stagger: 0.16,
    start: "top bottom",
    end: "top 60%",
  });

  return (
    <Section id="faq">
      <Container>
        <Stack ref={reveal} className={styles.content} gap="3xl">
          <Stack className={styles.heading} gap="md">
            <Text as="h2" variant="sectionTitle">
              FAQ
            </Text>

            <Text variant="sectionSubtitle">
              Odpovede na otázky, ktoré väčšina klientov rieši ešte pred
              začiatkom spolupráce.
            </Text>
          </Stack>

          <Box className={styles.columns}>
            <Stack ref={leftColumnReveal} className={styles.column} gap="md">
              {leftColumn.map((item, index) => (
                <FaqItem
                  key={item.question}
                  {...item}
                  isOpen={openIndex === index}
                  onToggle={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                />
              ))}
            </Stack>

            <Stack ref={rightColumnReveal} className={styles.column} gap="md">
              {rightColumn.map((item, index) => (
                <FaqItem
                  key={item.question}
                  {...item}
                  isOpen={openIndex === middle + index}
                  onToggle={() =>
                    setOpenIndex(
                      openIndex === middle + index ? null : middle + index,
                    )
                  }
                />
              ))}
            </Stack>

            {customItem && (
              <Box id="faq-question" className={styles.customQuestion}>
                <FaqItem
                  key={customItem.question}
                  {...customItem}
                  isOpen={openIndex === regularQna.length}
                  onToggle={() =>
                    setOpenIndex(
                      openIndex === regularQna.length
                        ? null
                        : regularQna.length,
                    )
                  }
                />
              </Box>
            )}
          </Box>

          <Stack ref={ctaReveal} className={styles.cta} gap="md">
            <Text as="h3" variant="cardTitle">
              Máte jasnejšiu predstavu?
            </Text>

            <Text variant="body">
              Vyberte si balík v cenníku a pošlite nezáväzný dopyt. Do 24
              hodín sa vám ozvem s ďalším postupom.
            </Text>

            <Button onClick={() => scrollToSection("pricing")}>
              Chcem ponuku
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
