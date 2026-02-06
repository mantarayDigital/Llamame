import { mutation, internalMutation } from "./_generated/server";

/**
 * Seeds the database with demo data for development.
 * Run once via the Convex dashboard or `npx convex run seed:run`.
 */
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "mantaray"))
      .first();
    if (existingUser) {
      return { status: "already_seeded", userId: existingUser._id };
    }

    const now = Date.now();

    // ── Create demo user ──────────────────────────────────────────
    const userId = await ctx.db.insert("users", {
      name: "MantaRay Digital",
      email: "hello@mantaray.digital",
      handle: "mantaray",
      timezone: "America/New_York",
      plan: "pro",
      branding: {
        accentColor: "#22d3ee",
        bio: "Digital marketing consultancy helping brands grow through data-driven strategies.",
        showPoweredBy: true,
      },
      energyProfile: {
        peakStart: "09:00",
        peakEnd: "11:00",
        lowStart: "16:00",
        lowEnd: "18:00",
      },
      notificationPrefs: {
        emailConfirmations: true,
        emailReminders: true,
        whatsappReminders: true,
        slackNotifications: false,
        dailyDigest: true,
        reminderHoursBefore: [24, 1],
      },
      onboardingCompleted: true,
      createdAt: now,
    });

    // ── Create event types ────────────────────────────────────────
    const discoveryId = await ctx.db.insert("eventTypes", {
      userId,
      title: "Discovery Call",
      slug: "discovery-call",
      description:
        "A quick introductory call to understand your needs and see if we're a good fit.",
      duration: 30,
      color: "accent",
      location: "google_meet",
      isActive: true,
      requiresVibeCheck: false,
      requiresPayment: false,
      bufferAfter: 10,
      availability: [
        { day: 1, startTime: "09:00", endTime: "17:00" },
        { day: 2, startTime: "09:00", endTime: "17:00" },
        { day: 3, startTime: "09:00", endTime: "17:00" },
        { day: 4, startTime: "09:00", endTime: "17:00" },
        { day: 5, startTime: "09:00", endTime: "17:00" },
      ],
      createdAt: now,
    });

    const strategyId = await ctx.db.insert("eventTypes", {
      userId,
      title: "Strategy Session",
      slug: "strategy-session",
      description:
        "A deep-dive strategy session to discuss your digital marketing goals and create an actionable roadmap.",
      duration: 60,
      color: "violet",
      location: "google_meet",
      price: 150,
      currency: "USD",
      isActive: true,
      requiresVibeCheck: true,
      requiresPayment: true,
      bufferBefore: 15,
      bufferAfter: 15,
      availability: [
        { day: 1, startTime: "09:00", endTime: "16:00" },
        { day: 2, startTime: "09:00", endTime: "16:00" },
        { day: 3, startTime: "09:00", endTime: "16:00" },
        { day: 4, startTime: "09:00", endTime: "16:00" },
        { day: 5, startTime: "09:00", endTime: "16:00" },
      ],
      createdAt: now,
    });

    await ctx.db.insert("eventTypes", {
      userId,
      title: "Quick Check-in",
      slug: "quick-checkin",
      description:
        "A brief catch-up call for existing clients to discuss quick updates or questions.",
      duration: 15,
      color: "green",
      location: "phone",
      isActive: true,
      requiresVibeCheck: false,
      requiresPayment: false,
      availability: [
        { day: 1, startTime: "09:00", endTime: "17:00" },
        { day: 2, startTime: "09:00", endTime: "17:00" },
        { day: 3, startTime: "09:00", endTime: "17:00" },
        { day: 4, startTime: "09:00", endTime: "17:00" },
        { day: 5, startTime: "09:00", endTime: "17:00" },
      ],
      createdAt: now,
    });

    await ctx.db.insert("eventTypes", {
      userId,
      title: "Workshop",
      slug: "workshop",
      description:
        "An intensive hands-on workshop covering advanced marketing strategies.",
      duration: 120,
      color: "amber",
      location: "zoom",
      price: 500,
      currency: "USD",
      isActive: false,
      requiresVibeCheck: true,
      requiresPayment: true,
      maxPerDay: 1,
      bufferBefore: 30,
      bufferAfter: 30,
      availability: [
        { day: 2, startTime: "10:00", endTime: "15:00" },
        { day: 4, startTime: "10:00", endTime: "15:00" },
      ],
      createdAt: now,
    });

    // ── Create demo clients ───────────────────────────────────────
    const sarahId = await ctx.db.insert("clients", {
      userId,
      name: "Sarah Chen",
      email: "sarah@techflow.io",
      company: "TechFlow Inc",
      totalMeetings: 12,
      totalRevenue: 1800,
      noShowCount: 0,
      lastMeetingAt: now - 86_400_000 * 3,
      lastVibeCheck: "Excited",
      tags: ["VIP", "Enterprise"],
      createdAt: now - 86_400_000 * 90,
    });

    await ctx.db.insert("clients", {
      userId,
      name: "James Rodriguez",
      email: "james@startupxyz.com",
      company: "StartupXYZ",
      totalMeetings: 1,
      totalRevenue: 0,
      noShowCount: 0,
      lastMeetingAt: now - 86_400_000,
      lastVibeCheck: "Curious",
      createdAt: now - 86_400_000 * 7,
    });

    await ctx.db.insert("clients", {
      userId,
      name: "Ana Kovacs",
      email: "ana@growthlab.com",
      company: "GrowthLab",
      totalMeetings: 8,
      totalRevenue: 1200,
      noShowCount: 1,
      lastMeetingAt: now - 86_400_000 * 2,
      lastVibeCheck: "Optimistic",
      tags: ["Returning"],
      createdAt: now - 86_400_000 * 60,
    });

    await ctx.db.insert("clients", {
      userId,
      name: "Lucas Sharma",
      email: "lucas@designco.com",
      company: "DesignCo",
      totalMeetings: 5,
      totalRevenue: 750,
      noShowCount: 0,
      lastMeetingAt: now - 86_400_000 * 5,
      lastVibeCheck: "Optimistic",
      createdAt: now - 86_400_000 * 45,
    });

    // ── Create demo bookings (today + tomorrow) ───────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Today: 10am Strategy Session with Sarah
    await ctx.db.insert("bookings", {
      eventTypeId: strategyId,
      hostId: userId,
      clientName: "Sarah Chen",
      clientEmail: "sarah@techflow.io",
      startTime: todayStart.getTime() + 10 * 3_600_000,
      endTime: todayStart.getTime() + 11 * 3_600_000,
      timezone: "America/New_York",
      status: "confirmed",
      paymentStatus: "paid",
      paymentAmount: 150,
      paymentCurrency: "USD",
      vibeCheck: { mood: "Excited", goal: "Review Q1 content strategy" },
      source: "web",
      createdAt: now - 86_400_000 * 5,
    });

    // Today: 1pm Discovery Call with James
    await ctx.db.insert("bookings", {
      eventTypeId: discoveryId,
      hostId: userId,
      clientName: "James Rodriguez",
      clientEmail: "james@startupxyz.com",
      startTime: todayStart.getTime() + 13 * 3_600_000,
      endTime: todayStart.getTime() + 13.5 * 3_600_000,
      timezone: "America/New_York",
      status: "confirmed",
      source: "web",
      createdAt: now - 86_400_000 * 2,
    });

    // Today: 3:30pm Quick Check-in with Ana
    await ctx.db.insert("bookings", {
      eventTypeId: discoveryId, // using discovery as placeholder
      hostId: userId,
      clientName: "Ana Kovacs",
      clientEmail: "ana@growthlab.com",
      startTime: todayStart.getTime() + 15.5 * 3_600_000,
      endTime: todayStart.getTime() + 15.75 * 3_600_000,
      timezone: "America/New_York",
      status: "pending",
      source: "web",
      createdAt: now - 86_400_000,
    });

    // Tomorrow: 9am Strategy Session with Lucas
    const tomorrowStart = todayStart.getTime() + 86_400_000;
    await ctx.db.insert("bookings", {
      eventTypeId: strategyId,
      hostId: userId,
      clientName: "Lucas Sharma",
      clientEmail: "lucas@designco.com",
      startTime: tomorrowStart + 9 * 3_600_000,
      endTime: tomorrowStart + 10 * 3_600_000,
      timezone: "America/New_York",
      status: "confirmed",
      paymentStatus: "paid",
      paymentAmount: 150,
      paymentCurrency: "USD",
      vibeCheck: { mood: "Optimistic", goal: "Brand redesign kickoff" },
      source: "web",
      createdAt: now - 86_400_000 * 3,
    });

    // Tomorrow: 11am Discovery Call with Emily
    await ctx.db.insert("bookings", {
      eventTypeId: discoveryId,
      hostId: userId,
      clientName: "Emily Watson",
      clientEmail: "emily@brandforge.co",
      startTime: tomorrowStart + 11 * 3_600_000,
      endTime: tomorrowStart + 11.5 * 3_600_000,
      timezone: "America/New_York",
      status: "pending",
      source: "web",
      createdAt: now - 86_400_000,
    });

    // ── Create some past completed bookings for stats ────────────
    for (let i = 1; i <= 15; i++) {
      const pastDay = todayStart.getTime() - i * 86_400_000;
      const weekday = new Date(pastDay).getDay();
      if (weekday === 0 || weekday === 6) continue; // skip weekends

      await ctx.db.insert("bookings", {
        eventTypeId: i % 3 === 0 ? strategyId : discoveryId,
        hostId: userId,
        clientName: ["Sarah Chen", "Ana Kovacs", "Lucas Sharma"][i % 3],
        clientEmail: ["sarah@techflow.io", "ana@growthlab.com", "lucas@designco.com"][i % 3],
        startTime: pastDay + 10 * 3_600_000,
        endTime: pastDay + (i % 3 === 0 ? 11 : 10.5) * 3_600_000,
        timezone: "America/New_York",
        status: i === 7 ? "no_show" : "completed",
        paymentStatus: i % 3 === 0 ? "paid" : undefined,
        paymentAmount: i % 3 === 0 ? 150 : undefined,
        paymentCurrency: i % 3 === 0 ? "USD" : undefined,
        source: "web",
        createdAt: pastDay - 86_400_000 * 3,
      });
    }

    return { status: "seeded", userId };
  },
});
