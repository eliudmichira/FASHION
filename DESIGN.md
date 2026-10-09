# Design direction

Brand name: not decided yet. The site shows a `BRAND NAME` placeholder (set in `src/data/site.ts`).

Owner's brief (chosen in chat): **Street Kinetic**. Unisex streetwear, prices in KSh, photos to follow (placeholders until then). Bold condensed type, one acid accent, fast snappy motion, marquee tickers, slight grain.

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

Design Read: e-commerce site for a unisex streetwear label, in a loud condensed-type, drop-driven style, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## Identity

- **Personality:** loud, fast, confident. Talks like a shop counter, not a press release.
- **Motif:** the forward slash. Used as the separator in product codes (`XX/003`), marquee copy, and section labels. Product codes sit in boxed tags that read like woven garment labels.

## Palette

| Token | Hex | Role |
|---|---|---|
| ink | `#0F0F0D` | Type, dark sections, primary buttons |
| bone | `#EDEAE2` | Page base. Warmer than white so it reads as paper, not a screen |
| acid | `#C8F31D` | The one accent: Drop 02 section, bag count. Never text on bone |
| concrete | `#CFCABF` | Placeholder photo tone only |
| muted | `#5A564E` | Secondary text on bone only (6.07:1). Fails on concrete, never used there |
| error | `#9E2A1F` | Form errors, always paired with text |

Contrast (checked with antislop `contrast-check.py`): ink/bone 15.96, ink/acid 14.89, muted/bone 6.07, `#A9A498` on ink 7.72.

## Type

- **Display:** Big Shoulders, 800 and 900, uppercase, tight tracking. Condensed signage type that fits huge words across a phone screen, which is what this direction needs.
- **Body:** Archivo. A sturdy grotesk with workwear proportions that stays readable at small sizes next to a loud display face.
- No wide-tracked uppercase labels. Small labels use normal tracking.

## Motion (each with its job)

- **Intro (once per session):** wordmark letters rise, panel lifts. Brand moment before the first drop. Skippable, skipped entirely with reduced motion.
- **Hero wordmark:** shrinks and drifts on scroll, so the brand hands off to the content.
- **Velocity marquee:** speed and direction follow the scroll. Carries drop info and the slash motif.
- **Pinned lookbook:** vertical scroll drives a horizontal strip on wide screens; native swipe on phones.
- **Product hover:** second photo swaps in, "View" cursor on mouse devices. Touch goes straight to the product.
- **Add to bag:** count bumps, drawer slides in. Confirms the action.
- **Page change:** ink panel wipes off. Marks the route change with the same panel as the intro.
- `prefers-reduced-motion` turns off the intro, smooth scroll, marquee movement, pinning, and the wipe.

## Layout

- Fixed bone/ink brand palette, no theme toggle: the label's colours are the identity, and ink sections are a brand choice, not a "dark mode".
- Sections deliberately differ: full-bleed hero, ink marquee band, pinned horizontal lookbook, asymmetric product grid, acid drop block.
- Radius: 0 everywhere except the bag count badge (round, because it is a counter).
