"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  Settings,
  CreditCard,
  Zap,
  Shield,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  btn,
  input as inputStyles,
  card,
  badge,
  table as tableStyles,
  statsGrid3,
} from "@/lib/theme";

// ─── Types ───────────────────────────────────────────────────────

type ResourceType =
  | "all"
  | "bookings"
  | "events"
  | "clients"
  | "workflows"
  | "settings"
  | "billing";

type DateRange = "today" | "7d" | "30d" | "all";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: ResourceType | string;
  details: string;
  ipAddress: string;
}

// ─── Icon map ────────────────────────────────────────────────────

function getActionIcon(action: string) {
  if (action.startsWith("booking")) return Calendar;
  if (action.startsWith("event_type")) return Calendar;
  if (action.startsWith("client")) return User;
  if (action.startsWith("workflow")) return Zap;
  if (action.startsWith("settings")) return Settings;
  if (action.startsWith("billing")) return CreditCard;
  if (action.startsWith("api_key") || action.startsWith("webhook"))
    return Zap;
  if (
    action === "login" ||
    action === "password_changed" ||
    action === "logout"
  )
    return Shield;
  return Clock;
}

// ─── Color map ───────────────────────────────────────────────────

function getActionColor(action: string): string {
  // Creates = green
  if (
    action.endsWith(".created") ||
    action === "login" ||
    action.endsWith(".activated") ||
    action === "billing.payment_received"
  )
    return "text-green";

  // Updates = amber
  if (
    action.endsWith(".updated") ||
    action.endsWith(".rescheduled") ||
    action === "password_changed" ||
    action === "billing.plan_upgraded"
  )
    return "text-amber";

  // Deletes / cancellations = rose
  if (
    action.endsWith(".cancelled") ||
    action.endsWith(".deleted") ||
    action.endsWith(".deactivated")
  )
    return "text-rose";

  // Security = violet
  if (
    action.startsWith("api_key") ||
    action.startsWith("webhook") ||
    action === "login" ||
    action === "password_changed"
  )
    return "text-violet";

  return "text-text-sec";
}

// ─── Demo data ───────────────────────────────────────────────────

