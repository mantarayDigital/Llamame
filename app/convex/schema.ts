import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    handle: v.string(),
    avatarUrl: v.optional(v.string()),
    timezone: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
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
      })
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_handle", ["handle"]),

  eventTypes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    color: v.string(),
    location: v.union(
      v.literal("google_meet"),
      v.literal("zoom"),
      v.literal("phone"),
      v.literal("in_person"),
      v.literal("custom")
    ),
    locationDetails: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    isActive: v.boolean(),
    requiresVibeCheck: v.boolean(),
    requiresPayment: v.boolean(),
    bufferBefore: v.optional(v.number()),
    bufferAfter: v.optional(v.number()),
    maxPerDay: v.optional(v.number()),
    availability: v.optional(
      v.array(
        v.object({
          day: v.number(),
          startTime: v.string(),
          endTime: v.string(),
        })
      )
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  bookings: defineTable({
    eventTypeId: v.id("eventTypes"),
    hostId: v.id("users"),
    clientName: v.string(),
    clientEmail: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    meetingUrl: v.optional(v.string()),
    paymentStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("refunded")
      )
    ),
    paymentAmount: v.optional(v.number()),
    vibeCheck: v.optional(
      v.object({
        mood: v.string(),
        goal: v.optional(v.string()),
        context: v.optional(v.string()),
      })
    ),
    aiNotes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_host", ["hostId"])
    .index("by_event_type", ["eventTypeId"])
    .index("by_client_email", ["clientEmail"])
    .index("by_start_time", ["startTime"]),

  clients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    totalMeetings: v.number(),
    totalRevenue: v.number(),
    noShowCount: v.number(),
    lastMeetingAt: v.optional(v.number()),
    lastVibeCheck: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  workflows: defineTable({
    userId: v.id("users"),
    name: v.string(),
    trigger: v.union(
      v.literal("booking_created"),
      v.literal("booking_confirmed"),
      v.literal("booking_cancelled"),
      v.literal("booking_reminder"),
      v.literal("booking_completed")
    ),
    action: v.union(
      v.literal("send_email"),
      v.literal("send_sms"),
      v.literal("send_whatsapp"),
      v.literal("send_slack"),
      v.literal("update_crm")
    ),
    config: v.any(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
