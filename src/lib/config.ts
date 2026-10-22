/**
 * Store configuration — edit these values in one place.
 * No secrets belong here. Keep admin passwords in .env.local only.
 */

/** Iraqi mobile as provided by the store owner (leading 0 form). */
export const STORE_WHATSAPP_LOCAL = "07506455249";

/**
 * Normalized digits for https://wa.me/{digits}
 * Iraq country code 964 + national number without leading 0.
 */
export const STORE_WHATSAPP_E164_DIGITS = "9647506455249";

export const STORE_NAME = "SCF Fashion";

/**
 * Fixed demo exchange rate for dual currency display.
 * This is NOT a live rate. Update manually when you want a different assumption.
 * Assumption documented for customers in the UI footer and README.
 */
export const USD_TO_IQD = 1310;

export const CURRENCY_NOTE =
  "Prices show USD and IQD using a fixed demo rate (1 USD = 1,310 IQD). Not a live exchange rate.";

export const STORAGE_KEYS = {
  cart: "scf-fashion-cart-v1",
  productOverrides: "scf-fashion-product-overrides-v1",
  orders: "scf-fashion-orders-v1",
} as const;

export const CATEGORIES = [
  {
    id: "women" as const,
    name: "Women",
    description: "Soft layers and elevated everyday essentials.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "men" as const,
    name: "Men",
    description: "Clean tailoring with easy weekend pieces.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "shoes" as const,
    name: "Shoes",
    description: "From city sneakers to evening heels.",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bags" as const,
    name: "Bags",
    description: "Structured totes and compact crossbodies.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "accessories" as const,
    name: "Accessories",
    description: "Finishing touches with quiet polish.",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
  },
];
