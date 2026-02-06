/**
 * Central app configuration.
 * All environment-dependent and brand values live here.
 * Nothing in the app should reference "Llamame" or domain strings directly.
 */

export const appConfig = {
  /** Display name used in nav, footer, emails */
  name: "Llamame",
  /** The accent portion of the logo (e.g. "me" in "Llamame") */
  logoAccent: "me",
  /** Text before the accent in the logo */
  logoPrefix: "Llama",
  /** Primary domain (used in booking links, preview URLs, etc.) */
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "llamame.io",
  /** Full base URL */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://llamame.io",
  /** Convex backend URL */
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
  /** Company / org behind the product */
  company: "MantaRay Digital",
  /** Support email */
  supportEmail: "support@llamame.io",
  /** Current year for copyright */
  copyrightYear: new Date().getFullYear(),
  /** Tagline shown in footer, meta, etc. */
  tagline: "Smart scheduling for professionals who value their time and their clients' experience.",
  /** Short description for meta tags */
  description:
    "AI-powered scheduling with meeting briefs, client intelligence, WhatsApp booking, and energy-aware scheduling. Built for professionals who respect their time.",
  /** API docs URL */
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL ?? "docs.llamame.io/api",
} as const;

/**
 * Default user-configurable settings.
 * These are used when creating new accounts and as fallbacks.
 */
export const defaults = {
  timezone: "America/New_York",
  currency: "USD",
  locale: "en-US",
  /** Default buffer before meetings (minutes) */
  bufferBefore: 0,
  /** Default buffer after meetings (minutes) */
  bufferAfter: 0,
  /** Default max meetings per day (0 = unlimited) */
  maxPerDay: 0,
  /** Default plan for new users */
  plan: "free" as const,
  /** Available accent colors for branding */
  accentColors: [
    { name: "Cyan", value: "#22d3ee" },
    { name: "Violet", value: "#a78bfa" },
    { name: "Green", value: "#4ade80" },
    { name: "Rose", value: "#fb7185" },
    { name: "Amber", value: "#fbbf24" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Indigo", value: "#818cf8" },
    { name: "Pink", value: "#f472b6" },
    { name: "Orange", value: "#fb923c" },
    { name: "Teal", value: "#2dd4bf" },
  ],
} as const;

/**
 * Supported timezones.
 * Centralised so booking page, settings, and backend all share the same list.
 */
export const timezones = [
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "America/Denver", label: "America/Denver (MST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "America/Bogota", label: "America/Bogota (COT)" },
  { value: "America/Buenos_Aires", label: "America/Buenos_Aires (ART)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Madrid", label: "Europe/Madrid (CET)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
] as const;

/**
 * Mood options for Vibe Check.
 * Configurable per-org in the future.
 */
export const vibeCheckMoods = [
  { emoji: "\u{1F680}", label: "Excited" },
  { emoji: "\u{1F60A}", label: "Optimistic" },
  { emoji: "\u{1F914}", label: "Curious" },
  { emoji: "\u{1F624}", label: "Stressed" },
  { emoji: "\u{1F610}", label: "Neutral" },
] as const;

/**
 * Location types for event types.
 */
export const locationTypes = [
  { value: "google_meet", label: "Google Meet", icon: "Monitor" },
  { value: "zoom", label: "Zoom", icon: "Video" },
  { value: "phone", label: "Phone", icon: "Phone" },
  { value: "in_person", label: "In Person", icon: "MapPin" },
  { value: "custom", label: "Custom", icon: "Link" },
] as const;

/**
 * Duration presets (minutes).
 */
export const durationPresets = [15, 30, 45, 60, 90, 120, 180] as const;
