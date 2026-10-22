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
 */
export function getProductViews(
  product: Product,
  colorId?: string | null,
): ProductViews {
  const color = colorId
    ? product.colors.find((c) => c.id === colorId)
    : undefined;

  const colorFront = color?.images?.[0];
  const colorBack = color?.images?.[1];

  const front =
    colorFront ||
    product.views?.front ||
    product.images[0] ||
    undefined;

  // Only expose a back control when the catalog explicitly declares one.
  const back = product.views?.back
    ? colorBack || product.views.back
    : undefined;

  return { front, back };
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
