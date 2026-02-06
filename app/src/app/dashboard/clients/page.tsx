"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  MoreHorizontal,
  TrendingUp,
  UserPlus,
  X,
  Sparkles,
} from "lucide-react";
import { useClients, demoClients, isConvexConnected, demoUser } from "@/lib/data";
import type { ClientListItem } from "@/lib/types";
import { btn, input as inputStyles, card, table as tableStyles, tagColors, currencyFormatter, statsGrid } from "@/lib/theme";
import { generateClientIntelligence, type ClientIntelligence } from "@/lib/ai";

/** Extended client for the table view (in production from Convex) */
interface ClientRow {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  email: string;
  company: string;
  meetings: number;
  revenue: number;
  noShows: number;
  lastMeeting: string;
  vibe: string;
  tags: string[];
  meetingHistory: { date: string; type: string; outcome: string }[];
}

/** Demo client rows with extended data */
const demoClientRows: ClientRow[] = [
  {
    id: "cli_001",
    name: "Sarah Chen",
    initials: "SC",
    gradient: "from-accent to-violet",
    email: "sarah@techflow.io",
    company: "TechFlow Inc",
    meetings: 12,
    revenue: 1800,
    noShows: 0,
    lastMeeting: "3 days ago",
    vibe: "\u{1F680}",
    tags: ["VIP", "Enterprise"],
    meetingHistory: [
      { date: "2025-01-15", type: "Strategy Session", outcome: "completed" },
      { date: "2025-01-02", type: "Discovery Call", outcome: "completed" },
      { date: "2024-12-18", type: "Strategy Session", outcome: "completed" },
    ],
  },
  {
    id: "cli_002",
    name: "James Rodriguez",
    initials: "JR",
    gradient: "from-violet to-rose",
    email: "james@startupxyz.com",
    company: "StartupXYZ",
    meetings: 1,
    revenue: 0,
    noShows: 0,
    lastMeeting: "Yesterday",
    vibe: "\u{1F914}",
    tags: ["New"],
    meetingHistory: [
      { date: "2025-01-18", type: "Discovery Call", outcome: "completed" },
    ],
  },
  {
    id: "cli_003",
    name: "Ana Kovacs",
    initials: "AK",
    gradient: "from-amber to-rose",
    email: "ana@growthlab.com",
    company: "GrowthLab",
    meetings: 8,
    revenue: 1200,
    noShows: 1,
    lastMeeting: "2 days ago",
    vibe: "\u{1F60A}",
    tags: ["Returning"],
    meetingHistory: [
      { date: "2025-01-16", type: "Growth Review", outcome: "completed" },
      { date: "2025-01-08", type: "Strategy Session", outcome: "completed" },
      { date: "2024-12-20", type: "Discovery Call", outcome: "no-show" },
    ],
  },
  {
    id: "cli_004",
    name: "Lucas Sharma",
    initials: "LS",
    gradient: "from-accent to-green",
    email: "lucas@designco.com",
    company: "DesignCo",
    meetings: 5,
    revenue: 750,
    noShows: 0,
    lastMeeting: "5 days ago",
    vibe: "\u{1F60A}",
    tags: [],
    meetingHistory: [
      { date: "2025-01-13", type: "Design Review", outcome: "completed" },
      { date: "2024-12-30", type: "Strategy Session", outcome: "completed" },
    ],
  },
  {
    id: "cli_005",
    name: "Emily Watson",
    initials: "EW",
    gradient: "from-violet to-accent",
    email: "emily@brandforge.co",
    company: "BrandForge",
    meetings: 3,
    revenue: 450,
    noShows: 0,
    lastMeeting: "1 week ago",
    vibe: "\u{1F680}",
    tags: ["Returning"],
    meetingHistory: [
      { date: "2025-01-11", type: "Brand Workshop", outcome: "completed" },
      { date: "2024-12-28", type: "Discovery Call", outcome: "completed" },
      { date: "2024-12-15", type: "Follow-up", outcome: "completed" },
    ],
  },
];


