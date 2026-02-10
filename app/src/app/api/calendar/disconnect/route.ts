/**
 * POST /api/calendar/disconnect
 *
 * Disconnect an external calendar provider.
 * Revokes the OAuth token and updates the integration status in Convex.
 *
 * Body: { provider: "google" | "microsoft", userId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { CalendarProvider } from "@/lib/calendar/types";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
);

const VALID_PROVIDERS: CalendarProvider[] = ["google", "microsoft"];

const PROVIDER_MAP: Record<CalendarProvider, string> = {
  google: "google_calendar",
  microsoft: "outlook",
};

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

    // Look up the integration from Convex
    const convexProvider = PROVIDER_MAP[provider];
    const integration = await convex.query(api.integrations.getByUserProvider, {
      userId: userId as any,
      provider: convexProvider as any,
    });

    if (!integration) {
      return NextResponse.json(
        { error: `No ${provider} connection found` },
        { status: 404 },
      );
    }

    // Revoke the OAuth token with the provider
    if (integration.accessToken) {
      try {
        if (provider === "google") {
          await fetch(
            `https://oauth2.googleapis.com/revoke?token=${integration.accessToken}`,
            { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } },
          );
        }
        // Microsoft doesn't have a standard revocation endpoint
      } catch (revokeErr) {
        // Token revocation is best-effort; continue with disconnect
        console.warn("[Calendar Disconnect] Token revocation failed:", revokeErr);
      }
    }

    // Update the integration status in Convex
    await convex.mutation(api.integrations.disconnect, {
      id: integration._id,
    });

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
