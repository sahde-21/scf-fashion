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
import { readJson, writeJson } from "@/lib/storage";
import { uniqueKey } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

type AddToCartInput = {
  product: Product;
  size: string;
  colorId: string;
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalUsd: number;
  hydrated: boolean;
  addItem: (input: AddToCartInput) => void;
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

  const addItem = useCallback((input: AddToCartInput) => {
    const color = input.product.colors.find((c) => c.id === input.colorId);
    if (!color) return;
    const key = uniqueKey(input.product.id, input.size, input.colorId);
    const quantity = Math.max(1, input.quantity ?? 1);

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      const next: CartItem = {
        key,
        productId: input.product.id,
        name: input.product.name,
        image: input.product.images[0] ?? "",
        size: input.size,
        colorId: color.id,
        colorName: color.name,
        quantity,
        priceUsd: input.product.priceUsd,
      };
      return [...prev, next];
    });
  }, []);

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
