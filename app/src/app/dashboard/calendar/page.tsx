"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Phone,
  Monitor,
  MapPin,
  Plus,
} from "lucide-react";
import { demoUser } from "@/lib/demo-data";
import type { MeetingListItem } from "@/lib/types";
import {
  useTodayMeetings,
  useTomorrowMeetings,
  demoTodayMeetings,
  demoTomorrowMeetings,
  isConvexConnected,
} from "@/lib/data";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm

/** Map meeting color tokens to CSS classes */
const colorMap: Record<string, string> = {
  "bg-violet": "bg-violet/80 border-violet/40",
  "bg-accent": "bg-accent/80 border-accent/40",
  "bg-rose": "bg-rose/80 border-rose/40",
  "bg-green": "bg-green/80 border-green/40",
  "bg-amber": "bg-amber/80 border-amber/40",
};

/** Generate calendar grid for a given month */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-start
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

type View = "month" | "week";

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [view, setView] = useState<View>("month");

  const todayMeetings: MeetingListItem[] = isConvexConnected
    ? useTodayMeetings(demoUser.id)
    : demoTodayMeetings;
  const tomorrowMeetings: MeetingListItem[] = isConvexConnected
    ? useTomorrowMeetings(demoUser.id)
    : demoTomorrowMeetings;

  // Combine for display
  const allMeetings = [...todayMeetings, ...tomorrowMeetings];

  const calendarDays = getCalendarDays(year, month);
  const today = now.getDate();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-text-sec text-sm mt-1">
            View and manage your schedule at a glance.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 text-sm font-medium transition ${
                view === "month"
                  ? "bg-accent-muted text-text"
                  : "text-text-sec hover:text-text"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 text-sm font-medium transition border-l border-border ${
                view === "week"
                  ? "bg-accent-muted text-text"
                  : "text-text-sec hover:text-text"
              }`}
            >
              Week
            </button>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Block Time
          </button>
        </div>
      </div>

      {view === "month" && (
        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Calendar Grid */}
          <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMonth(now.getMonth());
                    setYear(now.getFullYear());
                    setSelectedDay(now.getDate());
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-white/[0.03] transition"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/[0.03] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-white/[0.03] transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border"
                >
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const isToday = isCurrentMonth && day === today;
                const isSelected = day === selectedDay && isCurrentMonth;
                // Mock: show dots on weekdays that have meetings
                const hasMeeting =
                  day !== null &&
                  day >= today - 1 &&
                  day <= today + 5 &&
                  new Date(year, month, day).getDay() !== 0 &&
                  new Date(year, month, day).getDay() !== 6;

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    className={`min-h-[80px] p-2 border-b border-r border-border cursor-pointer transition hover:bg-white/[0.02] ${
                      day === null ? "bg-white/[0.01]" : ""
                    } ${isSelected ? "bg-accent/[0.06]" : ""}`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                            isToday
                              ? "bg-accent text-bg font-bold"
                              : isSelected
                                ? "text-accent font-semibold"
                                : "text-text-sec"
                          }`}
                        >
                          {day}
                        </span>
                        {hasMeeting && (
                          <div className="mt-1 space-y-0.5">
                            <div className="h-1.5 rounded-full bg-violet/60 w-3/4" />
                            {day === today && (
                              <div className="h-1.5 rounded-full bg-accent/60 w-1/2" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold">
                  {MONTHS[month]} {selectedDay}, {year}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {allMeetings.length > 0
                    ? `${allMeetings.length} meetings`
                    : "No meetings scheduled"}
                </p>
              </div>
              <div className="p-3 space-y-2">
                {(isCurrentMonth && selectedDay === today
                  ? todayMeetings
                  : isCurrentMonth && selectedDay === today + 1
                    ? tomorrowMeetings
                    : []
                ).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer"
                  >
                    <div
                      className={`w-1 h-10 rounded-full ${m.color}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {m.title}
                      </div>
                      <div className="text-xs text-text-muted">
                        {m.time} &middot; {m.duration}
                      </div>
                    </div>
                    <div className="text-xs text-text-sec truncate max-w-[80px]">
                      {m.client}
                    </div>
                  </div>
                ))}
                {isCurrentMonth &&
                  selectedDay !== today &&
                  selectedDay !== today + 1 && (
                    <p className="text-sm text-text-muted text-center py-6">
                      No meetings on this day
                    </p>
                  )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-border bg-bg-card p-5">
              <h3 className="font-semibold text-sm mb-3">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-sec">Total meetings</span>
                  <span className="font-semibold">
                    {todayMeetings.length + tomorrowMeetings.length + 3}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-sec">Hours booked</span>
                  <span className="font-semibold">8.5h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-sec">Availability</span>
                  <span className="font-semibold text-green">72%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
            <div className="p-3" />
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => {
              const dayNum = today - now.getDay() + i + 1;
              return (
                <div
                  key={d}
                  className="p-3 text-center border-l border-border"
                >
                  <div className="text-xs text-text-muted font-medium uppercase">
                    {d}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-0.5 ${
                      dayNum === today ? "text-accent" : ""
                    }`}
                  >
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-[60px_repeat(5,1fr)] max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="py-4 px-2 text-xs text-text-muted text-right border-b border-border">
                  {hour > 12 ? hour - 12 : hour}
                  {hour >= 12 ? "pm" : "am"}
                </div>
                {[0, 1, 2, 3, 4].map((dayOffset) => {
                  // Show mock meetings on today and tomorrow
                  const meetings =
                    dayOffset === now.getDay() - 1
                      ? todayMeetings.filter(
                          (m) => parseInt(m.time) === hour
                        )
                      : dayOffset === now.getDay()
                        ? tomorrowMeetings.filter(
                            (m) => parseInt(m.time) === hour
                          )
                        : [];

                  return (
                    <div
                      key={dayOffset}
                      className="border-l border-b border-border min-h-[50px] relative hover:bg-white/[0.01] transition cursor-pointer"
                    >
                      {meetings.map((m) => {
                        const colors =
                          colorMap[m.color] ?? "bg-accent/80 border-accent/40";
                        return (
                          <div
                            key={m.id}
                            className={`absolute inset-x-1 top-1 rounded-md px-2 py-1.5 text-xs border ${colors}`}
                          >
                            <div className="font-semibold text-white truncate">
                              {m.title}
                            </div>
                            <div className="text-white/70 truncate">
                              {m.client}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
