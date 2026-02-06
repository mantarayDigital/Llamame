/**
 * POST /api/webhooks/google-calendar
 *
 * Google Calendar push notification handler.
 *
 * When we subscribe to calendar changes via `watchGoogleCalendar()`, Google
 * sends POST requests to this endpoint whenever events change. We must
 * respond 200 quickly to acknowledge receipt, then trigger a background sync.
 *
 * Google headers:
 *   - X-Goog-Channel-ID:      The channel ID we set when creating the watch
 *   - X-Goog-Resource-ID:     The opaque resource ID assigned by Google
 *   - X-Goog-Resource-State:  "sync" (initial), "exists" (change), "not_exists" (deleted)
 *   - X-Goog-Message-Number:  Monotonically increasing message number
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const channelId = req.headers.get("x-goog-channel-id");
  const resourceId = req.headers.get("x-goog-resource-id");
  const resourceState = req.headers.get("x-goog-resource-state");
  const messageNumber = req.headers.get("x-goog-message-number");

  console.log("[Google Webhook] Notification:", {
    channelId,
    resourceId,
    resourceState,
    messageNumber,
  });

  if (resourceState === "sync") {
    // Initial sync confirmation — Google sends this when the watch is first
    // created to confirm the webhook URL is reachable.
    console.log(
      "[Google Webhook] Watch confirmed for channel:",
      channelId,
    );
    return new NextResponse(null, { status: 200 });
  }

  if (resourceState === "exists") {
    // Calendar changed — one or more events were created, updated, or deleted.
    // TODO: Look up the CalendarConnection by channelId
    // TODO: Trigger an incremental sync (use syncToken for efficiency)
    console.log(
      "[Google Webhook] Calendar changed, triggering sync for channel:",
      channelId,
    );
  }

  if (resourceState === "not_exists") {
    // The watched resource was deleted (e.g., calendar was removed).
    // TODO: Mark the connection as needing re-setup
    console.log(
      "[Google Webhook] Resource deleted for channel:",
      channelId,
    );
  }

  return new NextResponse(null, { status: 200 });
}
