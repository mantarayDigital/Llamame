/**
 * Scheduling intelligence — energy-aware scheduling and fatigue protection.
 *
 * Energy Levels:
 * - Peak hours get high-effort meetings (strategy sessions, workshops)
 * - Low hours get light meetings (check-ins, internal syncs)
 * - Fatigue protection warns when thresholds are exceeded
 */

import type { EnergyProfile, MeetingListItem } from "./types";

// ─── Energy-Aware Scheduling ────────────────────────────────────

export type EnergyLevel = "peak" | "focus" | "moderate" | "low";

export interface EnergySlotInfo {
  level: EnergyLevel;
  label: string;
  color: string;
  /** 0–100 energy score for the time */
  score: number;
  /** Recommended meeting types for this energy level */
  recommended: string[];
}

const DEFAULT_PROFILE: EnergyProfile = {
  peakStart: "09:00",
  peakEnd: "11:00",
  lowStart: "16:00",
  lowEnd: "18:00",
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Get energy level info for a given time.
 */
export function getEnergyForTime(
  time: string,
  profile: EnergyProfile = DEFAULT_PROFILE
): EnergySlotInfo {
  const min = timeToMinutes(time);
  const peakStart = timeToMinutes(profile.peakStart);
  const peakEnd = timeToMinutes(profile.peakEnd);
  const lowStart = timeToMinutes(profile.lowStart);
  const lowEnd = timeToMinutes(profile.lowEnd);

  if (min >= peakStart && min < peakEnd) {
    return {
      level: "peak",
      label: "Peak Energy",
      color: "bg-green",
      score: 90,
      recommended: ["Strategy Session", "Workshop", "Important Client Call"],
    };
  }

  if (min >= peakEnd && min < peakEnd + 120) {
    return {
      level: "focus",
      label: "Focus Time",
      color: "bg-accent",
      score: 70,
      recommended: ["Discovery Call", "Deep Work", "Planning"],
    };
  }

  if (min >= lowStart && min < lowEnd) {
    return {
      level: "low",
      label: "Low Energy",
      color: "bg-rose",
      score: 30,
      recommended: ["Quick Check-in", "Internal Sync", "Admin Tasks"],
    };
  }

  return {
    level: "moderate",
    label: "Moderate Energy",
    color: "bg-amber",
    score: 55,
    recommended: ["Discovery Call", "Review Meeting", "Check-in"],
  };
}

// ─── Fatigue Protection ─────────────────────────────────────────

export interface FatigueWarning {
  type: "overloaded" | "back_to_back" | "long_day" | "no_breaks";
  severity: "warning" | "critical";
  message: string;
  suggestion: string;
}

interface FatigueCheckInput {
  /** Meetings for the day */
  meetings: Pick<MeetingListItem, "time" | "duration">[];
  /** Maximum recommended meetings per day */
  maxPerDay?: number;
  /** Maximum consecutive hours of meetings */
  maxConsecutiveHours?: number;
  /** Required break between meetings in minutes */
  minBreakMinutes?: number;
}

/**
 * Check a day's schedule for fatigue warnings.
 */
export function checkFatigue(input: FatigueCheckInput): FatigueWarning[] {
  const {
    meetings,
    maxPerDay = 6,
    maxConsecutiveHours = 3,
    minBreakMinutes = 15,
  } = input;
  const warnings: FatigueWarning[] = [];

  if (meetings.length === 0) return [];

  // Check overloaded day
  if (meetings.length >= maxPerDay) {
    warnings.push({
      type: "overloaded",
      severity: meetings.length >= maxPerDay + 2 ? "critical" : "warning",
      message: `${meetings.length} meetings scheduled — exceeds your ${maxPerDay} meeting limit.`,
      suggestion: "Consider rescheduling non-essential meetings to another day.",
    });
  }

  // Parse meetings into time ranges
  const sorted = [...meetings]
    .map((m) => {
      const [h, mStr] = m.time.split(":").map(Number);
      const startMin = h * 60 + (mStr || 0);
      const dur = parseInt(m.duration) || 30;
      return { startMin, endMin: startMin + dur };
    })
    .sort((a, b) => a.startMin - b.startMin);

  // Check back-to-back
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].startMin - sorted[i].endMin;
    if (gap < minBreakMinutes) {
      warnings.push({
        type: "back_to_back",
        severity: "warning",
        message: "Back-to-back meetings without a break detected.",
        suggestion: `Add at least ${minBreakMinutes} minutes between meetings for mental reset.`,
      });
      break;
    }
  }

  // Check long day span
  if (sorted.length >= 2) {
    const daySpan = sorted[sorted.length - 1].endMin - sorted[0].startMin;
    if (daySpan > 8 * 60) {
      warnings.push({
        type: "long_day",
        severity: "warning",
        message: `Meetings span ${Math.round(daySpan / 60)} hours — that's a long day.`,
        suggestion: "Try to cluster meetings in shorter blocks.",
      });
    }
  }

  // Check consecutive meeting blocks
  let consecutiveStart = sorted[0].startMin;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].startMin - sorted[i].endMin;
    if (gap >= 30) {
      consecutiveStart = sorted[i + 1].startMin;
    } else {
      const consecutiveHours =
        (sorted[i + 1].endMin - consecutiveStart) / 60;
      if (consecutiveHours >= maxConsecutiveHours) {
        warnings.push({
          type: "no_breaks",
          severity: "critical",
          message: `${Math.round(consecutiveHours)} hours of consecutive meetings.`,
          suggestion:
            "Block a 30-minute break to avoid burnout. Your best ideas come after rest.",
        });
        break;
      }
    }
  }

  return warnings;
}

// ─── Smart Scheduling Suggestions ───────────────────────────────

export interface SchedulingSuggestion {
  type: "energy_match" | "conflict_warning" | "optimization";
  message: string;
}

/**
 * Generate smart scheduling suggestions for a meeting.
 */
export function getSchedulingSuggestions(
  meetingTitle: string,
  time: string,
  profile: EnergyProfile = DEFAULT_PROFILE
): SchedulingSuggestion[] {
  const suggestions: SchedulingSuggestion[] = [];
  const energy = getEnergyForTime(time, profile);
  const titleLower = meetingTitle.toLowerCase();

  // Check if high-effort meeting is in low energy
  const isHighEffort =
    titleLower.includes("strategy") ||
    titleLower.includes("workshop") ||
    titleLower.includes("presentation");

  if (isHighEffort && energy.level === "low") {
    suggestions.push({
      type: "energy_match",
      message: `"${meetingTitle}" is a high-effort session — consider moving it to your peak hours (${profile.peakStart}–${profile.peakEnd}).`,
    });
  }

  // Check if low-effort meeting is in peak energy
  const isLowEffort =
    titleLower.includes("check-in") ||
    titleLower.includes("sync") ||
    titleLower.includes("standup");

  if (isLowEffort && energy.level === "peak") {
    suggestions.push({
      type: "optimization",
      message: `"${meetingTitle}" is a quick meeting — save your peak hours for high-impact work.`,
    });
  }

  return suggestions;
}