const demoAuditEntries: AuditEntry[] = [
  {
    id: "audit_001",
    timestamp: "2026-02-06 09:15:23",
    user: "You",
    action: "booking.created",
    resource: "bookings",
    details: "Strategy Call with Sarah Chen on Feb 10 at 2:00 PM",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_002",
    timestamp: "2026-02-06 09:02:11",
    user: "System",
    action: "billing.payment_received",
    resource: "billing",
    details: "Invoice #INV-2024-047 — $150.00 received via Stripe",
    ipAddress: "—",
  },
  {
    id: "audit_003",
    timestamp: "2026-02-06 08:45:30",
    user: "You",
    action: "event_type.updated",
    resource: "events",
    details: 'Updated "Discovery Call" duration from 30 min to 45 min',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_004",
    timestamp: "2026-02-06 08:30:00",
    user: "You",
    action: "login",
    resource: "settings",
    details: "Logged in from Chrome on macOS",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_005",
    timestamp: "2026-02-05 17:22:14",
    user: "You",
    action: "booking.cancelled",
    resource: "bookings",
    details: "Quick Check-in with James Rodriguez — cancelled by client",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_006",
    timestamp: "2026-02-05 16:10:45",
    user: "You",
    action: "workflow.activated",
    resource: "workflows",
    details: 'Activated workflow "Send confirmation email on booking"',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_007",
    timestamp: "2026-02-05 15:33:12",
    user: "You",
    action: "client.created",
    resource: "clients",
    details: "Added new client: Emily Watson (emily@brandforge.co)",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_008",
    timestamp: "2026-02-05 14:20:00",
    user: "You",
    action: "settings.updated",
    resource: "settings",
    details: "Updated profile: changed timezone to America/New_York",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_009",
    timestamp: "2026-02-05 13:05:33",
    user: "You",
    action: "booking.rescheduled",
    resource: "bookings",
    details:
      "Rescheduled Strategy Call with Ana Kovacs from Feb 6 to Feb 8 at 10:00 AM",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_010",
    timestamp: "2026-02-05 11:48:20",
    user: "You",
    action: "event_type.created",
    resource: "events",
    details: 'Created new event type "Portfolio Review" (60 min, $200)',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_011",
    timestamp: "2026-02-04 16:30:00",
    user: "You",
    action: "billing.plan_upgraded",
    resource: "billing",
    details: "Upgraded plan from Free to Pro ($12/mo)",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_012",
    timestamp: "2026-02-04 15:15:42",
    user: "You",
    action: "api_key.created",
    resource: "settings",
    details: 'Created API key "Production Integration" with read/write scope',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_013",
    timestamp: "2026-02-04 14:00:18",
    user: "You",
    action: "webhook.created",
    resource: "settings",
    details:
      "Created webhook endpoint: https://api.example.com/llamame-events",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_014",
    timestamp: "2026-02-04 12:45:00",
    user: "You",
    action: "client.updated",
    resource: "clients",
    details: 'Updated client Sarah Chen — added tag "Enterprise"',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_015",
    timestamp: "2026-02-04 10:20:55",
    user: "You",
    action: "workflow.deactivated",
    resource: "workflows",
    details: 'Deactivated workflow "Send SMS reminder 1h before"',
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_016",
    timestamp: "2026-02-04 09:10:30",
    user: "You",
    action: "settings.updated",
    resource: "settings",
    details: "Updated branding: changed accent color to Violet",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_017",
    timestamp: "2026-02-03 17:55:10",
    user: "You",
    action: "password_changed",
    resource: "settings",
    details: "Password changed successfully",
    ipAddress: "192.168.1.42",
  },
  {
    id: "audit_018",
    timestamp: "2026-02-03 16:30:00",
    user: "System",
    action: "booking.created",
    resource: "bookings",
    details:
      "Discovery Call with Lucas Sharma on Feb 7 at 11:00 AM — booked via public link",
    ipAddress: "10.0.0.55",
  },
  {
    id: "audit_019",
    timestamp: "2026-02-03 14:12:44",
    user: "You",
    action: "settings.updated",
    resource: "settings",
    details: "Updated notification preferences: enabled SMS reminders",
    ipAddress: "192.168.1.42",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

function matchesResource(entry: AuditEntry, resource: ResourceType): boolean {
  if (resource === "all") return true;
  return entry.resource === resource;
}

function matchesDateRange(entry: AuditEntry, range: DateRange): boolean {
  if (range === "all") return true;
  const entryDate = new Date(entry.timestamp);
  const now = new Date("2026-02-06T12:00:00");
  const diffMs = now.getTime() - entryDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (range) {
    case "today":
      return (
        entryDate.toDateString() === now.toDateString()
      );
    case "7d":
      return diffDays <= 7;
    case "30d":
      return diffDays <= 30;
    default:
      return true;
  }
}

function formatAction(action: string): string {
  return action
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Component ───────────────────────────────────────────────────

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<ResourceType>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 15;

  // Filter entries
  const filtered = demoAuditEntries.filter((entry) => {
    const matchesSearch =
      search === "" ||
      entry.user.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.details.toLowerCase().includes(search.toLowerCase()) ||
      entry.ipAddress.includes(search);
    return (
      matchesSearch &&
      matchesResource(entry, resourceFilter) &&
      matchesDateRange(entry, dateRange)
    );
  });

  // Pagination
  const totalEntries = 47; // simulated total
  const totalPages = Math.ceil(totalEntries / pageSize);
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const showStart = (currentPage - 1) * pageSize + 1;
  const showEnd = Math.min(currentPage * pageSize, filtered.length);

  // Stats
  const todayEvents = demoAuditEntries.filter((e) =>
    e.timestamp.startsWith("2026-02-06"),
  ).length;
  const securityEvents = demoAuditEntries.filter(
    (e) =>
      e.action === "login" ||
      e.action === "password_changed" ||
      e.action.startsWith("api_key") ||
      e.action.startsWith("webhook"),
  ).length;
  const systemChanges = demoAuditEntries.filter(
    (e) =>
      e.action.startsWith("settings") ||
      e.action.startsWith("billing") ||
      e.action.startsWith("event_type"),
  ).length;

  // Resource filter options
  const resourceOptions: { value: ResourceType; label: string }[] = [
    { value: "all", label: "All Resources" },
    { value: "bookings", label: "Bookings" },
    { value: "events", label: "Event Types" },
    { value: "clients", label: "Clients" },
    { value: "workflows", label: "Workflows" },
    { value: "settings", label: "Settings" },
    { value: "billing", label: "Billing" },
  ];

  // Date range options
  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "all", label: "All" },
  ];

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-text-sec text-sm mt-1">
            Track every action, change, and event across your account.
          </p>
        </div>
        <button className={btn.ghost}>
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={inputStyles.search}
          />
        </div>

        {/* Resource type dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <select
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value as ResourceType);
              setCurrentPage(1);
            }}
            className={`${inputStyles.select} pl-10 !w-auto min-w-[160px]`}
          >
            {resourceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range buttons */}
        <div className="flex gap-1.5">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setDateRange(opt.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                dateRange === opt.value
                  ? "bg-accent-muted border-accent/20 text-text"
                  : "border-border text-text-sec hover:text-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className={statsGrid3}>
        <div className={card.stat}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted font-medium">
              Total Events Today
            </span>
          </div>
          <div className="text-2xl font-bold">{todayEvents}</div>
        </div>
        <div className={card.stat}>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-violet" />
            <span className="text-xs text-text-muted font-medium">
              Security Events
            </span>
          </div>
          <div className="text-2xl font-bold">{securityEvents}</div>
        </div>
        <div className={card.stat}>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-3.5 h-3.5 text-amber" />
            <span className="text-xs text-text-muted font-medium">
              System Changes
            </span>
          </div>
          <div className="text-2xl font-bold">{systemChanges}</div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className={tableStyles.wrapper}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={tableStyles.th}>Timestamp</th>
              <th className={tableStyles.th}>User</th>
              <th className={tableStyles.th}>Action</th>
              <th className={tableStyles.th}>Resource</th>
              <th className={tableStyles.th}>Details</th>
              <th className={tableStyles.th}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((entry) => {
              const Icon = getActionIcon(entry.action);
              const actionColor = getActionColor(entry.action);
              return (
                <tr key={entry.id} className={tableStyles.row}>
                  <td className={tableStyles.cell}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="text-sm text-text-sec whitespace-nowrap">
                        {entry.timestamp}
                      </span>
                    </div>
                  </td>
                  <td className={tableStyles.cell}>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="text-sm font-medium">
                        {entry.user}
                      </span>
                    </div>
                  </td>
                  <td className={tableStyles.cell}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${actionColor}`} />
                      <span className={`text-sm font-semibold ${actionColor}`}>
                        {formatAction(entry.action)}
                      </span>
                    </div>
                  </td>
                  <td className={tableStyles.cell}>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[0.65rem] font-semibold capitalize ${
                        entry.resource === "bookings"
                          ? badge.green
                          : entry.resource === "events"
                            ? badge.accent
                            : entry.resource === "clients"
                              ? badge.violet
                              : entry.resource === "workflows"
                                ? badge.amber
                                : entry.resource === "settings"
                                  ? badge.rose
                                  : entry.resource === "billing"
                                    ? badge.green
                                    : badge.accent
                      }`}
                    >
                      {entry.resource}
                    </span>
                  </td>
                  <td className={tableStyles.cell}>
                    <span className="text-sm text-text-sec max-w-xs truncate block">
                      {entry.details}
                    </span>
                  </td>
                  <td className={tableStyles.cell}>
                    <span className="text-sm text-text-muted font-mono">
                      {entry.ipAddress}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {paginatedEntries.length === 0 && (
          <div className={tableStyles.empty}>
            No activity found matching your filters.
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {paginatedEntries.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-text-muted">
            Showing {showStart}-{showEnd} of {totalEntries}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${btn.iconSm} ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-text-sec px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className={`${btn.iconSm} ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
