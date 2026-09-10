import { Image, Text } from "@/ui/primitives";

import avatar from "@/assets/footer/avatar.png";

import styles from "./FooterSignature.module.css";

export default function FooterSignature() {
  return (
    <div className={styles.signature}>

      <Text
        as="span"
        variant="body"
      >
        Made with ♥ by
      </Text>

      <Image
        src={avatar}
        alt="Filip Várnik"
        className={styles.avatar}
      />

      <Text
        as="span"
        variant="body"
      >
        Filip "Coffister" Várnik
      </Text>

    </div>
  );
}
