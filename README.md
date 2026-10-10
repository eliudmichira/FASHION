

Storefront for Classofinfinitty, a unisex streetwear label. Next.js 16, Tailwind 4, Motion and Lenis.
Design direction lives in [`DESIGN.md`](DESIGN.md).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Pages

| Route | What's on it |
|---|---|
| `/` | Intro, hero, velocity marquee, pinned lookbook, new in, Drop 02 countdown and waitlist |
| `/shop` | Every piece, with category and in-stock-size filters |
| `/product/[slug]` | Photos, size picker, add to bag, details, "Wear it with" |

The bag is a slide-out drawer, saved in the visitor's browser.

## Where to change things

- **Products and prices:** `src/data/products.ts`. Keep every price ending in 998.
- **Descriptions:** `description` per product, in the house voice: who's modeling and in what size, what the piece is, what the print does, who it's for, then "Enjoy!". Add `model` (name, height, size) and the size picker shows it too.
- **Brand name, tagline and code prefix:** `name`, `tagline` and `codePrefix` in `src/data/site.ts`.
- **Logo:** `src/components/Logo.tsx` (site) and `src/app/icon.svg` (browser tab), both drawn from the same vector.
- **Drop names and the Drop 02 date:** `src/data/site.ts`.
- **Placeholder strip:** set `preview: false` in `src/data/site.ts` once real content is in.
- **Photos:** put shots in `public/images/products/` and list them under `photos` for the product in `src/data/products.ts` (main view, then the hover view). Products without photos show a labelled placeholder.
- **Colours and fonts:** `src/app/globals.css` (`@theme`) and `src/app/layout.tsx`.

## Before launch

- [x] Photos and description for #001 Night Dweller Baby Tee (front, back, both prints)
- [ ] Photos for the other six pieces, or remove them
- [ ] Real names for the other six pieces, and the [bracketed] facts in their draft descriptions
- [ ] Fabric and care details for every piece
- [ ] Real Drop 02 date
- [ ] Connect checkout (Shopify) in `src/components/CartDrawer.tsx`
- [x] Waitlist saves to the Firestore `waitlist` collection (`src/components/WaitlistForm.tsx`); check the Firestore rules allow those writes
- [ ] Privacy policy and terms pages (needed once you collect emails and payments)
- [x] Instagram link in the footer
- [ ] TikTok link in the footer
