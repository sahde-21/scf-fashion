"use client";

import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import {
  CURRENCY_NOTE,
  STORE_WHATSAPP_E164_DIGITS,
  STORE_WHATSAPP_LOCAL,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  buildOrderMessage,
  getWhatsAppChatUrl,
  validateMapsLink,
} from "@/lib/whatsapp";
import type { CheckoutFormData, LocationMethod } from "@/types";

const emptyForm = (): CheckoutFormData => ({
  name: "",
  phone: "",
  city: "",
  address: "",
  deliveryInstructions: "",
  locationMethod: "none",
  mapsLink: "",
  notes: "",
});

type FieldErrors = Partial<Record<keyof CheckoutFormData, string>>;

export function CheckoutView() {
  const { items, hydrated, subtotalUsd, clearCart } = useCart();
  const { addOrder } = useCatalog();
  const [form, setForm] = useState<CheckoutFormData>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [copied, setCopied] = useState(false);
  const [prepared, setPrepared] = useState(false);

  const message = useMemo(
    () => buildOrderMessage(form, items, subtotalUsd),
    [form, items, subtotalUsd],
  );

  if (!hydrated) return <LoadingBlock label="Loading checkout…" />;

  if (!items.length && !prepared) {
    return (
      <EmptyState
        title="Nothing to check out"
        description="Add products to your cart before preparing a WhatsApp order."
        action={<ButtonLink href="/products">Browse products</ButtonLink>}
      />
    );
  }

  const setField = <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: FieldErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Please enter your full name.";
    }
    const phone = form.phone.replace(/\s+/g, "");
    if (
      !/^(\+?964|0)?7\d{8,9}$/.test(phone) &&
      phone.replace(/\D/g, "").length < 10
    ) {
      next.phone = "Enter a valid phone number (Iraq mobile preferred).";
    }

    if (form.locationMethod === "address") {
      if (!form.city.trim()) {
        next.city = "Add a city or area for delivery.";
      }
      if (!form.address.trim() || form.address.trim().length < 5) {
        next.address = "Add a street or landmark so the store can find you.";
      }
    }

    if (form.locationMethod === "maps_link") {
      if (!form.mapsLink.trim()) {
        next.mapsLink = "Paste a map share link, or choose another location option.";
      } else {
        const mapsError = validateMapsLink(form.mapsLink);
        if (mapsError) next.mapsLink = mapsError;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persistLocalOrder = () => {
    // Intentionally omit mapsLink from localStorage drafts — pin stays in WhatsApp only.
    addOrder({
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: form.name.trim(),
      customerPhone: form.phone.trim(),
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      deliveryInstructions: form.deliveryInstructions.trim() || undefined,
      locationMethod: form.locationMethod,
      notes: form.notes.trim(),
      items,
      totalUsd: subtotalUsd,
      status: "drafted-for-whatsapp",
    });
  };

  const openWhatsApp = () => {
    if (!validate()) return;
    persistLocalOrder();
    setPrepared(true);
    const url = getWhatsAppChatUrl(message);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = url;
    }
    clearCart();
  };

  const copyOrder = async () => {
    if (!validate()) return;
    persistLocalOrder();
    setPrepared(true);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      clearCart();
    } catch {
      setErrors((prev) => ({
        ...prev,
        notes: "Clipboard unavailable — select and copy the message below.",
      }));
    }
  };

  const locationOptions: { id: LocationMethod; label: string; hint: string }[] =
    [
      {
        id: "none",
        label: "Skip for now",
        hint: "Store can ask for delivery details on WhatsApp.",
      },
      {
        id: "address",
        label: "Type an address",
        hint: "City/area plus street or landmark.",
      },
      {
        id: "maps_link",
        label: "Paste a map pin link",
        hint: "Google Maps, Apple Maps, OpenStreetMap, or Waze share URL.",
      },
      {
        id: "whatsapp_share",
        label: "Share live location in WhatsApp",
        hint: "Best on mobile — attach location in the chat after it opens.",
      },
    ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form
        className="space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
        noValidate
      >
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-neutral-600">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900">
            How WhatsApp checkout works
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Fill in your name and phone (required).</li>
            <li>Optionally add delivery location details.</li>
            <li>Open WhatsApp with a ready-made order message.</li>
            <li>
              You must review and press <strong>Send</strong> — opening the chat
              does <strong>not</strong> confirm or place the order.
            </li>
          </ol>
          <p className="mt-4 text-xs text-neutral-400">
            Store WhatsApp: {STORE_WHATSAPP_LOCAL} (wa.me +
            {STORE_WHATSAPP_E164_DIGITS}). No card payments. This site never
            requests your device location permission and does not track you.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Full name <span className="text-rose-700">*</span>
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="editorial-input"
            autoComplete="name"
          />
          {errors.name ? (
            <span className="text-sm text-rose-700" role="alert">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Phone <span className="text-rose-700">*</span>
          </span>
          <input
            required
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="0750…"
            className="editorial-input"
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone ? (
            <span className="text-sm text-rose-700" role="alert">
              {errors.phone}
            </span>
          ) : null}
        </label>

        <fieldset className="space-y-3">
          <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Delivery location (optional)
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {locationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={form.locationMethod === opt.id}
                onClick={() => setField("locationMethod", opt.id)}
                className={cn(
                  "border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                  form.locationMethod === opt.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-[var(--line)] bg-white text-neutral-700 hover:border-neutral-400",
                )}
              >
                <span className="block text-[11px] font-medium uppercase tracking-[0.12em]">
                  {opt.label}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-snug",
                    form.locationMethod === opt.id
                      ? "text-white/75"
                      : "text-neutral-400",
                  )}
                >
                  {opt.hint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {form.locationMethod === "address" ||
        form.locationMethod === "maps_link" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                City / area
                {form.locationMethod === "address" ? (
                  <span className="text-rose-700"> *</span>
                ) : null}
              </span>
              <input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                className="editorial-input"
                autoComplete="address-level2"
                placeholder="e.g. Baghdad — Karrada"
              />
              {errors.city ? (
                <span className="text-sm text-rose-700" role="alert">
                  {errors.city}
                </span>
              ) : null}
            </label>
            <label className="block space-y-2 sm:col-span-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Street / address
                {form.locationMethod === "address" ? (
                  <span className="text-rose-700"> *</span>
                ) : null}
              </span>
              <input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="editorial-input"
                autoComplete="street-address"
                placeholder="Street, building, landmark"
              />
              {errors.address ? (
                <span className="text-sm text-rose-700" role="alert">
                  {errors.address}
                </span>
              ) : null}
            </label>
          </div>
        ) : null}

        {form.locationMethod === "maps_link" ? (
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Map pin / share link <span className="text-rose-700">*</span>
              </span>
              <input
                value={form.mapsLink}
                onChange={(e) => setField("mapsLink", e.target.value)}
                className="editorial-input"
                inputMode="url"
                placeholder="https://maps.google.com/…"
                autoComplete="off"
              />
              {errors.mapsLink ? (
                <span className="text-sm text-rose-700" role="alert">
                  {errors.mapsLink}
                </span>
              ) : (
                <span className="text-xs text-neutral-400">
                  Open{" "}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-neutral-700"
                  >
                    Google Maps
                  </a>{" "}
                  (or Apple Maps / OSM), drop a pin, use Share → Copy link, then
                  paste it here. No API key and no automatic tracking.
                </span>
              )}
            </label>
          </div>
        ) : null}

        {form.locationMethod === "whatsapp_share" ? (
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">On your phone</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
              <li>Tap “Open WhatsApp order” below.</li>
              <li>Review the pre-filled order text.</li>
              <li>
                In WhatsApp, use the attachment / “+” menu →{" "}
                <strong>Location</strong> → send your current or pinned location.
              </li>
              <li>
                Press <strong>Send</strong> on the order message when ready.
              </li>
            </ol>
            <p className="mt-3 text-xs text-neutral-400">
              We never request browser location permission. Sharing is entirely
              inside WhatsApp under your control.
            </p>
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Delivery instructions (optional)
          </span>
          <textarea
            value={form.deliveryInstructions}
            onChange={(e) => setField("deliveryInstructions", e.target.value)}
            rows={3}
            className="editorial-input resize-y"
            placeholder="Gate code, preferred time window, call on arrival…"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Other notes (optional)
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            rows={3}
            className="editorial-input resize-y"
            placeholder="Sizing questions, gift wrap, etc."
          />
          {errors.notes ? (
            <span className="text-sm text-rose-700" role="alert">
              {errors.notes}
            </span>
          ) : null}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="sm:flex-1">
            Open WhatsApp order
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="sm:flex-1"
            onClick={copyOrder}
          >
            {copied ? "Order copied" : "Copy order message"}
          </Button>
        </div>

        {prepared ? (
          <p className="text-sm text-neutral-900" role="status">
            Order draft saved in this browser only (for local admin). Opening
            WhatsApp does not confirm the order — remember to press Send if the
            chat opened.
          </p>
        ) : null}
      </form>

      <aside className="h-fit space-y-4 border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="font-display text-2xl tracking-[0.04em] text-neutral-900">
          Order summary
        </h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3">
              <span className="text-neutral-600">
                {item.name} × {item.quantity}
                <span className="block text-xs text-neutral-400">
                  {item.size} · {item.colorName}
                </span>
              </span>
              <Price usd={item.priceUsd * item.quantity} compact />
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-[var(--line)] pt-3">
          <span className="font-medium text-neutral-900">Total</span>
          <Price usd={subtotalUsd} compact />
        </div>
        <p className="text-xs text-neutral-400">{CURRENCY_NOTE}</p>
        <details className="border border-[var(--line)] bg-white p-3 text-xs text-neutral-600">
          <summary className="cursor-pointer font-medium text-neutral-800">
            Preview WhatsApp message
          </summary>
          <pre className="mt-3 whitespace-pre-wrap font-sans">{message}</pre>
        </details>
      </aside>
    </div>
  );
}
