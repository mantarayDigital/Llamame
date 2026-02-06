/**
 * Navigation configuration.
 *
 * Centralised so sidebar, mobile nav, and breadcrumbs all stay in sync.
 */

import type { PlanTier } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name
  /** If set, only visible on these plans */
  requiredPlan?: PlanTier;
  /** Mark a nav item as "coming soon" (renders but greyed out) */
  comingSoon?: boolean;
  /** Badge text (e.g. "New", "Beta") */
  badge?: string;
}

export interface NavGroup {
  items: NavItem[];
}

/**
 * Dashboard sidebar navigation.
 */
export const dashboardNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "Home" },
      { label: "Event Types", href: "/dashboard/events", icon: "Calendar" },
      { label: "Calendar", href: "/dashboard/calendar", icon: "CalendarDays" },
      { label: "Clients", href: "/dashboard/clients", icon: "Users" },
      { label: "Messages", href: "/dashboard/messages", icon: "MessageCircle", comingSoon: true, badge: "Soon" },
    ],
  },
  {
    items: [
      { label: "Payments", href: "/dashboard/payments", icon: "DollarSign", requiredPlan: "pro" },
      { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
      { label: "Workflows", href: "/dashboard/workflows", icon: "Zap", requiredPlan: "pro" },
    ],
  },
  {
    items: [
      { label: "Billing", href: "/dashboard/billing", icon: "CreditCard" },
      { label: "Activity Log", href: "/dashboard/audit-log", icon: "FileText" },
      { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
    ],
  },
];

/**
 * Landing page / marketing nav links.
 */
export const marketingNav = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
] as const;

/**
 * Footer navigation columns.
 */
export const footerNav = [
  {
    title: "product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "Pricing", href: "#pricing" },
      { label: "API", href: "/docs/api" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "DPA", href: "/dpa" },
    ],
  },
] as const;

/**
 * Settings tabs.
 */
export const settingsTabs = [
  { id: "profile", label: "Profile", icon: "User" },
  { id: "integrations", label: "Integrations", icon: "Plug" },
  { id: "branding", label: "Branding", icon: "Palette" },
  { id: "ai", label: "AI & Energy", icon: "Brain", requiredPlan: "pro" as PlanTier },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "team", label: "Team", icon: "Users", requiredPlan: "team" as PlanTier },
  { id: "api", label: "API", icon: "Code", requiredPlan: "team" as PlanTier },
] as const;
