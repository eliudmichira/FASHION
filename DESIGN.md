# Design direction

Brand: **Classofinfinitty** (set in `src/data/site.ts`). Domain: classofinfinitty.web.app. Tagline: **Nothing But The Best** (owner approved).

Owner's brief: the logo plus the first piece, the Night Dweller Baby Tee (vintage Skele print on the front, the mark as a back hit), modeled by Mona. Unisex, all sizes, prices in KSh ending in 998.

## Voice

Taken from the owner's own description of the Night Dweller tee. Insider and a little menacing, written to the crew, never to everyone: "to scare the normies off", "for the night dwellers to rock in the dark". Product copy names who's modeling and the size, says what the piece is plainly, gives the print a job, and signs off "Enjoy!".

Dial: ENERGY 2 / RHYTHM 3 / MOTION 3

Design Read: e-commerce site for a unisex streetwear label with a punk and tattoo edge, in a cold, strictly monochrome gallery style built on the logo's pixel grid, dial ENERGY 2 / RHYTHM 3 / MOTION 3.

## What the brand gives off

- **Cold and digital:** smooth, almost rendered model shots against a cool grey-lilac studio; black fitted baby tees carrying one big white graphic.
- **Punk and tattoo:** the spiked skull with the 8-ball eye, piercings, script tattoos.
- The site is the quiet gallery; the clothes bring the noise.

## Identity

- **Logo:** a stepped "#" outline over two rings, one even 31-unit line on a square grid. Redrawn as a vector in `src/components/Logo.tsx` and `src/app/icon.svg`. Reads as a hashtag/number sign, the split O's of infinity, and a small face.
- **Motif:** the mark itself. Product codes read `#001`; the ticker uses the mark as its separator; the bag counter and cursor are its rings.

## Palette (strictly black and white)

| Token | Hex | Role |
|---|---|---|
| void | `#0C0C10` | Page base, sampled from the tee. The logo lives on black, so the dark site is a brand decision |
| chalk | `#FFFFFF` | Type and lines, same as the logo |
| studio | `#D4D6E2` | Photo tiles and inverted panels (drop block, bag, mobile menu). Matches the studio backdrop so photos have no visible edge |
| fog | `#B4B7C6` | Placeholder tone only |
| graphite | `#1E1E25` | Placeholder tone only |
| dim | `#9A9AA6` | Secondary text on void |
| dim-studio | `#4A4B55` | Secondary text on studio or white |

No colour accent. The accent is **inversion**: the Drop 02 block, bag drawer and mobile menu flip to grey with black type, and buttons flip on hover.

Contrast (antislop `contrast-check.py`): chalk/void 19.52, dim/void 7.02, void/studio 13.49, dim-studio/studio 5.98, dim-studio/white 8.65. Never chalk text on studio (1.45).

## Type

- **Display: Tiny5.** Square pixel face; its right-angle steps match the logo's grid, and it is narrow enough for the 16-letter name. Headings only.
- **Script: Jacquarda Bastarda 9.** Pixel blackletter that echoes the tattoo lettering. Used only for "Nothing But The Best".
- **Body: Archivo.** Plain, readable sans. Prices use it too, so numbers are never ambiguous.
- Lines and borders are 2px; the header mark is sized so its own line is about 2px.

## Motion (each with its job)

- **Intro (once per session):** the logo outline draws on in hard steps, the rings blink once, then the screen dissolves into the page as a grid of pixels. Skippable, off with reduced motion.
- **Hero:** the mark steps back as you scroll and the photo drifts, handing the screen to the product.
- **Velocity ticker:** speed and direction follow the scroll; black and white with the mark between phrases.
- **Pinned lookbook:** vertical scroll drives the strip sideways on wide screens; swipe on phones.
- **Product hover:** the second view (the back, or a close-up of the print) wipes up over the first. A ring cursor with "View" inverts whatever is under it.
- **Page change:** a grid of black pixels blinks out to reveal the new page.
- `prefers-reduced-motion` turns off the intro, smooth scroll, ticker movement, pinning and the pixel dissolve.

## Layout

- Sections deliberately differ: split hero (mark and photo), ticker band, pinned lookbook, asymmetric New in grid, scroll-lit statement, inverted Drop 02 block.
- Radius 0 everywhere except the logo-ring elements (bag counter, cursor).
- No grain: the shots are clean; texture lives in the prints.
