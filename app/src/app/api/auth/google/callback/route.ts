/**
 * GET /api/auth/google/callback
 *
 * Google OAuth callback handler.
 * Google redirects here after the user authorizes calendar access.
 * Exchanges the authorization code for tokens, fetches user info and
 * available calendars, then redirects to the settings page.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  getGoogleUserInfo,
  listGoogleCalendars,
} from "@/lib/calendar/google";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?tab=integrations&error=${error ?? "no_code"}`,
        req.url,
      ),
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    const calendars = await listGoogleCalendars(tokens.access_token);

    // TODO: Save connection to database
    // In production this would create a CalendarConnection record with:
    // - tokens (encrypted), user info, calendar list, sync settings
    console.log(
      "[Google Calendar] Connected:",
      userInfo.email,
      "Calendars:",
      calendars.length,
    );

    const redirectUrl = new URL("/dashboard/settings", req.url);
    redirectUrl.searchParams.set("tab", "integrations");
    redirectUrl.searchParams.set("connected", "google_calendar");
    redirectUrl.searchParams.set("email", userInfo.email);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[Google Calendar] OAuth error:", err);
    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?tab=integrations&error=google_auth_failed",
        req.url,
      ),
    );
  }
}
