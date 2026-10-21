import type { MouseEvent } from "react";
import heroBean from "@/assets/hero/hero-bean.webp";
import heroHand from "@/assets/hero/hero-hand.webp";
import {
  Box,
  Section,
  Container,
  Text,
  Stack,
} from "@/ui/primitives";
import { LinkButton } from "@/ui/components";
import SplitText from "@/ui/effects/SplitText";
import HeroIcons from "./HeroIcons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEntranceReveal } from "@/hooks/useEntranceReveal";
import { useParallax } from "@/hooks/useParallax";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { scrollToSection } from "@/lib/scroll";
import styles from "./Hero.module.css";

// Shared by the desktop and mobile hero so the copy stays in sync.
const HERO_TITLE = "Vy poviete čo.\nJa premyslím ako.";
const HERO_SUBTITLE =
  "Tvorím weby na mieru, vizuálne identity a grafiku, ktoré spájajú vašu predstavu s tým, čo vaša značka skutočne potrebuje.";

function scrollTo(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(id);
  };
}

// Shared by both heroes: the enquiry leads, the portfolio follows.
function HeroActions({ ghostClassName }: { ghostClassName?: string }) {
  return (
    <>
      <LinkButton href="#pricing" size="sm" onClick={scrollTo("pricing")}>
        Chcem ponuku
      </LinkButton>

      <LinkButton
        href="#projects"
        variant="secondary"
        contentClassName={ghostClassName}
        onClick={scrollTo("projects")}
      >
        Moja práca
      </LinkButton>
    </>
  );
}

function HeroMobile() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const mugMobileParallax = useParallax<HTMLDivElement>({
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
        <div ref={mugMobileParallax} className={styles.heroArt} role="img" aria-label="Coffister zrnková kompozícia">
          <img className={styles.heroHand} src={heroHand} alt="" width={614} height={877} />
          <img className={styles.heroBean} src={heroBean} alt="" width={458} height={369} />
        </div>
      </Box>

      <Container className={styles.intro}>
        <Stack ref={contentParallax} className={styles.legacyContent} gap="xl">
          {/* Same copy as the desktop hero, one sentence per line. */}
          <Stack gap="md" align="center">
            <h1 className={`${styles.heading} ${styles.legacyHeading}`}>
              {HERO_TITLE.split("\n").map((line) => (
                <span key={line} className={styles.legacyHeadingLine}>
                  {line}
                </span>
              ))}
            </h1>
            <Text as="p" variant="sectionSubtitle" className={styles.legacySubtitle}>
              {HERO_SUBTITLE}
            </Text>
          </Stack>

          <Stack className={styles.legacyActions} gap="sm">
            <HeroActions />
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
            text={HERO_TITLE}
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
              {HERO_SUBTITLE}
            </Text>

            <Stack direction="row" align="center" justify="center" className={styles.actions} gap="md">
              <HeroActions ghostClassName={styles.ghostNoTrailingPadding} />
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}

function Hero() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // null = viewport not known yet (prerender / hydration): render both, CSS shows one.
  return (
    <>
      {isMobile !== false && <div className="only-mobile"><HeroMobile /></div>}
      {isMobile !== true && <div className="only-desktop"><HeroDesktop /></div>}
    </>
  );
}

export default Hero;
