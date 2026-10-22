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
  getPublishedProducts,
  mergeProducts,
  type ProductOverrideMap,
} from "@/lib/products";
import { readJson, writeJson } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { LocalOrder, Product } from "@/types";

type CatalogContextValue = {
  products: Product[];
  publishedProducts: Product[];
  orders: LocalOrder[];
  hydrated: boolean;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setPublished: (id: string, published: boolean) => void;
  resetCatalogToSeed: () => void;
  addOrder: (order: LocalOrder) => void;
  clearOrders: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<ProductOverrideMap>({});
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOverrides(readJson<ProductOverrideMap>(STORAGE_KEYS.productOverrides, {}));
    setOrders(readJson<LocalOrder[]>(STORAGE_KEYS.orders, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEYS.productOverrides, overrides);
  }, [overrides, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEYS.orders, orders);
  }, [orders, hydrated]);

  const products = useMemo(() => mergeProducts(overrides), [overrides]);
  const publishedProducts = useMemo(
    () => getPublishedProducts(overrides),
    [overrides],
  );

  const upsertProduct = useCallback((product: Product) => {
    setOverrides((prev) => {
      const id = product.id || createId("p");
      const slug = product.slug || slugify(product.name);
      return {
        ...prev,
        [id]: {
          ...product,
          id,
          slug,
          createdAt: product.createdAt || new Date().toISOString(),
        },
      };
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: null }));
  }, []);

  const setPublished = useCallback((id: string, published: boolean) => {
    setOverrides((prev) => {
      const current = mergeProducts(prev).find((p) => p.id === id);
      if (!current) return prev;
      return { ...prev, [id]: { ...current, published } };
    });
  }, []);

  const resetCatalogToSeed = useCallback(() => {
    setOverrides({});
  }, []);

  const addOrder = useCallback((order: LocalOrder) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  const value = useMemo(
    () => ({
      products,
      publishedProducts,
      orders,
      hydrated,
      upsertProduct,
      removeProduct,
      setPublished,
      resetCatalogToSeed,
      addOrder,
      clearOrders,
    }),
    [
      products,
      publishedProducts,
      orders,
      hydrated,
      upsertProduct,
      removeProduct,
      setPublished,
      resetCatalogToSeed,
      addOrder,
      clearOrders,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
