import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────

export const getByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    return ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .first();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();
  },
});

// ─── Mutations ──────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    handle: v.string(),
    timezone: v.string(),
    externalId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (existing) throw new Error(`Handle "${args.handle}" is already taken`);

    return ctx.db.insert("users", {
      ...args,
      plan: "free",
      onboardingCompleted: false,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    handle: v.optional(v.string()),
    email: v.optional(v.string()),
    timezone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (updates.handle && updates.handle !== user.handle) {
      const taken = await ctx.db
        .query("users")
        .withIndex("by_handle", (q) => q.eq("handle", updates.handle!))
        .first();
      if (taken) throw new Error(`Handle "${updates.handle}" is already taken`);
    }

    // Remove undefined values
    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(cleaned).length > 0) {
      await ctx.db.patch(userId, cleaned);
    }
  },
});

export const updateBranding = mutation({
  args: {
    userId: v.id("users"),
    branding: v.object({
      logo: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      bio: v.optional(v.string()),
      customCss: v.optional(v.string()),
      showPoweredBy: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { userId, branding }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { branding });
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    userId: v.id("users"),
    notificationPrefs: v.object({
      emailConfirmations: v.boolean(),
      emailReminders: v.boolean(),
      whatsappReminders: v.boolean(),
      slackNotifications: v.boolean(),
      dailyDigest: v.boolean(),
      reminderHoursBefore: v.array(v.number()),
    }),
  },
  handler: async (ctx, { userId, notificationPrefs }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { notificationPrefs });
  },
});

export const updateEnergyProfile = mutation({
  args: {
    userId: v.id("users"),
    energyProfile: v.object({
      peakStart: v.string(),
      peakEnd: v.string(),
      lowStart: v.string(),
      lowEnd: v.string(),
    }),
  },
  handler: async (ctx, { userId, energyProfile }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { energyProfile });
  },
});

export const completeOnboarding = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { onboardingCompleted: true });
  },
});
