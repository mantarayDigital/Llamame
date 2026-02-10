"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Phone,
  Monitor,
  MapPin,
  Plus,
  X,
  RefreshCw,
  Sparkles,
  Lock,
} from "lucide-react";
import type { MeetingListItem } from "@/lib/types";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  useTodayMeetings,
  useTomorrowMeetings,
  useCurrentUserId,
} from "@/lib/data";
import { btn, card, colorToOverlay, input as inputStyles } from "@/lib/theme";
import RescheduleModal from "@/components/RescheduleModal";
import { getEnergyForTime, type EnergySlotInfo } from "@/lib/scheduling";

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

// ─── Blocked Time ─────────────────────────────────────────────────
interface BlockedTime {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
}

// ─── Energy Color Map ─────────────────────────────────────────────
const ENERGY_COLORS: Record<string, { bar: string; text: string; label: string }> = {
  peak: { bar: "bg-green", text: "text-green", label: "Peak" },
  focus: { bar: "bg-accent", text: "text-accent", label: "Focus" },
  moderate: { bar: "bg-amber", text: "text-amber", label: "Moderate" },
  low: { bar: "bg-rose", text: "text-rose", label: "Low" },
};

// ─── Block Time Modal ─────────────────────────────────────────────
function BlockTimeModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (block: BlockedTime) => void;
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleSave() {
    if (!date || !startTime || !endTime) return;
    onSave({
      id: crypto.randomUUID(),
      date,
      startTime,
      endTime,
      reason: reason.trim() || undefined,
    });
    // Reset
    setDate("");
    setStartTime("09:00");
    setEndTime("10:00");
    setReason("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl shadow-card w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose/10 flex items-center justify-center">
              <Lock size={18} className="text-rose" />
            </div>
            <h2 className="text-lg font-semibold text-text">Block Time</h2>
          </div>
          <button onClick={onClose} className={btn.iconSm}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputStyles.base}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputStyles.base}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputStyles.base}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">
              Reason <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch, Deep work, Personal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputStyles.base}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className={btn.ghost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!date || !startTime || !endTime}
            className={`${btn.primary} ${!date || !startTime || !endTime ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Lock size={16} />
            Block Time
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // Block time state
  const [blockTimeOpen, setBlockTimeOpen] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);

  // External events state
  const [externalEvents, setExternalEvents] = useState<CalendarEvent[]>([]);
  const [externalLoading, setExternalLoading] = useState(true);

  // Reschedule state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<MeetingListItem | null>(null);

  const currentUserId = useCurrentUserId();

  // Fetch external events when userId is available
  useEffect(() => {
    if (!currentUserId) {
      setExternalLoading(false);
      return;
    }
    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    fetch(`/api/calendar/events?userId=${encodeURIComponent(currentUserId)}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`)
      .then(res => res.json())
      .then(data => {
        setExternalEvents(data.events ?? []);
        setExternalLoading(false);
      })
      .catch(() => setExternalLoading(false));
  }, [currentUserId]);
  const todayMeetings = useTodayMeetings(currentUserId) as unknown as MeetingListItem[];
  const tomorrowMeetings = useTomorrowMeetings(currentUserId) as unknown as MeetingListItem[];

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

  // Helper: get blocked times for a specific date string (YYYY-MM-DD)
  function blocksForDate(dateStr: string) {
    return blockedTimes.filter((b) => b.date === dateStr);
  }

  // Helper: format YYYY-MM-DD for a given day in the current month
  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Helper: does a given hour (8-18) fall within a blocked range?
  function isHourBlocked(dateString: string, hour: number): BlockedTime | undefined {
    const hourMin = hour * 60;
    return blockedTimes.find((b) => {
      if (b.date !== dateString) return false;
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      return hourMin >= startMin && hourMin < endMin;
    });
  }

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
          <button className={btn.primary} onClick={() => setBlockTimeOpen(true)}>
            <Plus className="w-4 h-4" /> Block Time
          </button>
        </div>
      </div>

      {view === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
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

            <div className="flex items-center gap-3 text-[0.65rem] text-text-muted px-6 pb-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet/60" /> Llamame</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent/70" /> External</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose/70" /> Blocked</span>
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
                // Show dots on days that have actual meetings
                const hasMeeting =
                  day !== null &&
                  isCurrentMonth &&
                  ((day === today && todayMeetings.length > 0) ||
                    (day === today + 1 && tomorrowMeetings.length > 0));
                const hasBlock = day !== null && blocksForDate(dateStr(day)).length > 0;
                const hasExternalEvent = day !== null && externalEvents.some(e => {
                  const d = new Date(e.startTime);
                  return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                });

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
                        <div className="flex items-center gap-1">
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
                          {hasBlock && (
                            <span className="w-2 h-2 rounded-full bg-rose/70 shrink-0" title="Blocked time" />
                          )}
                          {hasExternalEvent && (
                            <span className="w-2 h-2 rounded-full bg-accent/70 shrink-0" title="External event" />
                          )}
                        </div>
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
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer"
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRescheduleMeeting(m);
                        setRescheduleOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 shrink-0"
                      title="Reschedule"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ))}
                {/* Show blocked times for selected day */}
                {isCurrentMonth && blocksForDate(dateStr(selectedDay)).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-rose/20 bg-rose/5 transition"
                  >
                    <div className="w-1 h-10 rounded-full bg-rose/60" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-rose">
                        <Lock size={12} className="inline mr-1 -mt-0.5" />
                        {b.reason || "Blocked"}
                      </div>
                      <div className="text-xs text-text-muted">
                        {b.startTime} - {b.endTime}
                      </div>
                    </div>
                  </div>
                ))}
                {/* External Calendar Events */}
                {externalEvents.filter(e => {
                  const eventDate = new Date(e.startTime);
                  return eventDate.getDate() === selectedDay &&
                         eventDate.getMonth() === month &&
                         eventDate.getFullYear() === year;
                }).map(e => (
                  <div key={e.externalId} className="flex items-center gap-3 p-3 rounded-lg border border-accent/20 bg-accent/[0.04] hover:bg-accent/[0.07] transition">
                    <div className="w-1 h-10 rounded-full bg-accent/50" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                        {e.title}
                        <span className="text-[0.6rem] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase">
                          {e.provider === "google" ? "GCal" : "Outlook"}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(e.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — {new Date(e.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
                {isCurrentMonth &&
                  selectedDay !== today &&
                  selectedDay !== today + 1 &&
                  blocksForDate(dateStr(selectedDay)).length === 0 &&
                  externalEvents.filter(e => {
                    const eventDate = new Date(e.startTime);
                    return eventDate.getDate() === selectedDay &&
                           eventDate.getMonth() === month &&
                           eventDate.getFullYear() === year;
                  }).length === 0 && (
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
                    {todayMeetings.length + tomorrowMeetings.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-sec">Hours booked</span>
                  <span className="font-semibold">
                    {allMeetings.length > 0
                      ? `${(allMeetings.reduce((sum, m) => {
                          const mins = parseInt(m.duration) || 0;
                          return sum + mins;
                        }, 0) / 60).toFixed(1)}h`
                      : "0h"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-sec">Meetings this week</span>
                  <span className="font-semibold">
                    {todayMeetings.length + tomorrowMeetings.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="space-y-3">
          {/* Energy Legend */}
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-text-muted" />
              <span className="text-xs font-medium text-text-muted">Energy:</span>
            </div>
            {Object.entries(ENERGY_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${val.bar}`} />
                <span className={`text-xs font-medium ${val.text}`}>{val.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose/30" />
              <span className="text-xs font-medium text-rose">Blocked</span>
            </div>
          </div>

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
              {HOURS.map((hour) => {
                const hourStr = `${String(hour).padStart(2, "0")}:00`;
                const energy = getEnergyForTime(hourStr);
                const energyColor = ENERGY_COLORS[energy.level] ?? ENERGY_COLORS.moderate;

                return (
                  <div key={hour} className="contents">
                    {/* Time label with energy bar */}
                    <div className="relative py-4 px-2 text-xs text-text-muted text-right border-b border-border">
                      <div className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r ${energyColor.bar} opacity-70`} />
                      <span>{hour > 12 ? hour - 12 : hour}{hour >= 12 ? "pm" : "am"}</span>
                    </div>
                    {[0, 1, 2, 3, 4].map((dayOffset) => {
                      // Compute the date string for this column
                      const columnDayNum = today - now.getDay() + dayOffset + 1;
                      const columnDate = new Date(year, month, columnDayNum);
                      const columnDateStr = `${columnDate.getFullYear()}-${String(columnDate.getMonth() + 1).padStart(2, "0")}-${String(columnDate.getDate()).padStart(2, "0")}`;
                      const blocked = isHourBlocked(columnDateStr, hour);

                      // Show meetings on today and tomorrow
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
                          className={`border-l border-b border-border min-h-[50px] relative transition cursor-pointer ${
                            blocked
                              ? "bg-rose/[0.06]"
                              : "hover:bg-white/[0.01]"
                          }`}
                        >
                          {blocked && (
                            <div className="absolute inset-x-1 top-1 rounded-md px-2 py-1 text-[10px] bg-rose/10 border border-rose/20 text-rose font-medium flex items-center gap-1">
                              <Lock size={10} />
                              {blocked.reason || "Blocked"}
                            </div>
                          )}
                          {!blocked && meetings.map((m) => {
                            const colors =
                              colorToOverlay[m.color] ?? "bg-accent/80 border-accent/40";
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
                          {/* External events in this slot */}
                          {!blocked && externalEvents.filter(e => {
                            const eventDate = new Date(e.startTime);
                            const eventDay = eventDate.getDate();
                            const eventHour = eventDate.getHours();
                            return eventDay === columnDayNum && eventHour === hour &&
                                   eventDate.getMonth() === month && eventDate.getFullYear() === year;
                          }).map(e => (
                            <div key={e.externalId} className="absolute inset-x-1 top-1 rounded-md px-2 py-1.5 text-xs border bg-accent/20 border-accent/30">
                              <div className="font-semibold text-accent truncate">{e.title}</div>
                              <div className="text-accent/60 truncate text-[10px]">{e.provider === "google" ? "Google" : "Outlook"}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      <BlockTimeModal
        open={blockTimeOpen}
        onClose={() => setBlockTimeOpen(false)}
        onSave={(block) =>
          setBlockedTimes((prev) => [...prev, block])
        }
      />

      {/* Reschedule Modal */}
      {rescheduleMeeting && (
        <RescheduleModal
          open={rescheduleOpen}
          onClose={() => {
            setRescheduleOpen(false);
            setRescheduleMeeting(null);
          }}
          onReschedule={(newTime, newDate, reason) => {
            // In a real app, this would call an API
            console.log("Rescheduled:", rescheduleMeeting.id, { newTime, newDate, reason });
            setRescheduleOpen(false);
            setRescheduleMeeting(null);
          }}
          bookingId={rescheduleMeeting.id}
          currentDate={`${MONTHS[month]} ${selectedDay}, ${year}`}
          currentTime={rescheduleMeeting.time}
          clientName={rescheduleMeeting.client}
          eventTitle={rescheduleMeeting.title}
        />
      )}
    </>
  );
}
