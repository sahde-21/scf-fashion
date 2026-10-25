"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { useCatalog } from "@/context/CatalogContext";
import {
  filterValidImageUrls,
  imageUrlError,
  isValidImageUrl,
  normalizeImageUrl,
} from "@/lib/image-url";
import {
  isProductAvailable,
  stockMapForSizes,
  withDerivedAvailability,
} from "@/lib/inventory";
import { slugify } from "@/lib/utils";
import type { CategoryId, Product } from "@/types";

type SessionState = {
  authenticated: boolean;
  passwordConfigured: boolean;
  demoNotice: string;
};

const emptyProduct = (): Product => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  category: "women",
  priceUsd: 49,
  images: [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  ],
  views: {},
  sizes: ["S", "M", "L"],
  stockBySize: { S: 5, M: 5, L: 5 },
  colors: [{ id: "ink", name: "Ink", hex: "#111111" }],
  tags: ["new"],
  published: true,
  inStock: true,
  createdAt: new Date().toISOString(),
  newArrival: true,
});

/**
 * Serialize colors for the admin textarea:
 * id|name|hex|frontUrl?|backUrl?  (one per line)
 */
function colorsToLines(colors: Product["colors"]): string {
  return colors
    .map((c) => {
      const front = c.images?.[0] ?? "";
      const back = c.images?.[1] ?? "";
      if (front && back) return `${c.id}|${c.name}|${c.hex}|${front}|${back}`;
      if (front) return `${c.id}|${c.name}|${c.hex}|${front}`;
      return `${c.id}|${c.name}|${c.hex}`;
    })
    .join("\n");
}

function linesToColors(value: string): Product["colors"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, name, hex, frontRaw, backRaw] = line
        .split("|")
        .map((s) => s.trim());
      const color = {
        id: id || "color",
        name: name || id || "Color",
        hex: hex || "#111111",
      };
      const images = [frontRaw, backRaw]
        .map((s) => (s ? normalizeImageUrl(s) : ""))
        .filter(Boolean);
      if (images.length) {
        return { ...color, images };
      }
      return color;
    });
}

function validateProduct(draft: Product): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Name is required.");
  if (!draft.description.trim()) errors.push("Description is required.");
  if (!draft.slug.trim()) errors.push("Slug is required.");
  if (!(draft.priceUsd > 0)) errors.push("Price must be greater than 0.");
  if (!draft.sizes.length) errors.push("Add at least one size.");
  if (!draft.colors.length) errors.push("Add at least one color.");

  const images = draft.images.map(normalizeImageUrl).filter(Boolean);
  if (!images.length) {
    errors.push("Add at least one gallery image URL.");
  }
  for (const url of images) {
    const err = imageUrlError(url);
    if (err) errors.push(`Gallery image: ${err}`);
  }

  if (draft.views?.front) {
    const err = imageUrlError(draft.views.front);
    if (err) errors.push(`Front view: ${err}`);
  }
  if (draft.views?.back) {
    const err = imageUrlError(draft.views.back);
    if (err) errors.push(`Back view: ${err}`);
  }
  if (draft.views?.back && !draft.views?.front) {
    errors.push("Set a front view URL before adding a back view.");
  }
  if (
    draft.views?.front &&
    draft.views?.back &&
    draft.views.front === draft.views.back
  ) {
    errors.push("Front and back view URLs must be different.");
  }

  for (const color of draft.colors) {
    if (!color.id.trim() || !color.name.trim()) {
      errors.push("Each color needs an id and name.");
    }
    for (const url of color.images ?? []) {
      if (!isValidImageUrl(url)) {
        const err = imageUrlError(url);
        errors.push(`Color “${color.name || color.id}”: ${err}`);
      }
    }
  }

  if (draft.stockBySize) {
    for (const size of draft.sizes) {
      const qty = draft.stockBySize[size];
      if (typeof qty !== "number" || Number.isNaN(qty) || qty < 0) {
        errors.push(`Stock for size ${size} must be a non-negative number.`);
      }
    }
  }

  return errors;
}

