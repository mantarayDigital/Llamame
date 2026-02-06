/**
 * POST /api/billing/portal
 *
 * Generates a Creem customer portal URL.
 * The portal lets users manage subscriptions, view invoices,
 * and update payment methods.
 *
 * Body: { customerId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCustomerPortalUrl, isCreemConfigured } from "@/lib/billing";

export async function POST(req: NextRequest) {
  if (!isCreemConfigured) {
    return NextResponse.json(
      { error: "Billing is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const portalUrl = await getCustomerPortalUrl(customerId);
    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error("[billing/portal] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate portal URL" },
      { status: 500 }
    );
  }
}
