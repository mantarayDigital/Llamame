/**
 * GET /api/auth/microsoft/callback
 *
 * Microsoft OAuth callback handler.
 * Microsoft redirects here after the user authorizes calendar access.
 * Exchanges the authorization code for tokens, fetches user info and
 * available calendars, then redirects to the settings page.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  exchangeMicrosoftCode,
  getMicrosoftUserInfo,
  listMicrosoftCalendars,
} from "@/lib/calendar/microsoft";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error || !code) {
    console.error(
      "[Microsoft Calendar] OAuth denied:",
      error,
      errorDescription,
    );
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?tab=integrations&error=${error ?? "no_code"}`,
        req.url,
      ),
    );
  }

  try {
    const tokens = await exchangeMicrosoftCode(code);
    const userInfo = await getMicrosoftUserInfo(tokens.access_token);
    const calendars = await listMicrosoftCalendars(tokens.access_token);

    // TODO: Save connection to database
    // In production this would create a CalendarConnection record with:
    // - tokens (encrypted), user info, calendar list, sync settings
    console.log(
      "[Microsoft Calendar] Connected:",
      userInfo.email,
      "Calendars:",
      calendars.length,
    );

    const redirectUrl = new URL("/dashboard/settings", req.url);
    redirectUrl.searchParams.set("tab", "integrations");
    redirectUrl.searchParams.set("connected", "microsoft_calendar");
    redirectUrl.searchParams.set("email", userInfo.email);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[Microsoft Calendar] OAuth error:", err);
    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?tab=integrations&error=microsoft_auth_failed",
        req.url,
      ),
    );
  }
}
