# Product image asset gaps

SCF Fashion supports **color-variant photos** and **explicit front/back views**
without requiring a database migration. Fields are optional and backward-compatible:

- `ProductColor.images?: string[]` — genuine photos for that colorway
- `Product.views?: { front?: string; back?: string }` — only when imagery is a real front/back pair

The UI never CSS-tints a photo to fake a color change, and never labels an
unrelated gallery image as **BACK**.

## Seed catalog status

| Product | Color-specific images | Front / back pair |
| --- | --- | --- |
| Everyday Cotton Tee | Yes (White, Sky, Ink) | Missing — need studio front + back |
| Harbor Oxford Shirt | Yes (White, Sky) | Missing |
| Midnight Wool Overcoat | Yes (Charcoal, Navy) | Missing |
| All other seed products | Missing | Missing |

## How to add assets (local admin)

1. Open `/admin` with `ADMIN_DEMO_PASSWORD` from `.env.local`
2. Edit a product
3. Set **Front view URL** / **Back view URL** only for genuine views
4. In **Colors**, use `id|name|hex|imageUrl` per line when a color photo exists
5. Save — overrides stay in this browser’s `localStorage` only

## Smallest future schema change (if moving off localStorage)

Add optional JSON columns (or document fields) mirroring `views` and
`colors[].images`. No migration is required for the current demo architecture.
