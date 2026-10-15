import type { Icon } from "@phosphor-icons/react";
import {
  Binoculars,
  Brain,
  ChartLineUp,
  Code,
  Database,
  DeviceMobileCamera,
  Envelope,
  FadersHorizontal,
  PaintBrush,
  PaperPlaneTilt,
  RocketLaunch,
  Stack,
  Sparkle,
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
  /** index into estimate's serviceOptions, preselected when the planner opens */
  service: number;
  plans: PricingPlan[];
}

// ponytail: identity + marketing are placeholders until real pricing arrives
const placeholderPlans: PricingPlan[] = [
  {
    title: "Základ",
    description: "Placeholder popis balíka",
    price: "od 000€",
    features: Array.from({ length: 5 }, () => ({ icon: Sparkle, label: "Placeholder služba" })),
  },
  {
    title: "Štandard",
    description: "Placeholder popis balíka",
    price: "od 000€",
    featured: true,
    features: Array.from({ length: 5 }, () => ({ icon: Sparkle, label: "Placeholder služba" })),
  },
  {
    title: "Na mieru",
    description: "Placeholder popis balíka",
    price: "Individuálne",
    features: Array.from({ length: 5 }, () => ({ icon: Sparkle, label: "Placeholder služba" })),
  },
];

export const pricingTabs: PricingTab[] = [
  { id: "identity", label: "Vizuálna identita", service: 0, plans: placeholderPlans },
  {
    id: "web",
    label: "Webdizajn a development",
    service: 1,
    plans: [
      {
        title: "Prezentačný web",
        description: "Profesionálna online prezentácia pre firmy a služby",
        price: "od 650€",
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
        price: "od 1200€",
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
  { id: "marketing", label: "Marketingové materiály", service: 2, plans: placeholderPlans },
];

export const defaultTabId = "web";
