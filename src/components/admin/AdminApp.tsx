"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { useCatalog } from "@/context/CatalogContext";
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
  sizes: ["S", "M", "L"],
  colors: [{ id: "sky", name: "Sky", hex: "#7DD3FC" }],
  tags: ["new"],
  published: true,
  inStock: true,
  createdAt: new Date().toISOString(),
  newArrival: true,
});

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

  const refreshSession = async () => {
    const res = await fetch("/api/admin/session");
    const data = (await res.json()) as SessionState;
    setSession(data);
  };

  useEffect(() => {
    void refreshSession();
  }, []);

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
            title="Admin password not configured"
            description="Copy .env.example to .env.local, set ADMIN_DEMO_PASSWORD, then restart the Next.js server."
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
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <ProductEditor
            product={editing}
            onCancel={() => setEditing(null)}
            onSave={(product) => {
              upsertProduct(product);
              setEditing(null);
            }}
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
                      "Reset catalog overrides in this browser back to seed data?",
                    )
                  ) {
                    resetCatalogToSeed();
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
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
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
                      <td className="px-3 py-3">
                        {product.published ? "Published" : "Unpublished"}
                        {!product.inStock ? " · Sold out" : ""}
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
                            onClick={() =>
                              setPublished(product.id, !product.published)
                            }
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
                                  `Remove ${product.name} from this browser catalog?`,
                                )
                              ) {
                                removeProduct(product.id);
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    </div>
                    <Price usd={order.totalUsd} compact />
                  </div>
                  {order.notes ? (
                    <p className="mt-3 text-sm text-slate-600">{order.notes}</p>
                  ) : null}
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
  onSave,
  onCancel,
}: {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Product | null>(product);

  useEffect(() => {
    setDraft(product);
  }, [product]);

  if (!draft) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-600">
        Select a product to edit, or add a new one. Changes stay in this browser
        only.
      </div>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const id = draft.id || `p-${slugify(draft.name)}-${Date.now().toString(36)}`;
        onSave({
          ...draft,
          id,
          slug: draft.slug || slugify(draft.name),
          images: draft.images.filter(Boolean),
          sizes: draft.sizes.filter(Boolean),
          tags: draft.tags.filter(Boolean),
        });
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
      <Field
        label="Sizes (comma-separated)"
        value={draft.sizes.join(", ")}
        onChange={(v) =>
          setDraft({
            ...draft,
            sizes: v.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
      />
      <Field
        label="Tags (comma-separated)"
        value={draft.tags.join(", ")}
        onChange={(v) =>
          setDraft({
            ...draft,
            tags: v.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
        />
        Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.inStock}
          onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
        />
        In stock
      </label>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-sky-100 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
        required={type !== "number"}
      />
    </label>
  );
}
