/**
 * POST /api/calendar/disconnect
 *
 * Disconnect an external calendar provider.
 *
 * Body: { provider: "google" | "microsoft", userId: string }
 *
 * In production this would:
 * 1. Revoke the OAuth tokens with the provider
 * 2. Stop any active push notification watches/subscriptions
 * 3. Delete the CalendarConnection from the database
 * 4. Optionally clean up synced events
 */

import { NextRequest, NextResponse } from "next/server";
import type { CalendarProvider } from "@/lib/calendar/types";

const VALID_PROVIDERS: CalendarProvider[] = ["google", "microsoft"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, userId } = body as {
      provider: CalendarProvider;
      userId: string;
    };

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}` },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // TODO: Look up the CalendarConnection from database
    // TODO: If Google, call stopGoogleWatch() to cancel push notifications
    // TODO: If Microsoft, delete the Graph subscription
    // TODO: Revoke the OAuth tokens with the provider:
    //   - Google: POST https://oauth2.googleapis.com/revoke?token=...
    //   - Microsoft: No standard revocation endpoint; just delete the token
    // TODO: Delete the CalendarConnection record from the database
    // TODO: Optionally remove synced external events from Llamame

    console.log(
      `[Calendar Disconnect] Disconnected ${provider} for user ${userId}`,
    );

    return NextResponse.json({
      success: true,
      provider,
      message: `${provider === "google" ? "Google Calendar" : "Microsoft Outlook"} disconnected successfully`,
    });
  } catch (err) {
    console.error("[Calendar Disconnect] Error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect calendar" },
      { status: 500 },
    );
  }
}
