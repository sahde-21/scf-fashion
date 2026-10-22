import type { Product, ProductColor, ProductViews } from "@/types";

/**
 * Resolve the gallery for a product + optional color.
 * Uses color.images only when present; never invents tinted substitutes.
 */
export function getGalleryImages(
  product: Product,
  colorId?: string | null,
): string[] {
  if (colorId) {
    const color = product.colors.find((c) => c.id === colorId);
    if (color?.images?.length) {
      return color.images.filter(Boolean);
    }
  }

  const base = (product.images ?? []).filter(Boolean);
  if (product.views?.front || product.views?.back) {
    const ordered = [
      product.views.front,
      product.views.back,
      ...base,
    ].filter((src, index, arr): src is string =>
      Boolean(src) && arr.indexOf(src) === index,
    );
    return ordered;
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
 * When a color has its own `images`, BACK is shown only if that color also
 * provides a second image (treated as that colorway’s back) AND the product
 * declares `views.back`. We never fall back to another colorway’s back photo.
 */
export function getProductViews(
  product: Product,
  colorId?: string | null,
): ProductViews {
  const color = colorId
    ? product.colors.find((c) => c.id === colorId)
    : undefined;

  if (color?.images?.length) {
    const front = color.images[0];
    const colorBack = color.images[1];
    const back =
      product.views?.back &&
      colorBack &&
      colorBack !== front
        ? colorBack
        : undefined;
    return { front, back };
  }

  return {
    front: product.views?.front || product.images[0] || undefined,
    back: product.views?.back || undefined,
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
