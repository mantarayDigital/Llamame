/**
 * Centralized UI theme tokens and reusable class strings.
 *
 * This is the **single source of truth** for all component-level styling.
 * Raw color/font/radius tokens live in globals.css @theme.
 * Reusable class strings, layout constants, and color maps live here.
 *
 * Changing values here updates the entire application.
 */

import { defaults } from "./config";

// ─── Layout ─────────────────────────────────────────────────

/** Max content width — used on landing page sections and footer */
export const CONTAINER = "max-w-[1140px] mx-auto" as const;

/** Dashboard sidebar width in px */
export const SIDEBAR_W = 260;

// ─── Buttons ────────────────────────────────────────────────

export const btn = {
  /** Accent CTA — glow shadow, lift on hover */
  primary:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 transition-all",
  /** Outlined secondary */
  secondary:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-bg-card text-text border border-border-hover hover:border-border-strong hover:bg-bg-card-hover transition-all",
  /** Subtle ghost */
  ghost:
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.03] border border-border hover:bg-bg-card-hover hover:border-border-hover transition",
  /** Square icon button */
  icon:
    "w-10 h-10 rounded-lg border border-border bg-white/[0.03] text-text-sec flex items-center justify-center hover:border-border-hover hover:text-text transition",
  /** Small icon button (32px) */
  iconSm:
    "w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-text hover:bg-white/[0.03] transition",
} as const;

// ─── Form Inputs ────────────────────────────────────────────

export const input = {
  base:
    "w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition placeholder:text-text-muted",
  search:
    "w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white/[0.03] text-sm text-text outline-none focus:border-accent transition placeholder:text-text-muted",
  select:
    "w-full px-4 py-3 rounded-lg border border-border bg-bg-card text-text text-sm outline-none focus:border-accent transition cursor-pointer",
  textarea:
    "w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition placeholder:text-text-muted min-h-[100px] resize-y",
} as const;

// ─── Cards ──────────────────────────────────────────────────

export const card = {
  base: "rounded-xl border border-border bg-bg-card",
  hover:
    "rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-hover transition",
  stat: "p-5 rounded-xl border border-border bg-bg-card",
} as const;

// ─── Badges / Status ────────────────────────────────────────

export const badge = {
  green: "bg-green-muted text-green",
  amber: "bg-amber-muted text-amber",
  rose: "bg-rose-muted text-rose",
  violet: "bg-violet-muted text-violet",
  accent: "bg-accent-muted text-accent",
} as const;

/** Booking / meeting status → label + badge class */
export const statusStyles: Record<
  string,
  { label: string; className: string }
> = {
  confirmed: { label: "Confirmed", className: badge.green },
  pending: { label: "Pending", className: badge.amber },
  cancelled: { label: "Cancelled", className: badge.rose },
  paid: { label: "Paid", className: badge.green },
  refunded: { label: "Refunded", className: badge.violet },
  failed: { label: "Failed", className: badge.rose },
};

/** Tag name → badge class */
export const tagColors: Record<string, string> = {
  VIP: badge.amber,
  Enterprise: badge.violet,
  New: badge.green,
  Returning: badge.accent,
};

// ─── Toggle Switch ──────────────────────────────────────────

export const toggle = {
  track: "w-10 h-[22px] rounded-full relative cursor-pointer",
  trackOn: "bg-green/30",
  trackOff: "bg-white/10",
  thumb: "absolute top-[3px] w-4 h-4 rounded-full transition",
  thumbOn: "left-[21px] bg-green",
  thumbOff: "left-[3px] bg-text-muted",
} as const;

// ─── Color Maps ─────────────────────────────────────────────

/** Map color token (from event type / meeting data) to Tailwind bg class */
export const colorToBg: Record<string, string> = {
  accent: "bg-accent",
  violet: "bg-violet",
  green: "bg-green",
  amber: "bg-amber",
  rose: "bg-rose",
};

/** Map prefixed bg-color (from MeetingListItem.color) to overlay classes */
export const colorToOverlay: Record<string, string> = {
  "bg-violet": "bg-violet/80 border-violet/40",
  "bg-accent": "bg-accent/80 border-accent/40",
  "bg-rose": "bg-rose/80 border-rose/40",
  "bg-green": "bg-green/80 border-green/40",
  "bg-amber": "bg-amber/80 border-amber/40",
};

// ─── Location Types ─────────────────────────────────────────

/** Location type value → display label */
export const locationLabels: Record<string, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  phone: "Phone",
  in_person: "In Person",
  custom: "Custom",
};

// ─── Formatters ─────────────────────────────────────────────

/** Shared currency formatter — uses config defaults so it's always in sync */
export const currencyFormatter = new Intl.NumberFormat(defaults.locale, {
  style: "currency",
  currency: defaults.currency,
  maximumFractionDigits: 0,
});

// ─── Page Header ────────────────────────────────────────────

/** Standard page header layout classes */
export const pageHeader = {
  wrapper: "flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4",
  title: "text-3xl font-bold tracking-tight",
  subtitle: "text-text-sec text-sm mt-1",
} as const;

// ─── Table ──────────────────────────────────────────────────

export const table = {
  wrapper: "rounded-xl border border-border bg-bg-card overflow-x-auto",
  th: "text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3",
  thCenter:
    "text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3",
  thRight:
    "text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3",
  row: "border-b border-border last:border-b-0 hover:bg-white/[0.02] transition cursor-pointer",
  cell: "px-5 py-4",
  empty: "text-center py-12 text-text-muted text-sm",
} as const;

// ─── Stats Grid ─────────────────────────────────────────────

/** Responsive stats grid */
export const statsGrid = "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" as const;
export const statsGrid3 = "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" as const;
