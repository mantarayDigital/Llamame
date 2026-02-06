/**
 * Integration registry.
 *
 * Single source of truth for all supported integrations.
 * Used by landing page, settings, and backend connection logic.
 */

import type { IntegrationProvider } from "./types";

export interface IntegrationDefinition {
  provider: IntegrationProvider;
  name: string;
  description: string;
  shortDesc: string;
  icon: string; // Lucide icon name
  category: IntegrationCategory;
  requiredPlan: "free" | "pro" | "team";
  /** Environment variables needed to configure this integration */
  requiredEnvVars: string[];
  /** OAuth-based or API-key-based */
  authType: "oauth2" | "api_key" | "webhook";
  docsUrl?: string;
}

export type IntegrationCategory =
  | "calendar"
  | "video"
  | "payments"
  | "messaging"
  | "crm"
  | "productivity"
  | "automation";

export const integrations: IntegrationDefinition[] = [
  // ── Calendar ──
  {
    provider: "google_calendar",
    name: "Google Calendar",
    description: "Two-way calendar sync. Block time, detect conflicts, auto-update availability.",
    shortDesc: "two-way sync",
    icon: "Calendar",
    category: "calendar",
    requiredPlan: "free",
    requiredEnvVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    authType: "oauth2",
  },
  {
    provider: "outlook",
    name: "Outlook",
    description: "Sync with Microsoft Outlook calendar and email. Two-way availability.",
    shortDesc: "cal + email",
    icon: "Mail",
    category: "calendar",
    requiredPlan: "pro",
    requiredEnvVars: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
    authType: "oauth2",
  },

  // ── Video ──
  {
    provider: "google_meet",
    name: "Google Meet",
    description: "Auto-generate Google Meet links when a video meeting is booked.",
    shortDesc: "auto-link",
    icon: "Monitor",
    category: "video",
    requiredPlan: "free",
    requiredEnvVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    authType: "oauth2",
  },
  {
    provider: "zoom",
    name: "Zoom",
    description: "Automatically create Zoom meeting rooms for each booking.",
    shortDesc: "auto-create",
    icon: "Video",
    category: "video",
    requiredPlan: "pro",
    requiredEnvVars: ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"],
    authType: "oauth2",
  },

  // ── Payments ──
  {
    provider: "stripe",
    name: "Stripe",
    description: "Collect payments at booking. Deposits, subscriptions, refunds.",
    shortDesc: "payments",
    icon: "CreditCard",
    category: "payments",
    requiredPlan: "pro",
    requiredEnvVars: [
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ],
    authType: "api_key",
  },
  {
    provider: "paypal",
    name: "PayPal",
    description: "Accept PayPal payments from clients at booking time.",
    shortDesc: "payments",
    icon: "Wallet",
    category: "payments",
    requiredPlan: "pro",
    requiredEnvVars: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    authType: "api_key",
  },

  // ── Messaging ──
  {
    provider: "whatsapp",
    name: "WhatsApp",
    description: "Conversational booking bot. Send confirmations and reminders via WhatsApp.",
    shortDesc: "chat booking",
    icon: "Smartphone",
    category: "messaging",
    requiredPlan: "pro",
    requiredEnvVars: ["WHATSAPP_BUSINESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
    authType: "api_key",
  },
  {
    provider: "slack",
    name: "Slack",
    description: "Get instant Slack notifications for bookings, cancellations, and reminders.",
    shortDesc: "notifications",
    icon: "Hash",
    category: "messaging",
    requiredPlan: "pro",
    requiredEnvVars: ["SLACK_BOT_TOKEN"],
    authType: "oauth2",
  },

  // ── CRM ──
  {
    provider: "hubspot",
    name: "HubSpot",
    description: "Sync contacts and deals. Auto-create CRM records from bookings.",
    shortDesc: "crm sync",
    icon: "Database",
    category: "crm",
    requiredPlan: "team",
    requiredEnvVars: ["HUBSPOT_ACCESS_TOKEN"],
    authType: "api_key",
  },

  // ── Productivity ──
  {
    provider: "mailchimp",
    name: "Mailchimp",
    description: "Auto-add booking clients to your Mailchimp email lists.",
    shortDesc: "auto-lists",
    icon: "Send",
    category: "productivity",
    requiredPlan: "pro",
    requiredEnvVars: ["MAILCHIMP_API_KEY"],
    authType: "api_key",
  },
  {
    provider: "notion",
    name: "Notion",
    description: "Save meeting notes and client data to Notion databases.",
    shortDesc: "meeting notes",
    icon: "FileText",
    category: "productivity",
    requiredPlan: "pro",
    requiredEnvVars: ["NOTION_API_KEY"],
    authType: "api_key",
  },

  // ── Automation ──
  {
    provider: "zapier",
    name: "Zapier",
    description: "Connect Llamame to 5000+ apps with no-code workflows.",
    shortDesc: "5000+ apps",
    icon: "Zap",
    category: "automation",
    requiredPlan: "pro",
    requiredEnvVars: [],
    authType: "webhook",
  },
];

/**
 * Get integrations filtered by category.
 */
export function getIntegrationsByCategory(
  category: IntegrationCategory
): IntegrationDefinition[] {
  return integrations.filter((i) => i.category === category);
}

/**
 * Get integrations available on a given plan tier.
 */
export function getAvailableIntegrations(
  planTier: "free" | "pro" | "team"
): IntegrationDefinition[] {
  const tierRank = { free: 0, pro: 1, team: 2 };
  return integrations.filter(
    (i) => tierRank[i.requiredPlan] <= tierRank[planTier]
  );
}

/**
 * Get a single integration definition.
 */
export function getIntegration(
  provider: IntegrationProvider
): IntegrationDefinition | undefined {
  return integrations.find((i) => i.provider === provider);
}
