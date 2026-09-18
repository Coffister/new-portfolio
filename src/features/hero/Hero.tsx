import heroMobileImage from "@/assets/hero/heromobile.webp";
import {
  Box,
  Section,
  Container,
  Text,
  Stack,
} from "@/ui/primitives";
import { Button, LinkButton } from "@/ui/components";
import SplitText from "@/ui/effects/SplitText";
import HeroIcons from "./HeroIcons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEntranceReveal } from "@/hooks/useEntranceReveal";
import { useParallax } from "@/hooks/useParallax";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { scrollToSection } from "@/lib/scroll";
import styles from "./Hero.module.css";

function HeroMobile() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const mugMobileParallax = useParallax<HTMLImageElement>({
    speed: -14,
    trigger: reveal,
    start: "top top",
    end: "bottom top",
  });
  const contentParallax = useParallax<HTMLDivElement>({
    speed: 10,
    trigger: reveal,
    start: "top top",
    end: "bottom top",
  });

  return (
    <Section ref={reveal} className={styles.heroLegacy}>
      <Box className={styles.cover}>
        <img
          ref={mugMobileParallax}
          className={styles.mugVideo}
          src={heroMobileImage}
          alt="Coffister zrnková kompozícia"
        />
      </Box>

      <Container className={styles.intro}>
        <Stack ref={contentParallax} className={styles.legacyContent} gap="xl">
          <Text as="h1" variant="sectionSubtitle" className={styles.legacyHeading}>
            Pomáham značkám komunikovať jasnejšie pomocou vizuálnej identity,
            brandingu a funkčného dizajnu.
          </Text>

          <Stack className={styles.legacyActions} gap="sm">
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

function HeroDesktop() {
  // The heading animates itself, letter by letter, via SplitText — running
  // useEntranceReveal on it too would fade/blur the whole block while its
  // characters animate underneath. Everything below it still uses the plain
  // fade/rise, delayed to pick up after the split text is mostly done.
  const reveal = useEntranceReveal<HTMLDivElement>({
    target: "children",
    y: 32,
    stagger: 0.15,
    delay: 0.6,
  });

  return (
    <Section className={styles.hero}>
      <HeroIcons />

      <Container>
        <Stack className={styles.content} gap="xl">
          <SplitText
            tag="h1"
            text="Vaša značka si zaslúži viac než AI vizuál"
            className={styles.heading}
            splitType="chars"
            delay={20}
            duration={0.6}
            ease="power3.out"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
          />

          <Stack ref={reveal} gap="xl">
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
        </Stack>
      </Container>
    </Section>
  );
}

function Hero() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? <HeroMobile /> : <HeroDesktop />;
}

export default Hero;
