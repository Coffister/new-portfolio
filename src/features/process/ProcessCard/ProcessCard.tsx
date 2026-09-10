import { Box, Image, Stack, Text } from "@/ui/primitives";
import Card from "@/ui/components/Card";

import styles from "./ProcessCard.module.css";

interface ProcessCardProps {
  image: string;

  title: string;
  description: string;
  number: string;

  imageClassName: string;
}

export default function ProcessCard({
  number,
  title,
  description,
  image,
  imageClassName,
}: ProcessCardProps) {
  return (
    <Box className={styles.wrapper}>
      <Card className={styles.processCard}>
        <Box className={styles.card}>
          <Box className={styles.topPanel} />

          <Box className={styles.content}>
            <Text className={styles.number}>{number}</Text>

            <Stack gap="xs">
              <Text as="h3" variant="cardTitle">
                {title}
              </Text>

              <Text as="p" variant="body">
                {description}
              </Text>
            </Stack>
          </Box>
        </Box>
      </Card>

      <Image
        src={image}
        alt=""
        className={`${styles.image} ${styles[imageClassName]}`}
      />
    </Box>
  );
}
