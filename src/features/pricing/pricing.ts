import type { Icon } from "@phosphor-icons/react";
import {
  Binoculars,
  Brain,
  Cards,
  ChartLineUp,
  Code,
  Crop,
  Database,
  DeviceMobile,
  DeviceMobileCamera,
  DownloadSimple,
  Envelope,
  FadersHorizontal,
  FileArrowDown,
  FileImage,
  Files,
  ImageSquare,
  Images,
  Layout,
  PaintBrush,
  Palette,
  PaperPlaneTilt,
  PenNib,
  Printer,
  RocketLaunch,
  SealCheck,
  Shapes,
  Slideshow,
  SquaresFour,
  Stack,
  Swatches,
  TextAa,
} from "@phosphor-icons/react";

export interface PricingFeature {
  icon: Icon;
  label: string;
}

export interface PricingPlan {
  /** stable id, sent with the enquiry */
  id: string;
  title: string;
  description: string;
  /** starting price in €; null = priced individually */
  priceFrom: number | null;
  featured?: boolean;
  /** CTA label; defaults to "Začať budovať projekt" */
  cta?: string;
  features: PricingFeature[];
}

export interface AddOn {
  name: string;
  description: string;
  /** starting price in €, always shown as "od" */
  priceFrom: number;
}

// Single source of add-on prices; tabs reference them by id.
export const addOns = {
  "business-card": {
    name: "Vizitka",
    description: "Návrh vizitky pripravený na tlač.",
    priceFrom: 60,
  },
  "identity-application": {
    name: "Ďalšia aplikácia identity",
    description: "Identita prenesená na ďalší materiál značky.",
    priceFrom: 50,
  },
  "marketing-visual": {
    name: "Ďalší marketingový vizuál",
    description: "Ďalší vizuál v rovnakom štýle.",
    priceFrom: 50,
  },
  "format-adaptation": {
    name: "Adaptácia do ďalšieho formátu",
    description: "Úprava hotového vizuálu na iný rozmer, cena za formát.",
    priceFrom: 15,
  },
  "logo-vectorization": {
    name: "Vektorizácia loga",
    description: "Existujúce logo prevedené do ostrého vektora.",
    priceFrom: 30,
  },
} satisfies Record<string, AddOn>;

export type AddOnId = keyof typeof addOns;

export interface PricingTab {
  id: string;
  label: string;
  /** shown instead of label on mobile */
  shortLabel: string;
  /** add-ons offered in the enquiry flow for this category */
  addOns: AddOnId[];
  plans: PricingPlan[];
}

