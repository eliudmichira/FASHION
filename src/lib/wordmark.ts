import { site } from "@/data/site";

// Font size (in vw) that makes the wordmark span roughly `widthVw` of the
// screen, whatever the brand name's length. Capped so short names stay sane.
export function wordmarkSize(widthVw: number, maxVw: number) {
  return `${Math.min(maxVw, (widthVw * 2) / site.name.length)}vw`;
}
