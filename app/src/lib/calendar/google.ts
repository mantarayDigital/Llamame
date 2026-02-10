/**
 * Google Calendar API v3 service.
 * Handles OAuth, CRUD, and push notifications.
 *
 * Uses native `fetch` -- no Google SDK required.
 */

import type {
  CalendarEvent,
  CalendarConnection,
  OAuthTokenResponse,
  OAuthUserInfo,
  AvailableCalendar,
  BusyTime,
  EventAttendee,
} from "./types";

// ─── Constants ──────────────────────────────────────────────────

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

/** Buffer before actual expiry to trigger a refresh (1 minute). */
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

function getRedirectUri(): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim();
  return `${baseUrl}/api/auth/google/callback`;
}

// ─── OAuth ──────────────────────────────────────────────────────

/**
 * Generate the Google OAuth authorization URL.
 * The `state` parameter should include the user ID for callback routing.
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeGoogleCode(
  code: string,
): Promise<OAuthTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  return res.json();
}

/**
 * Refresh an expired access token.
 */
export async function refreshGoogleToken(
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token refresh failed: ${err}`);
  }

  return res.json();
}

/**
 * Get the authenticated user's email and profile info.
 */
export async function getGoogleUserInfo(
  accessToken: string,
): Promise<OAuthUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to get Google user info");
  }

  const data = await res.json();
  return { email: data.email, name: data.name, picture: data.picture };
}

// ─── Token Management ───────────────────────────────────────────

/**
 * Ensure the access token for a connection is still valid.
 *
 * Returns the current `accessToken` when it is still fresh, or silently
 * refreshes it and returns the *new* token when it has expired (using a
 * 1-minute buffer so we never send a token that is about to expire).
 *
 * Callers should persist the updated token fields back to the database
 * after calling this function.
 */
export async function ensureValidToken(
  connection: CalendarConnection,
): Promise<string> {
  const isExpired = connection.expiresAt < Date.now() - TOKEN_EXPIRY_BUFFER_MS;

  if (!isExpired) {
    return connection.accessToken;
  }

  const tokenResponse = await refreshGoogleToken(connection.refreshToken);

  // Mutate the connection object so the caller can persist the changes.
  connection.accessToken = tokenResponse.access_token;
  connection.expiresAt = Date.now() + tokenResponse.expires_in * 1000;

  // Google only returns a new refresh_token on the very first exchange, but
  // on rare occasions it may rotate the refresh token during a refresh.
  if (tokenResponse.refresh_token) {
    connection.refreshToken = tokenResponse.refresh_token;
  }

  return tokenResponse.access_token;
}

// ─── Mapping Helpers ────────────────────────────────────────────

/**
 * Map a Google Calendar API event object to our unified CalendarEvent type.
 */
export function mapGoogleEventToCalendarEvent(
  googleEvent: Record<string, any>,
  calendarId: string,
): CalendarEvent {
  const isAllDay = !googleEvent.start?.dateTime;

  // All-day events use `date` (YYYY-MM-DD), timed events use `dateTime`.
  const startTime = isAllDay
    ? googleEvent.start?.date
    : googleEvent.start?.dateTime;

  const endTime = isAllDay
    ? googleEvent.end?.date
    : googleEvent.end?.dateTime;

  const timezone =
    googleEvent.start?.timeZone ??
    googleEvent.end?.timeZone ??
    "UTC";

  // Map attendees
  const attendees: EventAttendee[] | undefined = googleEvent.attendees?.map(
    (a: Record<string, any>) => ({
      email: a.email,
      name: a.displayName,
      responseStatus: a.responseStatus ?? "needsAction",
      organizer: a.organizer ?? false,
    }),
  );

  // Extract meeting URL from conferenceData (Google Meet, Zoom, etc.)
  let meetingUrl: string | undefined;
  if (googleEvent.conferenceData?.entryPoints) {
    const videoEntry = googleEvent.conferenceData.entryPoints.find(
      (ep: Record<string, any>) => ep.entryPointType === "video",
    );
    meetingUrl = videoEntry?.uri;
  }
  // Fall back to hangoutLink when conferenceData is absent
  if (!meetingUrl && googleEvent.hangoutLink) {
    meetingUrl = googleEvent.hangoutLink;
  }

  // Google uses "transparency" to indicate busy/free.
  // "opaque" (default) = busy, "transparent" = free.
  const busy = googleEvent.transparency !== "transparent";

  // Map Google status values to our status union.
  let status: CalendarEvent["status"] = "confirmed";
  if (googleEvent.status === "tentative") {
    status = "tentative";
  } else if (googleEvent.status === "cancelled") {
    status = "cancelled";
  }

  // Extract Llamame booking ID from extended properties if present.
  const llamameBookingId: string | undefined =
    googleEvent.extendedProperties?.private?.llamameBookingId;

  // Recurrence: Google returns an array of RRULE strings; take the first.
  const recurrence: string | undefined = googleEvent.recurrence?.[0];

  return {
    externalId: googleEvent.id,
    provider: "google",
    calendarId,
    title: googleEvent.summary ?? "(No title)",
    description: googleEvent.description,
    location: googleEvent.location,
    startTime: startTime ?? "",
    endTime: endTime ?? "",
    timezone,
    allDay: isAllDay,
    status,
    busy,
    attendees,
    meetingUrl,
    llamameBookingId,
    recurrence,
    updatedAt: googleEvent.updated ?? new Date().toISOString(),
    rawData: googleEvent,
  };
}

/**
 * Map our CalendarEvent (or a partial of it) to the Google Calendar API
 * event body used for create and update operations.
 */
export function mapCalendarEventToGoogleEvent(
  event: Partial<CalendarEvent>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (event.title !== undefined) {
    body.summary = event.title;
  }

  if (event.description !== undefined) {
    body.description = event.description;
  }

  if (event.location !== undefined) {
    body.location = event.location;
  }

  // Start / end
  if (event.startTime !== undefined) {
    if (event.allDay) {
      // All-day events use date (YYYY-MM-DD), strip any time component.
      body.start = { date: event.startTime.slice(0, 10) };
    } else {
      body.start = {
        dateTime: event.startTime,
        timeZone: event.timezone ?? "UTC",
      };
    }
  }

  if (event.endTime !== undefined) {
    if (event.allDay) {
      body.end = { date: event.endTime.slice(0, 10) };
    } else {
      body.end = {
        dateTime: event.endTime,
        timeZone: event.timezone ?? "UTC",
      };
    }
  }

  // Status
  if (event.status !== undefined) {
    body.status = event.status;
  }

  // Busy / free
  if (event.busy !== undefined) {
    body.transparency = event.busy ? "opaque" : "transparent";
  }

  // Attendees
  if (event.attendees !== undefined) {
    body.attendees = event.attendees.map((a) => ({
      email: a.email,
      displayName: a.name,
      responseStatus: a.responseStatus,
      organizer: a.organizer,
    }));
  }

  // Recurrence
  if (event.recurrence !== undefined) {
    body.recurrence = [event.recurrence];
  }

  // Store Llamame booking ID in extended properties so we can identify
  // our own events when syncing back from Google.
  if (event.llamameBookingId !== undefined) {
    body.extendedProperties = {
      private: { llamameBookingId: event.llamameBookingId },
    };
  }

  return body;
}

// ─── Calendar CRUD ──────────────────────────────────────────────

/**
 * List all calendars the authenticated user has access to.
 */
export async function listGoogleCalendars(
  accessToken: string,
): Promise<AvailableCalendar[]> {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list Google calendars: ${err}`);
  }

  const data = await res.json();

  return (data.items ?? []).map(
    (cal: Record<string, any>): AvailableCalendar => ({
      id: cal.id,
      name: cal.summary ?? cal.id,
      description: cal.description,
      primary: cal.primary ?? false,
      color: cal.backgroundColor,
      accessRole: cal.accessRole,
    }),
  );
}

