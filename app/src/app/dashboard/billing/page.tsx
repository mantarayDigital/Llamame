"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Check,
  ArrowUpRight,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { plans, getPlan } from "@/lib/plans";
import type { PlanTier } from "@/lib/types";
import { useCurrentUser, useCurrentUserId, useEventTypes } from "@/lib/data";
import { btn, card, badge, currencyFormatter } from "@/lib/theme";

/** Plans available for upgrade via Creem checkout */
const upgradePlans = plans.filter(
  (p) => p.price > 0 && p.price !== -1
);

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const currentUserId = useCurrentUserId();
  const user = useCurrentUser();
  const eventTypes = useEventTypes(currentUserId);

  const currentPlan = getPlan((user?.plan ?? "free") as PlanTier);

  const searchParams = useSearchParams();
  const justPurchased = searchParams.get("success") === "true";

  const [loading, setLoading] = useState<string | null>(null);

  /** Redirect to Creem checkout for a given plan */
  const handleUpgrade = async (plan: PlanTier) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: user?.email ?? "",
          userId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not start checkout");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };


  return (
    <>
      {/* Success banner */}
      {justPurchased && (
        <div className="p-4 rounded-xl bg-green-muted border border-green/20 flex items-center gap-3 mb-6">
          <Check className="w-5 h-5 text-green shrink-0" />
          <div className="flex-1">
            <strong className="text-sm block">Payment successful!</strong>
            <p className="text-sm text-text-sec">
              Your plan has been upgraded. Welcome to the new features.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-text-sec text-sm mt-1">
            Manage your subscription, upgrade your plan, and view invoices.
          </p>
        </div>
        {currentPlan.tier !== "free" && (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            Subscription management coming soon
          </span>
        )}
      </div>

      {/* Current Plan Card */}
      <div className={`${card.base} p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-violet flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-bg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{currentPlan.name} Plan</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentPlan.tier === "free"
                      ? badge.amber
                      : currentPlan.tier === "pro"
                        ? badge.accent
                        : badge.violet
                  }`}
                >
                  {currentPlan.tier === "free" ? "Free" : "Active"}
                </span>
              </div>
              <p className="text-sm text-text-sec mt-0.5">
                {currentPlan.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            {currentPlan.price > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  ${currentPlan.price}
                  <span className="text-sm font-normal text-text-muted">
                    {currentPlan.billingUnit}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Billed monthly
                </p>
              </>
            ) : (
              <div className="text-lg font-semibold text-text-muted">
                No charge
              </div>
            )}
          </div>
        </div>

        {/* Current plan features */}
        <div className="mt-6 pt-5 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">Included in your plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentPlan.features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm text-text-sec"
              >
                <Check className="w-3.5 h-3.5 text-green shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      {currentPlan.tier === "free" && (
        <>
          <h2 className="text-xl font-bold mb-4">Upgrade your plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {upgradePlans.map((plan) => (
              <div
                key={plan.tier}
                className={`${card.base} p-6 ${
                  plan.featured
                    ? "border-accent/30 shadow-featured"
                    : ""
                }`}
              >
                {plan.featured && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-semibold text-accent">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-sm text-text-muted">
                    {plan.billingUnit}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-text-sec mb-5">
                  {plan.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-text-sec"
                    >
                      <Check className="w-3.5 h-3.5 text-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={loading === plan.tier}
                  className={`w-full ${plan.featured ? btn.primary : btn.secondary}`}
                >
                  {loading === plan.tier ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Usage Stats */}
      <div className={`${card.base} p-6 mb-8`}>
        <h3 className="font-semibold mb-4">Current Usage</h3>
        <div className="space-y-4">
          <UsageRow
            label="Event Types"
            used={eventTypes.length}
            limit={currentPlan.limits.maxEventTypes || Infinity}
          />
          <UsageRow
            label="Bookings This Month"
            used={0}
            limit={currentPlan.limits.maxBookingsPerMonth || Infinity}
          />
          <UsageRow
            label="Workflows"
            used={0}
            limit={currentPlan.limits.maxWorkflows || Infinity}
          />
          <UsageRow
            label="Team Members"
            used={1}
            limit={currentPlan.limits.maxTeamMembers || Infinity}
          />
        </div>
      </div>

      {/* Billing Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card.base} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Secure Payments</h3>
          </div>
          <p className="text-sm text-text-sec leading-relaxed">
            Payments are processed securely by{" "}
            <strong className="text-text">Creem</strong>, our Merchant of
            Record. Creem handles global tax collection, chargebacks, and
            compliance automatically.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
            <span>Cards</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
            <span>80+ currencies</span>
          </div>
        </div>
        <div className={`${card.base} p-6`}>
          <h3 className="font-semibold mb-3">Payment History</h3>
          {currentPlan.tier === "free" ? (
            <p className="text-sm text-text-muted">
              No payments yet. Upgrade to see your billing history.
            </p>
          ) : (
            <p className="text-sm text-text-muted">
              Payment history will appear here once billing is active.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/** Usage meter row component */
function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = limit !== Infinity && pct >= 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-text-sec">{label}</span>
        <span className="font-semibold">
          {used}
          {limit === Infinity ? "" : ` / ${limit}`}
          {limit === Infinity && (
            <span className="text-text-muted font-normal ml-1">unlimited</span>
          )}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? "bg-amber" : "bg-accent"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
