/**
 * Shared types for calendar sync.
 *
 * These types are used by both Google Calendar and Microsoft Outlook
 * services, the sync engine, and the API routes.
 */

// ─── Provider ───────────────────────────────────────────────────

export type CalendarProvider = "google" | "microsoft";

// ─── Calendar Event (unified) ───────────────────────────────────

export interface CalendarEvent {
  /** Internal Llamame ID (if synced from our side) */
  id?: string;
  /** External provider event ID */
  externalId: string;
  /** Provider this event came from */
  provider: CalendarProvider;
  /** Calendar ID within the provider (e.g. "primary" for Google) */
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  timezone: string;
  /** Whether this is an all-day event */
  allDay: boolean;
  /** Event status */
  status: "confirmed" | "tentative" | "cancelled";
  /** Whether this event makes the user busy (for availability) */
  busy: boolean;
  /** Attendees */
  attendees?: EventAttendee[];
  /** Meeting link (Google Meet, Teams, etc.) */
  meetingUrl?: string;
  /** If this is a Llamame booking, the booking ID */
  llamameBookingId?: string;
  /** Recurrence rule (RRULE string) */
  recurrence?: string;
  /** Last modified timestamp */
  updatedAt: string; // ISO 8601
  /** Raw provider data for conflict resolution */
  rawData?: Record<string, unknown>;
}

export interface EventAttendee {
  email: string;
  name?: string;
  responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
  organizer?: boolean;
}

// ─── Calendar Connection ────────────────────────────────────────

export interface CalendarConnection {
  id: string;
  userId: string;
  provider: CalendarProvider;
  /** Provider account email */
  email: string;
  /** OAuth access token (encrypted in production) */
  accessToken: string;
  /** OAuth refresh token (encrypted in production) */
  refreshToken: string;
  /** Token expiry timestamp (ms) */
  expiresAt: number;
  /** Which calendars to sync */
  calendarIds: string[];
  /** Whether 2-way sync is enabled (vs read-only) */
  syncEnabled: boolean;
  /** Direction of sync */
  syncDirection: SyncDirection;
  /** Last successful sync timestamp */
  lastSyncAt?: number;
  /** Sync status */
  syncStatus: SyncStatus;
  /** Error message if sync failed */
  syncError?: string;
  /** Google: channel ID for push notifications. Microsoft: subscription ID */
  watchId?: string;
  /** Watch expiry */
  watchExpiresAt?: number;
  createdAt: number;
}

export type SyncDirection = "both" | "from_external" | "to_external";

export type SyncStatus = "idle" | "syncing" | "error" | "disabled";

// ─── Sync Results ───────────────────────────────────────────────

export interface SyncResult {
  provider: CalendarProvider;
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsResolved: number;
  errors: SyncError[];
  syncedAt: number;
}

export interface SyncError {
  eventId?: string;
  message: string;
  code: string;
}

// ─── Conflict ───────────────────────────────────────────────────

export interface SyncConflict {
  localEvent: CalendarEvent;
  externalEvent: CalendarEvent;
  field: string;
  localValue: string;
  externalValue: string;
}

export type ConflictResolution = "keep_local" | "keep_external" | "keep_newest";

// ─── OAuth ──────────────────────────────────────────────────────

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

export interface OAuthUserInfo {
  email: string;
  name?: string;
  picture?: string;
}

// ─── Available Calendar ─────────────────────────────────────────

export interface AvailableCalendar {
  id: string;
  name: string;
  description?: string;
  primary: boolean;
  color?: string;
  accessRole: "owner" | "writer" | "reader";
}

// ─── Busy Time (for availability checking) ─────────────────────

export interface BusyTime {
  start: string; // ISO 8601
  end: string; // ISO 8601
  provider: CalendarProvider;
  title?: string;
}
