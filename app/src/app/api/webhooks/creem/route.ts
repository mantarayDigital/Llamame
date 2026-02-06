/**
 * POST /api/webhooks/creem
 *
 * Handles incoming Creem webhook events.
 * Verifies HMAC-SHA256 signature, then processes subscription lifecycle events.
 *
 * Configure this URL in Creem Dashboard → Webhooks:
 *   https://your-domain.com/api/webhooks/creem
 *
 * Events handled:
 *   - checkout.completed  → grant access (activate plan)
 *   - subscription.active → confirm subscription started
 *   - subscription.paid   → renewal succeeded
 *   - subscription.canceled → schedule downgrade at period end
 *   - subscription.expired → revoke access immediately
 *   - subscription.paused  → pause features
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  getPlanFromProductId,
  type CreemWebhookEvent,
  type CreemEventType,
} from "@/lib/billing";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("creem-signature") ?? "";

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn("[webhook/creem] Invalid signature — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: CreemWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventType, object } = event;
  const metadata = object.metadata ?? {};
  const userId = metadata.userId;
  const plan = object.product_id
    ? getPlanFromProductId(object.product_id)
    : metadata.plan ?? null;

  console.log(
    `[webhook/creem] ${eventType} | user=${userId} plan=${plan} sub=${object.subscription_id ?? object.id}`
  );

  switch (eventType as CreemEventType) {
    // ── Checkout completed — user just paid ──────────────
    case "checkout.completed": {
      // TODO: Update user record in Convex:
      //   - Set user.plan to the purchased plan tier
      //   - Store creem_customer_id and creem_subscription_id
      //   - Record payment timestamp
      console.log(
        `[webhook/creem] Grant access: user=${userId} plan=${plan}`
      );
      break;
    }

    // ── Subscription active — confirmed and running ──────
    case "subscription.active": {
      // TODO: Ensure user plan is active in database
      console.log(
        `[webhook/creem] Subscription active: sub=${object.id}`
      );
      break;
    }

    // ── Recurring payment succeeded ──────────────────────
    case "subscription.paid": {
      // TODO: Update lastPaymentAt, extend billing period
      console.log(
        `[webhook/creem] Payment received: sub=${object.subscription_id ?? object.id}`
      );
      break;
    }

    // ── Subscription cancelled (at period end) ───────────
    case "subscription.canceled": {
      // TODO: Schedule plan downgrade to "free" at period end
      //   - Set user.planCancelAt = current period end date
      //   - User retains access until then
      console.log(
        `[webhook/creem] Subscription cancelled: sub=${object.id}`
      );
      break;
    }

    // ── Subscription expired — billing failed ────────────
    case "subscription.expired": {
      // TODO: Downgrade user to free plan immediately
      //   - Set user.plan = "free"
      //   - Send email notification about expired subscription
      console.log(
        `[webhook/creem] Subscription expired: sub=${object.id}`
      );
      break;
    }

    // ── Subscription paused ──────────────────────────────
    case "subscription.paused": {
      // TODO: Pause premium features (keep data, restrict access)
      console.log(
        `[webhook/creem] Subscription paused: sub=${object.id}`
      );
      break;
    }

    // ── Subscription updated (plan change, seats) ────────
    case "subscription.update": {
      // TODO: Sync new plan/seat count from Creem
      console.log(
        `[webhook/creem] Subscription updated: sub=${object.id}`
      );
      break;
    }

    // ── Trial started ────────────────────────────────────
    case "subscription.trialing": {
      // TODO: Grant plan access with trial flag
      console.log(
        `[webhook/creem] Trial started: sub=${object.id}`
      );
      break;
    }

    // ── Refund processed ─────────────────────────────────
    case "refund.created": {
      // TODO: Log refund, optionally downgrade
      console.log(
        `[webhook/creem] Refund created: ${object.id}`
      );
      break;
    }

    // ── Dispute / chargeback ─────────────────────────────
    case "dispute.created": {
      // TODO: Flag account, notify admin
      console.warn(
        `[webhook/creem] Dispute created: ${object.id}`
      );
      break;
    }

    default: {
      console.log(
        `[webhook/creem] Unhandled event: ${eventType}`
      );
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
