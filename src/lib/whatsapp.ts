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
    "_Please confirm availability and delivery details._",
  );

  return lines.join("\n");
}
