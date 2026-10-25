import { NextResponse } from "next/server";
import { assertAdminMutationOrigin } from "@/lib/admin-csrf";
import { clearSessionCookieOptions } from "@/lib/admin-session";

export async function POST(request: Request) {
  const originCheck = assertAdminMutationOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json(
      { ok: false, error: originCheck.error },
      { status: originCheck.status },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
