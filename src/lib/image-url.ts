/**
 * Image URL helpers for demo catalog / admin.
 * Next.js remote images are limited to hosts in next.config.ts.
 */

const ALLOWED_REMOTE_HOSTS = new Set(["images.unsplash.com"]);

export function normalizeImageUrl(raw: string): string {
  return raw.trim();
}

export function isValidImageUrl(raw: string): boolean {
  const value = normalizeImageUrl(raw);
  if (!value) return false;

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value.length > 1;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return ALLOWED_REMOTE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function filterValidImageUrls(urls: string[]): string[] {
  return urls.map(normalizeImageUrl).filter(isValidImageUrl);
}

export function imageUrlError(raw: string): string | null {
  const value = normalizeImageUrl(raw);
  if (!value) return "Image URL is empty.";
  if (value.startsWith("/") && !value.startsWith("//")) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "Image URL must use http or https.";
    }
    if (!ALLOWED_REMOTE_HOSTS.has(url.hostname)) {
      return `Host “${url.hostname}” is not allowed. Use images.unsplash.com or a path under /public (e.g. /products/tee.jpg).`;
    }
    return null;
  } catch {
    return "Image URL is not a valid URL.";
  }
}