export function AdminApp() {
  const {
    products,
    orders,
    hydrated,
    upsertProduct,
    removeProduct,
    setPublished,
    resetCatalogToSeed,
    clearOrders,
  } = useCatalog();
  const [session, setSession] = useState<SessionState | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ tone: "ok" | "err"; text: string } | null>(
    null,
  );

  const refreshSession = async () => {
    const res = await fetch("/api/admin/session");
    const data = (await res.json()) as SessionState;
    setSession(data);
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(t);
  }, [flash]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }
      setPassword("");
      await refreshSession();
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    await refreshSession();
  };

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [orders],
  );

  if (!session || !hydrated) {
    return <LoadingBlock label="Loading admin…" />;
  }

  if (!session.authenticated) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">Local demo admin only</p>
          <p className="mt-2">
            This gate is not production-grade security. Product edits and orders
            live in this browser&apos;s localStorage and are not shared across
            devices or users. Never commit admin passwords to Git.
          </p>
        </div>
        {!session.passwordConfigured ? (
          <EmptyState
            title="Admin authentication not configured"
            description="Copy .env.example to .env.local, set ADMIN_DEMO_PASSWORD and ADMIN_SESSION_SECRET, then restart the Next.js server."
          />
        ) : (
          <form onSubmit={onLogin} className="space-y-4 rounded-2xl border border-sky-100 bg-white p-6">
            <h1 className="font-display text-3xl text-slate-900">Admin sign-in</h1>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">
                Demo password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-sky-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? (
              <p className="text-sm text-rose-600" role="alert">
                {loginError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Checking…" : "Enter admin"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-slate-900">Local admin</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {session.demoNotice}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onLogout}>
          Sign out
        </Button>
      </div>

      {flash ? (
        <p
          role="status"
          className={
            flash.tone === "ok"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              : "rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          }
        >
          {flash.text}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant={tab === "products" ? "primary" : "secondary"}
          onClick={() => setTab("products")}
        >
          Products
        </Button>
        <Button
          type="button"
          variant={tab === "orders" ? "primary" : "secondary"}
          onClick={() => setTab("orders")}
        >
          Orders ({orders.length})
        </Button>
      </div>

      {tab === "products" ? (
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <ProductEditor
            product={editing}
            existingSlugs={products.map((p) => p.slug)}
            onCancel={() => setEditing(null)}
            onSave={(product) => {
              upsertProduct(product);
              setEditing(null);
              setFlash({
                tone: "ok",
                text: `Saved “${product.name}” to this browser’s local catalog.`,
              });
            }}
            onError={(message) =>
              setFlash({ tone: "err", text: message })
            }
          />
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setEditing(emptyProduct())}>
                Add product
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset catalog overrides in this browser back to seed data? Custom products added only in this browser will be removed.",
                    )
                  ) {
                    resetCatalogToSeed();
                    setEditing(null);
                    setFlash({
                      tone: "ok",
                      text: "Catalog overrides cleared. Seed products restored in this browser.",
                    });
                  }
                }}
              >
                Reset to seed data
              </Button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-sky-100">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-sky-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-3 font-medium">Product</th>
                    <th className="px-3 py-3 font-medium">Price</th>
                    <th className="px-3 py-3 font-medium">Inventory</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const available = isProductAvailable(product);
                    const stockSummary = product.stockBySize
                      ? product.sizes
                          .map((s) => `${s}:${product.stockBySize?.[s] ?? 0}`)
                          .join(" · ")
                      : available
                        ? "Legacy in-stock flag"
                        : "Sold out flag";
                    return (
                      <tr key={product.id} className="border-t border-sky-50">
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.category} · {product.slug}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <Price usd={product.priceUsd} compact />
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          {stockSummary}
                        </td>
                        <td className="px-3 py-3">
                          {product.published ? "Published" : "Unpublished"}
                          {!available ? " · Sold out" : ""}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="text-sky-700 hover:underline"
                              onClick={() => setEditing(product)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-sky-700 hover:underline"
                              onClick={() => {
                                setPublished(product.id, !product.published);
                                setFlash({
                                  tone: "ok",
                                  text: product.published
                                    ? `Unpublished “${product.name}”.`
                                    : `Published “${product.name}”.`,
                                });
                              }}
                            >
                              {product.published ? "Unpublish" : "Publish"}
                            </button>
                            <Link
                              href={`/products/${product.slug}`}
                              className="text-sky-700 hover:underline"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="text-rose-600 hover:underline"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remove ${product.name} from this browser catalog? Seed products can be restored with “Reset to seed data”.`,
                                  )
                                ) {
                                  removeProduct(product.id);
                                  if (editing?.id === product.id) {
                                    setEditing(null);
                                  }
                                  setFlash({
                                    tone: "ok",
                                    text: `Removed “${product.name}” from this browser catalog.`,
                                  });
                                }
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear local order drafts in this browser?")) {
                clearOrders();
                setFlash({
                  tone: "ok",
                  text: "Local order drafts cleared.",
                });
              }
            }}
          >
            Clear local orders
          </Button>
          {!sortedOrders.length ? (
            <EmptyState
              title="No local orders yet"
              description="When customers prepare a WhatsApp checkout on this browser, drafts appear here. They are not synced to a server."
            />
          ) : (
            <ul className="space-y-4">
              {sortedOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-sky-100 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl text-slate-900">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.customerPhone} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.city || order.address ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {[order.city, order.address].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {order.locationMethod && order.locationMethod !== "none" ? (
                        <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                          Location: {order.locationMethod.replace("_", " ")}
                        </p>
                      ) : null}
                    </div>
                    <Price usd={order.totalUsd} compact />
                  </div>
                  {order.deliveryInstructions ? (
                    <p className="mt-3 text-sm text-slate-600">
                      Delivery: {order.deliveryInstructions}
                    </p>
                  ) : null}
                  {order.notes ? (
                    <p className="mt-2 text-sm text-slate-600">{order.notes}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-400">
                    Map pin links are not stored here — only in the WhatsApp
                    message the customer sent.
                  </p>
                  <ul className="mt-4 space-y-1 text-sm text-slate-600">
                    {order.items.map((item) => (
                      <li key={item.key}>
                        {item.name} × {item.quantity} ({item.size},{" "}
                        {item.colorName})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-amber-700">
                    Status: drafted for WhatsApp — confirm whether the customer
                    pressed Send.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ProductEditor({
  product,
  existingSlugs,
  onSave,
  onCancel,
  onError,
}: {
  product: Product | null;
  existingSlugs: string[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState<Product | null>(product);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!product) {
      setDraft(null);
      setFormError("");
      return;
    }
    setDraft({
      ...product,
      stockBySize: stockMapForSizes(product.sizes, product.stockBySize),
      views: product.views ?? {},
    });
    setFormError("");
  }, [product]);

  if (!draft) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-600">
        Select a product to edit, or add a new one. Changes stay in this browser
        only — not a secure production database.
      </div>
    );
  }

  const updateSizes = (sizes: string[]) => {
    setDraft({
      ...draft,
      sizes,
      stockBySize: stockMapForSizes(sizes, draft.stockBySize),
    });
  };

  return (
    <form
      className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError("");
        const id =
          draft.id || `p-${slugify(draft.name)}-${Date.now().toString(36)}`;
        const slug = draft.slug || slugify(draft.name);
        const stockBySize = stockMapForSizes(draft.sizes, draft.stockBySize);
        const candidate: Product = {
          ...draft,
          id,
          slug,
          images: draft.images.map(normalizeImageUrl).filter(Boolean),
          sizes: draft.sizes.filter(Boolean),
          tags: draft.tags.filter(Boolean),
          views: {
            front: draft.views?.front?.trim() || undefined,
            back: draft.views?.back?.trim() || undefined,
          },
          colors: draft.colors.length
            ? draft.colors
            : [{ id: "ink", name: "Ink", hex: "#111111" }],
          stockBySize,
        };

        const errors = validateProduct(candidate);
        const slugTaken = existingSlugs.some(
          (s) => s === candidate.slug && s !== product?.slug,
        );
        if (slugTaken) {
          errors.push(
            `Slug “${candidate.slug}” is already used by another product.`,
          );
        }
        if (errors.length) {
          const message = errors[0] || "Fix the form errors and try again.";
          setFormError(errors.join(" "));
          onError(message);
          return;
        }

        const cleanedColors: Product["colors"] = candidate.colors.map((c) => {
          const colorImages = c.images?.length
            ? filterValidImageUrls(c.images)
            : [];
          if (colorImages.length) {
            return {
              id: c.id,
              name: c.name,
              hex: c.hex,
              images: colorImages,
            };
          }
          return { id: c.id, name: c.name, hex: c.hex };
        });

        const next = withDerivedAvailability({
          ...candidate,
          images: filterValidImageUrls(candidate.images),
          colors: cleanedColors,
        });

        onSave(next);
      }}
    >
      <h2 className="font-display text-2xl text-slate-900">
        {draft.id ? "Edit product" : "New product"}
      </h2>
      <Field
        label="Name"
        value={draft.name}
        onChange={(name) =>
          setDraft({
            ...draft,
            name,
            slug: draft.id ? draft.slug : slugify(name),
          })
        }
      />
      <Field
        label="Slug"
        value={draft.slug}
        onChange={(slug) => setDraft({ ...draft, slug: slugify(slug) })}
      />
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-800">Description</span>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-sky-100 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
          required
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-800">Category</span>
        <select
          value={draft.category}
          onChange={(e) =>
            setDraft({ ...draft, category: e.target.value as CategoryId })
          }
          className="w-full rounded-md border border-sky-100 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="shoes">Shoes</option>
          <option value="bags">Bags</option>
          <option value="accessories">Accessories</option>
        </select>
      </label>
      <Field
        label="Price (USD)"
        type="number"
        value={String(draft.priceUsd)}
        onChange={(v) => setDraft({ ...draft, priceUsd: Number(v) || 0 })}
      />
      <Field
        label="Image URLs (comma-separated)"
        value={draft.images.join(", ")}
        onChange={(v) =>
          setDraft({
            ...draft,
            images: v.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
      />
      <p className="text-xs text-slate-500">
        Use https://images.unsplash.com/… or a local path like /products/tee.jpg.
        Invalid URLs are rejected on save.
      </p>
      <Field
        label="Front view URL (optional — genuine front only)"
        value={draft.views?.front ?? ""}
        onChange={(v) =>
          setDraft({
            ...draft,
            views: { ...draft.views, front: v.trim() || undefined },
          })
        }
        required={false}
      />
      <Field
        label="Back view URL (optional — genuine back only)"
        value={draft.views?.back ?? ""}
        onChange={(v) =>
          setDraft({
            ...draft,
            views: { ...draft.views, back: v.trim() || undefined },
          })
        }
        required={false}
      />
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-800">
          Colors (one per line: id|name|hex|frontUrl?|backUrl?)
        </span>
        <textarea
          value={colorsToLines(draft.colors)}
          onChange={(e) =>
            setDraft({ ...draft, colors: linesToColors(e.target.value) })
          }
          rows={5}
          className="w-full rounded-md border border-sky-100 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-sky-300"
          required
        />
        <span className="block text-xs text-slate-500">
          Add image columns only for verified photos of that colorway. Optional
          5th column is that color&apos;s back view (also set product Back view
          URL so FRONT/BACK controls appear). Never use CSS tints as substitutes.
        </span>
      </label>
      <Field
        label="Sizes (comma-separated)"
        value={draft.sizes.join(", ")}
        onChange={(v) =>
          updateSizes(v.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />
      <div className="space-y-2 rounded-lg border border-sky-50 bg-sky-50/40 p-3">
        <p className="text-sm font-medium text-slate-800">
          Stock quantity per size
        </p>
        <p className="text-xs text-slate-500">
          Demo inventory for this browser only. Setting every size to 0 marks
          the product sold out on the storefront.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {draft.sizes.map((size) => (
            <label key={size} className="block space-y-1 text-xs">
              <span className="font-medium text-slate-700">{size}</span>
              <input
                type="number"
                min={0}
                step={1}
                name={`stock-${size}`}
                data-stock-size={size}
                value={draft.stockBySize?.[size] ?? 0}
                onChange={(e) => {
                  const qty = Math.max(0, Math.floor(Number(e.target.value) || 0));
                  setDraft({
                    ...draft,
                    stockBySize: {
                      ...stockMapForSizes(draft.sizes, draft.stockBySize),
                      [size]: qty,
                    },
                  });
                }}
                className="w-full rounded-md border border-sky-100 px-2 py-1.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>
          ))}
        </div>
      </div>
      <Field
        label="Tags (comma-separated)"
        value={draft.tags.join(", ")}
        onChange={(v) =>
          setDraft({
            ...draft,
            tags: v.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
        required={false}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
        />
        Published
      </label>
      <p className="text-xs text-slate-500">
        In-stock status is derived from per-size quantities when stock is set
        (currently{" "}
        {Object.values(draft.stockBySize ?? {}).some((n) => n > 0)
          ? "available"
          : "sold out"}
        ).
      </p>
      {formError ? (
        <p className="text-sm text-rose-600" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const isRequired =
    typeof required === "boolean" ? required : type !== "number";
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-sky-100 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
        required={isRequired}
      />
    </label>
  );
}
