/**
 * Replaces audited mismatched product/editorial images with verified
 * Unsplash License clothing/accessory photography.
 * Run: node scripts/correct-mismatched-images.mjs
 *
 * IMPORTANT: Does not overwrite the quiet-luxury clothing-rack hero
 * (`public/editorial/hero.jpg`). Visually verify every download before
 * wiring paths into `src/data/products.ts`. Prefer empty `images: []`
 * over a misleading category mismatch.
 */
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ file: string; source: string; note: string }[]} */
const ASSETS = [
  {
    file: "public/editorial/lookbook-rail.jpg",
    source:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1600&q=75",
    note: "Coat editorial for lookbook banner",
  },
  {
    file: "public/editorial/cat-women.jpg",
    source:
      "https://images.unsplash.com/photo-1747814965209-2301e535f209?auto=format&fit=crop&w=1200&q=75",
    note: "Women category — beige blazer editorial",
  },
  {
    file: "public/products/skyline-linen-blazer/01.jpg",
    source:
      "https://images.unsplash.com/photo-1747814965209-2301e535f209?auto=format&fit=crop&w=1200&q=75",
    note: "Ivory/beige oversized blazer",
  },
  {
    file: "public/products/skyline-linen-blazer/02.jpg",
    source:
      "https://images.unsplash.com/photo-1747815065172-a3234582223e?auto=format&fit=crop&w=1200&q=75",
    note: "Beige blazer second angle",
  },
  {
    file: "public/products/midnight-wool-overcoat/01.jpg",
    source:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=75",
    note: "Camel wrap coat — coat category match",
  },
  {
    file: "public/products/coastal-silk-midi/01.jpg",
    source:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=75",
    note: "Soft white dress editorial",
  },
  {
    file: "public/products/soft-relaxed-chino/01.jpg",
    source:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=75",
    note: "Khaki chino lifestyle",
  },
  {
    file: "public/products/atelier-leather-heel/01.jpg",
    source:
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1200&q=75",
    note: "Navy stiletto pumps",
  },
  {
    file: "public/products/atelier-structured-tote/01.jpg",
    source:
      "https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?auto=format&fit=crop&w=1200&q=75",
    note: "Cream canvas tote",
  },
  {
    file: "public/products/quiet-gold-hoops/01.jpg",
    source:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=75",
    note: "Twisted gold hoop earrings",
  },
  {
    file: "public/products/breeze-silk-scarf/01.jpg",
    source:
      "https://images.unsplash.com/photo-1527167598984-8802d8028eea?auto=format&fit=crop&w=1200&q=75",
    note: "Emerald silk textile for scarf",
  },
  // Placeholders (do not download misleading stand-ins):
  // cloud-city-sneaker, gallery-leather-loafer, horizon-crossbody,
  // evening-mini-clutch, studio-leather-belt → images: [] in products.ts
];

async function downloadOne(asset) {
  const dest = join(root, asset.file);
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(asset.source, {
    headers: { "User-Agent": "scf-fashion-local-demo/1.0" },
    redirect: "follow",
  });
  if (!res.ok || !res.body) {
    throw new Error(`Failed ${asset.file}: HTTP ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(dest));
  console.log(`ok  ${asset.file} — ${asset.note}`);
}

async function main() {
  console.log(`Correcting ${ASSETS.length} assets (hero rack preserved)…`);
  for (const asset of ASSETS) {
    await downloadOne(asset);
  }
  console.log("Done. Visually verify before committing seed paths.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
