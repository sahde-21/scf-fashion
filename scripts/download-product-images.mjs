/**
 * Downloads Unsplash License product/editorial images into public/.
 * Run: node scripts/download-product-images.mjs
 * Does not require an API key — uses the public images.unsplash.com CDN.
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ file: string; source: string; note: string }[]} */
const ASSETS = [
  // —— Editorial ——
  {
    file: "public/editorial/hero.jpg",
    source:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=75",
    note: "Homepage hero — freestocks",
  },
  {
    file: "public/editorial/promo.jpg",
    source:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=75",
    note: "Promo banner — Clark Street Mercantile",
  },
  {
    file: "public/editorial/cat-women.jpg",
    source:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=75",
    note: "Category women",
  },
  {
    file: "public/editorial/cat-men.jpg",
    source:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=75",
    note: "Category men",
  },
  {
    file: "public/editorial/cat-shoes.jpg",
    source:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=75",
    note: "Category shoes",
  },
  {
    file: "public/editorial/cat-bags.jpg",
    source:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=75",
    note: "Category bags",
  },
  {
    file: "public/editorial/cat-accessories.jpg",
    source:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=75",
    note: "Category accessories",
  },

  // —— Products (primary galleries) ——
  {
    file: "public/products/skyline-linen-blazer/01.jpg",
    source:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=75",
    note: "Blazer primary",
  },
  {
    file: "public/products/skyline-linen-blazer/02.jpg",
    source:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=75",
    note: "Blazer alt",
  },
  {
    file: "public/products/coastal-silk-midi/01.jpg",
    source:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=75",
    note: "Midi dress primary",
  },
  {
    file: "public/products/coastal-silk-midi/02.jpg",
    source:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=75",
    note: "Midi dress alt",
  },
  {
    file: "public/products/everyday-cotton-tee/white-01.jpg",
    source:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=75",
    note: "White crew tee — Anomaly",
  },
  {
    file: "public/products/everyday-cotton-tee/white-02.jpg",
    source:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=75",
    note: "Dark tee alt (gallery only; not Ink colorway claim)",
  },
  {
    file: "public/products/everyday-cotton-tee/ink-01.jpg",
    source:
      "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?auto=format&fit=crop&w=1200&q=75",
    note: "Black crew tee — Luis Quintero (Ink colorway demo)",
  },
  {
    file: "public/products/harbor-oxford-shirt/white-01.jpg",
    source:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=75",
    note: "White/light oxford primary",
  },
  {
    file: "public/products/harbor-oxford-shirt/white-02.jpg",
    source:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=75",
    note: "Shirt alt",
  },
  {
    file: "public/products/harbor-oxford-shirt/sky-01.jpg",
    source:
      "https://images.unsplash.com/photo-1602810316693-3667c854239a?auto=format&fit=crop&w=1200&q=75",
    note: "Blue button-up on table — Nimble Made (Sky colorway demo)",
  },
  {
    file: "public/products/midnight-wool-overcoat/01.jpg",
    source:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=75",
    note: "Overcoat primary",
  },
  {
    file: "public/products/midnight-wool-overcoat/02.jpg",
    source:
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=75",
    note: "Overcoat alt",
  },
  {
    file: "public/products/soft-relaxed-chino/01.jpg",
    source:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=75",
    note: "Chino primary",
  },
  {
    file: "public/products/soft-relaxed-chino/02.jpg",
    source:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=75",
    note: "Chino alt",
  },
  {
    file: "public/products/cloud-city-sneaker/01.jpg",
    source:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=75",
    note: "Sneaker primary",
  },
  {
    file: "public/products/cloud-city-sneaker/02.jpg",
    source:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=75",
    note: "Sneaker alt",
  },
  {
    file: "public/products/atelier-leather-heel/01.jpg",
    source:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=75",
    note: "Heel primary",
  },
  {
    file: "public/products/atelier-leather-heel/02.jpg",
    source:
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1200&q=75",
    note: "Heel alt",
  },
  {
    file: "public/products/gallery-leather-loafer/01.jpg",
    source:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=75",
    note: "Loafer primary",
  },
  {
    file: "public/products/gallery-leather-loafer/02.jpg",
    source:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=75",
    note: "Loafer alt",
  },
  {
    file: "public/products/atelier-structured-tote/01.jpg",
    source:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=75",
    note: "Tote primary",
  },
  {
    file: "public/products/atelier-structured-tote/02.jpg",
    source:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=75",
    note: "Tote alt",
  },
  {
    file: "public/products/horizon-crossbody/01.jpg",
    source:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=75",
    note: "Crossbody primary",
  },
  {
    file: "public/products/horizon-crossbody/02.jpg",
    source:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=75",
    note: "Crossbody alt",
  },
  {
    file: "public/products/evening-mini-clutch/01.jpg",
    source:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=75",
    note: "Clutch primary",
  },
  {
    file: "public/products/evening-mini-clutch/02.jpg",
    source:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=75",
    note: "Clutch alt",
  },
  {
    file: "public/products/quiet-gold-hoops/01.jpg",
    source:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=75",
    note: "Hoops primary",
  },
  {
    file: "public/products/quiet-gold-hoops/02.jpg",
    source:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=75",
    note: "Hoops alt",
  },
  {
    file: "public/products/breeze-silk-scarf/01.jpg",
    source:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=75",
    note: "Scarf primary",
  },
  {
    file: "public/products/breeze-silk-scarf/02.jpg",
    source:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=75",
    note: "Scarf alt",
  },
  {
    file: "public/products/studio-leather-belt/01.jpg",
    source:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=75",
    note: "Belt primary",
  },
  {
    file: "public/products/studio-leather-belt/02.jpg",
    source:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=75",
    note: "Belt alt",
  },
  {
    file: "public/products/soft-cotton-cap/01.jpg",
    source:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=75",
    note: "Cap primary",
  },
  {
    file: "public/products/soft-cotton-cap/02.jpg",
    source:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=75",
    note: "Cap alt",
  },
];

async function downloadOne(asset) {
  const dest = join(root, asset.file);
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) {
    console.log(`skip  ${asset.file}`);
    return;
  }
  const res = await fetch(asset.source, {
    headers: { "User-Agent": "scf-fashion-local-demo/1.0" },
    redirect: "follow",
  });
  if (!res.ok || !res.body) {
    throw new Error(`Failed ${asset.file}: HTTP ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(dest));
  console.log(`ok    ${asset.file} — ${asset.note}`);
}

async function main() {
  console.log(`Downloading ${ASSETS.length} Unsplash License assets…`);
  for (const asset of ASSETS) {
    await downloadOne(asset);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
