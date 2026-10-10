

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
- **Brand name and product code prefix:** `name` and `codePrefix` in `src/data/site.ts` (the `XX` code prefix is still a placeholder).
- **Drop names and the Drop 02 date:** `src/data/site.ts`.
- **Placeholder strip:** set `preview: false` in `src/data/site.ts` once real content is in.
- **Photos:** each grey block is a `<Placeholder>`. Swap it for `next/image` with the real shot.
- **Colours and fonts:** `src/app/globals.css` (`@theme`) and `src/app/layout.tsx`.

## Before launch

- [ ] Product photos, lookbook shots and campaign image
- [ ] Real product names, descriptions, fabric, fit and care copy
- [ ] Real Drop 02 date
- [ ] Connect checkout (Shopify) in `src/components/CartDrawer.tsx`
- [ ] Connect the waitlist to an email provider in `src/app/api/waitlist/route.ts`
- [ ] Privacy policy and terms pages (needed once you collect emails and payments)
- [x] Instagram link in the footer
- [ ] TikTok link in the footer
