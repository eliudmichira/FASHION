

Storefront for Classofinfinitty, a unisex streetwear label. Next.js 16, Tailwind 4, Motion and Lenis.
Design direction lives in [`DESIGN.md`](DESIGN.md).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, into out/
npm run lint
```

Run `npm install` again every time you pull, before building. The build stops
with a message if `node_modules` is out of date in the way that breaks
checkout. It also fixes up the page prefetch files when you build on Windows
(`scripts/fix-windows-export.mjs`), so links stay instant on Firebase Hosting.

To publish the site: `npm install && npm run build && firebase deploy --only hosting`.

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
- **Photos:** put shots in `public/images/products/` and list them under `photos` for the product in `src/data/products.ts` (main view, then the hover view, then any extras for the product page). Products without photos show a labelled placeholder.
- **Lookbook:** put shots in `public/images/looks/` and give each look in `looks` (bottom of `src/data/products.ts`) a `photo` and the pieces it links to.
- **Colours and fonts:** `src/app/globals.css` (`@theme`) and `src/app/layout.tsx`.

## M-Pesa payments

Checkout sends an M-Pesa PIN prompt (STK push) through Safaricom's Daraja API.
The keys never touch the website: three Firebase Cloud Functions in `functions/`
hold them.

- `startMpesaPayment`: prices the bag from `src/data/products.ts` plus the
  flat `deliveryFee` in `src/data/site.ts` (the browser only sends piece, size
  and quantity), saves an order, sends the prompt.
  One prompt per number per minute.
- `mpesaPaymentStatus`: the checkout polls this; if Safaricom's callback is
  late it asks Daraja directly.
- `mpesaCallback`: Safaricom posts results to `/api/mpesa/callback`; the order
  becomes `paid` with the M-Pesa receipt, or `failed`.

Orders land in Firestore under `orders` (items, amount, name, phone, address,
status, receipt). `firestore.rules` keeps them away from the website entirely.

### Set up (once)

1. Put the Firebase project on the **Blaze** plan. Cloud Functions need it.
2. On [developer.safaricom.co.ke](https://developer.safaricom.co.ke), create an
   app with **M-Pesa Express (Lipa na M-Pesa Online)**. Copy its consumer key
   and secret. The sandbox passkey is on the M-Pesa Express simulator page
   (sandbox Paybill: 174379).
3. Copy `functions/.env.example` to `functions/.env` and fill it in.
4. Store the keys as Firebase secrets. Run each line and paste the value when
   asked; never put them in a file or in this repo (it's public):

   ```bash
   firebase functions:secrets:set MPESA_CONSUMER_KEY
   firebase functions:secrets:set MPESA_CONSUMER_SECRET
   firebase functions:secrets:set MPESA_PASSKEY
   firebase functions:secrets:set MPESA_CALLBACK_TOKEN   # any long random string, e.g. from: openssl rand -hex 32
   ```

5. Deploy: `npm run build && firebase deploy`. This also deploys
   `firestore.rules`, which replaces any rules set in the Firebase console.
6. Switch checkout on: `payments.mpesa: true` in `src/data/site.ts`, then
   `npm run build && firebase deploy --only hosting`.

### Going live

Use Daraja's **Go Live** for your Paybill or Till. Safaricom sends production
keys and a passkey. Then: update the three secrets, and in `functions/.env` set
`MPESA_ENV=production`, your `MPESA_SHORTCODE` (and for a Till,
`MPESA_PARTY_B` and `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline`), plus
`MPESA_CALLBACK_BASE=https://classofinfinitty.shop` once that domain points at
Firebase Hosting. Redeploy with `firebase deploy --only functions`.

### If checkout fails

The shopper only sees "Checkout isn't working right now". The real error is in
the browser console, and on the server in
`firebase functions:log --only startMpesaPayment`.

- **"Service functions is not available"** (browser console): the site was
  built from an out-of-date `node_modules`. Run `npm install`, then build and
  deploy hosting again.
- **"Daraja auth failed: HTTP 400"** (functions log): Safaricom refused the
  consumer key and secret. Copy both again from your app on the Daraja portal
  (sandbox keys only work with `MPESA_ENV=sandbox`, production keys only with
  `production`), set them again with `firebase functions:secrets:set`, then
  run `firebase deploy --only functions`. Functions keep using the old values
  until they're redeployed.

### Tests

`npm --prefix functions test` runs the Daraja and pricing tests (no network,
Safaricom is faked).

## Before launch

- [x] Photos and description for #001 Night Dweller Baby Tee (front, back, both prints)
- [ ] Photos for the other six pieces, or remove them
- [ ] Real names for the other six pieces, and the [bracketed] facts in their draft descriptions
- [ ] Fabric and care details for every piece
- [ ] Real Drop 02 date
- [ ] M-Pesa checkout: Daraja keys, deploy, then switch on (see **M-Pesa payments** below)
- [x] Waitlist saves to the Firestore `waitlist` collection (`src/components/WaitlistForm.tsx`); check the Firestore rules allow those writes
- [ ] Privacy policy and terms pages (needed once you collect emails and payments)
- [x] Instagram link in the footer
- [ ] TikTok link in the footer
