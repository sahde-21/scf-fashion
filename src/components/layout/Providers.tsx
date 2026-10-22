"use client";

import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <CartProvider>{children}</CartProvider>
    </CatalogProvider>
  );
}
