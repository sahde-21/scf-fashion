# Product image asset gaps

SCF Fashion supports **color-variant photos** and **explicit front/back views**
without requiring a database migration. Fields are optional and backward-compatible:

- `ProductColor.images?: string[]` — genuine photos for that colorway (index 0 = front, optional index 1 = back for that color)
- `Product.views?: { front?: string; back?: string }` — only when imagery is a real front/back pair

The UI never CSS-tints a photo to fake a color change, and never labels an
unrelated gallery image as **BACK**. Invalid image URLs are dropped; the gallery
falls back to remaining valid assets or a “no verified image” state.

## Seed catalog status (audited)

| Product | Color-specific images | Front / back pair | Notes |
| --- | --- | --- | --- |
| Everyday Cotton Tee | **White only** (matches primary studio photo) | Missing | Sky / Ink still need same-SKU shots — do not map unrelated tees |
| Harbor Oxford Shirt | Missing | Missing | Prior Sky mapping was an unrelated white shirt + tie outfit |
| Midnight Wool Overcoat | Missing | Missing | Prior Charcoal/Navy mappings were olive field jacket / navy suit |
| All other seed products | Missing | Missing | Swatches select cart variant only; gallery stays on base `images` |

## Assets still needed (exact)

To re-enable color galleries honestly, add licensed studio photos of the **same SKU** in each colorway:

1. **Everyday Cotton Tee** — Sky and Ink variants of the plain crew tee (no alternate graphics). White is already wired to the existing Unsplash studio shot.
2. **Harbor Oxford Shirt** — White and Sky oxfords, same cut/collar.
3. **Midnight Wool Overcoat** — Charcoal and Navy of the same overcoat silhouette.
4. **Remaining catalog** — optional per-color photos only when they depict that exact garment colorway.

To enable FRONT/BACK controls for any product:

1. Set `views.front` and `views.back` to genuine matching views of that garment.
2. Optionally add a second URL in `colors[].images` for that colorway’s back (only when `views.back` is also set).

Until those exist, color swatches update the selected cart variant and label, and the UI shows: *“A dedicated photo for this colorway is not in the catalog yet.”* FRONT/BACK toggles stay hidden for that colorway unless `views.back` is set and the color itself provides a second (back) image — or the selected color has no `images` and product-level `views` apply.

## How to add assets (local admin)

1. Open `/admin` with `ADMIN_DEMO_PASSWORD` from `.env.local`
2. Edit a product
3. Set **Front view URL** / **Back view URL** only for genuine views
4. In **Colors**, use `id|name|hex|frontUrl|backUrl` per line when color photos exist
5. Set **Stock quantity per size** so storefront availability matches demo inventory
6. Save — overrides stay in this browser’s `localStorage` only

Allowed image hosts for the Next.js image optimizer: `images.unsplash.com`, or local paths under `/public` (e.g. `/products/tee-front.jpg`).

## Smallest future schema change (if moving off localStorage)

Add optional JSON columns (or document fields) mirroring `views`, `colors[].images`,
and `stockBySize`. No migration is required for the current demo architecture.
