import { site } from "@/data/site";

// #001 is a real piece with real photos and the owner's own copy. The rest are
// stand-ins until the range is ready: their descriptions are drafts in the
// brand voice, with [brackets] where a real fact is still needed.
// Every price ends in 998.

export type Category = "Tops" | "Bottoms" | "Outerwear" | "Accessories";

export type Tone = "studio" | "fog" | "graphite";

// focus: where to anchor the crop when a tile is a different shape from the photo.
export type Photo = { src: string; alt: string; label: string; focus?: string };

// Who is wearing it in the photos, so shoppers can judge the fit.
export type Model = { name: string; height: string; size: string };

export type Product = {
  slug: string;
  code: string;
  name: string;
  category: Category;
  price: number;
  sizes: { label: string; inStock: boolean }[];
  // Real shots when the piece has them: the first is the main view, the second
  // the hover view, any more show on the product page. Tone blocks otherwise.
  photos?: Photo[];
  tones: [Tone, Tone];
  model?: Model;
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

const mona: Model = { name: "Mona", height: "5'7", size: "Small" };

export const products: Product[] = [
  {
    slug: "skele-baby-tee",
    code: code(1),
    name: "Skele Baby Tee",
    category: "Tops",
    price: 2998,
    sizes: apparelSizes(),
    photos: [
      {
        src: "/images/products/skele-baby-tee-front.jpg",
        alt: "Mona wearing the black Skele Baby Tee: a white vintage skull print with a spiked mohawk and an 8-ball eye on the front",
        label: "Front",
        focus: "50% 62%",
      },
      {
        src: "/images/products/skele-baby-tee-back.jpg",
        alt: "Back of the black Skele Baby Tee with the Classofinfinitty mark printed large in white",
        label: "Back",
      },
      {
        src: "/images/products/skele-baby-tee-front-print.jpg",
        alt: "Close-up of the Skele print on the front",
        label: "Front print",
      },
      {
        src: "/images/products/skele-baby-tee-back-print.jpg",
        alt: "Close-up of the Classofinfinitty back hit",
        label: "Back print",
      },
    ],
    tones: ["studio", "graphite"],
    model: mona,
    // The owner's own words.
    description:
      "Mona (5'7) is modeling a sz Small lightweight, cropped, short-sleeved tee with a vintage Skele print to scare the normies off. With a clean classofinfinitty back hit for the night dwellers to rock in the dark. Enjoy!",
    details: [
      { title: "Fabric", body: "Lightweight. [Fabric, weight and origin]" },
      { title: "Fit", body: "Cropped and short-sleeved. Mona is 5'7 and wears a size Small." },
      { title: "Care", body: "[Washing and care instructions]" },
    ],
  },
  {
    slug: "utility-cargo-pant",
    code: code(2),
    name: "Utility Cargo Pant",
    category: "Bottoms",
    price: 5998,
    sizes: apparelSizes(["XXL"]),
    tones: ["fog", "graphite"],
    description:
      "[Model] ([height]) is modeling a sz [size] utility cargo pant with pockets for everything you shouldn't be carrying. Made for the long walk home after the city's gone quiet. Enjoy!",
    details: placeholderDetails,
  },
  {
    slug: "heavyweight-hoodie",
    code: code(3),
    name: "Heavyweight Hoodie",
    category: "Tops",
    price: 6998,
    sizes: apparelSizes(),
    tones: ["graphite", "studio"],
    description:
      "[Model] ([height]) is modeling a sz [size] heavyweight hoodie, the one you disappear into when the group chat gets loud. Hood up, world off. Enjoy!",
    details: placeholderDetails,
  },
  {
    slug: "nylon-track-jacket",
    code: code(4),
    name: "Nylon Track Jacket",
    category: "Outerwear",
    price: 7998,
    sizes: apparelSizes(["XS", "S"]),
    tones: ["studio", "graphite"],
    description:
      "[Model] ([height]) is modeling a sz [size] nylon track jacket that has never once been near a track. Zip it to the chin and leave the normies behind. Enjoy!",
    details: placeholderDetails,
  },
  {
    slug: "ripstop-short",
    code: code(5),
    name: "Ripstop Short",
    category: "Bottoms",
    price: 3998,
    sizes: apparelSizes(["M"]),
    tones: ["graphite", "fog"],
    description:
      "[Model] ([height]) is modeling a sz [size] ripstop short, tough enough for the pit and light enough for the heat after. Enjoy!",
    details: placeholderDetails,
  },
  {
    slug: "panel-bomber",
    code: code(6),
    name: "Panel Bomber",
    category: "Outerwear",
    price: 9998,
    sizes: apparelSizes(["XS", "XXL"]),
    tones: ["fog", "studio"],
    description:
      "[Model] ([height]) is modeling a sz [size] panel bomber cut for the night shift. Throw it over the Skele tee and you're dressed for whatever happens after dark. Enjoy!",
    details: placeholderDetails,
  },
  {
    slug: "tag-cap",
    code: code(7),
    name: "Tag Cap",
    category: "Accessories",
    price: 1998,
    sizes: [{ label: "One size", inStock: true }],
    tones: ["graphite", "fog"],
    description: "One size, every head. The tag cap keeps the sun off your face and the normies guessing. Enjoy!",
    details: placeholderDetails,
  },
];

export const categories: Category[] = ["Tops", "Bottoms", "Outerwear", "Accessories"];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

// A look is either a real shot of a product being worn, or a placeholder tone.
export type Look = { id: string; title: string; tone: Tone; photo?: Photo; productSlugs: string[] };

const skele = products[0];

export const looks: Look[] = [
  { id: "look-01", title: "Look 01", tone: "studio", photo: skele.photos![1], productSlugs: [skele.slug] },
  { id: "look-02", title: "Look 02", tone: "studio", photo: skele.photos![0], productSlugs: [skele.slug] },
  { id: "look-03", title: "Look 03", tone: "graphite", productSlugs: ["heavyweight-hoodie", "utility-cargo-pant"] },
  { id: "look-04", title: "Look 04", tone: "fog", productSlugs: ["panel-bomber", "tag-cap"] },
];
