"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useClients, demoClients, isConvexConnected, demoUser } from "@/lib/data";
import type { ClientListItem } from "@/lib/types";
import { btn, input as inputStyles, card, table as tableStyles, tagColors, currencyFormatter, statsGrid } from "@/lib/theme";

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
  },
];


export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
    </>
  );
}
