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
import { buildOrderMessage, getWhatsAppChatUrl } from "@/lib/whatsapp";
import type { CheckoutFormData } from "@/types";

export function CheckoutView() {
  const { items, hydrated, subtotalUsd, clearCart } = useCart();
  const { addOrder } = useCatalog();
  const [form, setForm] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
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

  const validate = () => {
    const next: Partial<CheckoutFormData> = {};
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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persistLocalOrder = () => {
    addOrder({
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: form.name.trim(),
      customerPhone: form.phone.trim(),
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

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
      >
        <div className="border border-neutral-200 bg-[var(--surface)] p-5 text-sm text-neutral-600">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-900">
            How WhatsApp checkout works
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Fill in your name and phone.</li>
            <li>Open WhatsApp with a ready-made order message.</li>
            <li>
              You must press <strong>Send</strong> in WhatsApp — opening the chat
              does not deliver the order by itself.
            </li>
          </ol>
          <p className="mt-4 text-xs text-neutral-400">
            Store WhatsApp: {STORE_WHATSAPP_LOCAL} (wa.me +
            {STORE_WHATSAPP_E164_DIGITS}). No card payments on this site.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Full name
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="editorial-input"
            autoComplete="name"
          />
          {errors.name ? (
            <span className="text-sm text-rose-700">{errors.name}</span>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Phone
          </span>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0750…"
            className="editorial-input"
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone ? (
            <span className="text-sm text-rose-700">{errors.phone}</span>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Notes (optional)
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="editorial-input resize-y"
            placeholder="Delivery area, preferred time, sizing notes…"
          />
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
          <p className="text-sm text-[var(--sky)]" role="status">
            Order draft saved in this browser. Remember to press Send in WhatsApp
            if the chat opened.
          </p>
        ) : null}
      </form>

      <aside className="h-fit space-y-4 border border-neutral-200 p-5">
        <h2 className="font-display text-2xl text-neutral-900">Order summary</h2>
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
        <div className="flex justify-between border-t border-neutral-200 pt-3">
          <span className="font-medium text-neutral-900">Total</span>
          <Price usd={subtotalUsd} compact />
        </div>
        <p className="text-xs text-neutral-400">{CURRENCY_NOTE}</p>
        <details className="border border-neutral-200 p-3 text-xs text-neutral-600">
          <summary className="cursor-pointer font-medium text-neutral-800">
            Preview WhatsApp message
          </summary>
          <pre className="mt-3 whitespace-pre-wrap font-sans">{message}</pre>
        </details>
      </aside>
    </div>
  );
}
