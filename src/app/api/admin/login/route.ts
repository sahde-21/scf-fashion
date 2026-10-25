import { NextResponse } from "next/server";
import { assertAdminMutationOrigin } from "@/lib/admin-csrf";
import {
  clientKeyFromRequest,
  consumeLoginAttempt,
  LOGIN_RATE_LIMIT,
  resetLoginAttempts,
} from "@/lib/admin-rate-limit";
import {
  adminAuthConfigured,
  adminAuthMisconfiguredMessage,
  createAdminSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const originCheck = assertAdminMutationOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json(
      { ok: false, error: originCheck.error },
      { status: originCheck.status },
    );
  }

  const clientKey = clientKeyFromRequest(request);
  const limit = consumeLoginAttempt(clientKey);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Too many login attempts. Wait and try again. (In-memory limit; not shared across serverless instances.)",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  if (!adminAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: adminAuthMisconfiguredMessage(),
      },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 },
    );
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Unable to create session." },
      { status: 500 },
    );
  }

  // Successful login resets the window for this client key.
  resetLoginAttempts(clientKey);

  const response = NextResponse.json({
    ok: true,
    warning:
      "Local demo authentication only. Not production-grade security. Product edits and orders stay in this browser's localStorage.",
    rateLimitNote: `Login attempts are limited to ${LOGIN_RATE_LIMIT.maxAttempts} per ${LOGIN_RATE_LIMIT.windowMs / 60000} minutes per instance (in-memory).`,
  });
  const cookie = sessionCookieOptions(token);
  response.cookies.set(cookie);
  return response;
}
