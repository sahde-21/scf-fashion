"use client";

import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import type { StorefrontCatalogBootstrap } from "@/lib/catalog/storefront-bootstrap";
import type { ReactNode } from "react";

export function Providers({
  children,
  catalogBootstrap,
}: {
  children: ReactNode;
  /** Resolved on the server in root layout (Phase B2). */
  catalogBootstrap: StorefrontCatalogBootstrap;
}) {
  return (
    <CatalogProvider bootstrap={catalogBootstrap}>
      <CartProvider>{children}</CartProvider>
    </CatalogProvider>
  );
}
