# Product image asset gaps

SCF Fashion supports **color-variant photos** and **explicit front/back views**
without requiring a database migration. Fields are optional and backward-compatible:

- `ProductColor.images?: string[]` — genuine photos for that colorway (index 0 = front, optional index 1 = back for that color)
- `Product.views?: { front?: string; back?: string }` — only when imagery is a real front/back pair

The UI never CSS-tints a photo to fake a color change, and never labels an
unrelated gallery image as **BACK**. Invalid image URLs are dropped; the gallery
falls back to remaining valid assets or an honest placeholder.

**Brand direction (owner):** quiet luxury. Demo photography is illustrative /
editorial and does **not** claim to represent verified warehouse stock packs.

## Seed catalog status (audited Oct 2026 — photography correction pass)

| Product | Base imagery | Color-specific | Front / back | Notes |
| --- | --- | --- | --- | --- |
| Skyline Linen Blazer | Verified beige blazer pair | Missing | Missing | Quiet-luxury editorial match |
| Coastal Silk Midi | **None — placeholder** | Missing | Missing | Cleared: white eyelet + red gown were not azure/blush silk midi |
| Everyday Cotton Tee | White base | White + Ink | Missing | Sky still missing |
| Harbor Oxford Shirt | White pair | White + Sky | Missing | Demo stand-ins, not same-SKU pack |
| Midnight Wool Overcoat | **None — placeholder** | Missing | Missing | Cleared: camel wrap / tuxedo / field jacket ≠ charcoal/navy overcoat |
| Soft Relaxed Chino | Khaki chino lifestyle | Missing | Missing | Pants focus with lifestyle layers |
| Cloud City Sneaker | **None — placeholder** | Missing | Missing | Orphan disk files are branded Nike — not mapped |
| Atelier Leather Heel | **None — placeholder** | Missing | Missing | Local navy stilettos ≠ nude/black; reused only for `cat-shoes` category tile |
| Gallery Leather Loafer | **None — placeholder** | Missing | Missing | Orphan disk files are monk straps — not loafers |
| Atelier Structured Tote | Cream canvas tote | Missing | Missing | Also used for `cat-bags` editorial tile |
| Horizon Crossbody | **None — placeholder** | Missing | Missing | Orphan disk files include logo’d / Ferragamo-style bags — not mapped |
| Evening Mini Clutch | **None — placeholder** | Missing | Missing | Orphan pink chevron bag ≠ slim evening clutch |
| Quiet Gold Hoops | Twisted gold hoops (`01.jpg` only) | — | Missing | Byte-identical `02.jpg` removed; also used for `cat-accessories` |
| Breeze Silk Scarf | **None — placeholder** | Missing | Missing | Cleared: emerald + marigold files ≠ sky/ivory scarf |
| Studio Leather Belt | **None — placeholder** | Missing | Missing | Orphan desk/lifestyle file is not a belt product shot |
| Soft Cotton Cap | **None — placeholder** | Missing | Missing | Cleared: charcoal cap ≠ white/sky; duplicate `02.jpg` removed |

## Editorial category tiles (corrected Oct 2026)

| File | Source (local verified copy) | Status |
| --- | --- | --- |
| `cat-shoes.jpg` | Copy of `atelier-leather-heel/01.jpg` (navy stiletto, unbranded) | Replaced ALDO floral retailer shot |
| `cat-bags.jpg` | Copy of `atelier-structured-tote/01.jpg` (cream tote) | Replaced Gucci Marmont shot |
| `cat-accessories.jpg` | Copy of `quiet-gold-hoops/01.jpg` (gold hoops) | Replaced pearl necklace box shot |

## Assets still needed (owner / licensed studio)

1. **Cloud City Sneaker** — unbranded white / sky knit sneakers, quiet studio light.
2. **Gallery Leather Loafer** — cognac + black penny or Venetian loafers (not monk straps).
3. **Horizon Crossbody** — unbranded tan / ink compact crossbody.
4. **Evening Mini Clutch** — slim satin/evening clutch (silver + sky).
5. **Studio Leather Belt** — clean belt-only studio shots (black + cognac), no knives/backpacks/desk props.
6. **Everyday Cotton Tee — Sky** — plain light-blue crew tee.
7. **Midnight Wool Overcoat — Charcoal & Navy** — same silhouette in both colors.
8. **Coastal Silk Midi — Azure & Blush** — true silk midi in listed colors + second angle.
9. **Breeze Silk Scarf — Sky & Ivory** — finished scarf product shots (not textile study only).
10. **Atelier Leather Heel — Nude & Black** — pointed or softly squared leather heels in listed colors.
11. **Soft Cotton Cap — White & Sky** — unstructured cotton cap in listed colors.
12. **Remaining colorways / front-back pairs** — only when photos depict that exact garment.
13. **Store-owned campaign hero** — optional replace of Unsplash clothing-rack campaign.

## Easy replacement path

1. Drop JPEG/WebP files into `public/products/{slug}/`
2. Local admin → edit product → set image URLs to `/products/...` paths, or color lines `id|name|hex|frontUrl|backUrl`
3. Or edit `src/data/products.ts` and re-run `npm run typecheck`
4. Document permission in `docs/IMAGE_LICENSES.md`

## What we deliberately did not do

- Did **not** download official brand/retailer product images (copyright).
- Did **not** invent front/back controls without real pairs.
- Did **not** tint white photos to fake Sky/Ink colors.
- Did **not** keep mismatched Nike / Gucci / Ferragamo / ALDO / pearl-box / costume-jewelry stand-ins in seed galleries or category tiles.
- Did **not** label illustrative Unsplash photos as verified inventory.
- Did **not** wire orphan files under placeholder SKUs after visual inspection failed.

## Admin / inventory honesty

Catalog overrides and order drafts use **this browser’s `localStorage` only**. They are
not a shared database. Opening WhatsApp does not confirm an order.
