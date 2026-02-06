"use client";

import { useState, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { btn, input as inputStyles, card } from "@/lib/theme";

// ─── Types ───────────────────────────────────────────────────────

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  onReschedule: (newTime: string, newDate: string, reason: string) => void;
  bookingId: string;
  currentDate: string;
  currentTime: string;
  clientName: string;
  eventTitle: string;
  availableSlots?: { label: string; time: string }[];
}

type RescheduleReason =
  | "scheduling_conflict"
  | "client_request"
  | "emergency"
  | "other";

// ─── Default available slots ─────────────────────────────────────

const DEFAULT_SLOTS: { label: string; time: string }[] = [
  { label: "9:00 AM", time: "09:00" },
  { label: "9:30 AM", time: "09:30" },
  { label: "10:00 AM", time: "10:00" },
  { label: "10:30 AM", time: "10:30" },
  { label: "11:00 AM", time: "11:00" },
  { label: "11:30 AM", time: "11:30" },
  { label: "1:00 PM", time: "13:00" },
  { label: "1:30 PM", time: "13:30" },
  { label: "2:00 PM", time: "14:00" },
  { label: "2:30 PM", time: "14:30" },
  { label: "3:00 PM", time: "15:00" },
  { label: "3:30 PM", time: "15:30" },
  { label: "4:00 PM", time: "16:00" },
  { label: "4:30 PM", time: "16:30" },
];

// ─── AI Suggestions (demo data) ─────────────────────────────────

const AI_SUGGESTIONS = [
  { time: "10:00 AM", reason: "Within your peak energy hours" },
  { time: "2:00 PM", reason: "Good spacing from other meetings" },
  { time: "11:00 AM", reason: "Client's historically preferred time" },
];

// ─── Reason labels ───────────────────────────────────────────────

const REASON_OPTIONS: { value: RescheduleReason; label: string }[] = [
  { value: "scheduling_conflict", label: "Scheduling conflict" },
  { value: "client_request", label: "Client request" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

// ─── Calendar helpers ────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_NAMES = [
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

// ─── Component ───────────────────────────────────────────────────

export default function RescheduleModal({
  open,
  onClose,
  onReschedule,
  bookingId,
  currentDate,
  currentTime,
  clientName,
  eventTitle,
  availableSlots,
}: RescheduleModalProps) {
  // Calendar state — start with current month
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Form state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState<RescheduleReason>("scheduling_conflict");
  const [reasonNote, setReasonNote] = useState("");

  const slots = availableSlots ?? DEFAULT_SLOTS;

  // Calendar grid
  const daysInMonth = useMemo(
    () => getDaysInMonth(calYear, calMonth),
    [calYear, calMonth],
  );
  const firstDay = useMemo(
    () => getFirstDayOfMonth(calYear, calMonth),
    [calYear, calMonth],
  );

  // Build the formatted date string for the selected day
  const selectedDateStr = selectedDay
    ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";

  const selectedDateDisplay = selectedDay
    ? `${MONTH_NAMES[calMonth]} ${selectedDay}, ${calYear}`
    : "";

  // Determine which time label corresponds to selectedTime
  const selectedTimeLabel =
    slots.find((s) => s.time === selectedTime)?.label ?? selectedTime ?? "";

  // Build the full reason string
  const fullReason = reasonNote
    ? `${REASON_OPTIONS.find((r) => r.value === reason)?.label}: ${reasonNote}`
    : (REASON_OPTIONS.find((r) => r.value === reason)?.label ?? reason);

  function handleReschedule() {
    if (!selectedTime || !selectedDateStr) return;
    onReschedule(selectedTime, selectedDateStr, fullReason);
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  function isDayInPast(day: number): boolean {
    const d = new Date(calYear, calMonth, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl shadow-card w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center">
              <Calendar size={18} className="text-amber" />
            </div>
            <h2 className="text-lg font-semibold text-text">
              Reschedule Booking
            </h2>
          </div>
          <button onClick={onClose} className={btn.iconSm}>
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable content ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Current booking info */}
          <div className={`${card.base} p-4`}>
            <div className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wider">
              Current Booking
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-muted">Date:</span>{" "}
                <span className="text-text font-medium">{currentDate}</span>
              </div>
              <div>
                <span className="text-text-muted">Time:</span>{" "}
                <span className="text-text font-medium">{currentTime}</span>
              </div>
              <div>
                <span className="text-text-muted">Event:</span>{" "}
                <span className="text-text font-medium">{eventTitle}</span>
              </div>
              <div>
                <span className="text-text-muted">Client:</span>{" "}
                <span className="text-text font-medium">{clientName}</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">
              Reason for Rescheduling
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RescheduleReason)}
              className={inputStyles.select}
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Additional details (optional)"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              className={inputStyles.base}
            />
          </div>

          {/* Calendar (mini date picker) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">
              Select New Date
            </label>
            <div className={`${card.base} p-4`}>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={prevMonth}
                  className="text-text-sec hover:text-text transition text-sm font-medium px-2 py-1 rounded hover:bg-white/[0.05]"
                >
                  &larr;
                </button>
                <span className="text-sm font-semibold text-text">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="text-text-sec hover:text-text transition text-sm font-medium px-2 py-1 rounded hover:bg-white/[0.05]"
                >
                  &rarr;
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[0.65rem] font-semibold text-text-muted uppercase py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isDayInPast(day);
                  const isSelected = selectedDay === day;
                  const isToday =
                    day === today.getDate() &&
                    calMonth === today.getMonth() &&
                    calYear === today.getFullYear();

                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedTime(null);
                      }}
                      className={`w-full aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center ${
                        past
                          ? "text-text-muted/40 cursor-not-allowed"
                          : isSelected
                            ? "bg-accent text-bg font-bold"
                            : isToday
                              ? "bg-accent/15 text-accent hover:bg-accent/25"
                              : "text-text-sec hover:bg-white/[0.05] hover:text-text"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time slots */}
          {selectedDay && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">
                Available Times for {selectedDateDisplay}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition text-center ${
                      selectedTime === slot.time
                        ? "bg-accent text-bg border-accent font-bold"
                        : "border-border text-text-sec hover:border-border-hover hover:text-text"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <label className="text-sm font-medium text-accent">
                AI suggests:
              </label>
            </div>
            <div className="space-y-2">
              {AI_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.time}
                  onClick={() => {
                    // Set the day to a reasonable future date and the time
                    if (!selectedDay) {
                      const futureDay = Math.min(
                        today.getDate() + 2,
                        daysInMonth,
                      );
                      setSelectedDay(futureDay);
                    }
                    const matchSlot = slots.find(
                      (s) => s.label === suggestion.time,
                    );
                    if (matchSlot) {
                      setSelectedTime(matchSlot.time);
                    }
                  }}
                  className={`${card.base} w-full p-3 flex items-center justify-between text-left hover:bg-bg-card-hover hover:border-border-hover transition`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Clock size={14} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text">
                        {suggestion.time}
                      </div>
                      <div className="text-xs text-text-muted">
                        {suggestion.reason}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </button>
              ))}
            </div>
          </div>

          {/* Notification preview */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber/5 border border-amber/10">
            <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
            <p className="text-xs text-text-sec">
              An email will be sent to{" "}
              <span className="font-semibold text-text">{clientName}</span>{" "}
              about the schedule change.
            </p>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className={btn.ghost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={!selectedTime || !selectedDay}
            className={`${btn.primary} ${!selectedTime || !selectedDay ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Calendar size={16} />
            Reschedule Booking
          </button>
        </div>
      </div>
    </div>
  );
}
