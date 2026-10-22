import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminPasswordConfigured,
  getAdminCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function GET() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  const authenticated = verifyAdminSessionToken(token);
  return NextResponse.json({
    authenticated,
    passwordConfigured: adminPasswordConfigured(),
    demoNotice:
      "Admin product edits and order drafts are stored in this browser only and are not shared across devices.",
  });
}