/**
 * List events in a calendar within a time range.
 */
export async function listGoogleEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list Google events: ${err}`);
  }

  const data = await res.json();

  return (data.items ?? []).map((item: Record<string, any>) =>
    mapGoogleEventToCalendarEvent(item, calendarId),
  );
}

/**
 * Create a new event in the specified calendar.
 *
 * When the event includes a `meetingUrl`, we request automatic conference
 * data creation (conferenceDataVersion=1).
 */
export async function createGoogleEvent(
  accessToken: string,
  calendarId: string,
  event: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
  const body = mapCalendarEventToGoogleEvent(event);

  const params = new URLSearchParams();
  if (event.meetingUrl !== undefined) {
    params.set("conferenceDataVersion", "1");
  }

  const queryString = params.toString();
  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google event: ${err}`);
  }

  const created = await res.json();
  return mapGoogleEventToCalendarEvent(created, calendarId);
}

/**
 * Update (patch) an existing event.
 */
export async function updateGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
  const body = mapCalendarEventToGoogleEvent(event);

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update Google event: ${err}`);
  }

  const updated = await res.json();
  return mapGoogleEventToCalendarEvent(updated, calendarId);
}

/**
 * Delete an event from a calendar.
 */
export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete Google event: ${err}`);
  }
}

// ─── FreeBusy ───────────────────────────────────────────────────

/**
 * Query free/busy information across one or more calendars.
 */
export async function getGoogleBusyTimes(
  accessToken: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string,
): Promise<BusyTime[]> {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: calendarIds.map((id) => ({ id })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Google busy times: ${err}`);
  }

  const data = await res.json();
  const busyTimes: BusyTime[] = [];

  // The response contains a `calendars` map keyed by calendar ID.
  // Each entry has a `busy` array of { start, end } objects.
  if (data.calendars) {
    for (const calendarId of Object.keys(data.calendars)) {
      const calendar = data.calendars[calendarId];
      if (calendar.busy) {
        for (const slot of calendar.busy) {
          busyTimes.push({
            start: slot.start,
            end: slot.end,
            provider: "google",
          });
        }
      }
    }
  }

  return busyTimes;
}

// ─── Push Notifications (Watch) ─────────────────────────────────

/**
 * Subscribe to push notifications for changes in a calendar.
 *
 * Google will POST to `webhookUrl` whenever events in the calendar change.
 * The subscription expires after a server-determined period (usually ~7 days).
 */
export async function watchGoogleCalendar(
  accessToken: string,
  calendarId: string,
  webhookUrl: string,
  channelId: string,
): Promise<{ expiration: number }> {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to watch Google calendar: ${err}`);
  }

  const data = await res.json();

  // Google returns `expiration` as a string of milliseconds since epoch.
  return { expiration: Number(data.expiration) };
}

/**
 * Stop an existing push notification channel.
 */
export async function stopGoogleWatch(
  accessToken: string,
  channelId: string,
  resourceId: string,
): Promise<void> {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/channels/stop`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        resourceId,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to stop Google watch: ${err}`);
  }
}
