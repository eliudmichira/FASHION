import { site } from "@/data/site";

// Placeholder catalogue. Names, prices and sizes are stand-ins until the real
// range is ready. Every price ends in 998.

export type Category = "Tops" | "Bottoms" | "Outerwear" | "Accessories";

export type Tone = "stone" | "concrete" | "soot";

export type Product = {
  slug: string;
  code: string;
  name: string;
  category: Category;
  price: number;
  sizes: { label: string; inStock: boolean }[];
  // One tone per placeholder photo: [front, on-model]. Swap for real images.
  tones: [Tone, Tone];
  description: string;
  details: { title: string; body: string }[];
};

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
    slug: "heavyweight-box-tee",
    code: `${site.codePrefix}/001`,
    name: "Heavyweight Box Tee",
    category: "Tops",
    price: 2998,
    sizes: apparelSizes(["XS"]),
    tones: ["concrete", "soot"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "slash-hoodie",
    code: `${site.codePrefix}/002`,
    name: "Slash Hoodie",
    category: "Tops",
    price: 6998,
    sizes: apparelSizes(),
    tones: ["soot", "stone"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "utility-cargo-pant",
    code: `${site.codePrefix}/003`,
    name: "Utility Cargo Pant",
    category: "Bottoms",
    price: 5998,
    sizes: apparelSizes(["XXL"]),
    tones: ["stone", "concrete"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "nylon-track-jacket",
    code: `${site.codePrefix}/004`,
    name: "Nylon Track Jacket",
    category: "Outerwear",
    price: 7998,
    sizes: apparelSizes(["XS", "S"]),
    tones: ["concrete", "soot"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "washed-long-sleeve",
    code: `${site.codePrefix}/005`,
    name: "Washed Long Sleeve",
    category: "Tops",
    price: 3998,
    sizes: apparelSizes(),
    tones: ["stone", "soot"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "ripstop-short",
    code: `${site.codePrefix}/006`,
    name: "Ripstop Short",
    category: "Bottoms",
    price: 3998,
    sizes: apparelSizes(["M"]),
    tones: ["soot", "concrete"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "panel-bomber",
    code: `${site.codePrefix}/007`,
    name: "Panel Bomber",
    category: "Outerwear",
    price: 9998,
    sizes: apparelSizes(["XS", "XXL"]),
    tones: ["concrete", "stone"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
  {
    slug: "tag-cap",
    code: `${site.codePrefix}/008`,
    name: "Tag Cap",
    category: "Accessories",
    price: 1998,
    sizes: [{ label: "One size", inStock: true }],
    tones: ["soot", "concrete"],
    description: "[Product description, one or two lines]",
    details: placeholderDetails,
  },
];

export const categories: Category[] = ["Tops", "Bottoms", "Outerwear", "Accessories"];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export type Look = { id: string; title: string; tone: Tone; productSlugs: string[] };

export const looks: Look[] = [
  { id: "look-01", title: "Look 01", tone: "soot", productSlugs: ["slash-hoodie", "utility-cargo-pant"] },
  { id: "look-02", title: "Look 02", tone: "concrete", productSlugs: ["nylon-track-jacket", "ripstop-short"] },
  { id: "look-03", title: "Look 03", tone: "stone", productSlugs: ["heavyweight-box-tee", "tag-cap"] },
  { id: "look-04", title: "Look 04", tone: "soot", productSlugs: ["panel-bomber", "washed-long-sleeve"] },
];
