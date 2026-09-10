import discovery from "@/assets/process/discovery.svg";
import design from "@/assets/process/design.svg";
import delivery from "@/assets/process/delivery.svg";


export const processSteps = [
  {
    number: "1",
    title: "Spoznanie projektu",
    description:
      "Krátkym rozhovorom si ujasníme vaše ciele, predstavy a smer projektu.",
    image: discovery,
    imageClassName: "discovery",
  },
  {
    number: "2",
    title: "Návrh a spätná väzba",
    description:
      "Pripravím prvý návrh, ktorý spoločne doladíme podľa spätnej väzby.",
    image: design,
    imageClassName: "design",
  },
  {
    number: "3",
    title: "Odovzdanie a podpora",
    description:
      "Po schválení dostanete všetky finálne súbory pripravené na použitie.",
    image: delivery,
    imageClassName: "delivery",
  },
];