export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [intelligence, setIntelligence] = useState<ClientIntelligence | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);

  // Fetch AI intelligence when a client is selected
  useEffect(() => {
    if (!selectedClient) {
      setIntelligence(null);
      return;
    }

    let cancelled = false;
    setIntelligenceLoading(true);

    generateClientIntelligence({
      clientName: selectedClient.name,
      totalMeetings: selectedClient.meetings,
      totalRevenue: selectedClient.revenue,
      noShowCount: selectedClient.noShows,
      recentVibes: [selectedClient.vibe],
      meetingHistory: selectedClient.meetingHistory,
    }).then((result) => {
      if (!cancelled) {
        setIntelligence(result);
        setIntelligenceLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedClient]);

  const clients = demoClientRows;

  const allTags = Array.from(
    new Set(clients.flatMap((c) => c.tags))
  ).filter(Boolean);

  const filtered = clients.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || c.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const totalMeetings = clients.reduce((sum, c) => sum + c.meetings, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-text-sec text-sm mt-1">
            Track client relationships, meeting history, and revenue.
          </p>
        </div>
        <button className={btn.primary}>
          <UserPlus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Total Clients
          </div>
          <div className="text-2xl font-bold">{clients.length}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-bold">
            {currencyFormatter.format(totalRevenue)}
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Total Meetings
          </div>
          <div className="text-2xl font-bold">{totalMeetings}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Avg Revenue/Client
          </div>
          <div className="text-2xl font-bold">
            {currencyFormatter.format(totalRevenue / clients.length)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputStyles.search}
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
              !selectedTag
                ? "bg-accent-muted border-accent/20 text-text"
                : "border-border text-text-sec hover:text-text"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTag(selectedTag === tag ? null : tag)
              }
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                selectedTag === tag
                  ? "bg-accent-muted border-accent/20 text-text"
                  : "border-border text-text-sec hover:text-text"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      <div className="rounded-xl border border-border bg-bg-card overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Client
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Company
              </th>
              <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Meetings
              </th>
              <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Revenue
              </th>
              <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Vibe
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Last Meeting
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Tags
              </th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="border-b border-border last:border-b-0 hover:bg-white/[0.02] transition cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-xs text-text-muted">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-text-sec">{c.company}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold">{c.meetings}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold">
                    {currencyFormatter.format(c.revenue)}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-xl">{c.vibe}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-text-sec">
                    {c.lastMeeting}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded text-[0.65rem] font-semibold ${
                          tagColors[tag] ?? "bg-accent-muted text-accent"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <button className="text-text-muted hover:text-text transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No clients found matching your search.
          </div>
        )}
      </div>

      {/* ── Client Detail Drawer ────────────────────────────────── */}

      {/* Backdrop overlay */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSelectedClient(null)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[420px] z-50 bg-bg-raised border-l border-border flex flex-col transition-transform duration-300 ease-in-out ${
          selectedClient ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedClient && (
          <>
            {/* Drawer Header */}
            <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedClient.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}
                >
                  {selectedClient.initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text">
                    {selectedClient.name}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {selectedClient.email}
                  </p>
                  <p className="text-xs text-text-sec mt-0.5">
                    {selectedClient.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-text hover:bg-white/[0.03] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                    <div className="text-xs text-text-muted mb-1">Vibe</div>
                    <div className="text-xl">{selectedClient.vibe}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                    <div className="text-xs text-text-muted mb-1">Meetings</div>
                    <div className="text-lg font-bold text-text">
                      {selectedClient.meetings}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                    <div className="text-xs text-text-muted mb-1">Total Revenue</div>
                    <div className="text-lg font-bold text-text">
                      {currencyFormatter.format(selectedClient.revenue)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                    <div className="text-xs text-text-muted mb-1">Avg / Meeting</div>
                    <div className="text-lg font-bold text-text">
                      {selectedClient.meetings > 0
                        ? currencyFormatter.format(
                            selectedClient.revenue / selectedClient.meetings,
                          )
                        : "$0"}
                    </div>
                  </div>
                </div>
                {selectedClient.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {selectedClient.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded text-[0.65rem] font-semibold ${
                          tagColors[tag] ?? "bg-accent-muted text-accent"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Intelligence Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Intelligence
                </h3>

                {intelligenceLoading ? (
                  <div className="p-4 rounded-lg border border-border bg-white/[0.03] text-center">
                    <div className="text-sm text-text-muted animate-pulse">
                      Analyzing client data...
                    </div>
                  </div>
                ) : intelligence ? (
                  <div className="space-y-3">
                    {/* Relationship Score */}
                    <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">
                          Relationship Score
                        </span>
                        <span className="text-sm font-bold text-text">
                          {intelligence.relationshipScore}/100
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06]">
                        <div
                          className="h-2 rounded-full bg-accent transition-all duration-500"
                          style={{
                            width: `${intelligence.relationshipScore}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Risk Level:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[0.65rem] font-semibold ${
                          intelligence.riskLevel === "low"
                            ? "bg-green-muted text-green"
                            : intelligence.riskLevel === "medium"
                              ? "bg-amber-muted text-amber"
                              : "bg-rose-muted text-rose"
                        }`}
                      >
                        {intelligence.riskLevel.charAt(0).toUpperCase() +
                          intelligence.riskLevel.slice(1)}
                      </span>
                    </div>

                    {/* Insights */}
                    <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                      <div className="text-xs font-semibold text-text-sec mb-2">
                        Insights
                      </div>
                      <ul className="space-y-1.5">
                        {intelligence.insights.map((insight, i) => (
                          <li
                            key={i}
                            className="text-xs text-text-sec leading-relaxed flex gap-2"
                          >
                            <span className="text-accent shrink-0 mt-0.5">
                              &bull;
                            </span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="p-3 rounded-lg border border-border bg-white/[0.03]">
                      <div className="text-xs font-semibold text-text-sec mb-2">
                        Recommendations
                      </div>
                      <ul className="space-y-1.5">
                        {intelligence.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="text-xs text-text-sec leading-relaxed flex gap-2"
                          >
                            <TrendingUp className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Meeting History Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Meeting History
                </h3>
                {selectedClient.meetingHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClient.meetingHistory.map((meeting, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-white/[0.03]"
                      >
                        <div>
                          <div className="text-sm font-medium text-text">
                            {meeting.type}
                          </div>
                          <div className="text-xs text-text-muted">
                            {meeting.date}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[0.65rem] font-semibold ${
                            meeting.outcome === "completed"
                              ? "bg-green-muted text-green"
                              : meeting.outcome === "no-show"
                                ? "bg-rose-muted text-rose"
                                : "bg-amber-muted text-amber"
                          }`}
                        >
                          {meeting.outcome === "completed"
                            ? "Completed"
                            : meeting.outcome === "no-show"
                              ? "No-show"
                              : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted p-3 text-center border border-border rounded-lg bg-white/[0.03]">
                    No meeting history yet.
                  </div>
                )}
              </div>

              {/* Notes Section (placeholder) */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <div className="p-3 rounded-lg border border-border bg-white/[0.03] text-xs text-text-muted italic">
                  No notes yet. Notes will appear here after meetings.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
