/**
 * Slot generation engine.
 *
 * Computes available time slots from an event type's availability rules,
 * existing bookings, buffer times, minimum notice, and max advance settings.
 */

import type { AvailabilityRule, DateOverride, Booking } from "./types";

interface SlotGenerationInput {
  /** Date to generate slots for (YYYY-MM-DD) */
  date: string;
  /** Duration of the event in minutes */
  duration: number;
  /** Availability rules (which days/hours are open) */
  availability: AvailabilityRule[];
  /** Date overrides (holidays, special hours) */
  dateOverrides?: DateOverride[];
  /** Existing bookings to check for conflicts */
  existingBookings?: Pick<Booking, "startTime" | "endTime">[];
  /** Buffer before each meeting in minutes */
  bufferBefore?: number;
  /** Buffer after each meeting in minutes */
  bufferAfter?: number;
  /** Minimum notice in hours */
  minNotice?: number;
  /** Maximum advance booking in days */
  maxAdvance?: number;
  /** Max bookings per day */
  maxPerDay?: number;
  /** Slot interval in minutes (default: 15) */
  slotInterval?: number;
  /** User timezone */
  timezone?: string;
}

export interface TimeSlot {
  /** Display label e.g. "9:00 AM" */
  label: string;
  /** ISO-ish time string e.g. "09:00" */
  time: string;
  /** Whether this slot is available */
  available: boolean;
}

/**
 * Generate available time slots for a given date.
 */
export function generateSlots(input: SlotGenerationInput): TimeSlot[] {
  const {
    date,
    duration,
    availability,
    dateOverrides = [],
    existingBookings = [],
    bufferBefore = 0,
    bufferAfter = 0,
    minNotice = 0,
    maxAdvance = 0,
    maxPerDay = 0,
    slotInterval = 15,
  } = input;

  const targetDate = new Date(date + "T00:00:00");
  const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ...
  const now = new Date();

  // Check max advance
  if (maxAdvance > 0) {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvance);
    if (targetDate > maxDate) return [];
  }

  // Check date override
  const override = dateOverrides.find((o) => o.date === date);
  if (override && !override.available) return [];

  // Get the working hours for this day
  let dayRules: { startTime: string; endTime: string }[];
  if (override?.available && override.startTime && override.endTime) {
    dayRules = [{ startTime: override.startTime, endTime: override.endTime }];
  } else {
    dayRules = availability.filter((r) => r.day === dayOfWeek);
  }

  if (dayRules.length === 0) return [];

  const slots: TimeSlot[] = [];
  let dailyBookingCount = existingBookings.filter((b) => {
    const bDate = new Date(b.startTime);
    return (
      bDate.getFullYear() === targetDate.getFullYear() &&
      bDate.getMonth() === targetDate.getMonth() &&
      bDate.getDate() === targetDate.getDate()
    );
  }).length;

  for (const rule of dayRules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    for (let min = startMin; min + duration <= endMin; min += slotInterval) {
      const hours = Math.floor(min / 60);
      const mins = min % 60;
      const time = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

      // Format label
      const period = hours >= 12 ? "PM" : "AM";
      const displayH = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const label = `${displayH}:${String(mins).padStart(2, "0")} ${period}`;

      // Check min notice
      const slotTime = new Date(date + `T${time}:00`);
      const hoursUntil = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (minNotice > 0 && hoursUntil < minNotice) {
        slots.push({ label, time, available: false });
        continue;
      }

      // Check past slots
      if (slotTime <= now) {
        slots.push({ label, time, available: false });
        continue;
      }

      // Check max per day
      if (maxPerDay > 0 && dailyBookingCount >= maxPerDay) {
        slots.push({ label, time, available: false });
        continue;
      }

      // Check conflicts with existing bookings (including buffer)
      const slotStart = slotTime.getTime() - bufferBefore * 60 * 1000;
      const slotEnd = slotTime.getTime() + duration * 60 * 1000 + bufferAfter * 60 * 1000;

      const hasConflict = existingBookings.some((b) => {
        const bStart = b.startTime;
        const bEnd = b.endTime;
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (hasConflict) {
        slots.push({ label, time, available: false });
        continue;
      }

      slots.push({ label, time, available: true });
    }
  }

  return slots;
}

/**
 * Get available dates for a month (dates that have at least one rule).
 */
export function getAvailableDates(
  year: number,
  month: number,
  availability: AvailabilityRule[],
  dateOverrides: DateOverride[] = []
): Set<number> {
  const available = new Set<number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const override = dateOverrides.find((o) => o.date === dateStr);
    if (override) {
      if (override.available) available.add(d);
      continue;
    }

    if (availability.some((r) => r.day === dayOfWeek)) {
      available.add(d);
    }
  }

  return available;
}
