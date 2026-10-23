import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Block, BrandGuide, ColorItem, FontItem, GalleryItem } from "./types";
import { hexToRgb, inkFor, rgbToCmyk, rgbToHsl } from "./color";
import styles from "./BrandPage.module.css";

const DEFAULT_TITLES: Record<Block["type"], string> = {
  logos: "Logo",
  colors: "Farby",
  typography: "Typografia",
  gallery: "Aplikácie identity",
  text: "",
  downloads: "Na stiahnutie",
};

const titleOf = (block: Block) => block.title || DEFAULT_TITLES[block.type];

export default function BrandPage({ guide, slug }: { guide: BrandGuide; slug: string }) {
  const file = (path: string) => `/brands/${slug}/${path}`;
  const [copied, setCopied] = useState("");

  useEffect(() => {
    document.title = `${guide.name} | Brand guide`;
  }, [guide.name]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`Skopírované: ${value}`);
    } catch {
      setCopied("Kopírovanie sa nepodarilo");
    }
  };

  const theme = {
    "--bg": guide.theme?.background ?? "#F5F5F5",
    "--fg": guide.theme?.text ?? "#0C0C0C",
    "--accent": guide.theme?.accent ?? "#0099FF",
  } as CSSProperties;

  return (
    <div className={styles.page} style={theme}>
      <nav className={styles.nav} aria-label="Sekcie">
        <span className={styles.navName}>{guide.name}</span>
        <ul>
          {guide.blocks.map((block, i) => (
            <li key={i}>
              <a href={`#s${i}`}>{titleOf(block)}</a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Brand guide</p>
          <h1>{guide.name}</h1>
          {guide.intro && <p className={styles.lead}>{guide.intro}</p>}
          {guide.cover && <img className={styles.cover} src={file(guide.cover)} alt="" />}
        </header>

        {guide.blocks.map((block, i) => (
          <section key={i} id={`s${i}`} className={styles.section} aria-labelledby={`s${i}-title`}>
            <h2 id={`s${i}-title`}>{titleOf(block)}</h2>
            {block.text && <p className={styles.text}>{block.text}</p>}
            <BlockBody block={block} file={file} copy={copy} />
          </section>
        ))}
      </main>

      <footer className={styles.footer}>
        Brand identity by <a href="https://coffister.art/">Coffister</a>
      </footer>

      <p className={styles.srOnly} role="status">
        {copied}
      </p>
    </div>
  );
}

type BodyProps = { block: Block; file: (path: string) => string; copy: (value: string) => void };

function BlockBody({ block, file, copy }: BodyProps) {
  switch (block.type) {
    case "logos":
      return (
        <div className={styles.grid}>
          {block.items.map((logo) => (
            <figure key={logo.file} className={styles.logo}>
              <div className={styles[logo.background ?? "checker"]}>
                <img src={file(logo.file)} alt={logo.name} loading="lazy" />
              </div>
              <figcaption>
                {logo.name}
                <a href={file(logo.file)} download>
                  Stiahnuť
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      );
    case "colors":
      return (
        <div className={styles.grid}>
          {block.items.map((color) => (
            <Swatch key={color.name + color.hex} color={color} copy={copy} />
          ))}
        </div>
      );
    case "typography":
      return block.items.map((font) => (
        <FontSpecimen key={font.name} font={font} src={font.file && file(font.file)} />
      ));
    case "gallery":
      return <Gallery items={block.items} file={file} />;
    case "text":
      return null;
    case "downloads":
      return (
        <ul className={styles.downloads}>
          {block.items.map((item) => (
            <li key={item.file}>
              <a href={file(item.file)} download>
                <span>{item.label}</span>
                <span className={styles.muted}>
                  {item.note ?? item.file.split(".").pop()!.toUpperCase()}
                </span>
              </a>
            </li>
          ))}
        </ul>
      );
  }
}

function Swatch({ color, copy }: { color: ColorItem; copy: (value: string) => void }) {
  const rgb = hexToRgb(color.hex);
  const hsl = rgbToHsl(rgb);
  const rows: [string, string][] = [
    ["HEX", color.hex.toUpperCase()],
    ["RGB", rgb.join(", ")],
    ["HSL", `${hsl[0]}°, ${hsl[1]} %, ${hsl[2]} %`],
    ["CMYK", color.cmyk ?? `${rgbToCmyk(rgb).join(", ")} (približne)`],
  ];
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={{ background: color.hex, color: inkFor(color.hex) }}>
        {color.name}
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <button type="button" onClick={() => copy(value)} aria-label={`Kopírovať ${label} ${value}`}>
                {value}
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FontSpecimen({ font, src }: { font: FontItem; src?: string }) {
  // own family name so a brand font never clashes with the guide's UI fonts
  const family = `brand-${font.name.replace(/\W+/g, "-")}`;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;
    const face = new FontFace(family, `url(${src})`);
    face.load().then((loaded) => {
      document.fonts.add(loaded);
      setReady(true);
    }, () => {});
  }, [family, src]);

  return (
    <article className={styles.font}>
      <header>
        <h3>{font.name}</h3>
        <span className={styles.muted}>{font.role}</span>
      </header>
      <p className={styles.sample} style={ready ? { fontFamily: family } : undefined}>
        {font.sample ?? "Príliš žltučký kôň úpel ďábelské ódy. 0123456789"}
      </p>
      {font.styles && <p className={styles.muted}>Rezy: {font.styles}</p>}
      {font.license && <p className={styles.muted}>Licencia: {font.license}</p>}
    </article>
  );
}

function Gallery({ items, file }: { items: GalleryItem[]; file: (path: string) => string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const show = (i: number) => {
    setOpen(i);
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const step = (dir: number) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length));
  const current = open === null ? null : items[open];

  return (
    <>
      <div className={styles.gallery}>
        {items.map((item, i) => (
          <figure key={item.src}>
            <button type="button" onClick={() => show(i)} aria-label={`Zväčšiť: ${item.alt}`}>
              <img src={file(item.src)} alt={item.alt} loading="lazy" />
            </button>
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <dialog
        ref={dialog}
        className={styles.lightbox}
        aria-label="Detail obrázka"
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        {current && (
          <>
            <img src={file(current.src)} alt={current.alt} />
            {current.caption && <p>{current.caption}</p>}
            <div className={styles.lightboxNav}>
              <button type="button" onClick={() => step(-1)}>Predchádzajúci</button>
              <span>{open! + 1} / {items.length}</span>
              <button type="button" onClick={() => step(1)}>Ďalší</button>
              <button type="button" onClick={() => dialog.current?.close()} autoFocus>Zavrieť</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
