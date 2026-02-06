import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const locationType = v.union(
  v.literal("google_meet"),
  v.literal("zoom"),
  v.literal("phone"),
  v.literal("in_person"),
  v.literal("custom")
);

// ─── Queries ────────────────────────────────────────────────────

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("eventTypes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listActiveByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("eventTypes")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("eventTypes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getByUserAndSlug = query({
  args: { userId: v.id("users"), slug: v.string() },
  handler: async (ctx, { userId, slug }) => {
    const events = await ctx.db
      .query("eventTypes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return events.find((e) => e.slug === slug) ?? null;
  },
});

export const get = query({
  args: { id: v.id("eventTypes") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

// ─── Mutations ──────────────────────────────────────────────────

export const create = mutation({
  args: {
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
    requiresVibeCheck: v.optional(v.boolean()),
    requiresPayment: v.optional(v.boolean()),
    bufferBefore: v.optional(v.number()),
    bufferAfter: v.optional(v.number()),
    maxPerDay: v.optional(v.number()),
    minNotice: v.optional(v.number()),
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
    redirectUrl: v.optional(v.string()),
    confirmationMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness per user
    const existing = await ctx.db
      .query("eventTypes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (existing.some((e) => e.slug === args.slug)) {
      throw new Error(`Slug "${args.slug}" already exists for this user`);
    }

    return ctx.db.insert("eventTypes", {
      ...args,
      isActive: true,
      requiresVibeCheck: args.requiresVibeCheck ?? false,
      requiresPayment: args.requiresPayment ?? false,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("eventTypes"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    color: v.optional(v.string()),
    location: v.optional(locationType),
    locationDetails: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    requiresVibeCheck: v.optional(v.boolean()),
    requiresPayment: v.optional(v.boolean()),
    bufferBefore: v.optional(v.number()),
    bufferAfter: v.optional(v.number()),
    maxPerDay: v.optional(v.number()),
    minNotice: v.optional(v.number()),
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
    redirectUrl: v.optional(v.string()),
    confirmationMessage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const eventType = await ctx.db.get(id);
    if (!eventType) throw new Error("Event type not found");

    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(cleaned).length > 0) {
      await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    }
  },
});

export const toggleActive = mutation({
  args: { id: v.id("eventTypes") },
  handler: async (ctx, { id }) => {
    const eventType = await ctx.db.get(id);
    if (!eventType) throw new Error("Event type not found");
    await ctx.db.patch(id, {
      isActive: !eventType.isActive,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("eventTypes") },
  handler: async (ctx, { id }) => {
    const eventType = await ctx.db.get(id);
    if (!eventType) throw new Error("Event type not found");
    await ctx.db.delete(id);
  },
});
