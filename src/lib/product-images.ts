import { filterValidImageUrls } from "@/lib/image-url";
import type { Product, ProductColor, ProductViews } from "@/types";

function uniqueUrls(urls: Array<string | undefined | null>): string[] {
  return filterValidImageUrls(
    urls.filter((src): src is string => Boolean(src)),
  ).filter((src, index, arr) => arr.indexOf(src) === index);
}

/**
 * Resolve the gallery for a product + optional color.
 * Uses color.images only when present; never invents tinted substitutes.
 * Invalid / empty URLs are dropped so the UI can fall back safely.
 */
export function getGalleryImages(
  product: Product,
  colorId?: string | null,
): string[] {
  if (colorId) {
    const color = product.colors.find((c) => c.id === colorId);
    if (color?.images?.length) {
      const colorGallery = uniqueUrls(color.images);
      if (colorGallery.length) return colorGallery;
    }
  }

  const base = uniqueUrls(product.images ?? []);
  if (product.views?.front || product.views?.back) {
    return uniqueUrls([product.views.front, product.views.back, ...base]);
  }

  return base;
}

export function getPrimaryImage(
  product: Product,
  colorId?: string | null,
): string {
  const gallery = getGalleryImages(product, colorId);
  return gallery[0] ?? "";
}

/**
 * Front/back views for gallery controls.
 * BACK is only returned when `product.views.back` is explicitly set —
 * never inferred from an unlabeled second gallery image.
 *
 * When a color has its own `images`:
 * - front = color.images[0]
 * - back = color.images[1] only when it differs from front AND `views.back`
 *   is set on the product (admin asserts a real back exists).
 * We never substitute another colorway’s photo as this color’s back.
 *
 * When the selected color has no `images`, product-level `views` apply.
 */
export function getProductViews(
  product: Product,
  colorId?: string | null,
): ProductViews {
  const color = colorId
    ? product.colors.find((c) => c.id === colorId)
    : undefined;

  if (color?.images?.length) {
    const colorGallery = uniqueUrls(color.images);
    const front = colorGallery[0];
    const colorBack = colorGallery[1];
    const productBack = uniqueUrls([product.views?.back])[0];
    const back =
      productBack &&
      colorBack &&
      colorBack !== front
        ? colorBack
        : undefined;
    return { front, back };
  }

  const base = uniqueUrls(product.images ?? []);
  return {
    front: uniqueUrls([product.views?.front])[0] || base[0] || undefined,
    back: uniqueUrls([product.views?.back])[0] || undefined,
  };
}

export function hasFrontBackPair(
  product: Product,
  colorId?: string | null,
): boolean {
  const views = getProductViews(product, colorId);
  return Boolean(views.front && views.back && views.front !== views.back);
}

export function colorLabel(
  product: Product,
  colorId: string,
): ProductColor | undefined {
  return product.colors.find((c) => c.id === colorId);
}
