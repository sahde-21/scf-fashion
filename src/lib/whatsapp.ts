import {
  STORE_NAME,
  STORE_WHATSAPP_E164_DIGITS,
  USD_TO_IQD,
} from "@/lib/config";
import { formatDualPrice } from "@/lib/currency";
import type { CartItem, CheckoutFormData } from "@/types";

export function getWhatsAppChatUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${STORE_WHATSAPP_E164_DIGITS}?text=${encoded}`;
}

/** Empty chat URL — useful when the customer will share live location in WhatsApp. */
export function getWhatsAppChatUrlEmpty(): string {
  return `https://wa.me/${STORE_WHATSAPP_E164_DIGITS}`;
}

function isLikelyMapsLink(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host.includes("google.") ||
      host.includes("maps.app.goo.gl") ||
      host === "goo.gl" ||
      host.includes("openstreetmap.org") ||
      host.includes("osm.org") ||
      host.includes("apple.com") ||
      host.includes("maps.apple.com") ||
      host.includes("waze.com")
    );
  } catch {
    return false;
  }
}

export function validateMapsLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isLikelyMapsLink(trimmed)) {
    return "Paste a full https map link (Google Maps, Apple Maps, OpenStreetMap, or Waze).";
  }
  return null;
}

export function buildOrderMessage(
  form: CheckoutFormData,
  items: CartItem[],
  totalUsd: number,
): string {
  const lines: string[] = [
    `*${STORE_NAME} — New Order*`,
    "",
    `Name: ${form.name.trim()}`,
    `Phone: ${form.phone.trim()}`,
  ];

  if (form.city.trim()) {
    lines.push(`City / area: ${form.city.trim()}`);
  }
  if (form.address.trim()) {
    lines.push(`Address: ${form.address.trim()}`);
  }
  if (form.deliveryInstructions.trim()) {
    lines.push(`Delivery instructions: ${form.deliveryInstructions.trim()}`);
  }

  if (form.locationMethod === "maps_link" && form.mapsLink.trim()) {
    lines.push(`Map pin / link: ${form.mapsLink.trim()}`);
  }
  if (form.locationMethod === "whatsapp_share") {
    lines.push(
      "Location: Customer will share live location in this WhatsApp chat (please ask if missing).",
    );
  }
  if (form.locationMethod === "address" && !form.mapsLink.trim()) {
    lines.push("Location method: Written address (no map pin attached).");
  }

  if (form.notes.trim()) {
    lines.push(`Notes: ${form.notes.trim()}`);
  }

  lines.push("", "*Items:*");

  for (const item of items) {
    const lineTotal = item.priceUsd * item.quantity;
    lines.push(
      `• ${item.name} × ${item.quantity}`,
      `  Size: ${item.size} · Color: ${item.colorName}`,
      `  ${formatDualPrice(lineTotal)}`,
    );
  }

  lines.push(
    "",
    `*Total:* ${formatDualPrice(totalUsd)}`,
    `(Demo rate: 1 USD = ${USD_TO_IQD.toLocaleString("en-US")} IQD)`,
    "",
    "_This message was prepared by the customer. Opening WhatsApp does not confirm the order — please reply to confirm availability and delivery._",
  );

  return lines.join("\n");
}
