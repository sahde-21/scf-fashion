"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/config";
import {
  getStockForSize,
  isSizeAvailable,
  maxOrderQuantity,
} from "@/lib/inventory";
import { getPrimaryImage } from "@/lib/product-images";
import { readJson, writeJson } from "@/lib/storage";
import { uniqueKey } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

type AddToCartInput = {
  product: Product;
  size: string;
  colorId: string;
  quantity?: number;
};

type AddToCartResult = { ok: true } | { ok: false; error: string };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalUsd: number;
  hydrated: boolean;
  addItem: (input: AddToCartInput) => AddToCartResult;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readJson<CartItem[]>(STORAGE_KEYS.cart, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEYS.cart, items);
  }, [items, hydrated]);

  const addItem = useCallback(
    (input: AddToCartInput): AddToCartResult => {
      const color = input.product.colors.find((c) => c.id === input.colorId);
      if (!color) {
        return { ok: false, error: "Please choose a valid color." };
      }
      if (!input.product.sizes.includes(input.size)) {
        return { ok: false, error: "Please choose a valid size." };
      }
      if (!isSizeAvailable(input.product, input.size)) {
        return {
          ok: false,
          error: `Size ${input.size} is out of stock.`,
        };
      }

      const key = uniqueKey(input.product.id, input.size, input.colorId);
      const requested = Math.max(1, input.quantity ?? 1);
      const cap = maxOrderQuantity(input.product, input.size);
      const stock = getStockForSize(input.product, input.size);
      const image =
        getPrimaryImage(input.product, input.colorId) ||
        input.product.images[0] ||
        "";

      const existing = items.find((item) => item.key === key);
      const already = existing?.quantity ?? 0;
      const room = Math.max(0, cap - already);
      if (requested > room) {
        return {
          ok: false,
          error:
            stock === null
              ? room < 1
                ? "Cannot add more of this item."
                : `Only ${room} more can be added.`
              : `Only ${stock} available in size ${input.size}${
                  already ? ` (${already} already in cart)` : ""
                }.`,
        };
      }

      setItems((prev) => {
        const current = prev.find((item) => item.key === key);
        if (current) {
          return prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: item.quantity + requested,
                  name: input.product.name,
                  image,
                  colorName: color.name,
                  priceUsd: input.product.priceUsd,
                }
              : item,
          );
        }
        return [
          ...prev,
          {
            key,
            productId: input.product.id,
            name: input.product.name,
            image,
            size: input.size,
            colorId: color.id,
            colorName: color.name,
            quantity: requested,
            priceUsd: input.product.priceUsd,
          },
        ];
      });

      return { ok: true };
    },
    [items],
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, Math.floor(quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalUsd = items.reduce(
      (sum, item) => sum + item.priceUsd * item.quantity,
      0,
    );
    return {
      items,
      itemCount,
      subtotalUsd,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, hydrated, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
