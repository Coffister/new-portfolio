import {
  Section,
  Container,
  Text,
  Stack,
} from "@/ui/primitives";
import { Button, LinkButton } from "@/ui/components";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { scrollToSection } from "@/lib/scroll";
import styles from "./Hero.module.css";

function Hero() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });

  return (
    <Section className={styles.hero}>
      <Container>
        <Stack ref={reveal} className={styles.content} gap="xl">
          <Text as="h1" variant="heroTitle" className={styles.heading}>
            Vaša značka si zaslúži viac než AI vizuál
          </Text>

          <Text variant="sectionSubtitle" className={styles.subtitle}>
            Branding a weby s dušou. Pretože za každou značkou by mali byť ľudia.
          </Text>

          <Stack direction="row" align="center" className={styles.actions} gap="md">
            <Button onClick={() => scrollToSection("projects")}>Pozrieť projekty</Button>

            <LinkButton
              href="#estimate"
              variant="secondary"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("estimate");
              }}
            >
              Nezáväzný kontakt
            </LinkButton>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}

export default Hero;
