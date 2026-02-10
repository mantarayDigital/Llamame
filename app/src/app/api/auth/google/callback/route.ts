/**
 * GET /api/auth/google/callback
 *
 * Google OAuth callback handler.
 * Exchanges the authorization code for tokens, saves the connection
 * to Convex, then redirects to the settings page.
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import {
  exchangeGoogleCode,
  getGoogleUserInfo,
  listGoogleCalendars,
} from "@/lib/calendar/google";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
);

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

  // Decode userId from state
  let userId: string | undefined;
  if (state) {
    try {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8"),
      );
      userId = decoded.userId;
    } catch {
      // ignore bad state
    }
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    const calendars = await listGoogleCalendars(tokens.access_token);

    // Save connection to Convex
    if (userId) {
      await convex.mutation(api.integrations.saveConnection, {
        userId: userId as any,
        provider: "google_calendar",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        config: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          calendars: calendars.map((c) => ({
            id: c.id,
            name: c.name,
            primary: c.primary,
            selected: c.primary, // auto-select primary calendar
          })),
          syncDirection: "both",
        },
      });
    }

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
