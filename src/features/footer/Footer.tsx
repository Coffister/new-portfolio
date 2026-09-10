import {
  Section,
  Container,
  Stack,
  Box,
  Text,
  Image,
} from "@/ui/primitives";

import FooterSignature from "./FooterSignature";

import logo from "@/assets/coffister.svg";
import email from "@/assets/footer/email.svg";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <Section
      id="footer"
      className={styles.footer}
    >
      <Container>

        <Box className={styles.inner}>

          <Box className={styles.top}>

            <Stack
              className={styles.left}
              gap="xl"
            >
              <Image
                src={logo}
                alt="Coffister"
                className={styles.logo}
              />

              <Stack gap="md">

                <Text
                  as="h3"
                  variant="cardTitle"
                  className={styles.title}
                >
                  Vaša značka si zaslúži viac
                  <br />
                  ako AI vizuál
                </Text>

                <Text
                  variant="caption"
                  className={styles.description}
                >
                  Nemám nič proti AI. Sám ju používam každý deň.
                  Ale nie preto, aby robila moju prácu za mňa.

                  Používam ju preto, aby som robil svoju prácu lepšie.

                  Rozdiel medzi týmito dvoma prístupmi je často presne to,
                  čo ľudia na vašej značke cítia.
                </Text>

              </Stack>

              <FooterSignature />

            </Stack>

            <Text
              variant="body"
              className={styles.copyright}
            >
              © 2026 Coffister. All rights reserved.
            </Text>

          </Box>

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