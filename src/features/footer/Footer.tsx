import {
  Section,
  Container,
  Box,
  Stack,
  Text,
  Image,
} from "@/ui/primitives";

import { usePrivacyModal } from "@/providers/PrivacyModalProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import TextLoop from "@/ui/effects/TextLoop";

import email from "@/assets/footer/emailupdate.svg";

import styles from "./Footer.module.css";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/coffister" },
  { label: "Linkedin", href: "https://www.linkedin.com/in/coffister/" },
  { label: "Behance", href: "https://behance.net/coffister" },
];

const LOOP_VIEWBOX = "0 0 2046.66 107.756";
const LOOP_PATH =
  "M0.409824 49.8588C78.313 50.8566 122.007 50.8566 199.91 49.8588C368.546 47.6989 462.789 29.2149 631.41 32.3588C824.035 35.9502 930.413 82.7679 1122.91 74.8588C1253.51 69.4927 1324.21 34.4042 1454.91 32.3588C1603.83 30.0282 1685.06 80.0727 1833.91 74.8588C1917.42 71.9335 2021.41 49.8588 2046.41 49.8588";

export default function Footer() {
  const { open: openPrivacyModal } = usePrivacyModal();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Section
      id="footer"
      className={styles.footer}
    >
      <div className={styles.socialsWrap}>
        <ul className={styles.socials}>
          {SOCIAL_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Box className={styles.stage}>
        <Image
          src={email}
          alt="hello@coffister.art"
          className={styles.email}
        />

        {isMobile ? (
          <TextLoop
            className={styles.textLoop}
            text="hello@coffister.art"
            shape="wave"
            curviness={70}
            speed={70}
            separator="✦"
            fontSize={26}
            fontWeight={700}
            letterSpacing={0}
            uppercase={false}
            color="#ffffff"
            ribbon
            ribbonColor="#0099FF"
            ribbonWidth={64}
          />
        ) : (
          <TextLoop
            className={styles.textLoop}
            text="hello@coffister.art"
            path={LOOP_PATH}
            viewBox={LOOP_VIEWBOX}
            speed={140}
            separator="✦"
            fontSize={22}
            fontWeight={700}
            letterSpacing={0}
            uppercase={false}
            color="#ffffff"
            ribbon
            ribbonColor="#0099FF"
            ribbonWidth={64}
          />
        )}
      </Box>

      <Container>
        <Stack gap="xs" className={styles.copyright}>
          <Text
            variant="caption"
            className={styles.copyrightText}
            style={{ fontWeight: 700 }}
          >
            © 2026 Coffister - All rights reserved
          </Text>

          <button type="button" className={styles.privacyLink} onClick={openPrivacyModal}>
            Ochrana osobných údajov
          </button>
        </Stack>
      </Container>

    </Section>
  );
}
