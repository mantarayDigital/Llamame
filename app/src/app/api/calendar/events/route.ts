/**
 * GET /api/calendar/events
 *
 * Fetch merged external calendar events from all connected providers.
 *
 * Query params:
 *   - userId: Convex user ID (required)
 *   - timeMin: ISO 8601 start of range (defaults to now)
 *   - timeMax: ISO 8601 end of range (defaults to 7 days from now)
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { CalendarEvent, CalendarProvider } from "@/lib/calendar/types";
import { listGoogleEvents, refreshGoogleToken } from "@/lib/calendar/google";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
);

const DEFAULT_RANGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ events: [], count: 0 });
  }

  const now = new Date();
  const timeMin = searchParams.get("timeMin") ?? now.toISOString();
  const timeMax =
    searchParams.get("timeMax") ??
    new Date(now.getTime() + DEFAULT_RANGE_MS).toISOString();

  try {
    // Fetch all integrations for this user
    const integrations = await convex.query(api.integrations.listByUser, {
      userId: userId as any,
    });

    const connectedCalendars = integrations.filter(
      (i: any) =>
        i.status === "connected" &&
        (i.provider === "google_calendar" || i.provider === "outlook") &&
        i.accessToken,
    );

    if (connectedCalendars.length === 0) {
      return NextResponse.json({ events: [], timeMin, timeMax, count: 0 });
    }

    const allEvents: CalendarEvent[] = [];

    for (const integration of connectedCalendars) {
      try {
        let accessToken = integration.accessToken!;

        // Refresh token if expired
        if (integration.expiresAt && integration.expiresAt < Date.now() - 60_000) {
          if (integration.refreshToken) {
            const provider = integration.provider === "google_calendar" ? "google" : "microsoft";
            if (provider === "google") {
              const tokens = await refreshGoogleToken(integration.refreshToken);
              accessToken = tokens.access_token;
              // Persist refreshed tokens
              await convex.mutation(api.integrations.updateTokens, {
                id: integration._id,
                accessToken: tokens.access_token,
                expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
                refreshToken: tokens.refresh_token,
              });
            }
          }
        }

        // Get selected calendar IDs from config
        const config = integration.config as any;
        const calendarIds: string[] =
          config?.calendars
            ?.filter((c: any) => c.selected)
            ?.map((c: any) => c.id) ?? ["primary"];

        const provider: CalendarProvider =
          integration.provider === "google_calendar" ? "google" : "microsoft";

        // Fetch events from each selected calendar
        for (const calendarId of calendarIds) {
          if (provider === "google") {
            const events = await listGoogleEvents(
              accessToken,
              calendarId,
              timeMin,
              timeMax,
            );
            allEvents.push(...events);
          }
          // Microsoft support can be added here later
        }
      } catch (err) {
        console.error(
          `[Calendar Events] Failed to fetch from ${integration.provider}:`,
          err,
        );
      }
    }

    // Sort by start time
    allEvents.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return NextResponse.json({
      events: allEvents,
      timeMin,
      timeMax,
      count: allEvents.length,
    });
  } catch (err) {
    console.error("[Calendar Events] Error:", err);
    return NextResponse.json({ events: [], timeMin, timeMax, count: 0 });
  }
}
