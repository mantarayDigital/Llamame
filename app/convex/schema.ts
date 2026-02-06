import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Llamame SaaS database schema.
 *
 * Design principles:
 * - Every tenant-scoped table has an optional `orgId` for team/enterprise plans
 * - `userId` is always present for single-user ownership
 * - All timestamps are Unix milliseconds (number)
 * - Indexes support the most common query patterns
 * - Schema is additive — new tables and fields can be added without migration
 */

// ─── Reusable value definitions ──────────────────────────────────

const planTier = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("team"),
  v.literal("enterprise")
);

const bookingStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed"),
  v.literal("no_show")
);

const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("failed")
);

const locationType = v.union(
  v.literal("google_meet"),
  v.literal("zoom"),
  v.literal("phone"),
  v.literal("in_person"),
  v.literal("custom")
);

const orgRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer")
);

const integrationProvider = v.union(
  v.literal("google_calendar"),
  v.literal("google_meet"),
  v.literal("outlook"),
  v.literal("zoom"),
  v.literal("stripe"),
  v.literal("paypal"),
  v.literal("whatsapp"),
  v.literal("slack"),
  v.literal("hubspot"),
  v.literal("mailchimp"),
  v.literal("notion"),
  v.literal("zapier")
);

const integrationStatus = v.union(
  v.literal("connected"),
  v.literal("disconnected"),
  v.literal("error"),
  v.literal("pending")
);

const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("paused")
);

const workflowTrigger = v.union(
  v.literal("booking_created"),
  v.literal("booking_confirmed"),
  v.literal("booking_cancelled"),
  v.literal("booking_reminder"),
  v.literal("booking_completed"),
  v.literal("client_created"),
  v.literal("payment_received"),
  v.literal("payment_failed")
);

const workflowAction = v.union(
  v.literal("send_email"),
  v.literal("send_sms"),
  v.literal("send_whatsapp"),
  v.literal("send_slack"),
  v.literal("update_crm"),
  v.literal("create_invoice"),
  v.literal("add_to_list"),
  v.literal("webhook")
);

// ─── Schema ──────────────────────────────────────────────────────

