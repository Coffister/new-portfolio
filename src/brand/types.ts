// Shape of public/brands/<slug>/guide.json. File paths are relative to
// public/brands/<slug>/ and checked by scripts/check-brands.mjs at build.

export interface BrandGuide {
  name: string;
  intro?: string;
  /** look of the guide itself, not the brand palette */
  theme?: { background?: string; text?: string; accent?: string };
  /** cover image shown under the intro */
  cover?: string;
  blocks: Block[];
}

export type Block =
  | { type: "logos"; title?: string; text?: string; items: LogoItem[] }
  | { type: "colors"; title?: string; text?: string; items: ColorItem[] }
  | { type: "typography"; title?: string; text?: string; items: FontItem[] }
  | { type: "gallery"; title?: string; text?: string; items: GalleryItem[] }
  | { type: "text"; title: string; text: string }
  | { type: "downloads"; title?: string; text?: string; items: DownloadItem[] };

export interface LogoItem {
  name: string;
  file: string;
  background?: "light" | "dark" | "checker";
}

export interface ColorItem {
  name: string;
  hex: string;
  /** exact CMYK from print specs; otherwise computed and marked approximate */
  cmyk?: string;
}

export interface FontItem {
  name: string;
  role: string;
  styles?: string;
  sample?: string;
  /** woff2 for the preview; only when the licence allows web use */
  file?: string;
  license?: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface DownloadItem {
  label: string;
  file: string;
  note?: string;
}
