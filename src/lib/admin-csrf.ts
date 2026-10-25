/**
 * Same-origin checks for state-changing admin requests (Phase B3a.1).
 *
 * Compares Origin (or Referer origin) to the request URL origin, plus an
 * optional ADMIN_ALLOWED_ORIGINS allowlist (comma-separated) for reverse
 * proxies / preview URLs where request.url origin may differ.
 *
 * Use on POST/PUT/PATCH/DELETE admin Route Handlers before mutations.
 * Do not log full Origin/Referer strings in production error bodies.
 */

export type AdminEnv = NodeJS.ProcessEnv | Record<string, string | undefined>;

function parseAllowlist(env: AdminEnv): Set<string> {
  const raw = env.ADMIN_ALLOWED_ORIGINS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function originFromReferer(referer: string): string | null {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Extract the caller origin from Origin or Referer.
 */
export function readRequestOrigin(request: Request): string | null {
  const origin = request.headers.get("origin")?.trim();
  if (origin) return origin;
  const referer = request.headers.get("referer")?.trim();
  if (!referer) return null;
  return originFromReferer(referer);
}

/**
 * True when the mutation is same-origin (or allowlisted).
 * Rejects when Origin and Referer are both missing.
 */
export function isAllowedAdminMutationOrigin(
  request: Request,
  env: AdminEnv = process.env,
): boolean {
  const caller = readRequestOrigin(request);
  if (!caller) return false;

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    return false;
  }

  if (caller === expected) return true;
  return parseAllowlist(env).has(caller);
}

export type AdminOriginCheckResult =
  | { ok: true }
  | { ok: false; status: 403; error: string };

/**
 * Gate for future state-changing admin APIs (and current login/logout).
 */
export function assertAdminMutationOrigin(
  request: Request,
  env: AdminEnv = process.env,
): AdminOriginCheckResult {
  if (isAllowedAdminMutationOrigin(request, env)) {
    return { ok: true };
  }
  return {
    ok: false,
    status: 403,
    error: "Forbidden. Invalid or missing request origin.",
  };
}
