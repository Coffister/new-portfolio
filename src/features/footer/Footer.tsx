import {
  Section,
  Container,
  Box,
  Stack,
  Text,
  Image,
} from "@/ui/primitives";

import { usePrivacyModal } from "@/providers/PrivacyModalProvider";

import logo from "@/assets/coffister.svg";
import email from "@/assets/footer/email.svg";

import styles from "./Footer.module.css";

export default function Footer() {
  const { open: openPrivacyModal } = usePrivacyModal();

  return (
    <Section
      id="footer"
      className={styles.footer}
    >
      <Container>

        <Box className={styles.inner}>

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

        </Box>

      </Container>

      <Image
        src={email}
        alt=""
        className={styles.email}
      />

    </Section>
  );
}