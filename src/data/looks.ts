/**
 * Editorial looks composed only from existing catalog product slugs.
 * Does not invent products — each item links to a real product page.
 * Cover images are demo editorial assets from the catalog — not verified stock packs.
 */

export type LookItemRole =
  | "top"
  | "bottom"
  | "outerwear"
  | "footwear"
  | "bag"
  | "accessory";

export type LookDefinition = {
  id: string;
  title: string;
  description: string;
  /** Path under /public — must be a clothing/editorial asset already in the repo */
  coverImage: string;
  items: Array<{
    slug: string;
    role: LookItemRole;
  }>;
};

export const LOOKS: LookDefinition[] = [
  {
    id: "city-essentials",
    title: "Day Edit",
    description:
      "A calm everyday foundation — soft tee, relaxed chino, and easy sneakers.",
    coverImage: "/products/everyday-cotton-tee/white-01.jpg",
    items: [
      { slug: "everyday-cotton-tee", role: "top" },
      { slug: "soft-relaxed-chino", role: "bottom" },
      { slug: "cloud-city-sneaker", role: "footwear" },
      { slug: "soft-cotton-cap", role: "accessory" },
    ],
  },
  {
    id: "evening-line",
    title: "Evening Line",
    description:
      "Fluid midi, structured tote, and a quiet gold finish for night.",
    // Cover uses verified tote (midi product photo cleared as colorway mismatch)
    coverImage: "/products/atelier-structured-tote/01.jpg",
    items: [
      { slug: "coastal-silk-midi", role: "top" },
      { slug: "atelier-structured-tote", role: "bag" },
      { slug: "atelier-leather-heel", role: "footwear" },
      { slug: "quiet-gold-hoops", role: "accessory" },
    ],
  },
  {
    id: "tailored-edge",
    title: "Tailored Ivory",
    description:
      "Linen blazer, crisp oxford, and loafers — desk to dinner polish.",
    coverImage: "/products/skyline-linen-blazer/01.jpg",
    items: [
      { slug: "skyline-linen-blazer", role: "outerwear" },
      { slug: "harbor-oxford-shirt", role: "top" },
      { slug: "gallery-leather-loafer", role: "footwear" },
      { slug: "breeze-silk-scarf", role: "accessory" },
    ],
  },
  {
    id: "night-outer",
    title: "After Dark",
    description:
      "Wool overcoat and ink layers — an editorial silhouette for cooler evenings.",
    // Editorial coat banner (not product SKU imagery — overcoat gallery is placeholder)
    coverImage: "/editorial/lookbook-rail.jpg",
    items: [
      { slug: "midnight-wool-overcoat", role: "outerwear" },
      { slug: "everyday-cotton-tee", role: "top" },
      { slug: "horizon-crossbody", role: "bag" },
      { slug: "cloud-city-sneaker", role: "footwear" },
    ],
  },
];
