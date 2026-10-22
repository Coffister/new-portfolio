import { useEffect, useState } from "react";

import { qna } from "./qna";
import FaqItem from "./FaqItem";

import { Box, Container, Section, Stack, Text } from "@/ui/primitives";
import Button from "@/ui/components/Button";

import styles from "./Faq.module.css";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getLenis, scrollToSection } from "@/lib/scroll";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const customItem = qna.find((item) => item.isCustom);
  const regularQna = qna.filter((item) => !item.isCustom);
  const middle = Math.ceil(regularQna.length / 2);

  const leftColumn = regularQna.slice(0, middle);
  const rightColumn = regularQna.slice(middle);
  // With an odd number of questions the right column is one short; the own
  // question takes that slot instead of a centred row of its own.
  const customFillsGap = regularQna.length % 2 === 1;

  const customQuestion = customItem && (
    <FaqItem
      key={customItem.question}
      {...customItem}
      isOpen={openIndex === regularQna.length}
      onToggle={() =>
        setOpenIndex(openIndex === regularQna.length ? null : regularQna.length)
      }
    />
  );

  // "Opýtajte sa ma" under the price list: open the own question and bring it into view.
  useEffect(
    () =>
      onAskQuestion(() => {
        setOpenIndex(regularQna.length);
        const target = document.getElementById("faq-question");
        if (!target) return;
        // offsetTop ignores the scroll-reveal transforms, which push the
        // measured box down while the items are still animating in
        let top = 0;
        for (let el: HTMLElement | null = target; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
        const y = top - 160;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y);
        else window.scrollTo({ top: y, behavior: "smooth" });
      }),
    [regularQna.length],
  );

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
              {customItem && customFillsGap && <Box id="faq-question">{customQuestion}</Box>}
            </Stack>

            {customItem && !customFillsGap && (
              <Box id="faq-question" className={styles.customQuestion}>
                {customQuestion}
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

const ASK_QUESTION_EVENT = "faq:ask";

/** Scrolls to the FAQ's own-question form and opens it. */
export function askQuestion() {
  window.dispatchEvent(new Event(ASK_QUESTION_EVENT));
}

function onAskQuestion(handler: () => void) {
  window.addEventListener(ASK_QUESTION_EVENT, handler);
  return () => window.removeEventListener(ASK_QUESTION_EVENT, handler);
}
