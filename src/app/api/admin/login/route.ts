import { NextResponse } from "next/server";
import {
  adminPasswordConfigured,
  createAdminSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin password is not configured. Copy .env.example to .env.local and set ADMIN_DEMO_PASSWORD.",
      },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
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

  const response = NextResponse.json({
    ok: true,
    warning:
      "Local demo authentication only. Not production-grade security. Product edits and orders stay in this browser's localStorage.",
  });
  const cookie = sessionCookieOptions(token);
  response.cookies.set(cookie);
  return response;
}
