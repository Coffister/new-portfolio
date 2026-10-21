import { renderToString } from "react-dom/server";
import App from "./App";
import { qna } from "./features/faq/qna";
import { pricingTabs } from "./features/pricing/pricing";
import { projects } from "./features/projects/projects";

const SITE = "https://coffister.art";

export function render() {
  return renderToString(<App />);
}

// Content the static markup hides behind clicks (FAQ answers, other pricing
// tabs, other projects), as schema.org data built from the same sources.
export function structuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qna
        .filter((item) => !item.isCustom)
        .map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    },
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "Cenník Coffister",
      url: `${SITE}/#pricing`,
      provider: { "@id": `${SITE}/#business` },
      itemListElement: pricingTabs.map((tab) => ({
        "@type": "OfferCatalog",
        name: tab.label,
        itemListElement: tab.plans.map((plan) => ({
          "@type": "Offer",
          name: plan.title,
          description: [plan.description, ...plan.features.map((feature) => feature.label)].join(". "),
          ...(plan.priceFrom !== null && {
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: plan.priceFrom,
              priceCurrency: "EUR",
            },
          }),
        })),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Projekty Coffister",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          genre: project.category,
          description: project.description.replace(/\*\*/g, ""),
          image: new URL(project.thumbnail, SITE).href,
          creator: { "@id": `${SITE}/#business` },
          ...(project.url && { url: project.url }),
        },
      })),
    },
  ];
}
