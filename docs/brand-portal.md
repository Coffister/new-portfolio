# Brand portál

Verejný sprievodca značkou na `coffister.art/brand/<slug>`. Bez databázy:
každá značka je priečinok v repozitári a publikuje sa nasadením (git push → Vercel).

## Nová značka

1. Skopíruj `public/brands/coffister/` do `public/brands/<slug>/` (slug: a-z, 0-9, `-`).
2. Súbory daj do `files/`, uprav `guide.json` (tvar: `src/brand/types.ts`).
3. `node scripts/check-brands.mjs` overí cesty, farby, alt texty a chýbajúce súbory.
   Spúšťa sa aj pri každom `npm run build`, takže chybný sprievodca sa nenasadí.
4. Lokálne: `npm run dev` → `http://localhost:5173/brand/<slug>`.
5. Commit + push = publikovanie.

Bloky (poradie v poli = poradie na stránke): `logos`, `colors`, `typography`,
`gallery`, `text`, `downloads`. Blok skryješ tak, že ho z poľa vyberieš.

## Čo je verejné

Všetko v `public/brands/<slug>/` je po nasadení verejne dostupné cez URL.
Do priečinka teda patria iba schválené súbory na odovzdanie. `noindex`
(hlavička aj meta tag) stránky iba nevyhľadá, nechráni ich.

Font daj do `files/` a do `downloads` iba vtedy, keď licencia dovoľuje
webové použitie, resp. ďalšie šírenie.

## Archivácia a obnovenie

- Archivácia: `git mv public/brands/<slug> brands-archive/<slug>` a push.
  URL aj súbory prestanú existovať, návštevník sa presmeruje na coffister.art.
- Obnovenie: presuň priečinok späť a push.
- Zmena slugu = premenovanie priečinka; stará URL prestane fungovať.

## Kontroly

- `node scripts/check-brands.mjs` — preflight všetkých sprievodcov
- `node --experimental-strip-types scripts/check-brand-logic.ts` — self-check preflightu a prepočtu farieb
