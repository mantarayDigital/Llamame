/**
 * Calendar sync engine.
 *
 * Handles bidirectional synchronization:
 * 1. Push: Llamame bookings → external calendar events
 * 2. Pull: External calendar events → Llamame availability blocking
 * 3. Conflict resolution when both sides change
 */

import type {
  CalendarEvent,
  CalendarConnection,
  CalendarProvider,
  SyncResult,
  SyncError,
  SyncConflict,
  ConflictResolution,
  BusyTime,
} from "./types";

import {
  listGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  getGoogleBusyTimes,
  ensureValidToken as ensureGoogleToken,
} from "./google";

import {
  listMicrosoftEvents,
  createMicrosoftEvent,
  updateMicrosoftEvent,
  deleteMicrosoftEvent,
  getMicrosoftBusyTimes,
  ensureMicrosoftToken,
} from "./microsoft";

// ─── Local Types ────────────────────────────────────────────────

export interface SyncOptions {
  /** Days in the past to include */
  pastDays?: number;
  /** Days in the future to include */
  futureDays?: number;
  /** Conflict resolution strategy */
  conflictResolution?: ConflictResolution;
  /** Dry run (don't actually push/pull) */
  dryRun?: boolean;
}

export interface ChangeSet {
  localNew: CalendarEvent[];
  externalNew: CalendarEvent[];
  localUpdated: CalendarEvent[];
  externalUpdated: CalendarEvent[];
  conflicts: SyncConflict[];
}

export interface ResolvedConflict {
  conflict: SyncConflict;
  winner: "local" | "external";
  resolvedEvent: CalendarEvent;
}

// ─── Constants ──────────────────────────────────────────────────

const DEFAULT_PAST_DAYS = 7;
const DEFAULT_FUTURE_DAYS = 30;
const LLAMAME_PREFIX = "[Llamame]";

// ─── Main Sync ──────────────────────────────────────────────────

/**
 * Run a full bidirectional sync for a single calendar connection.
 *
 * Steps:
 *  1. Ensure the OAuth token is still valid (refresh if needed).
 *  2. Compute the sync window.
 *  3. Pull external events for that window.
 *  4. Detect changes between local and external events.
 *  5. Resolve any conflicts.
 *  6. Push local-side changes to the external calendar.
 *  7. Return a SyncResult summarising what happened.
 */
