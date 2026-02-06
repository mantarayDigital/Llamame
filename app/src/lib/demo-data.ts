/**
 * Demo / seed data.
 *
 * ALL mock data lives here. No hardcoded names, prices, or stats
 * should appear directly in page components. When the backend is
 * wired up, pages will import from Convex queries instead.
 *
 * This file is also useful for seeding the database in development.
 */

import type {
  MeetingListItem,
  ClientListItem,
  DashboardStats,
  EventType,
  EnergyBlock,
  NotificationPreferences,
  UserProfile,
} from "./types";

// ─── Demo User ───────────────────────────────────────────────────

export const demoUser: UserProfile = {
  id: "demo_user_001",
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
  createdAt: Date.now(),
};

// ─── Demo Event Types ────────────────────────────────────────────

export const demoEventTypes: EventType[] = [
  {
    id: "evt_001",
    userId: demoUser.id,
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
    createdAt: Date.now(),
  },
  {
    id: "evt_002",
    userId: demoUser.id,
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
    createdAt: Date.now(),
  },
  {
    id: "evt_003",
    userId: demoUser.id,
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
    createdAt: Date.now(),
  },
  {
    id: "evt_004",
    userId: demoUser.id,
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
    createdAt: Date.now(),
  },
];

// ─── Demo Dashboard Stats ────────────────────────────────────────

export const demoDashboardStats: DashboardStats = {
  meetingsThisWeek: 18,
  meetingsChange: 12,
  revenueCollected: 2450,
  revenueChange: 8,
  showRate: 94,
  showRateChange: 3,
  energyScore: 78,
};

// ─── Demo Meetings ───────────────────────────────────────────────

export const demoTodayMeetings: MeetingListItem[] = [
  {
    id: "mtg_001",
    time: "10:00",
    duration: "60 min",
    title: "Strategy Session",
    client: "Sarah Chen",
    company: "TechFlow Inc",
    color: "bg-violet",
    status: "confirmed",
  },
  {
    id: "mtg_002",
    time: "13:00",
    duration: "30 min",
    title: "Discovery Call",
    client: "James Rodriguez",
    company: "StartupXYZ",
    color: "bg-accent",
    status: "confirmed",
  },
  {
    id: "mtg_003",
    time: "15:30",
    duration: "15 min",
    title: "Quick Check-in",
    client: "Ana Kovacs",
    company: "GrowthLab",
    color: "bg-rose",
    status: "pending",
  },
];

export const demoTomorrowMeetings: MeetingListItem[] = [
  {
    id: "mtg_004",
    time: "09:00",
    duration: "60 min",
    title: "Strategy Session",
    client: "Lucas Sharma",
    company: "DesignCo",
    color: "bg-violet",
    status: "confirmed",
  },
  {
    id: "mtg_005",
    time: "11:00",
    duration: "30 min",
    title: "Discovery Call",
    client: "Emily Watson",
    company: "BrandForge",
    color: "bg-accent",
    status: "pending",
  },
];

// ─── Demo AI Brief ───────────────────────────────────────────────

export const demoAiBrief = {
  clientName: "Sarah",
  clientCompany: "TechFlow",
  meetingNumber: 3,
  summary:
    "This is her 3rd Strategy Session. Last time you discussed SEO migration and she wanted a progress update. She completed the Vibe Check as \"Excited\".",
  suggestedTopics: [
    "Follow up on SEO migration timeline",
    "Review Q1 content calendar she submitted",
    "She mentioned interest in paid ads",
  ],
};

export const demoAiInsight =
  "Your no-show rate dropped 23% this month after adding the reminder workflow. Clients who complete the Vibe Check are 4x more likely to show up.";

// ─── Demo Clients ────────────────────────────────────────────────

export const demoClients: ClientListItem[] = [
  {
    id: "cli_001",
    name: "Sarah Chen",
    initials: "SC",
    gradient: "from-accent to-violet",
    meetings: 12,
    vibe: "\u{1F680}",
  },
  {
    id: "cli_002",
    name: "James Rodriguez",
    initials: "JR",
    gradient: "from-violet to-rose",
    meetings: 1,
    vibe: "\u{1F914}",
  },
  {
    id: "cli_003",
    name: "Ana Kovacs",
    initials: "AK",
    gradient: "from-amber to-rose",
    meetings: 8,
    vibe: "\u{1F60A}",
  },
  {
    id: "cli_004",
    name: "Lucas Sharma",
    initials: "LS",
    gradient: "from-accent to-green",
    meetings: 5,
    vibe: "\u{1F60A}",
  },
];

// ─── Demo Energy Blocks ──────────────────────────────────────────

export const demoEnergyBlocks: EnergyBlock[] = [
  { label: "Morning (9-11am)", level: 90, color: "bg-green" },
  { label: "Midday (11am-1pm)", level: 70, color: "bg-accent" },
  { label: "Afternoon (1-4pm)", level: 50, color: "bg-amber" },
  { label: "Late (4-6pm)", level: 30, color: "bg-rose" },
];

// ─── Demo Notification Preferences ──────────────────────────────

export const demoNotificationPrefs: NotificationPreferences = {
  emailConfirmations: true,
  emailReminders: true,
  whatsappReminders: true,
  slackNotifications: false,
  dailyDigest: true,
  reminderHoursBefore: [24, 1],
};

// ─── Demo Testimonials (for landing page) ────────────────────────

export const demoTestimonials = [
  {
    quote:
      "The AI meeting briefs alone are worth it. I walk into every call knowing exactly what to discuss. My clients think I have superhuman memory.",
    name: "Jamie Rodriguez",
    role: "Business Coach",
    initials: "JR",
    gradient: "from-accent to-violet",
  },
  {
    quote:
      "WhatsApp booking changed everything for my Latin American clients. They don't want to visit a website — they want to text. Llamame gets it.",
    name: "Ana Kovacs",
    role: "Marketing Consultant",
    initials: "AK",
    gradient: "from-violet to-rose",
  },
  {
    quote:
      "Energy-aware scheduling is genius. No more back-to-back calls that leave me drained. My calendar finally works for me, not against me.",
    name: "Lucas Sharma",
    role: "UX Designer",
    initials: "LS",
    gradient: "from-green to-accent",
  },
];

// ─── Demo Landing Page Stats ─────────────────────────────────────

export const demoLandingStats = [
  { value: "94%", label: "Show rate", color: "text-accent" },
  { value: "2 min", label: "Setup time", color: "text-green" },
  { value: "12+", label: "Integrations", color: "text-violet" },
  { value: "4.9", label: "User rating", color: "text-amber" },
];

// ─── Demo Connected Integrations ─────────────────────────────────

export const demoConnectedIntegrations: string[] = [
  "google_calendar",
  "google_meet",
  "whatsapp",
  "stripe",
];

// ─── Demo Booking Config ─────────────────────────────────────────

/**
 * Default time slots. In production, these are generated dynamically
 * from the event type's availability rules, existing bookings, and
 * calendar integrations.
 */
export const demoTimeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];
