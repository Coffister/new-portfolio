import mugImage from "@/assets/coffister-mug.webp";
import coffisterLogo from "@/assets/coffister-dark.svg";
import heroMobileVideo from "@/assets/hero/heromobile.webm";
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

function Hero() {
  // The mug still (6 MB) and the mobile video (8 MB) never show at the same
  // breakpoint — only mount the one this viewport actually renders.
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const mugParallax = useParallax<HTMLImageElement>({
    speed: -14,
    trigger: reveal,
    start: "top top",
    end: "bottom top",
  });
  const mugVideoParallax = useParallax<HTMLVideoElement>({
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
    <Section ref={reveal} className={styles.hero}>
      <Box className={styles.cover}>
        <img
          className={styles.logo}
          src={coffisterLogo}
          alt=""
          aria-hidden="true"
        />


        {isMobile ? (
          <video
            ref={mugVideoParallax}
            className={styles.mugVideo}
            src={heroMobileVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            ref={mugParallax}
            className={styles.mug}
            src={mugImage}
            alt="Coffister hrnček"
          />
        )}
      </Box>

      <Container className={styles.intro}>
        <Stack ref={contentParallax} className={styles.content} gap="xl">
          <Text as="h1" variant="sectionSubtitle" className={styles.heading}>
            Pomáham značkám komunikovať jasnejšie pomocou vizuálnej identity,
            brandingu a funkčného dizajnu.
          </Text>

          <Stack className={styles.actions} gap="sm">
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
