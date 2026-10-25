import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  getAdminCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function GET() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const authenticated = verifyAdminSessionToken(token);
  return NextResponse.json({
    authenticated,
    /** True when both ADMIN_DEMO_PASSWORD and ADMIN_SESSION_SECRET are usable. */
    passwordConfigured: adminAuthConfigured(),
    demoNotice:
      "Admin product edits and order drafts are stored in this browser only and are not shared across devices.",
  });
}