export async function syncCalendar(
  connection: CalendarConnection,
  localEvents: CalendarEvent[],
  options?: SyncOptions,
): Promise<SyncResult> {
  const errors: SyncError[] = [];
  let eventsCreated = 0;
  let eventsUpdated = 0;
  let eventsDeleted = 0;
  let conflictsResolved = 0;

  const pastDays = options?.pastDays ?? DEFAULT_PAST_DAYS;
  const futureDays = options?.futureDays ?? DEFAULT_FUTURE_DAYS;
  const strategy = options?.conflictResolution ?? "keep_local";
  const dryRun = options?.dryRun ?? false;

  try {
    // 1. Ensure token is valid
    await ensureTokenValid(connection);

    // 2. Compute sync window
    const now = new Date();
    const timeMin = new Date(
      now.getTime() - pastDays * 24 * 60 * 60 * 1000,
    ).toISOString();
    const timeMax = new Date(
      now.getTime() + futureDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 3. Pull external events
    const externalEvents = await pullExternalEvents(
      connection,
      timeMin,
      timeMax,
    );

    // 4. Detect changes
    const changes = detectChanges(localEvents, externalEvents);

    // 5. Resolve conflicts
    const resolved = resolveConflicts(changes.conflicts, strategy);
    conflictsResolved = resolved.length;

    if (dryRun) {
      return {
        provider: connection.provider,
        success: true,
        eventsCreated: changes.localNew.length + changes.externalNew.length,
        eventsUpdated:
          changes.localUpdated.length + changes.externalUpdated.length,
        eventsDeleted: 0,
        conflictsResolved,
        errors,
        syncedAt: Date.now(),
      };
    }

    // 6a. Push local-new events to external
    if (
      connection.syncDirection === "both" ||
      connection.syncDirection === "to_external"
    ) {
      for (const event of changes.localNew) {
        try {
          await pushEventToExternal(connection, event);
          eventsCreated++;
        } catch (err) {
          errors.push({
            eventId: event.id ?? event.externalId,
            message:
              err instanceof Error ? err.message : "Failed to push event",
            code: "PUSH_CREATE_FAILED",
          });
        }
      }

      // 6b. Push local-updated events to external
      for (const event of changes.localUpdated) {
        try {
          await pushEventToExternal(connection, event);
          eventsUpdated++;
        } catch (err) {
          errors.push({
            eventId: event.id ?? event.externalId,
            message:
              err instanceof Error ? err.message : "Failed to update event",
            code: "PUSH_UPDATE_FAILED",
          });
        }
      }
    }

    // 6c. Count external-new events that were pulled
    if (
      connection.syncDirection === "both" ||
      connection.syncDirection === "from_external"
    ) {
      eventsCreated += changes.externalNew.length;
      eventsUpdated += changes.externalUpdated.length;
    }

    // 6d. Apply resolved conflicts — push winners to the losing side
    for (const { conflict, winner } of resolved) {
      try {
        if (
          winner === "local" &&
          (connection.syncDirection === "both" ||
            connection.syncDirection === "to_external")
        ) {
          await pushEventToExternal(connection, conflict.localEvent);
          eventsUpdated++;
        }
        // If winner is "external", the caller is responsible for
        // persisting the external version locally (returned in the
        // changeSet's externalUpdated).
      } catch (err) {
        errors.push({
          eventId:
            conflict.localEvent.id ?? conflict.localEvent.externalId,
          message:
            err instanceof Error
              ? err.message
              : "Failed to resolve conflict",
          code: "CONFLICT_RESOLUTION_FAILED",
        });
      }
    }

    return {
      provider: connection.provider,
      success: errors.length === 0,
      eventsCreated,
      eventsUpdated,
      eventsDeleted,
      conflictsResolved,
      errors,
      syncedAt: Date.now(),
    };
  } catch (err) {
    errors.push({
      message:
        err instanceof Error ? err.message : "Unknown sync error",
      code: "SYNC_FAILED",
    });

    return {
      provider: connection.provider,
      success: false,
      eventsCreated,
      eventsUpdated,
      eventsDeleted,
      conflictsResolved,
      errors,
      syncedAt: Date.now(),
    };
  }
}

// ─── Change Detection ───────────────────────────────────────────

/**
 * Compare local and external event lists and categorise every event
 * into one of: new on local side, new on external side, updated on
 * either side, or in conflict (modified on both sides).
 *
 * Matching is done by `llamameBookingId` (preferred) or `externalId`.
 */
export function detectChanges(
  localEvents: CalendarEvent[],
  externalEvents: CalendarEvent[],
): ChangeSet {
  const localNew: CalendarEvent[] = [];
  const externalNew: CalendarEvent[] = [];
  const localUpdated: CalendarEvent[] = [];
  const externalUpdated: CalendarEvent[] = [];
  const conflicts: SyncConflict[] = [];

  // Build lookup maps for external events
  const externalByExternalId = new Map<string, CalendarEvent>();
  const externalByBookingId = new Map<string, CalendarEvent>();

  for (const ext of externalEvents) {
    if (ext.externalId) {
      externalByExternalId.set(ext.externalId, ext);
    }
    if (ext.llamameBookingId) {
      externalByBookingId.set(ext.llamameBookingId, ext);
    }
  }

  // Track which external events have been matched
  const matchedExternalIds = new Set<string>();

  // Walk through local events
  for (const local of localEvents) {
    // Try to find a matching external event
    let matched: CalendarEvent | undefined;

    if (local.llamameBookingId) {
      matched = externalByBookingId.get(local.llamameBookingId);
    }
    if (!matched && local.externalId) {
      matched = externalByExternalId.get(local.externalId);
    }

    if (!matched) {
      // No external counterpart → new on local side
      localNew.push(local);
      continue;
    }

    matchedExternalIds.add(matched.externalId);

    // Both exist — check for changes
    const localTime = new Date(local.updatedAt).getTime();
    const externalTime = new Date(matched.updatedAt).getTime();
    const hasLocalChanges = hasEventChanged(local, matched);
    const hasExternalChanges = hasEventChanged(matched, local);

    if (hasLocalChanges && hasExternalChanges) {
      // Both sides changed → conflict
      const diff = diffEvents(local, matched);
      for (const conflict of diff) {
        conflicts.push(conflict);
      }
    } else if (hasLocalChanges && localTime > externalTime) {
      localUpdated.push(local);
    } else if (hasExternalChanges && externalTime > localTime) {
      externalUpdated.push(matched);
    }
    // If timestamps are equal or no meaningful changes, skip (already in sync).
  }

  // Any unmatched external events are new on the external side
  for (const ext of externalEvents) {
    if (!matchedExternalIds.has(ext.externalId)) {
      // Check it wasn't matched via bookingId either
      const wasMatched =
        ext.llamameBookingId != null &&
        localEvents.some(
          (l) => l.llamameBookingId === ext.llamameBookingId,
        );
      if (!wasMatched) {
        externalNew.push(ext);
      }
    }
  }

  return {
    localNew,
    externalNew,
    localUpdated,
    externalUpdated,
    conflicts,
  };
}

// ─── Conflict Resolution ────────────────────────────────────────

/**
 * Given a list of sync conflicts and a resolution strategy, decide
 * which version of each conflicting event should win.
 */
export function resolveConflicts(
  conflicts: SyncConflict[],
  strategy: ConflictResolution,
): ResolvedConflict[] {
  // Group conflicts by event pair (there can be multiple field-level
  // conflicts for the same event pair).
  const grouped = groupConflictsByEvent(conflicts);

  const resolved: ResolvedConflict[] = [];

  for (const group of grouped) {
    const first = group[0];
    let winner: "local" | "external";

    switch (strategy) {
      case "keep_local":
        winner = "local";
        break;

      case "keep_external":
        winner = "external";
        break;

      case "keep_newest": {
        const localTime = new Date(first.localEvent.updatedAt).getTime();
        const extTime = new Date(first.externalEvent.updatedAt).getTime();
        winner = localTime >= extTime ? "local" : "external";
        break;
      }

      default:
        winner = "local";
    }

    // Use the first conflict in the group as representative; the
    // resolvedEvent is whichever side won.
    resolved.push({
      conflict: first,
      winner,
      resolvedEvent:
        winner === "local" ? first.localEvent : first.externalEvent,
    });
  }

  return resolved;
}

// ─── Push ───────────────────────────────────────────────────────

/**
 * Create or update an event in the external calendar.
 *
 * - If the event already has an `externalId`, we update.
 * - Otherwise we create a new external event.
 * - A `[Llamame]` prefix is added to the title so users can identify
 *   synced events at a glance.
 */
export async function pushEventToExternal(
  connection: CalendarConnection,
  event: CalendarEvent,
): Promise<CalendarEvent> {
  await ensureTokenValid(connection);

  // Tag the event so it's identifiable in the external calendar
  const taggedEvent: CalendarEvent = {
    ...event,
    title: event.title.startsWith(LLAMAME_PREFIX)
      ? event.title
      : `${LLAMAME_PREFIX} ${event.title}`,
  };

  const hasExternalId =
    taggedEvent.externalId != null && taggedEvent.externalId !== "";

  const token = connection.accessToken;
  const calId = connection.calendarIds[0] ?? "primary";

  if (connection.provider === "google") {
    if (hasExternalId) {
      return await updateGoogleEvent(token, calId, taggedEvent.externalId, taggedEvent);
    }
    return await createGoogleEvent(token, calId, taggedEvent);
  }

  if (connection.provider === "microsoft") {
    if (hasExternalId) {
      return await updateMicrosoftEvent(token, calId, taggedEvent.externalId, taggedEvent);
    }
    return await createMicrosoftEvent(token, calId, taggedEvent);
  }

  throw new Error(`Unsupported provider: ${connection.provider as string}`);
}

// ─── Pull ───────────────────────────────────────────────────────

/**
 * Fetch all events from the external calendar for the given time range.
 *
 * Iterates over every calendar ID configured on the connection and
 * merges the results into a single flat list.
 */
export async function pullExternalEvents(
  connection: CalendarConnection,
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  await ensureTokenValid(connection);

  const allEvents: CalendarEvent[] = [];

  for (const calendarId of connection.calendarIds) {
    try {
      let events: CalendarEvent[];

      if (connection.provider === "google") {
        events = await listGoogleEvents(connection.accessToken, calendarId, timeMin, timeMax);
      } else if (connection.provider === "microsoft") {
        events = await listMicrosoftEvents(connection.accessToken, calendarId, timeMin, timeMax);
      } else {
        throw new Error(
          `Unsupported provider: ${connection.provider as string}`,
        );
      }

      allEvents.push(...events);
    } catch (err) {
      // Log but continue — one failing calendar shouldn't block the rest
      console.error(
        `[calendar-sync] Failed to pull events from ${connection.provider}/${calendarId}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return allEvents;
}

// ─── Busy Times ─────────────────────────────────────────────────

/**
 * Fetch busy/free information from the external calendar.
 *
 * This is the primary mechanism for preventing double-bookings:
 * Llamame checks these busy times before offering appointment slots.
 */
export async function getBusyTimesFromExternal(
  connection: CalendarConnection,
  timeMin: string,
  timeMax: string,
): Promise<BusyTime[]> {
  await ensureTokenValid(connection);

  try {
    if (connection.provider === "google") {
      return await getGoogleBusyTimes(
        connection.accessToken,
        connection.calendarIds,
        timeMin,
        timeMax,
      );
    }

    if (connection.provider === "microsoft") {
      return await getMicrosoftBusyTimes(
        connection.accessToken,
        connection.calendarIds,
        timeMin,
        timeMax,
        "UTC",
      );
    }

    throw new Error(`Unsupported provider: ${connection.provider as string}`);
  } catch (err) {
    console.error(
      `[calendar-sync] Failed to fetch busy times from ${connection.provider}:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

// ─── Booking → CalendarEvent Mapping ────────────────────────────

/**
 * Convert a Llamame booking into a unified CalendarEvent that can be
 * pushed to any external calendar provider.
 */
export function mapBookingToCalendarEvent(booking: {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  startTime: number;
  endTime: number;
  timezone: string;
  meetingUrl?: string;
  description?: string;
}): CalendarEvent {
  const startTime = new Date(booking.startTime).toISOString();
  const endTime = new Date(booking.endTime).toISOString();

  const descriptionParts: string[] = [];
  if (booking.description) {
    descriptionParts.push(booking.description);
  }
  descriptionParts.push(`Client: ${booking.clientName} (${booking.clientEmail})`);
  if (booking.meetingUrl) {
    descriptionParts.push(`Meeting link: ${booking.meetingUrl}`);
  }
  descriptionParts.push("Booked via Llamame");

  return {
    // No `id` yet — will be assigned after sync
    externalId: "",
    provider: "google", // Default; overwritten by push logic
    calendarId: "primary",
    title: `${LLAMAME_PREFIX} ${booking.title}`,
    description: descriptionParts.join("\n\n"),
    startTime,
    endTime,
    timezone: booking.timezone,
    allDay: false,
    status: "confirmed",
    busy: true,
    attendees: [
      {
        email: booking.clientEmail,
        name: booking.clientName,
        responseStatus: "needsAction",
      },
    ],
    meetingUrl: booking.meetingUrl,
    llamameBookingId: booking.id,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Internal Helpers ───────────────────────────────────────────

/**
 * Ensure the connection's OAuth token is still valid, refreshing if
 * necessary.  Mutates `connection.accessToken` / `connection.expiresAt`
 * in-place so downstream calls use the fresh token.
 */
async function ensureTokenValid(
  connection: CalendarConnection,
): Promise<void> {
  if (connection.provider === "google") {
    await ensureGoogleToken(connection);
  } else if (connection.provider === "microsoft") {
    await ensureMicrosoftToken(connection);
  }
}

/**
 * Shallow check: does `a` differ from `b` in any user-visible field?
 */
function hasEventChanged(a: CalendarEvent, b: CalendarEvent): boolean {
  return (
    a.title !== b.title ||
    a.description !== b.description ||
    a.startTime !== b.startTime ||
    a.endTime !== b.endTime ||
    a.location !== b.location ||
    a.status !== b.status
  );
}

/**
 * Produce a list of per-field SyncConflicts for two events that have
 * diverged on both sides.
 */
function diffEvents(
  local: CalendarEvent,
  external: CalendarEvent,
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];
  const fields: (keyof CalendarEvent)[] = [
    "title",
    "description",
    "startTime",
    "endTime",
    "location",
    "status",
  ];

  for (const field of fields) {
    const lv = local[field];
    const ev = external[field];
    if (lv !== ev) {
      conflicts.push({
        localEvent: local,
        externalEvent: external,
        field,
        localValue: String(lv ?? ""),
        externalValue: String(ev ?? ""),
      });
    }
  }

  return conflicts;
}

/**
 * Group an array of SyncConflicts so that conflicts belonging to the
 * same event pair are kept together (they share externalId or
 * llamameBookingId).
 */
function groupConflictsByEvent(
  conflicts: SyncConflict[],
): SyncConflict[][] {
  const map = new Map<string, SyncConflict[]>();

  for (const c of conflicts) {
    const key =
      c.localEvent.llamameBookingId ??
      c.localEvent.externalId ??
      c.externalEvent.externalId;

    const group = map.get(key);
    if (group) {
      group.push(c);
    } else {
      map.set(key, [c]);
    }
  }

  return Array.from(map.values());
}
