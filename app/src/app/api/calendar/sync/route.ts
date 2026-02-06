/**
 * POST /api/calendar/sync
 * GET  /api/calendar/sync
 *
 * Manual sync trigger and sync status endpoint.
 *
 * POST: Triggers a calendar sync for a specific provider and user.
 * GET:  Returns the current sync status for all connections.
 */

import { NextRequest, NextResponse } from "next/server";
import type { CalendarProvider, SyncResult } from "@/lib/calendar/types";

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

    // TODO: Look up CalendarConnection from database by userId + provider
    // TODO: Call ensureValidToken() to refresh if needed
    // TODO: Call syncCalendar() from the sync engine

    const result: SyncResult = {
      provider,
      success: true,
      eventsCreated: 0,
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

export async function GET(req: NextRequest) {
  // TODO: Look up all CalendarConnections for the authenticated user
  // TODO: Return their sync statuses

  return NextResponse.json({
    connections: [],
    lastSync: null,
  });
}
