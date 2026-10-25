import type { Product } from "@/types";

/**
 * Seed catalog. Images are local copies of Unsplash License assets under
 * `public/products/` — see docs/IMAGE_LICENSES.md and docs/ASSET_GAPS.md.
 * Admin overrides live in browser localStorage only and never sync to Git.
 *
 * Color-specific `images` are only set when a verified photo depicts that
 * garment type + color. They are representative demo assets, not same-SKU
 * studio packs — replace with store-owned photography before a public launch.
 * Empty `images` arrays show the honest UI placeholder (never fake inventory).
 */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "p-linen-blazer",
    slug: "skyline-linen-blazer",
    name: "Skyline Linen Blazer",
    description:
      "A breathable linen blend blazer with soft shoulders and a relaxed lapel. Layer over tees or silk camisoles for city evenings.",
    category: "women",
    priceUsd: 128,
    images: [
      "/products/skyline-linen-blazer/01.jpg",
      "/products/skyline-linen-blazer/02.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { id: "ivory", name: "Ivory", hex: "#F5F0E8" },
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
    ],
    stockBySize: { XS: 4, S: 8, M: 10, L: 6 },
    tags: ["blazer", "linen", "work"],
    featured: true,
    newArrival: true,
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "p-silk-midi",
    slug: "coastal-silk-midi",
    name: "Coastal Silk Midi Dress",
    description:
      "Fluid midi dress with a gentle bias drape and covered buttons. Packs light and photographs beautifully.",
    category: "women",
    priceUsd: 142,
    // No verified azure/blush silk midi on Unsplash — local candidates were short white
    // eyelet and red formal gown (misleading). Honest placeholder until store photography.
    images: [],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { id: "azure", name: "Azure", hex: "#38BDF8" },
      { id: "blush", name: "Blush", hex: "#F9C5D1" },
    ],
    stockBySize: { XS: 3, S: 7, M: 9, L: 5, XL: 2 },
    tags: ["dress", "silk", "evening"],
    featured: true,
    newArrival: true,
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-05T10:00:00.000Z",
  },
  {
    id: "p-cotton-tee",
    slug: "everyday-cotton-tee",
    name: "Everyday Cotton Tee",
    description:
      "Mid-weight organic cotton tee with a refined crew neck. The quiet essential for every wardrobe.",
    category: "women",
    priceUsd: 38,
    images: ["/products/everyday-cotton-tee/white-01.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        id: "white",
        name: "White",
        hex: "#FFFFFF",
        images: ["/products/everyday-cotton-tee/white-01.jpg"],
      },
      // Sky still needs a verified light-blue plain crew tee — see ASSET_GAPS.md
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
      {
        id: "ink",
        name: "Ink",
        hex: "#0F172A",
        images: ["/products/everyday-cotton-tee/ink-01.jpg"],
      },
    ],
    stockBySize: { XS: 6, S: 14, M: 18, L: 12, XL: 4 },
    tags: ["basics", "cotton"],
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "p-oxford-shirt",
    slug: "harbor-oxford-shirt",
    name: "Harbor Oxford Shirt",
    description:
      "Crisp oxford cloth with mother-of-pearl buttons and a soft collar. Works from desk to dinner.",
    category: "men",
    priceUsd: 78,
    images: [
      "/products/harbor-oxford-shirt/white-01.jpg",
      "/products/harbor-oxford-shirt/white-02.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        id: "white",
        name: "White",
        hex: "#FFFFFF",
        images: ["/products/harbor-oxford-shirt/white-01.jpg"],
      },
      {
        id: "sky",
        name: "Sky",
        hex: "#BAE6FD",
        images: ["/products/harbor-oxford-shirt/sky-01.jpg"],
      },
    ],
    stockBySize: { S: 5, M: 11, L: 8, XL: 3 },
    tags: ["shirt", "oxford"],
    featured: true,
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-08T10:00:00.000Z",
  },
  {
    id: "p-wool-overcoat",
    slug: "midnight-wool-overcoat",
    name: "Midnight Wool Overcoat",
    description:
      "Double-faced wool coat with a clean silhouette and deep pockets. Built for cool evenings and travel.",
    category: "men",
    priceUsd: 248,
    // No verified charcoal/navy wool overcoat — local candidates were camel wrap,
    // tuxedo blazer, and olive field jacket. Honest placeholder until store photography.
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { id: "charcoal", name: "Charcoal", hex: "#334155" },
      { id: "navy", name: "Navy", hex: "#1E3A5F" },
    ],
    stockBySize: { S: 2, M: 4, L: 3, XL: 1 },
    tags: ["coat", "wool"],
    featured: true,
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "p-relaxed-chino",
    slug: "soft-relaxed-chino",
    name: "Soft Relaxed Chino",
    description:
      "Tapered chino with stretch and a washed finish. Pair with sneakers or loafers.",
    category: "men",
    priceUsd: 68,
    images: ["/products/soft-relaxed-chino/01.jpg"],
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { id: "sand", name: "Sand", hex: "#E7E5E4" },
      { id: "olive", name: "Olive", hex: "#78716C" },
    ],
    stockBySize: { "28": 4, "30": 9, "32": 12, "34": 7, "36": 3 },
    tags: ["pants", "chino"],
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "p-city-sneaker",
    slug: "cloud-city-sneaker",
    name: "Cloud City Sneaker",
    description:
      "Lightweight knit upper with a cushioned sole. Designed for all-day walks and airport hops.",
    category: "shoes",
    priceUsd: 118,
    // No trustworthy unbranded knit sneaker on Unsplash — honest placeholder
    images: [],
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
    ],
    stockBySize: {
      "37": 2,
      "38": 4,
      "39": 6,
      "40": 8,
      "41": 5,
      "42": 4,
      "43": 2,
    },
    tags: ["sneakers", "comfort"],
    featured: true,
    popular: true,
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "p-leather-heel",
    slug: "atelier-leather-heel",
    name: "Atelier Leather Heel",
    description:
      "Sculpted heel with a softly squared toe. Stable enough for long evenings, elegant enough for celebrations.",
    category: "shoes",
    priceUsd: 156,
    // Local heel files are navy stilettos — not nude/black colorways. Kept only as
    // shoes-category editorial (cat-shoes.jpg). Product gallery uses placeholder.
    images: [],
    sizes: ["36", "37", "38", "39", "40"],
    colors: [
      { id: "nude", name: "Nude", hex: "#E8D5C4" },
      { id: "black", name: "Black", hex: "#111827" },
    ],
    stockBySize: { "36": 3, "37": 5, "38": 6, "39": 4, "40": 2 },
    tags: ["heels", "leather"],
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "p-loafers",
    slug: "gallery-leather-loafer",
    name: "Gallery Leather Loafer",
    description:
      "Hand-finished leather loafers with a flexible sole. Slip on with cropped trousers or midi skirts.",
    category: "shoes",
    priceUsd: 134,
    // Available Unsplash dress shoes were monk straps / boots — not loafers
    images: [],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: [
      { id: "cognac", name: "Cognac", hex: "#9A3412" },
      { id: "black", name: "Black", hex: "#111827" },
    ],
    stockBySize: {
      "39": 2,
      "40": 5,
      "41": 7,
      "42": 6,
      "43": 3,
      "44": 1,
    },
    tags: ["loafers", "leather"],
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-14T10:00:00.000Z",
  },
  {
    id: "p-structured-tote",
    slug: "atelier-structured-tote",
    name: "Atelier Structured Tote",
    description:
      "Architectural tote with a wide base and hidden magnetic closure. Fits a 13\" laptop and a silk scarf.",
    category: "bags",
    priceUsd: 168,
    images: ["/products/atelier-structured-tote/01.jpg"],
    sizes: ["One size"],
    colors: [
      { id: "cream", name: "Cream", hex: "#FAF7F2" },
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
    ],
    stockBySize: { "One size": 9 },
    tags: ["tote", "work"],
    featured: true,
    popular: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-02T10:00:00.000Z",
  },
  {
    id: "p-crossbody",
    slug: "horizon-crossbody",
    name: "Horizon Crossbody",
    description:
      "Compact crossbody with adjustable strap and two inner pockets. Ideal for markets and late dinners.",
    category: "bags",
    priceUsd: 96,
    // No unbranded crossbody match without third-party logos — honest placeholder
    images: [],
    sizes: ["One size"],
    colors: [
      { id: "tan", name: "Tan", hex: "#D6B48C" },
      { id: "ink", name: "Ink", hex: "#0F172A" },
    ],
    stockBySize: { "One size": 11 },
    tags: ["crossbody", "everyday"],
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-11T10:00:00.000Z",
  },
  {
    id: "p-mini-clutch",
    slug: "evening-mini-clutch",
    name: "Evening Mini Clutch",
    description:
      "Slim satin clutch with a hidden clasp. Holds cards, keys, and a compact mirror.",
    category: "bags",
    priceUsd: 72,
    // No verified slim evening clutch without mismatched bags — honest placeholder
    images: [],
    sizes: ["One size"],
    colors: [
      { id: "silver", name: "Silver", hex: "#E2E8F0" },
      { id: "sky", name: "Sky", hex: "#38BDF8" },
    ],
    stockBySize: { "One size": 7 },
    tags: ["clutch", "evening"],
    published: true,
    inStock: true,
    createdAt: "2026-08-18T10:00:00.000Z",
  },
  {
    id: "p-gold-hoops",
    slug: "quiet-gold-hoops",
    name: "Quiet Gold Hoops",
    description:
      "Lightweight gold-tone hoops with a brushed finish. Everyday jewelry that still feels considered.",
    category: "accessories",
    priceUsd: 42,
    images: ["/products/quiet-gold-hoops/01.jpg"],
    sizes: ["One size"],
    colors: [{ id: "gold", name: "Gold", hex: "#D4AF37" }],
    stockBySize: { "One size": 15 },
    tags: ["jewelry", "earrings"],
    popular: true,
    newArrival: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-09T10:00:00.000Z",
  },
  {
    id: "p-silk-scarf",
    slug: "breeze-silk-scarf",
    name: "Breeze Silk Scarf",
    description:
      "Hand-rolled silk scarf with a soft sky wash. Tie at the neck, bag handle, or hair.",
    category: "accessories",
    priceUsd: 54,
    // Local scarf files are emerald textile and marigold orange — not sky/ivory.
    // Honest placeholder until verified colorway photography.
    images: [],
    sizes: ["One size"],
    colors: [
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
      { id: "ivory", name: "Ivory", hex: "#F5F0E8" },
    ],
    stockBySize: { "One size": 10 },
    tags: ["scarf", "silk"],
    featured: true,
    published: true,
    inStock: true,
    createdAt: "2026-09-03T10:00:00.000Z",
  },
  {
    id: "p-leather-belt",
    slug: "studio-leather-belt",
    name: "Studio Leather Belt",
    description:
      "Full-grain leather belt with a brushed buckle. Sizes are listed by waist measurement.",
    category: "accessories",
    priceUsd: 58,
    // Verified belt-only Unsplash assets unavailable without unrelated props
    images: [],
    sizes: ["80", "85", "90", "95", "100"],
    colors: [
      { id: "black", name: "Black", hex: "#111827" },
      { id: "cognac", name: "Cognac", hex: "#9A3412" },
    ],
    stockBySize: { "80": 3, "85": 6, "90": 8, "95": 5, "100": 2 },
    tags: ["belt", "leather"],
    published: true,
    inStock: true,
    createdAt: "2026-08-22T10:00:00.000Z",
  },
  {
    id: "p-cap",
    slug: "soft-cotton-cap",
    name: "Soft Cotton Cap",
    description:
      "Unstructured cotton cap with an adjustable strap. A light finishing piece for weekends.",
    category: "accessories",
    priceUsd: 36,
    // Local cap file is charcoal/washed black (and 02 was a byte-identical duplicate).
    // Not white/sky — honest placeholder until verified colorway photography.
    images: [],
    sizes: ["One size"],
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
    ],
    stockBySize: { "One size": 0 },
    tags: ["cap", "casual"],
    newArrival: true,
    published: true,
    inStock: false,
    createdAt: "2026-09-15T10:00:00.000Z",
  },
];
