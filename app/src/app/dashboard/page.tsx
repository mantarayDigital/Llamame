import Link from "next/link";
import {
  Plus,
  Bell,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    label: "Meetings This Week",
    value: "18",
    change: "+12%",
    changeLabel: "vs last week",
    up: true,
  },
  {
    label: "Revenue Collected",
    value: "$2,450",
    change: "+8%",
    changeLabel: "vs last week",
    up: true,
  },
  {
    label: "Show Rate",
    value: "94%",
    change: "+3%",
    changeLabel: "improvement",
    up: true,
  },
];

const meetings = [
  {
    time: "10:00",
    duration: "60 min",
    title: "Strategy Session",
    client: "Sarah Chen",
    company: "TechFlow Inc",
    color: "bg-violet",
    status: "Confirmed",
    statusClass: "bg-green-muted text-green",
  },
  {
    time: "13:00",
    duration: "30 min",
    title: "Discovery Call",
    client: "James Rodriguez",
    company: "StartupXYZ",
    color: "bg-accent",
    status: "Confirmed",
    statusClass: "bg-green-muted text-green",
  },
  {
    time: "15:30",
    duration: "15 min",
    title: "Quick Check-in",
    client: "Ana Kovacs",
    company: "GrowthLab",
    color: "bg-rose",
    status: "Pending",
    statusClass: "bg-amber-muted text-amber",
  },
];

const tomorrowMeetings = [
  {
    time: "09:00",
    duration: "60 min",
    title: "Strategy Session",
    client: "Lucas Sharma",
    company: "DesignCo",
    color: "bg-violet",
    status: "Confirmed",
    statusClass: "bg-green-muted text-green",
  },
  {
    time: "11:00",
    duration: "30 min",
    title: "Discovery Call",
    client: "Emily Watson",
    company: "BrandForge",
    color: "bg-accent",
    status: "Pending",
    statusClass: "bg-amber-muted text-amber",
  },
];

const eventTypes = [
  {
    name: "Discovery Call",
    meta: "30 min \u00b7 Google Meet",
    color: "bg-accent",
    bookings: 42,
    active: true,
  },
  {
    name: "Strategy Session",
    meta: "60 min \u00b7 $150 \u00b7 Google Meet",
    color: "bg-violet",
    bookings: 28,
    active: true,
  },
  {
    name: "Quick Check-in",
    meta: "15 min \u00b7 Phone",
    color: "bg-rose",
    bookings: 67,
    active: true,
  },
  {
    name: "Workshop",
    meta: "120 min \u00b7 $500 \u00b7 Zoom",
    color: "bg-amber",
    bookings: 5,
    active: false,
  },
];

