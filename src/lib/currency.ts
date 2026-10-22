import { USD_TO_IQD } from "@/lib/config";
import { formatNumber } from "@/lib/utils";

export function usdToIqd(usd: number, rate = USD_TO_IQD): number {
  return Math.round(usd * rate);
}

export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)} USD`;
}

export function formatIqd(usd: number, rate = USD_TO_IQD): string {
  return `${formatNumber(usdToIqd(usd, rate))} IQD`;
}

export function formatDualPrice(usd: number, rate = USD_TO_IQD): string {
  return `${formatUsd(usd)} · ${formatIqd(usd, rate)}`;
}
