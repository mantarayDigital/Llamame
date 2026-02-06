import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

export const getByEmail = query({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    return ctx.db
      .query("clients")
      .withIndex("by_user_email", (q) =>
        q.eq("userId", userId).eq("email", email)
      )
      .first();
  },
});

// ─── Mutations ──────────────────────────────────────────────────

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...updates }) => {
    const client = await ctx.db.get(id);
    if (!client) throw new Error("Client not found");

    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(cleaned).length > 0) {
      await ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    const client = await ctx.db.get(id);
    if (!client) throw new Error("Client not found");
    await ctx.db.delete(id);
  },
});
