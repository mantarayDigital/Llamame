import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Computed dashboard stats — meetings this week, revenue, show rate, etc.
 */
export const stats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const dayMs = 86_400_000;

    // Start of current week (Monday)
    const today = new Date(now);
    const dayOfWeek = today.getDay(); // 0 = Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    const weekStartMs = weekStart.getTime();

    // Previous week for comparison
    const prevWeekStart = weekStartMs - 7 * dayMs;

    // Fetch all bookings this week
    const thisWeekBookings = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", userId).gte("startTime", weekStartMs)
      )
      .collect();

    // Fetch previous week bookings for comparison
    const allRecent = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", userId).gte("startTime", prevWeekStart)
      )
      .collect();
    const prevWeekBookings = allRecent.filter(
      (b) => b.startTime < weekStartMs
    );

    // Meetings this week (non-cancelled)
    const meetingsThisWeek = thisWeekBookings.filter(
      (b) => b.status !== "cancelled"
    ).length;
    const meetingsPrevWeek = prevWeekBookings.filter(
      (b) => b.status !== "cancelled"
    ).length;
    const meetingsChange =
      meetingsPrevWeek > 0
        ? Math.round(
            ((meetingsThisWeek - meetingsPrevWeek) / meetingsPrevWeek) * 100
          )
        : 0;

    // Revenue this week
    const revenueCollected = thisWeekBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.paymentAmount ?? 0), 0);
    const revenuePrev = prevWeekBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.paymentAmount ?? 0), 0);
    const revenueChange =
      revenuePrev > 0
        ? Math.round(((revenueCollected - revenuePrev) / revenuePrev) * 100)
        : 0;

    // Show rate (last 30 days)
    const thirtyDaysAgo = now - 30 * dayMs;
    const last30 = allRecent.filter(
      (b) => b.startTime >= thirtyDaysAgo && b.startTime < now
    );
    const completedOrNoShow = last30.filter(
      (b) => b.status === "completed" || b.status === "no_show"
    );
    const completed = completedOrNoShow.filter(
      (b) => b.status === "completed"
    ).length;
    const showRate =
      completedOrNoShow.length > 0
        ? Math.round((completed / completedOrNoShow.length) * 100)
        : 100;

    // Energy score placeholder (would need user's energy profile + today's schedule)
    const user = await ctx.db.get(userId);
    const energyScore = user?.energyProfile ? 78 : 50;

    return {
      meetingsThisWeek,
      meetingsChange,
      revenueCollected,
      revenueChange,
      showRate,
      showRateChange: 0,
      energyScore,
    };
  },
});

/**
 * Today's meetings for the dashboard sidebar.
 */
export const todayMeetings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 86_400_000;

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", userId).gte("startTime", todayStart)
      )
      .collect();

    const todayBookings = bookings.filter(
      (b) => b.startTime < todayEnd && b.status !== "cancelled"
    );

    // Enrich with event type info
    const enriched = await Promise.all(
      todayBookings.map(async (b) => {
        const eventType = await ctx.db.get(b.eventTypeId);
        return {
          _id: b._id,
          startTime: b.startTime,
          endTime: b.endTime,
          clientName: b.clientName,
          clientEmail: b.clientEmail,
          status: b.status,
          vibeCheck: b.vibeCheck,
          eventType: eventType
            ? { title: eventType.title, color: eventType.color, duration: eventType.duration }
            : null,
        };
      })
    );

    return enriched.sort((a, b) => a.startTime - b.startTime);
  },
});

/**
 * Tomorrow's meetings for the dashboard.
 */
export const tomorrowMeetings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStart = tomorrow.getTime();
    const tomorrowEnd = tomorrowStart + 86_400_000;

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_host_start", (q) =>
        q.eq("hostId", userId).gte("startTime", tomorrowStart)
      )
      .collect();

    const tomorrowBookings = bookings.filter(
      (b) => b.startTime < tomorrowEnd && b.status !== "cancelled"
    );

    const enriched = await Promise.all(
      tomorrowBookings.map(async (b) => {
        const eventType = await ctx.db.get(b.eventTypeId);
        return {
          _id: b._id,
          startTime: b.startTime,
          endTime: b.endTime,
          clientName: b.clientName,
          clientEmail: b.clientEmail,
          status: b.status,
          vibeCheck: b.vibeCheck,
          eventType: eventType
            ? { title: eventType.title, color: eventType.color, duration: eventType.duration }
            : null,
        };
      })
    );

    return enriched.sort((a, b) => a.startTime - b.startTime);
  },
});