export default defineSchema({
  // ── Identity & Access ──────────────────────────────────────────

  users: defineTable({
    // Auth provider external ID (Clerk, Auth0, etc.)
    externalId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    handle: v.string(),
    avatarUrl: v.optional(v.string()),
    timezone: v.string(),
    plan: planTier,
    orgId: v.optional(v.id("organizations")),
    role: v.optional(orgRole),
    energyProfile: v.optional(
      v.object({
        peakStart: v.string(),
        peakEnd: v.string(),
        lowStart: v.string(),
        lowEnd: v.string(),
      })
    ),
    branding: v.optional(
      v.object({
        logo: v.optional(v.string()),
        accentColor: v.optional(v.string()),
        bio: v.optional(v.string()),
        customCss: v.optional(v.string()),
        showPoweredBy: v.optional(v.boolean()),
      })
    ),
    notificationPrefs: v.optional(
      v.object({
        emailConfirmations: v.boolean(),
        emailReminders: v.boolean(),
        whatsappReminders: v.boolean(),
        slackNotifications: v.boolean(),
        dailyDigest: v.boolean(),
        reminderHoursBefore: v.array(v.number()),
      })
    ),
    onboardingCompleted: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_handle", ["handle"])
    .index("by_external_id", ["externalId"])
    .index("by_org", ["orgId"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.id("users"),
    plan: planTier,
    subscriptionId: v.optional(v.id("subscriptions")),
    branding: v.optional(
      v.object({
        logo: v.optional(v.string()),
        accentColor: v.optional(v.string()),
        bio: v.optional(v.string()),
        customCss: v.optional(v.string()),
        showPoweredBy: v.optional(v.boolean()),
      })
    ),
    settings: v.optional(
      v.object({
        defaultTimezone: v.string(),
        defaultCurrency: v.string(),
        requireVibeCheck: v.boolean(),
        enableAiBriefs: v.boolean(),
        enableEnergyScheduling: v.boolean(),
        enableFatigueProtection: v.boolean(),
        maxMembersAllowed: v.number(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  teamMembers: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: orgRole,
    invitedBy: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"]),

  invitations: defineTable({
    orgId: v.id("organizations"),
    email: v.string(),
    role: orgRole,
    invitedBy: v.id("users"),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  // ── Billing ────────────────────────────────────────────────────

  subscriptions: defineTable({
    orgId: v.optional(v.id("organizations")),
    userId: v.id("users"),
    plan: planTier,
    status: subscriptionStatus,
    billingInterval: v.union(v.literal("monthly"), v.literal("yearly")),
    /** External subscription ID (Stripe sub_xxx, etc.) */
    externalId: v.optional(v.string()),
    /** External customer ID (Stripe cus_xxx, etc.) */
    customerId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialEndsAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_external_id", ["externalId"]),

  // ── Core ───────────────────────────────────────────────────────

  eventTypes: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    color: v.string(),
    location: locationType,
    locationDetails: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    isActive: v.boolean(),
    requiresVibeCheck: v.boolean(),
    requiresPayment: v.boolean(),
    bufferBefore: v.optional(v.number()),
    bufferAfter: v.optional(v.number()),
    maxPerDay: v.optional(v.number()),
    /** Min notice in hours (e.g. 24 = must book at least 24h in advance) */
    minNotice: v.optional(v.number()),
    /** Max advance in days (e.g. 60 = can book up to 60 days ahead) */
    maxAdvance: v.optional(v.number()),
    availability: v.optional(
      v.array(
        v.object({
          day: v.number(),
          startTime: v.string(),
          endTime: v.string(),
        })
      )
    ),
    /** Date-specific overrides (holidays, special hours) */
    dateOverrides: v.optional(
      v.array(
        v.object({
          date: v.string(), // "2026-02-14"
          available: v.boolean(),
          startTime: v.optional(v.string()),
          endTime: v.optional(v.string()),
        })
      )
    ),
    /** Custom questions beyond Vibe Check */
    customFields: v.optional(
      v.array(
        v.object({
          label: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("textarea"),
            v.literal("select"),
            v.literal("checkbox")
          ),
          required: v.boolean(),
          options: v.optional(v.array(v.string())),
        })
      )
    ),
    /** Redirect URL after booking */
    redirectUrl: v.optional(v.string()),
    /** Confirmation message override */
    confirmationMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_slug", ["slug"])
    .index("by_user_active", ["userId", "isActive"]),

  bookings: defineTable({
    eventTypeId: v.id("eventTypes"),
    hostId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    status: bookingStatus,
    meetingUrl: v.optional(v.string()),
    /** External calendar event ID for sync */
    calendarEventId: v.optional(v.string()),
    paymentStatus: v.optional(paymentStatus),
    paymentAmount: v.optional(v.number()),
    paymentCurrency: v.optional(v.string()),
    /** External payment ID (Stripe pi_xxx, etc.) */
    paymentExternalId: v.optional(v.string()),
    vibeCheck: v.optional(
      v.object({
        mood: v.string(),
        goal: v.optional(v.string()),
        context: v.optional(v.string()),
      })
    ),
    /** Answers to custom fields */
    customFieldAnswers: v.optional(v.any()),
    aiNotes: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    rescheduledFrom: v.optional(v.id("bookings")),
    /** Source: how the booking was created */
    source: v.optional(
      v.union(
        v.literal("web"),
        v.literal("whatsapp"),
        v.literal("api"),
        v.literal("embed"),
        v.literal("manual")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_host", ["hostId"])
    .index("by_org", ["orgId"])
    .index("by_event_type", ["eventTypeId"])
    .index("by_client_email", ["clientEmail"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_host_start", ["hostId", "startTime"]),

  clients: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    totalMeetings: v.number(),
    totalRevenue: v.number(),
    noShowCount: v.number(),
    lastMeetingAt: v.optional(v.number()),
    lastVibeCheck: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    /** Custom metadata for CRM sync, etc. */
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_email", ["email"])
    .index("by_user_email", ["userId", "email"]),

  // ── Automation ─────────────────────────────────────────────────

  workflows: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: workflowTrigger,
    /** Conditions that must be true for the workflow to fire */
    conditions: v.optional(v.any()),
    action: workflowAction,
    /** Action-specific configuration (template, channel, URL, etc.) */
    config: v.any(),
    /** Delay before executing (minutes) */
    delayMinutes: v.optional(v.number()),
    isActive: v.boolean(),
    lastTriggeredAt: v.optional(v.number()),
    triggerCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_trigger", ["trigger"]),

  workflowLogs: defineTable({
    workflowId: v.id("workflows"),
    bookingId: v.optional(v.id("bookings")),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("skipped")
    ),
    error: v.optional(v.string()),
    executedAt: v.number(),
  })
    .index("by_workflow", ["workflowId"])
    .index("by_booking", ["bookingId"]),

  // ── Integrations ───────────────────────────────────────────────

  integrations: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    provider: integrationProvider,
    status: integrationStatus,
    /** Encrypted access token */
    accessToken: v.optional(v.string()),
    /** Encrypted refresh token */
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    /** Provider-specific config (e.g. selected calendar, Slack channel) */
    config: v.optional(v.any()),
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_provider", ["provider"])
    .index("by_user_provider", ["userId", "provider"]),

  // ── API & Webhooks ─────────────────────────────────────────────

  apiKeys: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    name: v.string(),
    /** First 8 chars of key, for display: "llm_sk_7f3a..." */
    keyPrefix: v.string(),
    /** SHA-256 hash of the full key */
    keyHash: v.string(),
    scopes: v.array(v.string()),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_hash", ["keyHash"]),

  webhookEndpoints: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    url: v.string(),
    /** Which events to deliver */
    events: v.array(v.string()),
    /** Signing secret for verifying deliveries */
    secret: v.string(),
    isActive: v.boolean(),
    lastDeliveryAt: v.optional(v.number()),
    failureCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"]),

  webhookDeliveries: defineTable({
    endpointId: v.id("webhookEndpoints"),
    event: v.string(),
    payload: v.any(),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    deliveredAt: v.number(),
    success: v.boolean(),
  }).index("by_endpoint", ["endpointId"]),

  // ── Audit & Analytics ──────────────────────────────────────────

  auditLog: defineTable({
    orgId: v.optional(v.id("organizations")),
    userId: v.id("users"),
    action: v.string(), // e.g. "event_type.created", "booking.cancelled"
    resource: v.string(), // e.g. "eventTypes", "bookings"
    resourceId: v.string(),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_resource", ["resource", "resourceId"])
    .index("by_created", ["createdAt"]),

  // ── Email Templates ────────────────────────────────────────────

  emailTemplates: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    type: v.union(
      v.literal("booking_confirmation"),
      v.literal("booking_reminder"),
      v.literal("booking_cancelled"),
      v.literal("booking_rescheduled"),
      v.literal("payment_receipt"),
      v.literal("invitation"),
      v.literal("custom")
    ),
    name: v.string(),
    subject: v.string(),
    /** HTML body with template variables like {{clientName}}, {{meetingDate}} */
    body: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_type", ["type"]),
});
