"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Bell,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { btn, card, statusStyles as themeStatusStyles, colorToBg, locationLabels as themeLocationLabels, currencyFormatter, toggle } from "@/lib/theme";
import type { MeetingListItem, EventType, ClientListItem } from "@/lib/types";
import {
  useDashboardStats,
  useTodayMeetings,
  useTomorrowMeetings,
  useEventTypes,
  useClients,
  demoAiBrief,
  demoAiInsight,
  demoUser,
  demoTodayMeetings,
  demoTomorrowMeetings,
  demoEventTypes,
  demoClients,
  isConvexConnected,
} from "@/lib/data";
import {
  generateMeetingBrief,
  analyzeVibeCheck,
  type MeetingBrief,
} from "@/lib/ai";
import { getEnergyForTime, checkFatigue, type FatigueWarning } from "@/lib/scheduling";
import RescheduleModal from "@/components/RescheduleModal";

/** Dynamic greeting based on time of day */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Format a Date to e.g. "Thursday, February 6, 2026" */
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Short date label like "Feb 6" */
function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  // Convex hooks (fall back to demo data when not connected)
  const dashboardStats = useDashboardStats(isConvexConnected ? demoUser.id : undefined);
  const todayMeetings: MeetingListItem[] = isConvexConnected ? useTodayMeetings(demoUser.id) : demoTodayMeetings;
  const tomorrowMeetings: MeetingListItem[] = isConvexConnected ? useTomorrowMeetings(demoUser.id) : demoTomorrowMeetings;
  const eventTypes = useEventTypes(isConvexConnected ? demoUser.id : undefined) as EventType[];
  const clients = useClients(isConvexConnected ? demoUser.id : undefined) as ClientListItem[];

  // Dynamic date
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const greeting = getGreeting();
  const todayLabel = formatDate(now);
  const todayShort = shortDate(now);
  const tomorrowShort = shortDate(tomorrow);

  // AI Brief state
  const [aiBrief, setAiBrief] = useState<MeetingBrief | null>(null);
  const [aiInsight, setAiInsight] = useState<string>(demoAiInsight);

  // Reschedule modal state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<MeetingListItem | null>(null);

  // Fatigue warnings
  const [fatigueWarnings, setFatigueWarnings] = useState<FatigueWarning[]>([]);

  // Generate AI brief for the next meeting
  useEffect(() => {
    const nextMeeting = todayMeetings[0];
    if (!nextMeeting) return;
    generateMeetingBrief({
      clientName: nextMeeting.client,
      clientEmail: "",
      eventType: nextMeeting.title,
      meetingNumber: 3,
      lastVibeCheck: "Excited",
    }).then(setAiBrief);
  }, [todayMeetings]);

  // Check fatigue
  useEffect(() => {
    const warnings = checkFatigue({ meetings: todayMeetings });
    setFatigueWarnings(warnings);
  }, [todayMeetings]);

  const handleReschedule = useCallback((meeting: MeetingListItem) => {
    setRescheduleMeeting(meeting);
    setRescheduleOpen(true);
  }, []);

  const handleRescheduleConfirm = useCallback(
    (_newTime: string, _newDate: string, _reason: string) => {
      setRescheduleOpen(false);
      setRescheduleMeeting(null);
    },
    []
  );

  const briefData = aiBrief ?? {
    summary: demoAiBrief.summary,
    suggestedTopics: demoAiBrief.suggestedTopics,
    clientInsight: "",
    preparationTips: [],
  };
  const briefClientName = aiBrief ? todayMeetings[0]?.client?.split(" ")[0] ?? "Client" : demoAiBrief.clientName;
  const briefCompany = aiBrief ? todayMeetings[0]?.company ?? "" : demoAiBrief.clientCompany;

  const stats = [
    {
      label: "Meetings This Week",
      value: String(dashboardStats.meetingsThisWeek),
      change: `+${dashboardStats.meetingsChange}%`,
      changeLabel: "vs last week",
      up: dashboardStats.meetingsChange >= 0,
    },
    {
      label: "Revenue Collected",
      value: currencyFormatter.format(dashboardStats.revenueCollected),
      change: `+${dashboardStats.revenueChange}%`,
      changeLabel: "vs last week",
      up: dashboardStats.revenueChange >= 0,
    },
    {
      label: "Show Rate",
      value: `${dashboardStats.showRate}%`,
      change: `+${dashboardStats.showRateChange}%`,
      changeLabel: "improvement",
      up: dashboardStats.showRateChange >= 0,
    },
  ];
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}
          </h1>
          <p className="text-text-sec text-sm mt-1">
            {todayLabel} &middot; {todayMeetings.length} meetings today
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button className={btn.icon}>
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button className={btn.icon}>
            <Search className="w-[18px] h-[18px]" />
          </button>
          <Link
            href="/dashboard/events"
            className={btn.primary}
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
            {aiInsight}
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/[0.03] text-text border border-border hover:bg-bg-card-hover transition shrink-0">
          View Details
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
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
              <span className="text-green text-sm">&#9679;</span>{" "}
              {dashboardStats.energyScore}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-accent"
              style={{ width: `${dashboardStats.energyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Upcoming Meetings */}
        <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Upcoming Meetings</h3>
            <Link href="#" className="text-xs text-accent font-medium">
              View calendar &rarr;
            </Link>
          </div>

          <div className="p-2">
            {/* Fatigue warnings */}
            {fatigueWarnings.length > 0 && (
              <div className="mx-2 mb-2 p-3 rounded-lg bg-amber/[0.08] border border-amber/15">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber mb-1">
                  <AlertTriangle className="w-3 h-3" /> Schedule Warning
                </div>
                {fatigueWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-text-sec">
                    {w.message} <span className="text-text-muted">{w.suggestion}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Today &middot; {todayShort}
            </div>

            {/* AI Brief */}
            <div className="mx-2 p-4 rounded-lg bg-gradient-to-r from-violet/[0.08] to-accent/[0.05] border border-violet/15 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet mb-2.5">
                <Sparkles className="w-3 h-3" /> AI Brief for next meeting
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                <strong className="text-text">
                  {briefClientName} from {briefCompany}
                </strong>{" "}
                &mdash; {briefData.summary}
              </p>
              <ul className="mt-2 space-y-0.5">
                {briefData.suggestedTopics.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-text-sec flex items-center gap-2"
                  >
                    <span className="text-violet font-bold">&gt;</span> {item}
                  </li>
                ))}
              </ul>
              {briefData.preparationTips.length > 0 && (
                <div className="mt-3 pt-2 border-t border-violet/10">
                  <div className="text-xs font-semibold text-violet mb-1">Prep Tips</div>
                  {briefData.preparationTips.map((tip) => (
                    <p key={tip} className="text-xs text-text-muted">&bull; {tip}</p>
                  ))}
                </div>
              )}
            </div>

            {todayMeetings.map((m) => {
              const status = themeStatusStyles[m.status] ?? themeStatusStyles.pending;
              const energy = getEnergyForTime(m.time);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3.5 px-3 py-3.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition group"
                >
                  <div className="text-center min-w-[54px]">
                    <div className="text-sm font-semibold">{m.time}</div>
                    <div className="text-[0.7rem] text-text-muted">
                      {m.duration}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <div
                      className={`w-[3px] h-7 rounded-sm ${m.color}`}
                    />
                    <div className={`w-1.5 h-1.5 rounded-full ${energy.color}`} title={energy.label} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{m.title}</div>
                    <div className="text-xs text-text-sec">
                      {m.client} &middot; {m.company}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReschedule(m); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-text transition"
                    title="Reschedule"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}

            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider mt-2">
              Tomorrow &middot; {tomorrowShort}
            </div>

            {tomorrowMeetings.map((m) => {
              const status = themeStatusStyles[m.status] ?? themeStatusStyles.pending;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3.5 px-3 py-3.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition group"
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReschedule(m); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-text transition"
                    title="Reschedule"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
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
              {eventTypes.map((et) => {
                const bgColor = colorToBg[et.color] ?? "bg-accent";
                const locationLabel =
                  themeLocationLabels[et.location] ?? et.location;
                const meta = `${et.duration} min${
                  et.price
                    ? ` \u00b7 ${currencyFormatter.format(et.price)}`
                    : ""
                } \u00b7 ${locationLabel}`;
                return (
                  <div
                    key={et.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-lg border border-border bg-white/[0.03] mb-2 last:mb-0 hover:border-border-hover transition cursor-pointer"
                  >
                    <div
                      className={`w-1 h-9 rounded shrink-0 ${bgColor}`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{et.title}</div>
                      <div className="text-xs text-text-muted">{meta}</div>
                    </div>
                    <div
                      className={`${toggle.track} ${
                        et.isActive ? toggle.trackOn : toggle.trackOff
                      }`}
                    >
                      <div
                        className={`${toggle.thumb} ${
                          et.isActive
                            ? toggle.thumbOn
                            : toggle.thumbOff
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
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
                  key={c.id}
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

      {/* Reschedule Modal */}
      {rescheduleMeeting && (
        <RescheduleModal
          open={rescheduleOpen}
          onClose={() => { setRescheduleOpen(false); setRescheduleMeeting(null); }}
          onReschedule={handleRescheduleConfirm}
          bookingId={rescheduleMeeting.id}
          currentDate={todayLabel}
          currentTime={rescheduleMeeting.time}
          clientName={rescheduleMeeting.client}
          eventTitle={rescheduleMeeting.title}
        />
      )}
    </>
  );
}
