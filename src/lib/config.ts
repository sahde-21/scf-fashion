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

/**
 * Bottom announcement ticker copy — edit in one place.
 * Quiet luxury tone; keep phrases short.
 */
export const TICKER_MESSAGES = [
  "SCF FASHION",
  "QUIET LUXURY",
  "REFINED ESSENTIALS",
  "EDITORIAL LOOKS",
  "WHATSAPP ORDERING",
] as const;

export const STORE_CONTACT = {
  whatsappLocal: STORE_WHATSAPP_LOCAL,
  whatsappDigits: STORE_WHATSAPP_E164_DIGITS,
  email: "hello@scffashion.demo",
  city: "Baghdad",
} as const;

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
    image: "/editorial/cat-women.jpg",
  },
  {
    id: "men" as const,
    name: "Men",
    description: "Clean tailoring with easy weekend pieces.",
    image: "/editorial/cat-men.jpg",
  },
  {
    id: "shoes" as const,
    name: "Shoes",
    description: "From city sneakers to evening heels.",
    image: "/editorial/cat-shoes.jpg",
  },
  {
    id: "bags" as const,
    name: "Bags",
    description: "Structured totes and compact crossbodies.",
    image: "/editorial/cat-bags.jpg",
  },
  {
    id: "accessories" as const,
    name: "Accessories",
    description: "Finishing touches with quiet polish.",
    image: "/editorial/cat-accessories.jpg",
  },
];

/** Honest storefront copy — update when the owner confirms real policies. */
export const STORE_POLICY_NOTICE =
  "Delivery timing, fees, and return rules are confirmed by the store on WhatsApp. This demo does not promise specific shipping windows.";
