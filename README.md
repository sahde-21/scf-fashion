# SCF Fashion

Premium, mobile-first fashion e-commerce storefront for **SCF Fashion**.

White + sky-blue design, dual **USD / IQD** pricing, local cart persistence, and
**WhatsApp checkout** (no card payments). Built with Next.js, TypeScript, and
Tailwind CSS — free and open-source packages only.

> This repository is a **local demo**. Working locally does **not** mean the site
> is production-secure. Do not deploy secrets, enable billing, or treat the local
> admin gate as real authentication.

## Features

- Brand homepage with editorial hero, collections, new arrivals, popular pieces, and promo section
- Full catalog with search, sort, and filters (category, size, color, price, stock)
- Product detail pages with gallery, variants, availability, and related products
- Cart with quantity updates and `localStorage` persistence
- Checkout that builds a WhatsApp order message for `07506455249` (normalized to `wa.me/9647506455249`)
- Copy-order fallback if WhatsApp cannot open
- Clear notice that customers must press **Send** in WhatsApp
- Dual currency labels (USD + IQD) with a documented fixed demo exchange rate
- Local-only admin for product CRUD / publish state and order drafts
- Loading, empty, and error states; `not-found` page; reduced-motion support
- Accessible focus states, semantic structure, and basic SEO metadata

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Browser `localStorage` for cart, catalog overrides, and order drafts
- Server-only admin password via `.env.local` (never committed)

No paid APIs, databases, auth providers, analytics, or hosting are required.

## Quick start (on your computer)

```bash
git clone https://github.com/sahde-21/scf-fashion.git
cd scf-fashion
npm install
cp .env.example .env.local
# edit .env.local and set ADMIN_DEMO_PASSWORD to a local-only value
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build check (does not deploy) |
| `npm run start` | Serve a production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |

## Configuration

### WhatsApp number

Edit `src/lib/config.ts`:

- `STORE_WHATSAPP_LOCAL` — store-facing number (`07506455249`)
- `STORE_WHATSAPP_E164_DIGITS` — digits for `https://wa.me/...` (`9647506455249`)

Iraq normalization used here: drop the leading `0`, prefix country code `964`.

### Currency (USD + IQD)

Also in `src/lib/config.ts`:

- `USD_TO_IQD = 1310` — **fixed demo assumption**, not a live market rate
- `CURRENCY_NOTE` — customer-facing explanation

Update the rate manually when you want a different assumption. The UI always labels both currencies.

### Admin demo password

1. Copy `.env.example` → `.env.local`
2. Set `ADMIN_DEMO_PASSWORD=your-local-value`
3. Restart `npm run dev`
4. Visit `/admin`

The password is verified in a **server route** and a short-lived **httpOnly** cookie is set.
It is **not** embedded in client bundles.

**Limitations (important):**

- Admin product edits and order drafts are stored in **this browser’s localStorage only**
- They are **not** shared across devices, browsers, or users
- Clearing site data resets local overrides/orders
- This is **not** production-grade security

## Architecture

```
src/
  app/                 # Routes (home, products, cart, checkout, admin, APIs)
  components/          # UI, storefront, cart, checkout, admin
  context/             # Cart + catalog providers (localStorage)
  data/products.ts     # Seed catalog (committed sample data)
  lib/                 # config, currency, WhatsApp, product helpers, admin session
  types/               # Shared TypeScript types
docs/IMAGE_LICENSES.md # Image source / license notes
```

Seed products live in Git. Admin overrides merge on top in the browser and never
write back to the repository automatically.

## Image licensing

Sample imagery uses Unsplash photos under the Unsplash License.
See [`docs/IMAGE_LICENSES.md`](docs/IMAGE_LICENSES.md).

## Testing checklist (manual)

1. Home loads with hero, collections, and product rails
2. Catalog filters/search/sort update results and empty state works
3. Product detail: change size/color, add to cart, related products appear
4. Cart persists after refresh; quantities update; remove works
5. Checkout validates name/phone; WhatsApp link opens with full message
6. Copy-order fallback copies the message
7. `/admin` rejects missing/wrong password; accepts `.env.local` password
8. Admin can add/edit/unpublish/remove products (local only)
9. Mobile navigation and focus rings work with keyboard
10. `npm run lint`, `npm run typecheck`, and `npm run build` succeed

## Budget / safety rules honored by this project

- **$0** — free npm packages and free Unsplash assets only
- No deploy/publish steps are included or required
- No second repository
- Secrets stay in `.env.local` (gitignored)
- No real card payments

## Continuing work later

1. Pull the latest branch from GitHub on your computer
2. Run `npm install` and recreate `.env.local` from `.env.example`
3. Use `npm run dev` for UI work
4. Keep WhatsApp/currency edits centralized in `src/lib/config.ts`
