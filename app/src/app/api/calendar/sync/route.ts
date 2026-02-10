/**
 * POST /api/calendar/sync
 *
 * Manual sync trigger — pulls external events and returns sync stats.
 *
 * Body: { provider: "google" | "microsoft", userId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { CalendarProvider, CalendarConnection, SyncResult } from "@/lib/calendar/types";
import { pullExternalEvents } from "@/lib/calendar/sync";
import { refreshGoogleToken } from "@/lib/calendar/google";

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
        {
          success: false,
          error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    // Look up the integration from Convex
    const convexProvider = PROVIDER_MAP[provider];
    const integration = await convex.query(api.integrations.getByUserProvider, {
      userId: userId as any,
      provider: convexProvider as any,
    });

    if (!integration || integration.status !== "connected" || !integration.accessToken) {
      return NextResponse.json(
        { success: false, error: `No active ${provider} connection found` },
        { status: 404 },
      );
    }

    let accessToken = integration.accessToken;

    // Refresh token if expired
    if (integration.expiresAt && integration.expiresAt < Date.now() - 60_000) {
      if (integration.refreshToken && provider === "google") {
        const tokens = await refreshGoogleToken(integration.refreshToken);
        accessToken = tokens.access_token;
        await convex.mutation(api.integrations.updateTokens, {
          id: integration._id,
          accessToken: tokens.access_token,
          expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
          refreshToken: tokens.refresh_token,
        });
      }
    }

    // Build CalendarConnection from Convex data
    const config = integration.config as any;
    const calendarIds: string[] =
      config?.calendars
        ?.filter((c: any) => c.selected)
        ?.map((c: any) => c.id) ?? ["primary"];

    const connection: CalendarConnection = {
      id: integration._id,
      userId,
      provider,
      email: config?.email ?? "",
      accessToken,
      refreshToken: integration.refreshToken ?? "",
      expiresAt: integration.expiresAt ?? Date.now() + 3600_000,
      calendarIds,
      syncEnabled: true,
      syncDirection: config?.syncDirection ?? "both",
      lastSyncAt: integration.lastSyncAt,
      syncStatus: "syncing",
      createdAt: integration.createdAt,
    };

    // Pull external events
    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const externalEvents = await pullExternalEvents(connection, timeMin, timeMax);

    // Update sync status in Convex
    await convex.mutation(api.integrations.updateSyncStatus, {
      id: integration._id,
      lastSyncAt: Date.now(),
      status: "connected",
    });

    const result: SyncResult = {
      provider,
      success: true,
      eventsCreated: externalEvents.length,
      eventsUpdated: 0,
      eventsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      syncedAt: Date.now(),
    };

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("[Calendar Sync] Error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 },
    );
  }
}
