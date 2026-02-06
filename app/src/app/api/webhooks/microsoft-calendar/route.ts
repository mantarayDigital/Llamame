/**
 * POST /api/webhooks/microsoft-calendar
 *
 * Microsoft Graph change notification handler.
 *
 * When we create a subscription via the Microsoft Graph API, Microsoft sends
 * notifications to this endpoint whenever calendar events change.
 *
 * Two-phase protocol:
 * 1. Validation: On subscription creation, Microsoft sends a POST with
 *    ?validationToken=... — we must echo the token back as plain text.
 * 2. Notifications: Subsequent POSTs contain a JSON body with a `value`
 *    array of change notifications.
 *
 * We must respond quickly (202 for notifications) to avoid Microsoft
 * disabling the subscription.
 */

import { NextRequest, NextResponse } from "next/server";

interface MicrosoftChangeNotification {
  subscriptionId: string;
  changeType: "created" | "updated" | "deleted";
  resource: string;
  resourceData?: {
    id: string;
    "@odata.type": string;
    "@odata.id": string;
    "@odata.etag": string;
  };
  clientState?: string;
  tenantId?: string;
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const validationToken = searchParams.get("validationToken");

  // Phase 1: Microsoft validation handshake
  // When creating a subscription, Microsoft sends a validation request
  // that must be echoed back immediately.
  if (validationToken) {
    console.log("[Microsoft Webhook] Validation handshake");
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Phase 2: Process change notifications
  try {
    const body = await req.json();
    const notifications: MicrosoftChangeNotification[] = body.value ?? [];

    for (const notification of notifications) {
      console.log("[Microsoft Webhook] Change:", {
        resource: notification.resource,
        changeType: notification.changeType,
        subscriptionId: notification.subscriptionId,
      });

      // TODO: Validate clientState to prevent spoofed notifications
      // TODO: Look up CalendarConnection by subscriptionId
      // TODO: Trigger an incremental sync using delta query
    }
  } catch {
    // Ignore parse errors — still respond 202 so Microsoft doesn't
    // disable the subscription.
    console.warn("[Microsoft Webhook] Failed to parse notification body");
  }

  return new NextResponse(null, { status: 202 });
}
