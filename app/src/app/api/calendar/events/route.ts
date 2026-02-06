/**
 * GET /api/calendar/events
 *
 * Fetch merged external calendar events from all connected providers.
 *
 * Query params:
 *   - timeMin: ISO 8601 start of range (defaults to now)
 *   - timeMax: ISO 8601 end of range (defaults to 7 days from now)
 */

import { NextRequest, NextResponse } from "next/server";
import type { CalendarEvent } from "@/lib/calendar/types";

/** Default time range: 7 days from now. */
const DEFAULT_RANGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const now = new Date();
  const timeMin = searchParams.get("timeMin") ?? now.toISOString();
  const timeMax =
    searchParams.get("timeMax") ??
    new Date(now.getTime() + DEFAULT_RANGE_MS).toISOString();

  // TODO: In production, look up all CalendarConnections for the authenticated
  // user and fetch events from each provider using listGoogleEvents /
  // listMicrosoftEvents, then merge and sort.

  // Demo external events to show the feature works
  const demoExternalEvents: CalendarEvent[] = [
    {
      externalId: "ext_001",
      provider: "google",
      calendarId: "primary",
      title: "Team Standup",
      description: "Daily team sync to discuss progress and blockers.",
      startTime: new Date(Date.now() + 3_600_000).toISOString(),
      endTime: new Date(Date.now() + 5_400_000).toISOString(),
      timezone: "America/New_York",
      allDay: false,
      status: "confirmed",
      busy: true,
      attendees: [
        {
          email: "alice@example.com",
          name: "Alice",
          responseStatus: "accepted",
          organizer: true,
        },
        {
          email: "bob@example.com",
          name: "Bob",
          responseStatus: "accepted",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      externalId: "ext_002",
      provider: "google",
      calendarId: "primary",
      title: "Lunch Break",
      startTime: new Date(Date.now() + 7_200_000).toISOString(),
      endTime: new Date(Date.now() + 10_800_000).toISOString(),
      timezone: "America/New_York",
      allDay: false,
      status: "confirmed",
      busy: false,
      updatedAt: new Date().toISOString(),
    },
    {
      externalId: "ext_003",
      provider: "microsoft",
      calendarId: "default",
      title: "Sprint Planning",
      description: "Bi-weekly sprint planning session.",
      startTime: new Date(Date.now() + 86_400_000).toISOString(),
      endTime: new Date(Date.now() + 90_000_000).toISOString(),
      timezone: "America/New_York",
      allDay: false,
      status: "confirmed",
      busy: true,
      meetingUrl: "https://teams.microsoft.com/l/meetup-join/example",
      updatedAt: new Date().toISOString(),
    },
    {
      externalId: "ext_004",
      provider: "google",
      calendarId: "primary",
      title: "Company All-Hands",
      startTime: new Date(Date.now() + 172_800_000).toISOString(),
      endTime: new Date(Date.now() + 176_400_000).toISOString(),
      timezone: "America/New_York",
      allDay: false,
      status: "tentative",
      busy: true,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      updatedAt: new Date().toISOString(),
    },
    {
      externalId: "ext_005",
      provider: "microsoft",
      calendarId: "default",
      title: "Project Deadline",
      startTime: new Date(Date.now() + 259_200_000).toISOString(),
      endTime: new Date(Date.now() + 259_200_000).toISOString(),
      timezone: "America/New_York",
      allDay: true,
      status: "confirmed",
      busy: false,
      updatedAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    events: demoExternalEvents,
    timeMin,
    timeMax,
    count: demoExternalEvents.length,
  });
}
