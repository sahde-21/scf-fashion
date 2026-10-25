# SCF Fashion

Premium, mobile-first fashion storefront for **SCF Fashion**.

White / warm ivory editorial ground, black typography, neon-lime announcement
ticker, full-bleed hero, interactive hanging clothing rail, dual **USD / IQD**
pricing, local cart persistence, and **WhatsApp checkout** (no card payments).
Built with Next.js, TypeScript, and Tailwind CSS — free and open-source packages
only.

> This repository is a **local demo**. Working locally does **not** mean the site
> is production-secure. Do not deploy secrets, enable billing, or treat the local
> admin gate as real authentication.

## Features

- Full-bleed editorial hero with centered brand signal
- Homepage hanging clothing rail with keyboard / touch / swipe selection and “See availability”
- Full-collection lookbook on the homepage (all published products)
- Compact centered brand header (About · SCF Fashion · Contact) plus shop / search / cart
- Neon-lime scrolling announcement ticker (messages in `src/lib/config.ts`)
- Full catalog with search, sort, and filters (category, size, color, price, stock)
- Product detail with color-aware imagery, optional FRONT/BACK views, sizes, related products
- Cart with quantity updates and `localStorage` persistence
- Checkout with optional city/address, map pin link, or WhatsApp live-location guidance for `07506455249` (`wa.me/9647506455249`)
- Copy-order fallback if WhatsApp cannot open; opening chat never auto-confirms an order
- Delivery, returns, and privacy pages with honest “owner confirms” wording
- Dual currency labels (USD + IQD) with a documented fixed demo exchange rate
- Local Unsplash License product photos under `public/products/` (see licensing docs)
- Local-only admin for product CRUD, color images, front/back URLs, per-size demo stock, publish state, order drafts
- Loading, empty, and error states; `not-found` page; reduced-motion support
- Accessible focus states, semantic structure, and basic SEO / Open Graph metadata

See [`docs/ASSET_GAPS.md`](docs/ASSET_GAPS.md) and [`docs/IMAGE_LICENSES.md`](docs/IMAGE_LICENSES.md).

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Browser `localStorage` for cart, catalog overrides, and order drafts
- Server-only admin gate via `.env.local` (`ADMIN_DEMO_PASSWORD` + `ADMIN_SESSION_SECRET`, never committed)
- Optional Neon Postgres scaffolding (`src/db/`, `drizzle/`) for server-backed catalog **reads** when explicitly enabled

