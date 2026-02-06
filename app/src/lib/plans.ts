/**
 * Plan definitions and feature limits.
 *
 * This is the single source of truth for what each plan can do.
 * Used by the landing page pricing section, middleware guards,
 * and backend validation.
 */

import type { PlanTier } from "./types";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  price: number;
  billingUnit: string;
  description: string;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  maxEventTypes: number; // 0 = unlimited
  maxBookingsPerMonth: number; // 0 = unlimited
  maxTeamMembers: number; // 0 = unlimited
  maxWorkflows: number;
  maxApiKeys: number;
  maxWebhooks: number;
  calendarIntegrations: boolean;
  videoIntegrations: boolean;
  paymentIntegrations: boolean;
  messagingIntegrations: boolean;
  crmIntegrations: boolean;
  automationIntegrations: boolean;
  aiBriefs: boolean;
  energyScheduling: boolean;
  fatigueProtection: boolean;
  clientIntelligence: boolean;
  vibeCheck: boolean;
  customBranding: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  webhookAccess: boolean;
  prioritySupport: boolean;
  analytics: "basic" | "advanced" | "full";
}

export const plans: PlanDefinition[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    billingUnit: "/mo",
    description: "For individuals getting started with smart scheduling.",
    featured: false,
    ctaLabel: "Get started",
    ctaHref: "/auth/signup?plan=free",
    limits: {
      maxEventTypes: 1,
      maxBookingsPerMonth: 50,
      maxTeamMembers: 1,
      maxWorkflows: 1,
      maxApiKeys: 0,
      maxWebhooks: 0,
      calendarIntegrations: true,
      videoIntegrations: false,
      paymentIntegrations: false,
      messagingIntegrations: false,
      crmIntegrations: false,
      automationIntegrations: false,
      aiBriefs: false,
      energyScheduling: false,
      fatigueProtection: false,
      clientIntelligence: false,
      vibeCheck: false,
      customBranding: false,
      whiteLabel: false,
      apiAccess: false,
      webhookAccess: false,
      prioritySupport: false,
      analytics: "basic",
    },
    features: [
      "1 event type",
      "Google Calendar sync",
      "Email notifications",
      "Booking page",
      "50 bookings/month",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 12,
    billingUnit: "/mo",
    description: "AI scheduling, all integrations, and full customization.",
    featured: true,
    ctaLabel: "Start free trial",
    ctaHref: "/auth/signup?plan=pro",
    limits: {
      maxEventTypes: 0,
      maxBookingsPerMonth: 0,
      maxTeamMembers: 1,
      maxWorkflows: 10,
      maxApiKeys: 2,
      maxWebhooks: 3,
      calendarIntegrations: true,
      videoIntegrations: true,
      paymentIntegrations: true,
      messagingIntegrations: true,
      crmIntegrations: false,
      automationIntegrations: true,
      aiBriefs: true,
      energyScheduling: true,
      fatigueProtection: true,
      clientIntelligence: false,
      vibeCheck: true,
      customBranding: true,
      whiteLabel: false,
      apiAccess: false,
      webhookAccess: false,
      prioritySupport: false,
      analytics: "advanced",
    },
    features: [
      "Unlimited event types",
      "AI Meeting Briefs",
      "All integrations",
      "WhatsApp booking bot",
      "Payments + Vibe Check",
      "Custom branding",
      "Energy-aware scheduling",
    ],
  },
  {
    tier: "team",
    name: "Team",
    price: 24,
    billingUnit: "/seat/mo",
    description: "Round-robin, collective booking, and team analytics.",
    featured: false,
    ctaLabel: "Contact sales",
    ctaHref: "/contact?plan=team",
    limits: {
      maxEventTypes: 0,
      maxBookingsPerMonth: 0,
      maxTeamMembers: 0,
      maxWorkflows: 0,
      maxApiKeys: 10,
      maxWebhooks: 10,
      calendarIntegrations: true,
      videoIntegrations: true,
      paymentIntegrations: true,
      messagingIntegrations: true,
      crmIntegrations: true,
      automationIntegrations: true,
      aiBriefs: true,
      energyScheduling: true,
      fatigueProtection: true,
      clientIntelligence: true,
      vibeCheck: true,
      customBranding: true,
      whiteLabel: true,
      apiAccess: true,
      webhookAccess: true,
      prioritySupport: true,
      analytics: "full",
    },
    features: [
      "Everything in Pro",
      "Team scheduling",
      "Client Intelligence dashboard",
      "Advanced analytics",
      "API access",
      "White-label",
      "Priority support",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: -1, // -1 = custom pricing
    billingUnit: "",
    description: "Custom deployment, SLA, and dedicated support for large teams.",
    featured: false,
    ctaLabel: "Talk to us",
    ctaHref: "/contact?plan=enterprise",
    limits: {
      maxEventTypes: 0,
      maxBookingsPerMonth: 0,
      maxTeamMembers: 0,
      maxWorkflows: 0,
      maxApiKeys: 0,
      maxWebhooks: 0,
      calendarIntegrations: true,
      videoIntegrations: true,
      paymentIntegrations: true,
      messagingIntegrations: true,
      crmIntegrations: true,
      automationIntegrations: true,
      aiBriefs: true,
      energyScheduling: true,
      fatigueProtection: true,
      clientIntelligence: true,
      vibeCheck: true,
      customBranding: true,
      whiteLabel: true,
      apiAccess: true,
      webhookAccess: true,
      prioritySupport: true,
      analytics: "full",
    },
    features: [
      "Everything in Team",
      "Custom deployment",
      "99.9% SLA",
      "Dedicated account manager",
      "SSO / SAML",
      "Custom integrations",
      "Onboarding & training",
    ],
  },
];

/**
 * Lookup a plan by tier.
 */
export function getPlan(tier: PlanTier): PlanDefinition {
  return plans.find((p) => p.tier === tier) ?? plans[0];
}

/**
 * Check if a feature is available on a given plan.
 */
export function hasFeature(
  tier: PlanTier,
  feature: keyof PlanLimits
): boolean {
  const plan = getPlan(tier);
  const value = plan.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return value !== "basic";
}

/**
 * Get the numeric limit for a plan feature.
 * Returns Infinity for 0 (unlimited).
 */
export function getLimit(
  tier: PlanTier,
  feature: keyof PlanLimits
): number {
  const plan = getPlan(tier);
  const value = plan.limits[feature];
  if (typeof value === "number") return value === 0 ? Infinity : value;
  return value ? 1 : 0;
}
