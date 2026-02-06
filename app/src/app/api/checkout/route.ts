/**
 * POST /api/checkout
 *
 * Creates a Creem checkout session and returns the URL.
 * The client redirects the user to this URL to complete payment.
 *
 * Body: { plan: "pro" | "team", email?: string, userId?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, isCreemConfigured } from "@/lib/billing";
import type { PlanTier } from "@/lib/types";

const ALLOWED_PLANS: PlanTier[] = ["pro", "team"];

export async function POST(req: NextRequest) {
  if (!isCreemConfigured) {
    return NextResponse.json(
      { error: "Billing is not configured. Set CREEM_API_KEY in environment." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const plan = body.plan as PlanTier;

    if (!plan || !ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${ALLOWED_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    const checkoutUrl = await createCheckoutSession({
      plan,
      email: body.email,
      userId: body.userId,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("[checkout] Error creating session:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
