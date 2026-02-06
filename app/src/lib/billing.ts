/**
 * Creem billing configuration.
 *
 * Single source of truth for plan ↔ Creem product mapping,
 * the Creem client instance, and billing helpers.
 *
 * Creem acts as Merchant of Record — handles tax collection,
 * chargebacks, and global payment methods automatically.
 *
 * @see https://docs.creem.io
 */

import { Creem } from "creem";
import type { PlanTier } from "./types";

// ─── Environment ────────────────────────────────────────────

const CREEM_API_KEY = process.env.CREEM_API_KEY ?? "";
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET ?? "";
const CREEM_TEST_MODE = process.env.CREEM_TEST_MODE === "true";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Creem Client (server-side only) ────────────────────────

/**
 * Lazy-initialised Creem SDK instance.
 * Uses test API (serverIdx 1) or production (serverIdx 0).
 */
let _creem: Creem | null = null;

export function getCreem(): Creem {
  if (!_creem) {
    _creem = new Creem({
      apiKey: CREEM_API_KEY,
      serverIdx: CREEM_TEST_MODE ? 1 : 0,
    });
  }
  return _creem;
}

// ─── Plan → Creem Product Mapping ───────────────────────────

/**
 * Map plan tiers to Creem product IDs.
 *
 * Create these products in the Creem dashboard:
 *   - Pro:  $12/mo recurring (every-month)
 *   - Team: $24/seat/mo recurring (every-month, seat-based)
 *
 * Free and Enterprise don't go through Creem checkout.
 */
export const planProductIds: Partial<Record<PlanTier, string>> = {
  pro: process.env.CREEM_PRODUCT_PRO ?? "",
  team: process.env.CREEM_PRODUCT_TEAM ?? "",
};

// ─── Checkout Helpers ───────────────────────────────────────

export interface CheckoutOptions {
  plan: PlanTier;
  /** Creem customer ID (if returning customer) */
  customerId?: string;
  /** User email for Creem to pre-fill */
  email?: string;
  /** Internal user ID passed as metadata */
  userId?: string;
  /** Number of seats (for Team plan) */
  seats?: number;
}

/**
 * Create a Creem checkout session and return the URL.
 * Throws if the plan has no associated Creem product.
 */
export async function createCheckoutSession(
  opts: CheckoutOptions
): Promise<string> {
  const productId = planProductIds[opts.plan];
  if (!productId) {
    throw new Error(`No Creem product configured for plan: ${opts.plan}`);
  }

  const creem = getCreem();
  const result = await creem.checkouts.create({
    productId,
    successUrl: `${APP_URL}/dashboard/billing?success=true`,
    metadata: {
      userId: opts.userId ?? "",
      plan: opts.plan,
    },
  });

  if (!result.checkoutUrl) {
    throw new Error("Creem did not return a checkout URL");
  }

  return result.checkoutUrl;
}

// ─── Customer Portal ────────────────────────────────────────

/**
 * Generate a Creem customer portal link.
 * The portal lets users manage subscription, view invoices,
 * and update payment methods.
 */
export async function getCustomerPortalUrl(
  customerId: string
): Promise<string> {
  const creem = getCreem();
  const result = await creem.customers.generateBillingLinks({
    customerId,
  });

  const portalUrl = (result as Record<string, unknown>).customerPortalUrl ?? (result as Record<string, unknown>).url;
  if (!portalUrl) {
    throw new Error("Creem did not return a portal URL");
  }

  return portalUrl as string;
}

// ─── Subscription Helpers ───────────────────────────────────

/**
 * Cancel a subscription. By default cancels at period end
 * so the user retains access until their billing cycle ends.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const creem = getCreem();
  await creem.subscriptions.cancel(subscriptionId, { mode: "scheduled" });
}

// ─── Webhook Verification ───────────────────────────────────

/**
 * Verify the Creem webhook signature (HMAC-SHA256).
 * Returns true if the signature matches.
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  if (!CREEM_WEBHOOK_SECRET) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(CREEM_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );
  const computed = Buffer.from(sig).toString("hex");
  return computed === signature;
}

// ─── Webhook Event Types ────────────────────────────────────

export type CreemEventType =
  | "checkout.completed"
  | "subscription.active"
  | "subscription.paid"
  | "subscription.canceled"
  | "subscription.expired"
  | "subscription.trialing"
  | "subscription.paused"
  | "subscription.update"
  | "refund.created"
  | "dispute.created";

export interface CreemWebhookEvent {
  id: string;
  eventType: CreemEventType;
  created_at: string;
  object: {
    id: string;
    product_id?: string;
    customer_id?: string;
    subscription_id?: string;
    status?: string;
    metadata?: Record<string, string>;
    [key: string]: unknown;
  };
}

// ─── Plan resolution from product ID ────────────────────────

/**
 * Given a Creem product ID, determine which plan tier it corresponds to.
 */
export function getPlanFromProductId(productId: string): PlanTier | null {
  for (const [tier, id] of Object.entries(planProductIds)) {
    if (id === productId) return tier as PlanTier;
  }
  return null;
}

// ─── Exports for env check ──────────────────────────────────

export const isCreemConfigured =
  !!CREEM_API_KEY && CREEM_API_KEY !== "placeholder";

export { CREEM_WEBHOOK_SECRET };
