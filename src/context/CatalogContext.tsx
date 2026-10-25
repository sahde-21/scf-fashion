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
import { CatalogUnavailable } from "@/components/layout/CatalogUnavailable";
import { STORAGE_KEYS } from "@/lib/config";
import type { StorefrontCatalogBootstrap } from "@/lib/catalog/storefront-bootstrap";
import { withDerivedAvailability } from "@/lib/inventory";
import {
  getPublishedProducts,
  mergeProducts,
  type ProductOverrideMap,
} from "@/lib/products";
import { readJson, writeJson } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { LocalOrder, Product } from "@/types";

type CatalogSource = "seed" | "server" | "error";

type CatalogContextValue = {
  products: Product[];
  publishedProducts: Product[];
  orders: LocalOrder[];
  hydrated: boolean;
  /** Catalog data source for the current request/session. */
  catalogSource: CatalogSource;
  /** Non-null when server catalog failed or is misconfigured. */
  catalogError: string | null;
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

function emptyOverrideMap(): ProductOverrideMap {
  return {};
}

export function CatalogProvider({
  children,
  bootstrap = { mode: "seed" },
}: {
  children: ReactNode;
  bootstrap?: StorefrontCatalogBootstrap;
}) {
  const catalogSource: CatalogSource = bootstrap.mode;
  const catalogError =
    bootstrap.mode === "error" ? bootstrap.message : null;

  const [overrides, setOverrides] = useState<ProductOverrideMap>({});
  /** In-memory product list when serving from Neon (not merged with seed). */
  const [serverProducts, setServerProducts] = useState<Product[]>(() =>
    bootstrap.mode === "server" ? bootstrap.products : [],
  );
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (bootstrap.mode === "seed") {
      setOverrides(
        readJson<ProductOverrideMap>(STORAGE_KEYS.productOverrides, {}),
      );
    } else {
      // Do not apply seed/localStorage overrides when server catalog is active
      // or when the catalog failed — avoids presenting stale seed as live Neon data.
      setOverrides(emptyOverrideMap());
    }
    setOrders(readJson<LocalOrder[]>(STORAGE_KEYS.orders, []));
    setHydrated(true);
  }, [bootstrap.mode]);

  useEffect(() => {
    if (!hydrated) return;
    // Persist overrides only in seed mode (existing localStorage behavior).
    if (bootstrap.mode !== "seed") return;
    writeJson(STORAGE_KEYS.productOverrides, overrides);
  }, [overrides, hydrated, bootstrap.mode]);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEYS.orders, orders);
  }, [orders, hydrated]);

  const products = useMemo(() => {
    if (bootstrap.mode === "error") return [];
    if (bootstrap.mode === "server") {
      return serverProducts.map((p) => withDerivedAvailability(p));
    }
    return mergeProducts(overrides);
  }, [bootstrap.mode, serverProducts, overrides]);

  const publishedProducts = useMemo(() => {
    if (bootstrap.mode === "error") return [];
    if (bootstrap.mode === "server") {
      return products.filter((p) => p.published);
    }
    return getPublishedProducts(overrides);
  }, [bootstrap.mode, products, overrides]);

  const upsertProduct = useCallback(
    (product: Product) => {
      const id = product.id || createId("p");
      const slug = product.slug || slugify(product.name);
      const next = withDerivedAvailability({
        ...product,
        id,
        slug,
        createdAt: product.createdAt || new Date().toISOString(),
      });

      if (bootstrap.mode === "server") {
        setServerProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === id);
          if (idx === -1) return [next, ...prev];
          const copy = [...prev];
          copy[idx] = next;
          return copy;
        });
        return;
      }

      if (bootstrap.mode === "error") return;

      setOverrides((prev) => ({
        ...prev,
        [id]: next,
      }));
    },
    [bootstrap.mode],
  );

  const removeProduct = useCallback(
    (id: string) => {
      if (bootstrap.mode === "server") {
        setServerProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
      if (bootstrap.mode === "error") return;
      setOverrides((prev) => ({ ...prev, [id]: null }));
    },
    [bootstrap.mode],
  );

  const setPublished = useCallback(
    (id: string, published: boolean) => {
      if (bootstrap.mode === "server") {
        setServerProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published } : p)),
        );
        return;
      }
      if (bootstrap.mode === "error") return;
      setOverrides((prev) => {
        const current = mergeProducts(prev).find((p) => p.id === id);
        if (!current) return prev;
        return { ...prev, [id]: { ...current, published } };
      });
    },
    [bootstrap.mode],
  );

  const resetCatalogToSeed = useCallback(() => {
    if (bootstrap.mode === "server") {
      // Reset in-memory edits to the last server bootstrap payload.
      setServerProducts(bootstrap.products);
      return;
    }
    if (bootstrap.mode === "error") return;
    setOverrides({});
  }, [bootstrap]);

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
      catalogSource,
      catalogError,
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
      catalogSource,
      catalogError,
      upsertProduct,
      removeProduct,
      setPublished,
      resetCatalogToSeed,
      addOrder,
      clearOrders,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>
      {catalogError ? (
        <div className="border-b border-[var(--line)] bg-[var(--surface)]">
          <CatalogUnavailable message={catalogError} />
        </div>
      ) : null}
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
