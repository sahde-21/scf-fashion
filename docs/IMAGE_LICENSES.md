# Image sources and licenses

All product and editorial imagery used in SCF Fashion sample data comes from
[Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license).

You may use the photos commercially and non-commercially without permission.
Attribution is not required by the license but is appreciated; photographer
credits are listed below for transparency.

## Editorial / hero

| Usage | Unsplash photo | Photographer |
| --- | --- | --- |
| Homepage hero | https://unsplash.com/photos/black-and-white-adidas-yeezy-boost-350-v2-sneakers-OYYE4g-I5ZQ | Not used — see seed URLs |
| Homepage hero | https://images.unsplash.com/photo-1469334031218-e382a71b716b | freestocks |
| Promo banner | https://images.unsplash.com/photo-1441984904996-e0b6ba687e04 | Clark Street Mercantile |
| Collection — Women | https://images.unsplash.com/photo-1483985988355-763728e1935b | freestocks |
| Collection — Men | https://images.unsplash.com/photo-1617137968427-85924c800a22 | Unsplash contributor |
| Collection — Shoes | https://images.unsplash.com/photo-1543163521-1bf539c55dd2 | Irene Strong |
| Collection — Bags | https://images.unsplash.com/photo-1548036328-c9fa89d128fa | Laura Chouette |
| Collection — Accessories | https://images.unsplash.com/photo-1515562141207-7a88fb7ce338 | Laura Chouette |

## Product photos

Product image URLs are defined in `src/data/products.ts`. Each URL points to an
`images.unsplash.com` asset. Replace them with your own licensed photos before any
public launch.

To swap images later:

1. Add files under `public/products/` or use another free-licensed host.
2. Update the `images` array on each product in seed data or via the local admin UI.
3. If using a new remote host, allow it in `next.config.ts` `images.remotePatterns`.
