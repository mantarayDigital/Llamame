import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    resource: v.optional(v.string()),
  },
  handler: async (ctx, { userId, limit, resource }) => {
    let results = await ctx.db
      .query("auditLog")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    if (resource) {
      results = results.filter((r) => r.resource === resource);
    }
    return limit ? results.slice(0, limit) : results;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    action: v.string(),
    resource: v.string(),
    resourceId: v.string(),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("auditLog", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
