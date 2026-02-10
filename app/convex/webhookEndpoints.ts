import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("webhookEndpoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    events: v.array(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("webhookEndpoints", {
      ...args,
      isActive: true,
      failureCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
