import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────────

export const listByHost = query({
  args: {
    hostId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { hostId, limit }) => {
    const q = ctx.db
      .query("bookings")
      .withIndex("by_host", (q) => q.eq("hostId", hostId))
      .order("desc");
    return limit ? q.take(limit) : q.collect();
  },
});

export const listUpcoming = query({
  args: {
    hostId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { hostId, limit }) => {
    const now = Date.now();
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) => q.eq("hostId", hostId).gte("startTime", now))
      .order("asc")
      .collect();

    // Filter to only confirmed/pending
    const upcoming = all.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    );
    return limit ? upcoming.slice(0, limit) : upcoming;
  },
});

export const listByDateRange = query({
  args: {
    hostId: v.id("users"),
    startFrom: v.number(),
    startTo: v.number(),
  },
  handler: async (ctx, { hostId, startFrom, startTo }) => {
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", hostId).gte("startTime", startFrom)
      )
      .collect();
    return all.filter((b) => b.startTime <= startTo);
  },
});

export const get = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

export const listByClientEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query("bookings")
      .withIndex("by_client_email", (q) => q.eq("clientEmail", email))
      .order("desc")
      .collect();
  },
});

// ─── Mutations ──────────────────────────────────────────────────

export const create = mutation({
  args: {
    eventTypeId: v.id("eventTypes"),
    hostId: v.id("users"),
    orgId: v.optional(v.id("organizations")),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    vibeCheck: v.optional(
      v.object({
        mood: v.string(),
        goal: v.optional(v.string()),
        context: v.optional(v.string()),
      })
    ),
    source: v.optional(
      v.union(
        v.literal("web"),
        v.literal("whatsapp"),
        v.literal("api"),
        v.literal("embed"),
        v.literal("manual")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Verify event type exists and is active
    const eventType = await ctx.db.get(args.eventTypeId);
    if (!eventType) throw new Error("Event type not found");
    if (!eventType.isActive) throw new Error("Event type is not active");

    // Check for time conflicts
    const conflicts = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", args.hostId).gte("startTime", args.startTime - 1)
      )
      .collect();

    const hasConflict = conflicts.some(
      (b) =>
        b.status !== "cancelled" &&
        b.startTime < args.endTime &&
        b.endTime > args.startTime
    );
    if (hasConflict) throw new Error("Time slot is already booked");

    // Determine initial status
    const status = eventType.requiresPayment ? "pending" : "confirmed";
    const paymentStatus = eventType.requiresPayment ? "pending" : undefined;
    const paymentAmount = eventType.price;
    const paymentCurrency = eventType.currency;

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status,
      paymentStatus: paymentStatus as "pending" | undefined,
      paymentAmount,
      paymentCurrency,
      source: args.source ?? "web",
      createdAt: Date.now(),
    });

    // Upsert client record
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_user_email", (q) =>
        q.eq("userId", args.hostId).eq("email", args.clientEmail)
      )
      .first();

    if (existingClient) {
      await ctx.db.patch(existingClient._id, {
        totalMeetings: existingClient.totalMeetings + 1,
        lastMeetingAt: args.startTime,
        lastVibeCheck: args.vibeCheck?.mood,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("clients", {
        userId: args.hostId,
        orgId: args.orgId,
        name: args.clientName,
        email: args.clientEmail,
        phone: args.clientPhone,
        totalMeetings: 1,
        totalRevenue: 0,
        noShowCount: 0,
        lastMeetingAt: args.startTime,
        lastVibeCheck: args.vibeCheck?.mood,
        createdAt: Date.now(),
      });
    }

    return bookingId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, cancellationReason }) => {
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found");

    const patch: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };
    if (cancellationReason) patch.cancellationReason = cancellationReason;

    // If marking as no_show, update client record
    if (status === "no_show") {
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_email", (q) =>
          q.eq("userId", booking.hostId).eq("email", booking.clientEmail)
        )
        .first();
      if (client) {
        await ctx.db.patch(client._id, {
          noShowCount: client.noShowCount + 1,
          updatedAt: Date.now(),
        });
      }
    }

    // If completing a paid booking, update client revenue
    if (status === "completed" && booking.paymentAmount) {
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_email", (q) =>
          q.eq("userId", booking.hostId).eq("email", booking.clientEmail)
        )
        .first();
      if (client) {
        await ctx.db.patch(client._id, {
          totalRevenue: client.totalRevenue + (booking.paymentAmount ?? 0),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(id, patch);
  },
});

export const confirm = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending")
      throw new Error("Only pending bookings can be confirmed");
    await ctx.db.patch(id, { status: "confirmed", updatedAt: Date.now() });
  },
});

export const cancel = mutation({
  args: {
    id: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found");
    await ctx.db.patch(id, {
      status: "cancelled",
      cancellationReason: reason,
      updatedAt: Date.now(),
    });
  },
});

export const listWithPayments = query({
  args: {
    hostId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { hostId, limit }) => {
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_host", (q) => q.eq("hostId", hostId))
      .order("desc")
      .collect();
    const withPayments = all.filter((b) => b.paymentStatus !== undefined);
    const result = limit ? withPayments.slice(0, limit) : withPayments;
    // Enrich with event type title
    return Promise.all(
      result.map(async (b) => {
        const et = await ctx.db.get(b.eventTypeId);
        return { ...b, eventTypeTitle: et?.title ?? "Unknown" };
      })
    );
  },
});
