export const site = {
  // Shows in the wordmark, header, footer, marquee and page titles.
  // Display type is uppercased by CSS; wordmarks resize to fit the length.
  name: "Classofinfinitty",
  tagline: "Grow To Fly",
  // Product codes read #001, #002: the "#" is the logo's own shape.
  codePrefix: "#",
  domain: "classofinfinitty.shop",
  instagram: "https://www.instagram.com/classofinfinitty",
  // Shows the "placeholder content" strip across the site. Set to false once
  // real photos, products and the drop date are in.
  preview: true,
  // Flat delivery charge per order, added to the M-Pesa total. The checkout
  // functions read this same value, so the shop and the charge always agree.
  deliveryFee: 298,
  payments: {
    // Turn on once the M-Pesa functions are deployed and their secrets are set
    // (see README). Until then the bag shows "Checkout coming soon".
    mpesa: false,
    // Must match setGlobalOptions({ region }) in functions/src/index.ts.
    region: "europe-west1",
  },
  currentDrop: "Drop 01",
  nextDrop: {
    name: "Drop 02",
    // Placeholder date. Replace with the real release time (East Africa Time).
    opensAt: "2026-11-27T18:00:00+03:00",
  },
};