export const pricingTabs: PricingTab[] = [
  {
    id: "identity",
    label: "Vizuálna identita",
    shortLabel: "Identita",
    addOns: ["identity-application", "business-card", "marketing-visual"],
    plans: [
      {
        id: "identity-basic",
        title: "Základná identita",
        description: "Vizuálny základ, vďaka ktorému bude značka rozpoznateľná.",
        priceFrom: 390,
        features: [
          { icon: PenNib, label: "Logo a jeho varianty" },
          { icon: Palette, label: "Farebná paleta" },
          { icon: TextAa, label: "Typografia" },
          { icon: FileArrowDown, label: "Exporty pre web a tlač" },
          { icon: Layout, label: "Základný Brand Portal" },
        ],
      },
      {
        id: "identity-complete",
        title: "Kompletná identita",
        description: "Prepracovaný vizuálny systém pripravený na každodenné používanie.",
        priceFrom: 790,
        featured: true,
        features: [
          { icon: PenNib, label: "Logo a jeho varianty" },
          { icon: Palette, label: "Farby a typografická hierarchia" },
          { icon: Shapes, label: "Vlastný grafický systém" },
          { icon: Cards, label: "2 aplikácie identity" },
          { icon: Layout, label: "Interaktívny Brand Portal" },
        ],
      },
      {
        id: "identity-extended",
        title: "Rozšírená identita",
        description: "Komplexnejší vizuálny systém s aplikáciami pre rôzne situácie.",
        priceFrom: 1490,
        features: [
          { icon: Stack, label: "Kompletný vizuálny systém" },
          { icon: Shapes, label: "Rozšírené grafické prvky" },
          { icon: SquaresFour, label: "4 aplikácie identity" },
          { icon: Slideshow, label: "Ukážky použitia značky" },
          { icon: Layout, label: "Rozšírený Brand Portal" },
        ],
      },
    ],
  },
  {
    id: "web",
    label: "Webdizajn a development",
    shortLabel: "Web",
    // no web add-ons are defined yet, so the flow skips straight to contact
    addOns: [],
    plans: [
      {
        id: "web-presentation",
        title: "Prezentačný web",
        description: "Profesionálna online prezentácia pre firmy a služby",
        priceFrom: 650,
        features: [
          { icon: Stack, label: "Do 05 podstránok" },
          { icon: PaintBrush, label: "Individuálny dizajn" },
          { icon: DeviceMobileCamera, label: "Responzivný vývoj" },
          { icon: Envelope, label: "Kontaktný formulár" },
          { icon: Binoculars, label: "Základné technické SEO a AEO" },
        ],
      },
      {
        id: "web-business",
        title: "Firemný web",
        description: "Premyslený web na prezentáciu aj získavanie dopytov",
        priceFrom: 1200,
        featured: true,
        features: [
          { icon: Stack, label: "Do 10 podstránok" },
          { icon: PaintBrush, label: "Individuálny dizajn a UX" },
          { icon: Database, label: "Dynamický obsah a administrácia" },
          { icon: PaperPlaneTilt, label: "Formuláre a integrácia" },
          { icon: ChartLineUp, label: "Technické SEO, AEO a analytika" },
        ],
      },
      {
        id: "web-custom",
        title: "Web na mieru",
        description: "Individuálne funkcie a procesy podľa potrieb projektu",
        priceFrom: null,
        features: [
          { icon: Code, label: "Vlastné funkcie a procesy" },
          { icon: Database, label: "Databáza a spracovanie údajov" },
          { icon: FadersHorizontal, label: "Administrácia na mieru" },
          { icon: Brain, label: "Integrácie externých služieb" },
          { icon: RocketLaunch, label: "Testovania a nasadenie" },
        ],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketingové materiály",
    shortLabel: "Marketing",
    addOns: ["marketing-visual", "format-adaptation", "logo-vectorization", "business-card"],
    plans: [
      {
        id: "marketing-single",
        title: "Jednotlivá grafika",
        cta: "Objednať grafiku",
        description: "Výrazný vizuál pre konkrétnu správu alebo kampaň.",
        priceFrom: 50,
        features: [
          { icon: ImageSquare, label: "Príspevok alebo banner" },
          { icon: PenNib, label: "Individuálny grafický návrh" },
          { icon: Crop, label: "Jeden dohodnutý formát" },
          { icon: SealCheck, label: "Finálny súbor na použitie" },
        ],
      },
      {
        id: "marketing-poster",
        title: "Plagát alebo leták",
        cta: "Navrhnúť plagát",
        description: "Grafický materiál, ktorý upúta pozornosť v tlači aj online.",
        priceFrom: 90,
        features: [
          { icon: FileImage, label: "Individuálny návrh" },
          { icon: TextAa, label: "Typografia a kompozícia" },
          { icon: Printer, label: "Príprava pre tlač" },
          { icon: Files, label: "Finálne exporty" },
        ],
      },
      {
        id: "marketing-set",
        title: "Sada grafík",
        cta: "Vytvoriť sadu",
        description: "Vizuálne zladená séria výstupov pre jednu tému alebo kampaň.",
        priceFrom: 160,
        features: [
          { icon: Images, label: "4 tematicky zladené vizuály" },
          { icon: Palette, label: "Jednotný grafický štýl" },
          { icon: DeviceMobile, label: "Formát pre sociálne siete" },
          { icon: DownloadSimple, label: "Export všetkých výstupov" },
        ],
      },
      {
        id: "marketing-templates",
        title: "Sada šablón",
        cta: "Pripraviť šablóny",
        description: "Opakovane použiteľné podklady na konzistentnú komunikáciu značky.",
        priceFrom: 220,
        features: [
          { icon: Cards, label: "6 editovateľných šablón" },
          { icon: Palette, label: "Jednotný vizuálny systém" },
          { icon: Swatches, label: "Prispôsobenie značke" },
          { icon: DownloadSimple, label: "Súbory pripravené na používanie" },
        ],
      },
    ],
  },
];

export const defaultTabId = "web";

export function formatPrice(priceFrom: number | null): string {
  return priceFrom === null ? "Individuálne" : `od ${priceFrom.toLocaleString("sk-SK")} €`;
}

/** Starting total for a plan plus add-ons; null when the plan is priced individually. */
export function startingTotal(plan: PricingPlan, selected: AddOnId[]): number | null {
  if (plan.priceFrom === null) return null;
  return selected.reduce((sum, id) => sum + addOns[id].priceFrom, plan.priceFrom);
}
