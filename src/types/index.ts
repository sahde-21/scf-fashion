export type CategoryId =
  | "men"
  | "women"
  | "shoes"
  | "bags"
  | "accessories";

/**
 * Color swatch. Optional `images` are genuine color-variant photos only —
 * never CSS-tinted stand-ins. When omitted, the product’s base gallery is used.
 */
export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  /** Color-specific gallery images (front-first). Optional and backward-compatible. */
  images?: string[];
};

/**
 * Explicit front/back assets. Only set when imagery genuinely matches the view.
 * Do not invent a “back” from an unrelated alternate photo.
 */
export type ProductViews = {
  front?: string;
  back?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  priceUsd: number;
  /** Default gallery (used when the selected color has no `images`). */
  images: string[];
  /** Optional explicit front/back views for the default / primary colorway. */
  views?: ProductViews;
  sizes: string[];
  /**
   * Optional demo inventory per size. When present, storefront availability
   * and cart quantity limits use these counts. When omitted, `inStock` alone
   * applies (legacy seed behavior). Not a production warehouse system.
   */
  stockBySize?: Record<string, number>;
  colors: ProductColor[];
  tags: string[];
  featured?: boolean;
  newArrival?: boolean;
  popular?: boolean;
  published: boolean;
  inStock: boolean;
  createdAt: string;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  colorId: string;
  colorName: string;
  quantity: number;
  priceUsd: number;
};

export type CheckoutFormData = {
  name: string;
  phone: string;
  notes: string;
};

export type LocalOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  items: CartItem[];
  totalUsd: number;
  status: "drafted-for-whatsapp";
};

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export type ProductFilters = {
  category?: CategoryId | "all";
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  query: string;
  sort: SortOption;
  inStockOnly: boolean;
};
