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
  title: string;
  description: string;
  price: string;
  featured?: boolean;
  features: PricingFeature[];
}

export interface PricingTab {
  id: string;
  label: string;
  /** shown instead of label on mobile */
  shortLabel: string;
  /** index into estimate's serviceOptions, preselected when the planner opens */
  service: number;
  plans: PricingPlan[];
}

export const pricingTabs: PricingTab[] = [
  {
    id: "identity",
    label: "Vizuálna identita",
    shortLabel: "Identita",
    service: 0,
    plans: [
      {
        title: "Základná identita",
        description: "Vizuálny základ, vďaka ktorému bude značka rozpoznateľná.",
        price: "od 390 €",
        features: [
          { icon: PenNib, label: "Logo a jeho varianty" },
          { icon: Palette, label: "Farebná paleta" },
          { icon: TextAa, label: "Typografia" },
          { icon: FileArrowDown, label: "Exporty pre web a tlač" },
          { icon: Layout, label: "Základný Brand Portal" },
        ],
      },
      {
        title: "Kompletná identita",
        description: "Prepracovaný vizuálny systém pripravený na každodenné používanie.",
        price: "od 790 €",
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
        title: "Rozšírená identita",
        description: "Komplexnejší vizuálny systém s aplikáciami pre rôzne situácie.",
        price: "od 1 490 €",
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
    service: 1,
    plans: [
      {
        title: "Prezentačný web",
        description: "Profesionálna online prezentácia pre firmy a služby",
        price: "od 650 €",
        features: [
          { icon: Stack, label: "Do 05 podstránok" },
          { icon: PaintBrush, label: "Individuálny dizajn" },
          { icon: DeviceMobileCamera, label: "Responzivný vývoj" },
          { icon: Envelope, label: "Kontaktný formulár" },
          { icon: Binoculars, label: "Základné technické SEO a AEO" },
        ],
      },
      {
        title: "Firemný web",
        description: "Premyslený web na prezentáciu aj získavanie dopytov",
        price: "od 1 200 €",
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
        title: "Web na mieru",
        description: "Individuálne funkcie a procesy podľa potrieb projektu",
        price: "Individuálne",
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
    service: 2,
    plans: [
      {
        title: "Jednotlivá grafika",
        description: "Výrazný vizuál pre konkrétnu správu alebo kampaň.",
        price: "od 50 €",
        features: [
          { icon: ImageSquare, label: "Príspevok alebo banner" },
          { icon: PenNib, label: "Individuálny grafický návrh" },
          { icon: Crop, label: "Jeden dohodnutý formát" },
          { icon: SealCheck, label: "Finálny súbor na použitie" },
        ],
      },
      {
        title: "Plagát alebo leták",
        description: "Grafický materiál, ktorý upúta pozornosť v tlači aj online.",
        price: "od 90 €",
        features: [
          { icon: FileImage, label: "Individuálny návrh" },
          { icon: TextAa, label: "Typografia a kompozícia" },
          { icon: Printer, label: "Príprava pre tlač" },
          { icon: Files, label: "Finálne exporty" },
        ],
      },
      {
        title: "Sada grafík",
        description: "Vizuálne zladená séria výstupov pre jednu tému alebo kampaň.",
        price: "od 160 €",
        features: [
          { icon: Images, label: "4 tematicky zladené vizuály" },
          { icon: Palette, label: "Jednotný grafický štýl" },
          { icon: DeviceMobile, label: "Formát pre sociálne siete" },
          { icon: DownloadSimple, label: "Export všetkých výstupov" },
        ],
      },
      {
        title: "Sada šablón",
        description: "Opakovane použiteľné podklady na konzistentnú komunikáciu značky.",
        price: "od 220 €",
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
