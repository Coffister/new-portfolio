import coffisterLogo from "@/assets/logos/coffister-logotransparent.webp";

import volnekridlaLogo from "@/assets/logos/volnekridla-logo.webp";
import archbuildLogo from "@/assets/logos/archbuild-logo.webp";
import yoburgerLogo from "@/assets/logos/yoburger-logo.webp";
import emkaLogo from "@/assets/logos/emka-logo.webp";

import coffisterCover from "@/assets/coffister-cover.webp";
import volnekridlaCover from "@/assets/volnekridla-cover.webp";
import archbuildCover from "@/assets/archbuild-cover.webp";
import yoburgerCover from "@/assets/yoburger-cover.webp";
import emkaCover from "@/assets/emka-cover.webp";


import coffisterScreenshot1 from "@/assets/screenshots/coffister-screenshot1.webp";
import coffisterScreenshot2 from "@/assets/screenshots/coffister-screenshot2.webm";
import coffisterScreenshot3 from "@/assets/screenshots/coffister-screenshot3.webp";

import volnekridlaScreenshot1 from "@/assets/screenshots/volnekridla-screenshot1.webp";
import volnekridlaScreenshot2 from "@/assets/screenshots/volnekridla-screenshot2.webp";

import archbuildScreenshot1 from "@/assets/screenshots/archbuild-screenshot1.webp";
import archbuildScreenshot2 from "@/assets/screenshots/archbuild-screenshot2.webm";
import archbuildScreenshot3 from "@/assets/screenshots/archbuild-screenshot3.webp";
import archbuildScreenshot4 from "@/assets/screenshots/archbuild-screenshot4.webp";

import yoburgerScreenshot1 from "@/assets/screenshots/yoburger-screenshot1.webp";
import yoburgerScreenshot2 from "@/assets/screenshots/yoburger-screenshot2.webp";

import emkaScreenshot1 from "@/assets/screenshots/emka-screenshot1.webp";
import emkaScreenshot2 from "@/assets/screenshots/emka-screenshot2.webp";

export interface Project {
    id: string;
    title: string;
    category: string;
    description: string;

    logo: string;
    thumbnail: string;
    screenshots: string[];

    url: string;

    accentColor?: string;
    year?: string;
    services?: string[];
}

export const projects: Project[] = [
    {
        id: "coffister",
        title: "Coffister",
        category: "Osobný branding",
        description: "Coffister je moja osobná značka — meno, ktoré mi časom tak prirástlo, že ma tak dnes volajú kamaráti aj rodina. Vizuál sa priebežne mení s tým, ako sa posúvam v dizajne — od tradičných ilustrácií cez digitálny raster až po vektor.\n\nRád pracujem s minimalistickým, čistým dizajnom, inšpirovaným značkami ako Apple alebo Notion. Coffister je tak trochu môj testovací priestor aj vizitka zároveň.",
        logo: coffisterLogo,
        thumbnail: coffisterCover,
        screenshots: [coffisterScreenshot1, coffisterScreenshot2, coffisterScreenshot3],
        url: "https://coffister.art",
    },

    {
        id: "volnekridla",
        title: "Voľné Krídla",
        category: "Web design a development",
        description: "Voľné krídla je projekt, na ktorom som pracoval dlhodobo a zároveň je jeden z mojich obľúbených.\n\nZačali sme kompletným redizajnom webu, ktorý dovtedy fungoval na starej šablóne z čias, keď značka vznikala. Navrhol som jednoduchší kontaktný formulár, vďaka ktorému je prihlásenie na kurz oveľa jednoduchšie a zvýšil sa počet odoslaných prihlášok.\n\nPopri webe sme prekreslili logo do kriviek pre tlač, vytvorili merch pre účastníkov kurzov a pripravil som aj diplomy pre úspešných absolventov. Franka bola jeden z najlepších klientov, s akými som mal možnosť spolupracovať.",
        logo: volnekridlaLogo,
        thumbnail: volnekridlaCover,
        screenshots: [volnekridlaScreenshot2, volnekridlaScreenshot1],
        url: "https://volnekridla.sk",
    },

    {
        id: "archbuild",
        title: "Archbuild",
        category: "Dizajn sociálnych sietí",
        description: "Návrh obsahu pre slovenskú architektonicko-stavebnú firmu. Vizuálny systém pripravený pre Instagram a tlač.\n\nProjekt bohužiaľ nedopadol podľa plánu, ale stále je to jeden z mojich najobľúbenejších vizuálov.",
        logo: archbuildLogo,
        thumbnail: archbuildCover,
        screenshots: [archbuildScreenshot4, archbuildScreenshot1, archbuildScreenshot2, archbuildScreenshot3],
        url: "",
    },

    {
        id: "yoburger",
        title: "YoBurger",
        category: "Kompletný branding",
        description: "YoBurger vznikol pre kamaráta, ktorý so svojím burger stánkom mieril na event a potreboval sa odlíšiť od davu. Zvolili sme bold, ohnivý štýl, ktorý je vidieť na diaľku.\n\nNavrhol som logo, rollup banner a reklamné letáčiky — kompletný vizuál, ktorý stánok upútal hneď od prvého pohľadu.",
        logo: yoburgerLogo,
        thumbnail: yoburgerCover,
        screenshots: [yoburgerScreenshot1, yoburgerScreenshot2],
        url: "",
    },
    
    {
        id: "emka",
        title: "Emka - Jazykové kurzy",
        category: "Rebrand a marketingové materiály",
        description: "Popis neskôr",
        logo: emkaLogo,
        thumbnail: emkaCover,
        screenshots: [emkaScreenshot2, emkaScreenshot1],
        url: "",
    },
];