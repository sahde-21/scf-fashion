# Image sources and licenses

All product and editorial imagery shipped with SCF Fashion is from
[Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license).

You may use these photos commercially and non-commercially. Attribution is not
required by the license but is listed here for transparency.

**Brand / retailer product pages were not downloaded.** Official commerce photos
are typically copyrighted and not free to reuse. Demo colorways use Unsplash
photos that match garment **type** (and color when verified). They are
**illustrative editorial assets**, not verified warehouse inventory packs —
replace with store-owned studio photography before a public launch
(see `docs/ASSET_GAPS.md`).

Local copies live under `public/editorial/` and `public/products/`.
Re-download base set with:

```bash
npm run images:download
```

## Editorial

| File | Unsplash photo ID | Note |
| --- | --- | --- |
| `public/editorial/hero.jpg` | `photo-1490481651871-ab68de25d43d` | Quiet-luxury garment rail campaign (warm ivory) — restored Oct 2026; do not overwrite with streetwear |
| `public/editorial/hero-alt.jpg` | `photo-1469334031218-e382a71b716b` | Soft fashion editorial alternate |
| `public/editorial/lookbook-rail.jpg` | `photo-1539533018447-63fcce2678e3` | Coat editorial for lookbook banner (camel wrap — atmosphere only, not SKU stock) |
| `public/editorial/promo.jpg` | `photo-1441984904996-e0b6ba687e04` | Clark Street Mercantile boutique interior |
| `public/editorial/cat-women.jpg` | `photo-1747814965209-2301e535f209` | Beige blazer editorial |
| `public/editorial/cat-men.jpg` | `photo-1523398002811-999ca8dec234` | Street jacket editorial |
| `public/editorial/cat-shoes.jpg` | `photo-1515347619252-60a4bf4fff4f` | **Corrected Oct 2026** — local copy of unbranded navy stilettos (same file as former heel `01.jpg`). Replaces ALDO floral retailer shot. Category tile only — not nude/black heel SKU. |
| `public/editorial/cat-bags.jpg` | `photo-1574365569389-a10d488ca3fb` | **Corrected Oct 2026** — local copy of cream canvas tote (same as `atelier-structured-tote/01.jpg`). Replaces Gucci Marmont shot. |
| `public/editorial/cat-accessories.jpg` | `photo-1617038260897-41a1f14a8ca0` | **Corrected Oct 2026** — local copy of twisted gold hoops (same as `quiet-gold-hoops/01.jpg`). Replaces pearl necklace box shot. |

## Product galleries (seed `images` arrays — photography correction Oct 2026)

| Product slug | Seed mapping | Status / Unsplash IDs |
| --- | --- | --- |
| skyline-linen-blazer | `01.jpg`, `02.jpg` | Kept — beige blazer pair `photo-1747814965209`, `photo-1747815065172` |
| coastal-silk-midi | *(empty)* | **Placeholder** — inspected local files were short white eyelet + red formal gown |
| everyday-cotton-tee | `white-01.jpg`, `ink-01.jpg` | Kept — `photo-1521572163474`, `photo-1571455786673` |
| harbor-oxford-shirt | `white-01.jpg`, `white-02.jpg`, `sky-01.jpg` | Kept — oxford / button-up set |
| midnight-wool-overcoat | *(empty)* | **Placeholder** — inspected locals were camel wrap, tuxedo jacket, olive field coat |
| soft-relaxed-chino | `01.jpg` | Kept — khaki chino lifestyle `photo-1473966968600` |
| cloud-city-sneaker | *(empty)* | **Placeholder** — orphan `01.jpg` inspected: branded Nike (not mapped) |
| atelier-leather-heel | *(empty)* | **Placeholder** — navy stilettos ≠ nude/black; file retained for `cat-shoes` only |
| gallery-leather-loafer | *(empty)* | **Placeholder** — orphan files inspected: monk straps (not loafers) |
| atelier-structured-tote | `01.jpg` | Kept — cream canvas tote `photo-1574365569389` |
| horizon-crossbody | *(empty)* | **Placeholder** — orphan files inspected: floral Ferragamo-style / logo bags |
| evening-mini-clutch | *(empty)* | **Placeholder** — orphan pink chevron bag ≠ slim evening clutch |
| quiet-gold-hoops | `01.jpg` | Kept — twisted gold hoops `photo-1617038260897`; byte-identical `02.jpg` removed |
| breeze-silk-scarf | *(empty)* | **Placeholder** — inspected locals were emerald textile + marigold scarf |
| studio-leather-belt | *(empty)* | **Placeholder** — orphan desk lifestyle shot is not a belt product photo |
| soft-cotton-cap | *(empty)* | **Placeholder** — charcoal cap ≠ white/sky; byte-identical `02.jpg` removed |

## Color-specific mappings (verified type + color)

| Product | Color | Local file | Status |
| --- | --- | --- | --- |
| Everyday Cotton Tee | White | `white-01.jpg` | Verified white crew tee |
| Everyday Cotton Tee | Ink | `ink-01.jpg` | Verified black crew tee (demo stand-in, not same photoshoot as White) |
| Everyday Cotton Tee | Sky | — | Missing — needs light-blue plain crew tee |
| Harbor Oxford Shirt | White | `white-01.jpg` | Verified light oxford / dress shirt |
| Harbor Oxford Shirt | Sky | `sky-01.jpg` | Verified blue button-up product-style shot |

All other color swatches update the cart variant only; gallery stays on base images
or the honest placeholder when `images` is empty.

## Replacing with store-owned photos

1. Add files under `public/products/{slug}/`
2. Update `images` / `colors[].images` / `views` in seed data or local admin
3. Prefer JPEG/WebP under ~200–400KB at ~1200px wide
4. Update this file with your license/permission notes
