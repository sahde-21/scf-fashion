# Product image asset gaps

SCF Fashion supports **color-variant photos** and **explicit front/back views**
without requiring a database migration. Fields are optional and backward-compatible:

- `ProductColor.images?: string[]` — genuine photos for that colorway
- `Product.views?: { front?: string; back?: string }` — only when imagery is a real front/back pair

The UI never CSS-tints a photo to fake a color change, and never labels an
unrelated gallery image as **BACK**.

## Seed catalog status (audited)

| Product | Color-specific images | Front / back pair | Notes |
| --- | --- | --- | --- |
| Everyday Cotton Tee | Missing | Missing | Removed prior Sky (404) and Ink (different graphic tee) mappings |
| Harbor Oxford Shirt | Missing | Missing | Removed prior Sky mapping (white shirt + tie outfit, not sky oxford) |
| Midnight Wool Overcoat | Missing | Missing | Removed prior Charcoal/Navy mappings (olive field jacket / navy suit) |
| All other seed products | Missing | Missing | Swatches select cart variant only; gallery stays on base `images` |

## Assets still needed (exact)

To re-enable color galleries honestly, add licensed studio photos of the **same SKU** in each colorway:

1. **Everyday Cotton Tee** — White, Sky, and Ink variants of the plain crew tee (no alternate graphics).
2. **Harbor Oxford Shirt** — White and Sky oxfords, same cut/collar.
3. **Midnight Wool Overcoat** — Charcoal and Navy of the same overcoat silhouette.

To enable FRONT/BACK controls for any product:

1. Set `views.front` and `views.back` to genuine matching views of that garment.
2. Optionally add a second URL in `colors[].images` for that colorway’s back (only when `views.back` is also set).

Until those exist, color swatches update the selected cart variant and label, and the UI shows: *“A dedicated photo for this colorway is not in the catalog yet.”* FRONT/BACK toggles stay hidden.

## How to add assets (local admin)

1. Open `/admin` with `ADMIN_DEMO_PASSWORD` from `.env.local`
2. Edit a product
3. Set **Front view URL** / **Back view URL** only for genuine views
4. In **Colors**, use `id|name|hex|imageUrl` per line when a color photo exists
5. Save — overrides stay in this browser’s `localStorage` only

## Smallest future schema change (if moving off localStorage)

Add optional JSON columns (or document fields) mirroring `views` and
`colors[].images`. No migration is required for the current demo architecture.
