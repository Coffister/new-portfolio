import {
  Section,
  Container,
  Box,
  Stack,
  Text,
  Image,
} from "@/ui/primitives";

import { usePrivacyModal } from "@/providers/PrivacyModalProvider";
import FooterTextLoop from "./FooterTextLoop";

import logo from "@/assets/coffister-dark.svg";
import email from "@/assets/footer/emailupdate.svg";

import styles from "./Footer.module.css";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/coffister" },
  { label: "Linkedin", href: "https://www.linkedin.com/in/coffister/" },
  { label: "Behance", href: "https://behance.net/coffister" },
];

export default function Footer() {
  const { open: openPrivacyModal } = usePrivacyModal();

  return (
    <Section
      id="footer"
      className={styles.footer}
    >
      <Container>
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
      </Container>

      <Box className={styles.stage}>
        <Image
          src={email}
          alt="hello@coffister.art"
          className={styles.email}
        />

        <FooterTextLoop />
      </Box>

      <Container>
        <Stack gap="xs" className={styles.copyright}>
          <Text variant="body" className={styles.copyrightText}>
            © 2026
            <Image
              src={logo}
              alt="Coffister"
              className={styles.copyrightLogo}
            />
            All rights reserved.
          </Text>

          <button type="button" className={styles.privacyLink} onClick={openPrivacyModal}>
            Ochrana osobných údajov
          </button>
        </Stack>
      </Container>

    </Section>
  );
}