const clients = [
  {
    name: "Sarah Chen",
    initials: "SC",
    gradient: "from-accent to-violet",
    meetings: 12,
    vibe: "\u{1F680}",
  },
  {
    name: "James Rodriguez",
    initials: "JR",
    gradient: "from-violet to-rose",
    meetings: 1,
    vibe: "\u{1F914}",
  },
  {
    name: "Ana Kovacs",
    initials: "AK",
    gradient: "from-amber to-rose",
    meetings: 8,
    vibe: "\u{1F60A}",
  },
  {
    name: "Lucas Sharma",
    initials: "LS",
    gradient: "from-accent to-green",
    meetings: 5,
    vibe: "\u{1F60A}",
  },
];

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning
          </h1>
          <p className="text-text-sec text-sm mt-1">
            Thursday, February 6, 2026 &middot; 3 meetings today
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 rounded-lg border border-border bg-white/[0.03] text-text-sec flex items-center justify-center hover:border-border-hover hover:text-text transition">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button className="w-10 h-10 rounded-lg border border-border bg-white/[0.03] text-text-sec flex items-center justify-center hover:border-border-hover hover:text-text transition">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" /> New Event Type
          </Link>
        </div>
      </div>

      {/* AI Banner */}
      <div className="p-4 px-5 rounded-xl bg-gradient-to-r from-accent/10 to-violet/[0.06] border border-accent/15 flex items-center gap-3.5 mb-7">
        <Sparkles className="w-5 h-5 text-accent shrink-0" />
        <div className="flex-1">
          <strong className="text-sm block mb-0.5">AI Insight</strong>
          <p className="text-sm text-text-sec">
            Your no-show rate dropped 23% this month after adding the reminder
            workflow. Clients who complete the Vibe Check are 4x more likely to
            show up.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/[0.03] text-text border border-border hover:bg-bg-card-hover transition shrink-0">
          View Details
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-xl border border-border bg-bg-card"
          >
            <div className="text-xs text-text-muted font-medium mb-2">
              {s.label}
            </div>
            <div className="text-3xl font-bold mb-1.5">{s.value}</div>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                s.up ? "bg-green-muted text-green" : "bg-rose-muted text-rose"
              }`}
            >
              {s.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {s.change} {s.changeLabel}
            </span>
          </div>
        ))}
        {/* Energy Card */}
        <div className="p-5 rounded-xl border border-violet/20 bg-gradient-to-br from-violet/[0.06] to-accent/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-medium">
              Today&apos;s Energy Score
            </span>
            <div className="text-3xl font-bold flex items-center gap-2">
              <span className="text-green text-sm">&#9679;</span> 78
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-accent"
              style={{ width: "78%" }}
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Upcoming Meetings */}
        <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Upcoming Meetings</h3>
            <Link href="#" className="text-xs text-accent font-medium">
              View calendar &rarr;
            </Link>
          </div>

          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Today &middot; Feb 6
            </div>

            {/* AI Brief */}
            <div className="mx-2 p-4 rounded-lg bg-gradient-to-r from-violet/[0.08] to-accent/[0.05] border border-violet/15 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet mb-2.5">
                <Sparkles className="w-3 h-3" /> AI Brief for next meeting
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                <strong className="text-text">Sarah from TechFlow</strong> — This is her
                3rd Strategy Session. Last time you discussed SEO migration and
                she wanted a progress update. She completed the Vibe Check as
                &ldquo;Excited&rdquo;.
              </p>
              <ul className="mt-2 space-y-0.5">
                {[
                  "Follow up on SEO migration timeline",
                  "Review Q1 content calendar she submitted",
                  "She mentioned interest in paid ads",
                ].map((item) => (
                  <li
                    key={item}
                    className="text-sm text-text-sec flex items-center gap-2"
                  >
                    <span className="text-violet font-bold">&gt;</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {meetings.map((m) => (
              <div
                key={`${m.time}-${m.title}`}
                className="flex items-center gap-3.5 px-3 py-3.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition"
              >
                <div className="text-center min-w-[54px]">
                  <div className="text-sm font-semibold">{m.time}</div>
                  <div className="text-[0.7rem] text-text-muted">
                    {m.duration}
                  </div>
                </div>
                <div
                  className={`w-[3px] h-10 rounded-sm shrink-0 ${m.color}`}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-xs text-text-sec">
                    {m.client} &middot; {m.company}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${m.statusClass}`}
                >
                  {m.status}
                </span>
              </div>
            ))}

            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider mt-2">
              Tomorrow &middot; Feb 7
            </div>

            {tomorrowMeetings.map((m) => (
              <div
                key={`${m.time}-${m.title}`}
                className="flex items-center gap-3.5 px-3 py-3.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition"
              >
                <div className="text-center min-w-[54px]">
                  <div className="text-sm font-semibold">{m.time}</div>
                  <div className="text-[0.7rem] text-text-muted">
                    {m.duration}
                  </div>
                </div>
                <div
                  className={`w-[3px] h-10 rounded-sm shrink-0 ${m.color}`}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-xs text-text-sec">
                    {m.client} &middot; {m.company}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${m.statusClass}`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Event Types */}
          <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold">Event Types</h3>
              <Link
                href="/dashboard/events"
                className="text-xs text-accent font-medium"
              >
                Manage &rarr;
              </Link>
            </div>
            <div className="p-3">
              {eventTypes.map((et) => (
                <div
                  key={et.name}
                  className="flex items-center gap-3.5 p-3.5 rounded-lg border border-border bg-white/[0.03] mb-2 last:mb-0 hover:border-border-hover transition cursor-pointer"
                >
                  <div
                    className={`w-1 h-9 rounded shrink-0 ${et.color}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{et.name}</div>
                    <div className="text-xs text-text-muted">{et.meta}</div>
                  </div>
                  <div className="text-xs text-text-muted min-w-[60px] text-right">
                    {et.bookings} booked
                  </div>
                  <div
                    className={`w-10 h-[22px] rounded-full relative ${
                      et.active ? "bg-green/30" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-[3px] w-4 h-4 rounded-full transition ${
                        et.active
                          ? "left-[21px] bg-green"
                          : "left-[3px] bg-text-muted"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Clients */}
          <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold">Recent Clients</h3>
              <Link href="#" className="text-xs text-accent font-medium">
                All clients &rarr;
              </Link>
            </div>
            <div className="p-4">
              {clients.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-[0.7rem] font-bold text-white shrink-0`}
                  >
                    {c.initials}
                  </div>
                  <div className="flex-1 text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-text-muted">
                    {c.meetings} meetings
                  </div>
                  <div className="text-base">{c.vibe}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
