import { site } from "@/data/site";

// #001 and #002 are real pieces with real photos. The rest are stand-ins until
// the range is ready. Every price ends in 998.

export type Category = "Tops" | "Bottoms" | "Outerwear" | "Accessories";

export type Tone = "studio" | "fog" | "graphite";

// focus: where to anchor the crop when a tile is a different shape from the photo.
export type Photo = { src: string; alt: string; label: string; focus?: string };

export type Product = {
  slug: string;
  code: string;
  name: string;
  category: Category;
  price: number;
  sizes: { label: string; inStock: boolean }[];
  // [main, hover]. Real shots when the piece has them; tone blocks otherwise.
  photos?: [Photo, Photo];
  tones: [Tone, Tone];
  description: string;
  details: { title: string; body: string }[];
};

const code = (n: number) => `${site.codePrefix}${String(n).padStart(3, "0")}`;

const apparelSizes = (soldOut: string[] = []) =>
  ["XS", "S", "M", "L", "XL", "XXL"].map((label) => ({
    label,
    inStock: !soldOut.includes(label),
  }));

const placeholderDetails = [
  { title: "Fabric", body: "[Fabric, weight and origin]" },
  { title: "Fit", body: "[Fit notes and model measurements]" },
  { title: "Care", body: "[Washing and care instructions]" },
];

export const products: Product[] = [
  {
    slug: "mark-baby-tee",
    code: code(1),
    name: "Mark Baby Tee",
    category: "Tops",
    price: 2998,
    sizes: apparelSizes(),
    photos: [
      {
        src: "/images/products/mark-baby-tee-back.jpg",
        alt: "Back of a fitted black baby tee with the Classofinfinitty mark printed large in white",
        label: "Back",
      },
      {
        src: "/images/products/mark-baby-tee-print.jpg",
        alt: "Close-up of the white mark print on the back of the black tee",
        label: "Print",
      },
    ],
    tones: ["studio", "graphite"],
    description: "Fitted, cropped black baby tee with the mark printed big across the back.",
    details: placeholderDetails,
  },
  {
    slug: "eight-ball-skull-baby-tee",
    code: code(2),
    name: "8-Ball Skull Baby Tee",
    category: "Tops",
    price: 3998,
    sizes: apparelSizes(),
    photos: [
      {
        src: "/images/products/skull-baby-tee-front.jpg",
        alt: "Fitted black baby tee with a white spiked skull print, an 8-ball for one eye",
        label: "Front",
        focus: "50% 62%",
      },
      {
        src: "/images/products/skull-baby-tee-print.jpg",
        alt: "Close-up of the spiked skull print with the 8-ball eye",
        label: "Print",
      },
    ],
    tones: ["studio", "graphite"],
    description: "Fitted, cropped black baby tee with a spiked skull and an 8-ball eye printed on the front.",
    details: placeholderDetails,
  },
  {
    slug: "utility-cargo-pant",
    code: code(3),
    name: "Utility Cargo Pant",
    category: "Bottoms",
    price: 5998,
    sizes: apparelSizes(["XXL"]),
    tones: ["fog", "graphite"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "heavyweight-hoodie",
    code: code(4),
    name: "Heavyweight Hoodie",
    category: "Tops",
    price: 6998,
    sizes: apparelSizes(),
    tones: ["graphite", "studio"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "nylon-track-jacket",
    code: code(5),
    name: "Nylon Track Jacket",
    category: "Outerwear",
    price: 7998,
    sizes: apparelSizes(["XS", "S"]),
    tones: ["studio", "graphite"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "ripstop-short",
    code: code(6),
    name: "Ripstop Short",
    category: "Bottoms",
    price: 3998,
    sizes: apparelSizes(["M"]),
    tones: ["graphite", "fog"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "panel-bomber",
    code: code(7),
    name: "Panel Bomber",
    category: "Outerwear",
    price: 9998,
    sizes: apparelSizes(["XS", "XXL"]),
    tones: ["fog", "studio"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "tag-cap",
    code: code(8),
    name: "Tag Cap",
    category: "Accessories",
    price: 1998,
    sizes: [{ label: "One size", inStock: true }],
    tones: ["graphite", "fog"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
];

export const categories: Category[] = ["Tops", "Bottoms", "Outerwear", "Accessories"];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

// A look is either a real shot of a product being worn, or a placeholder tone.
export type Look = { id: string; title: string; tone: Tone; photo?: Photo; productSlugs: string[] };

export const looks: Look[] = [
  {
    id: "look-01",
    title: "Look 01",
    tone: "studio",
    photo: products[0].photos![0],
    productSlugs: ["mark-baby-tee"],
  },
  {
    id: "look-02",
    title: "Look 02",
    tone: "studio",
    photo: products[1].photos![0],
    productSlugs: ["eight-ball-skull-baby-tee"],
  },
  { id: "look-03", title: "Look 03", tone: "graphite", productSlugs: ["heavyweight-hoodie", "utility-cargo-pant"] },
  { id: "look-04", title: "Look 04", tone: "fog", productSlugs: ["panel-bomber", "tag-cap"] },
];
