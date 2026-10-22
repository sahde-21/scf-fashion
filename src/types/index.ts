export type CategoryId =
  | "men"
  | "women"
  | "shoes"
  | "bags"
  | "accessories";

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  priceUsd: number;
  images: string[];
  sizes: string[];
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
