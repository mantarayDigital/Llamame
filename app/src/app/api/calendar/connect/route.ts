/**
 * POST /api/calendar/connect
 *
 * Initiate an OAuth connection to an external calendar provider.
 *
 * Body: { provider: "google" | "microsoft", userId: string }
 *
 * Returns the OAuth authorization URL that the frontend should redirect
 * the user to. The `state` parameter encodes the userId and provider
 * so the callback can route properly.
 */

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { getMicrosoftAuthUrl } from "@/lib/calendar/microsoft";
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

    // Encode userId and provider in the state parameter so we can
    // associate the callback with the correct user.
    const state = Buffer.from(
      JSON.stringify({ userId, provider }),
    ).toString("base64url");

    let authUrl: string;

    if (provider === "google") {
      authUrl = getGoogleAuthUrl(state);
    } else if (provider === "microsoft") {
      authUrl = getMicrosoftAuthUrl(state);
    } else {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 },
      );
    }

    return NextResponse.json({ authUrl });
  } catch (err) {
    console.error("[Calendar Connect] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 },
    );
  }
}
