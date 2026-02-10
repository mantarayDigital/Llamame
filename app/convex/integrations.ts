import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const providerLiteral = v.union(
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

const statusLiteral = v.union(
  v.literal("connected"),
  v.literal("disconnected"),
  v.literal("error"),
  v.literal("pending")
);

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByUserProvider = query({
  args: {
    userId: v.id("users"),
    provider: providerLiteral,
  },
  handler: async (ctx, { userId, provider }) => {
    return ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", provider)
      )
      .first();
  },
});

export const connect = mutation({
  args: {
    userId: v.id("users"),
    provider: providerLiteral,
    status: statusLiteral,
  },
  handler: async (ctx, { userId, provider, status }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", provider)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { status });
      return existing._id;
    }
    return ctx.db.insert("integrations", {
      userId,
      provider,
      status,
      createdAt: Date.now(),
    });
  },
});

/** Save OAuth tokens and calendar config after a successful OAuth callback. */
export const saveConnection = mutation({
  args: {
    userId: v.id("users"),
    provider: providerLiteral,
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    config: v.optional(v.any()),
  },
  handler: async (ctx, { userId, provider, accessToken, refreshToken, expiresAt, config }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", provider)
      )
      .first();

    const data = {
      userId,
      provider,
      status: "connected" as const,
      accessToken,
      refreshToken,
      expiresAt,
      config,
      lastSyncAt: Date.now(),
      lastError: undefined,
      createdAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "connected",
        accessToken,
        refreshToken: refreshToken ?? existing.refreshToken,
        expiresAt,
        config: config ?? existing.config,
        lastSyncAt: Date.now(),
        lastError: undefined,
      });
      return existing._id;
    }
    return ctx.db.insert("integrations", data);
  },
});

/** Update tokens after a refresh. */
export const updateTokens = mutation({
  args: {
    id: v.id("integrations"),
    accessToken: v.string(),
    expiresAt: v.number(),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, { id, accessToken, expiresAt, refreshToken }) => {
    const update: Record<string, unknown> = { accessToken, expiresAt };
    if (refreshToken) update.refreshToken = refreshToken;
    await ctx.db.patch(id, update);
  },
});

/** Update sync status after a sync completes. */
export const updateSyncStatus = mutation({
  args: {
    id: v.id("integrations"),
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    status: v.optional(statusLiteral),
  },
  handler: async (ctx, { id, lastSyncAt, lastError, status }) => {
    const update: Record<string, unknown> = {};
    if (lastSyncAt !== undefined) update.lastSyncAt = lastSyncAt;
    if (lastError !== undefined) update.lastError = lastError;
    if (status !== undefined) update.status = status;
    await ctx.db.patch(id, update);
  },
});

export const disconnect = mutation({
  args: { id: v.id("integrations") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status: "disconnected",
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      config: undefined,
      lastError: undefined,
    });
  },
});