The default path needs **no** paid APIs, databases, auth providers, analytics, or hosting.
Neon is optional and owner-gated (see [Optional Neon catalog](#optional-neon-catalog-owner-approved)).

## Quick start (on your computer)

```bash
git clone https://github.com/sahde-21/scf-fashion.git
cd scf-fashion
npm install
cp .env.example .env.local
# Set ADMIN_DEMO_PASSWORD and ADMIN_SESSION_SECRET (local-only; never commit)
# Leave DATABASE_URL unset and USE_SERVER_CATALOG=false until Neon is approved
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
| `npm run images:download` | Re-fetch Unsplash License assets into `public/` |
| `npm run test:seed-plan` | Offline seed planner tests (no database) |
| `npm run test:catalog-b1` | Offline catalog mapper / flag tests (no database) |
| `npm run test:catalog-b2` | Offline storefront catalog bootstrap tests (no database) |
| `npm run test:admin-b3a1` | Offline admin session / CSRF / rate-limit tests (no database) |
| `npm run db:generate` | Generate Drizzle migrations from schema (no live DB required when URL unset) |
| `npm run db:migrate` | **Owner approval required** — apply migrations to Neon |
| `npm run db:studio` | **Owner approval required** — Drizzle Studio against Neon |
| `npm run db:seed` | **Owner approval required** — catalog seed (insert-only by default) |

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

### Admin demo authentication

1. Copy `.env.example` → `.env.local`
2. Set **both**:
   - `ADMIN_DEMO_PASSWORD` — login password for `/admin`
   - `ADMIN_SESSION_SECRET` — HMAC key for the session cookie (**must not** reuse the password; at least 16 characters in production)
3. Restart `npm run dev`
4. Visit `/admin`

The password is verified in a **server route** and a short-lived **httpOnly** cookie is signed with `ADMIN_SESSION_SECRET`.
Neither value is embedded in client bundles. See `.env.example` for optional `ADMIN_ALLOWED_ORIGINS` and rate-limit notes.

**Limitations (important):**

- Admin product edits and order drafts are stored in **this browser’s localStorage only**
- They are **not** written to Neon; **admin write APIs to the database do not exist yet**
- They are **not** shared across devices, browsers, or users
- Clearing site data resets local overrides/orders
- This is **not** production-grade security

## Optional Neon catalog (owner-approved)

By default the storefront uses committed `SEED_PRODUCTS` plus browser `localStorage` overrides (`USE_SERVER_CATALOG=false`).
Optional Neon scaffolding can serve **published** catalog reads from Postgres after the owner provisions a database and approves each step below.

**Do not** paste real connection strings, passwords, or other secrets into this README, issues, commits, or `.env.example`. Put secrets only in `.env.local` (gitignored) or your host’s secret store.

### Environment variables

| Variable | Role |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string — used by the app client (`getDb`), server catalog reads, and `npm run db:seed` |
| `DATABASE_URL_UNPOOLED` | Neon **direct / unpooled** connection string — preferred for `npm run db:migrate` and `db:studio` (`drizzle.config.ts` prefers unpooled when set) |
| `USE_SERVER_CATALOG` | Keep `false` (or unset) until migrate + seed succeed. Only then set `true` with owner approval |

**Pooled vs unpooled:** the pooled URL goes through Neon’s connection pooler and suits serverless HTTP queries. The unpooled URL talks to Postgres directly and is preferred for schema migrations. Leave both unset until a Neon project exists.

### Approval gates (do nothing without owner approval)

| Step | Requires separate owner approval |
| --- | --- |
| Create a Neon account, project, or database | **Yes** |
| `npm run db:migrate` | **Yes** |
| `npm run db:seed` (insert-only) | **Yes** |
| `npm run db:seed -- --force-catalog` or `--force-stock` | **Yes** |
| Set `USE_SERVER_CATALOG=true` | **Yes** |
| Schema rollback / destructive DDL (no down-migration in-repo) | **Yes** |
| Implementing Neon admin write APIs | **Yes** (not in this phase) |

### Recommended sequence (after approvals)

1. Create the Neon project — **[OWNER APPROVAL]**
2. Copy the pooled URL into `DATABASE_URL` and the direct URL into `DATABASE_URL_UNPOOLED` in `.env.local` only
3. Keep `USE_SERVER_CATALOG=false`
4. Apply schema: `npm run db:migrate` — **[OWNER APPROVAL]**
5. Load sample catalog: `npm run db:seed` — **[OWNER APPROVAL]** (insert-only default)
6. Activate server reads: set `USE_SERVER_CATALOG=true`, restart `npm run dev` — **[OWNER APPROVAL]**
7. Confirm home, catalog, and product pages show published Neon products only

### Seed behavior and force-flag risks

- **Default** (`npm run db:seed`): insert-only — inserts missing products, colors, and stock rows; **skips** existing product/color metadata and existing stock quantities; never modifies `orders` / `order_items`; never deletes orphan colors or size-stock rows
- `--force-catalog`: **overwrites** product and color metadata from seed — can destroy curated Neon edits — **[OWNER APPROVAL]**
- `--force-stock`: **overwrites** stock quantities from seed — **[OWNER APPROVAL]**
- Unknown `--force*` tokens are rejected

### Catalog activation and fail-closed behavior

When `USE_SERVER_CATALOG=true` and `DATABASE_URL` is a real Neon URL, the root layout loads published products from Neon into the storefront (RSC bootstrap). Unpublished products are excluded from public listings, PDP metadata, and client catalog context.

If the flag is on but the URL is missing/invalid, or a query fails, the storefront shows a catalog error state — **it does not silently fall back to seed data**.

### Rollback

To return to seed + `localStorage` catalog mode:

1. Set `USE_SERVER_CATALOG=false` (or unset it) in `.env.local` / host env
2. Restart the dev server or redeploy

Neon data remains in place. Turning the flag off does **not** drop tables. Undoing schema requires a separate owner-approved plan (there is no down-migration in this repository).

## Architecture

```
src/
  app/                 # Routes (home, products, cart, checkout, admin, APIs)
  components/          # UI, storefront, cart, checkout, admin
  context/             # Cart + catalog providers (localStorage / server bootstrap)
  data/products.ts     # Seed catalog (committed sample data)
  db/                  # Drizzle schema, URL helpers, seed planner (server-only)
  lib/                 # config, currency, WhatsApp, catalog flag, admin session
  types/               # Shared TypeScript types
drizzle/               # Generated SQL migrations + journal
docs/IMAGE_LICENSES.md # Image source / license notes
```

Seed products live in Git. Admin overrides merge on top in the browser (seed mode) and never
write back to the repository or Neon automatically.

## Image licensing

Sample imagery uses Unsplash photos under the Unsplash License.
See [`docs/IMAGE_LICENSES.md`](docs/IMAGE_LICENSES.md).

## Testing checklist (manual)

1. Home loads with hanging rail, collections, product rails, and green ticker
2. Rail prev/next, click, keyboard arrows, and “See availability” work
3. About / Contact pages open from the header
4. Catalog filters/search/sort update results and empty state works
5. Product detail: change size/color (image updates when color photos exist), add to cart
6. FRONT/BACK appears only when `views.back` is set with a genuine asset
7. Cart persists after refresh; quantities update; remove works
8. Checkout validates name/phone; WhatsApp link opens with full message
9. `/admin` rejects missing/wrong password; accepts configured `.env.local` credentials
10. Admin can edit colors, front/back URLs, per-size stock, publish/unpublish (localStorage only)
11. Mobile navigation, ticker clearance, and focus rings work with keyboard
12. `npm run lint`, `npm run typecheck`, and `npm run build` succeed
13. Offline: `npm run test:seed-plan`, `test:catalog-b2`, and `test:admin-b3a1` pass (no database)

## Budget / safety rules honored by this project

- **$0** — free npm packages and free Unsplash assets only
- No deploy/publish steps are included or required
- No second repository
- Secrets stay in `.env.local` (gitignored)
- No real card payments
- Neon create / migrate / seed / catalog activation only with separate owner approval

## Continuing work later

1. Pull the latest branch from GitHub on your computer
2. Run `npm install` and recreate `.env.local` from `.env.example`
3. Set `ADMIN_DEMO_PASSWORD` and `ADMIN_SESSION_SECRET`; keep `USE_SERVER_CATALOG=false` unless Neon is already approved and configured
4. Use `npm run dev` for UI work
5. Keep WhatsApp/currency edits centralized in `src/lib/config.ts`
