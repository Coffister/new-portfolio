import heroMobileImage from "@/assets/hero/heromobile.webp";
import {
  Box,
  Section,
  Container,
  Text,
  Stack,
} from "@/ui/primitives";
import { Button, LinkButton } from "@/ui/components";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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

function Hero() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? <HeroMobile /> : <HeroDesktop />;
}

export default Hero;
