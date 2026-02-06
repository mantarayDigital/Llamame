/**
 * Microsoft Graph Calendar API service.
 * Handles OAuth, CRUD, and change notifications for Outlook calendars.
 *
 * Uses native `fetch` — no Microsoft SDK required.
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

const MS_AUTH_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MS_TOKEN_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MS_GRAPH_URL = "https://graph.microsoft.com/v1.0";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "Calendars.ReadWrite",
  "User.Read",
].join(" ");

/** Maximum number of pages we will follow for paginated Graph responses. */
const MAX_PAGES = 20;

/** Token refresh buffer — refresh 5 minutes before actual expiry. */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/** Default subscription expiry — 3 days (maximum for calendar resources). */
const SUBSCRIPTION_EXPIRY_MINUTES = 4230; // ~2.94 days (max allowed is 4230)

// ─── Helpers (internal) ─────────────────────────────────────────

function getClientId(): string {
  const id = process.env.MICROSOFT_CLIENT_ID;
  if (!id) throw new Error("MICROSOFT_CLIENT_ID is not set");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!secret) throw new Error("MICROSOFT_CLIENT_SECRET is not set");
  return secret;
}

function getRedirectUri(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/auth/microsoft/callback`;
}

/**
 * Generic wrapper around `fetch` that throws on non-OK responses with the
 * Graph API error body included.
 */
async function graphFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorBody: string;
    try {
      errorBody = JSON.stringify(await response.json());
    } catch {
      errorBody = await response.text();
    }
    throw new Error(
      `Microsoft Graph API error (${response.status}): ${errorBody}`,
    );
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Build standard Authorization + JSON headers for Graph requests.
 */
function graphHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

// ─── OAuth ──────────────────────────────────────────────────────

/**
 * Build the Microsoft OAuth 2.0 authorization URL.
 *
 * @param state - An opaque CSRF / session state value.
 * @returns The full authorization URL to redirect the user to.
 */
export function getMicrosoftAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    state,
    prompt: "consent",
    response_mode: "query",
  });

  return `${MS_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeMicrosoftCode(
  code: string,
): Promise<OAuthTokenResponse> {
  try {
    const body = new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
      scope: SCOPES,
    });

    const data = await graphFetch<OAuthTokenResponse>(MS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    return data;
  } catch (error) {
    throw new Error(
      `Failed to exchange Microsoft auth code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Refresh an expired access token using a refresh token.
 */
export async function refreshMicrosoftToken(
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  try {
    const body = new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: SCOPES,
    });

    const data = await graphFetch<OAuthTokenResponse>(MS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    return data;
  } catch (error) {
    throw new Error(
      `Failed to refresh Microsoft token: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetch the authenticated user's profile from Microsoft Graph.
 */
export async function getMicrosoftUserInfo(
  accessToken: string,
): Promise<OAuthUserInfo> {
  try {
    const data = await graphFetch<{
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
      photo?: string;
    }>(`${MS_GRAPH_URL}/me`, {
      method: "GET",
      headers: graphHeaders(accessToken),
    });

    const email = data.mail ?? data.userPrincipalName ?? "";

    // Attempt to get profile photo URL — Graph returns the binary photo at
    // /me/photo/$value but for our purposes we store the metadata endpoint.
    let picture: string | undefined;
    try {
      const photoMeta = await graphFetch<{ "@odata.mediaContentType"?: string }>(
        `${MS_GRAPH_URL}/me/photo`,
        { method: "GET", headers: graphHeaders(accessToken) },
      );
      if (photoMeta?.["@odata.mediaContentType"]) {
        picture = `${MS_GRAPH_URL}/me/photo/$value`;
      }
    } catch {
      // No profile photo — that is fine.
    }

    return {
      email,
      name: data.displayName ?? undefined,
      picture,
    };
  } catch (error) {
    throw new Error(
      `Failed to get Microsoft user info: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ─── Calendar Operations ────────────────────────────────────────

/**
 * List all calendars the user has access to.
 */
export async function listMicrosoftCalendars(
  accessToken: string,
): Promise<AvailableCalendar[]> {
  try {
    const calendars: AvailableCalendar[] = [];
    let url: string | null = `${MS_GRAPH_URL}/me/calendars?$top=100`;
    let pages = 0;

    interface MsCalendarResponse {
      value: Array<{
        id: string;
        name: string;
        isDefaultCalendar?: boolean;
        color?: string;
        canEdit?: boolean;
        canShare?: boolean;
        owner?: { address?: string; name?: string };
        changeKey?: string;
      }>;
      "@odata.nextLink"?: string;
    }

    while (url && pages < MAX_PAGES) {
      const data: MsCalendarResponse = await graphFetch<MsCalendarResponse>(url, {
        method: "GET",
        headers: graphHeaders(accessToken),
      });

      for (const cal of data.value) {
        calendars.push({
          id: cal.id,
          name: cal.name,
          primary: cal.isDefaultCalendar ?? false,
          color: cal.color ?? undefined,
          accessRole: cal.canEdit ? (cal.canShare ? "owner" : "writer") : "reader",
        });
      }

      url = data["@odata.nextLink"] ?? null;
      pages++;
    }

    return calendars;
  } catch (error) {
    throw new Error(
      `Failed to list Microsoft calendars: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * List events in a calendar between two dates.
 *
 * Uses the `calendarView` endpoint which expands recurring events.
 *
 * @param accessToken - Valid Graph access token.
 * @param calendarId - The calendar ID.
 * @param startDateTime - ISO 8601 start (e.g. "2026-02-06T00:00:00Z").
 * @param endDateTime - ISO 8601 end.
 */
export async function listMicrosoftEvents(
  accessToken: string,
  calendarId: string,
  startDateTime: string,
  endDateTime: string,
): Promise<CalendarEvent[]> {
  try {
    const events: CalendarEvent[] = [];

    const params = new URLSearchParams({
      startDateTime,
      endDateTime,
      $top: "250",
      $orderby: "start/dateTime",
      $select:
        "id,subject,bodyPreview,location,start,end,isAllDay,showAs,attendees,onlineMeeting,recurrence,lastModifiedDateTime,isCancelled,sensitivity",
    });

    let url: string | null =
      `${MS_GRAPH_URL}/me/calendars/${encodeURIComponent(calendarId)}/calendarView?${params.toString()}`;
    let pages = 0;

    interface MsEventResponse {
      value: Array<Record<string, unknown>>;
      "@odata.nextLink"?: string;
    }

    while (url && pages < MAX_PAGES) {
      const data: MsEventResponse = await graphFetch<MsEventResponse>(url, {
        method: "GET",
        headers: {
          ...graphHeaders(accessToken),
          Prefer: 'outlook.timezone="UTC"',
        },
      });

      for (const msEvent of data.value) {
        events.push(mapMicrosoftEventToCalendarEvent(msEvent, calendarId));
      }

      url = data["@odata.nextLink"] ?? null;
      pages++;
    }

    return events;
  } catch (error) {
    throw new Error(
      `Failed to list Microsoft events: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create a new event in a Microsoft calendar.
 */
export async function createMicrosoftEvent(
  accessToken: string,
  calendarId: string,
  event: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
  try {
    const msEvent = mapCalendarEventToMicrosoftEvent(event);

    const data = await graphFetch<Record<string, unknown>>(
      `${MS_GRAPH_URL}/me/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: graphHeaders(accessToken),
        body: JSON.stringify(msEvent),
      },
    );

    return mapMicrosoftEventToCalendarEvent(data, calendarId);
  } catch (error) {
    throw new Error(
      `Failed to create Microsoft event: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Update an existing event in a Microsoft calendar.
 */
export async function updateMicrosoftEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
  try {
    const msEvent = mapCalendarEventToMicrosoftEvent(event);

    const data = await graphFetch<Record<string, unknown>>(
      `${MS_GRAPH_URL}/me/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
        headers: graphHeaders(accessToken),
        body: JSON.stringify(msEvent),
      },
    );

    return mapMicrosoftEventToCalendarEvent(data, calendarId);
  } catch (error) {
    throw new Error(
      `Failed to update Microsoft event: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Delete an event from a Microsoft calendar.
 */
export async function deleteMicrosoftEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  try {
    await graphFetch<void>(
      `${MS_GRAPH_URL}/me/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: graphHeaders(accessToken),
      },
    );
  } catch (error) {
    throw new Error(
      `Failed to delete Microsoft event: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get busy/free schedule for one or more users.
 *
 * Uses POST /me/calendar/getSchedule which returns availability information.
 *
 * @param accessToken - Valid Graph access token.
 * @param schedules - Array of email addresses or user IDs to check.
 * @param startTime - ISO 8601 start time.
 * @param endTime - ISO 8601 end time.
 * @param timezone - IANA timezone string (e.g. "America/New_York").
 */
export async function getMicrosoftBusyTimes(
  accessToken: string,
  schedules: string[],
  startTime: string,
  endTime: string,
  timezone: string,
): Promise<BusyTime[]> {
  try {
    const body = {
      schedules,
      startTime: {
        dateTime: startTime,
        timeZone: timezone,
      },
      endTime: {
        dateTime: endTime,
        timeZone: timezone,
      },
      availabilityViewInterval: 15, // 15-minute granularity
    };

    const data = await graphFetch<{
      value: Array<{
        scheduleId: string;
        scheduleItems: Array<{
          status: string;
          start: { dateTime: string; timeZone: string };
          end: { dateTime: string; timeZone: string };
          subject?: string;
        }>;
      }>;
    }>(`${MS_GRAPH_URL}/me/calendar/getSchedule`, {
      method: "POST",
      headers: graphHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const busyTimes: BusyTime[] = [];

    for (const schedule of data.value) {
      for (const item of schedule.scheduleItems) {
        // Include busy, tentative, and out-of-office statuses
        if (
          item.status === "busy" ||
          item.status === "tentative" ||
          item.status === "oof"
        ) {
          busyTimes.push({
            start: item.start.dateTime,
            end: item.end.dateTime,
            provider: "microsoft",
            title: item.subject ?? undefined,
          });
        }
      }
    }

    return busyTimes;
  } catch (error) {
    throw new Error(
      `Failed to get Microsoft busy times: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ─── Change Notifications (Subscriptions) ───────────────────────

/**
 * Create a webhook subscription for calendar change notifications.
 *
 * Microsoft Graph subscriptions expire after a maximum of ~3 days for
 * calendar resources and must be renewed before expiry.
 *
 * @param accessToken - Valid Graph access token.
 * @param webhookUrl - The HTTPS endpoint that will receive notifications.
 * @param calendarId - The calendar to watch for changes.
 * @returns The subscription ID and expiration timestamp.
 */
export async function createMicrosoftSubscription(
  accessToken: string,
  webhookUrl: string,
  calendarId: string,
): Promise<{ id: string; expirationDateTime: string }> {
  try {
    const expirationDateTime = new Date(
      Date.now() + SUBSCRIPTION_EXPIRY_MINUTES * 60 * 1000,
    ).toISOString();

    const body = {
      changeType: "created,updated,deleted",
      notificationUrl: webhookUrl,
      resource: `/me/calendars/${calendarId}/events`,
      expirationDateTime,
      clientState: "llamame-calendar-sync",
    };

    const data = await graphFetch<{
      id: string;
      expirationDateTime: string;
    }>(`${MS_GRAPH_URL}/subscriptions`, {
      method: "POST",
      headers: graphHeaders(accessToken),
      body: JSON.stringify(body),
    });

    return {
      id: data.id,
      expirationDateTime: data.expirationDateTime,
    };
  } catch (error) {
    throw new Error(
      `Failed to create Microsoft subscription: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Renew an existing webhook subscription before it expires.
 *
 * @param accessToken - Valid Graph access token.
 * @param subscriptionId - The subscription to renew.
 * @returns The new expiration timestamp.
 */
export async function renewMicrosoftSubscription(
  accessToken: string,
  subscriptionId: string,
): Promise<{ expirationDateTime: string }> {
  try {
    const expirationDateTime = new Date(
      Date.now() + SUBSCRIPTION_EXPIRY_MINUTES * 60 * 1000,
    ).toISOString();

    const data = await graphFetch<{
      expirationDateTime: string;
    }>(
      `${MS_GRAPH_URL}/subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: "PATCH",
        headers: graphHeaders(accessToken),
        body: JSON.stringify({ expirationDateTime }),
      },
    );

    return {
      expirationDateTime: data.expirationDateTime,
    };
  } catch (error) {
    throw new Error(
      `Failed to renew Microsoft subscription: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Delete a webhook subscription (stop receiving change notifications).
 */
export async function deleteMicrosoftSubscription(
  accessToken: string,
  subscriptionId: string,
): Promise<void> {
  try {
    await graphFetch<void>(
      `${MS_GRAPH_URL}/subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: "DELETE",
        headers: graphHeaders(accessToken),
      },
    );
  } catch (error) {
    throw new Error(
      `Failed to delete Microsoft subscription: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ─── Token Management ───────────────────────────────────────────

/**
 * Ensure the connection has a valid (non-expired) access token.
 *
 * If the token is about to expire (within 5 minutes), it will be refreshed
 * automatically. Returns the valid access token string.
 *
 * **Note:** The caller is responsible for persisting the updated token fields
 * back to the database when a refresh occurs.
 *
 * @param connection - The calendar connection to check / refresh.
 * @returns A valid access token.
 */
export async function ensureMicrosoftToken(
  connection: CalendarConnection,
): Promise<string> {
  const now = Date.now();

  // If the token is still valid (with buffer), return it directly
  if (connection.expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return connection.accessToken;
  }

  // Token is expired or about to expire — refresh it
  if (!connection.refreshToken) {
    throw new Error(
      "Microsoft token expired and no refresh token is available. The user must re-authenticate.",
    );
  }

  try {
    const tokens = await refreshMicrosoftToken(connection.refreshToken);

    // Mutate the connection object so the caller can persist changes
    connection.accessToken = tokens.access_token;
    connection.expiresAt = now + tokens.expires_in * 1000;
    if (tokens.refresh_token) {
      connection.refreshToken = tokens.refresh_token;
    }

    return tokens.access_token;
  } catch (error) {
    throw new Error(
      `Failed to refresh Microsoft token for connection ${connection.id}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ─── Mapping Helpers ────────────────────────────────────────────

/**
 * Map a Microsoft Graph event object to the unified CalendarEvent format.
 *
 * @param msEvent - Raw event from Microsoft Graph.
 * @param calendarId - The calendar this event belongs to.
 */
export function mapMicrosoftEventToCalendarEvent(
  msEvent: Record<string, unknown>,
  calendarId: string,
): CalendarEvent {
  const start = msEvent.start as
    | { dateTime?: string; timeZone?: string }
    | undefined;
  const end = msEvent.end as
    | { dateTime?: string; timeZone?: string }
    | undefined;

  const isAllDay = (msEvent.isAllDay as boolean) ?? false;

  // For all-day events Microsoft returns date strings like "2026-02-06T00:00:00.0000000"
  // in the calendar's timezone. We normalise to ISO strings.
  let startTime = start?.dateTime ?? "";
  let endTime = end?.dateTime ?? "";

  // Ensure ISO 8601 — Graph sometimes omits the Z for UTC.
  if (startTime && !startTime.endsWith("Z") && !startTime.includes("+")) {
    startTime = `${startTime}Z`;
  }
  if (endTime && !endTime.endsWith("Z") && !endTime.includes("+")) {
    endTime = `${endTime}Z`;
  }

  const timezone = start?.timeZone ?? "UTC";

  // Map attendees
  const rawAttendees = msEvent.attendees as
    | Array<{
        emailAddress?: { address?: string; name?: string };
        status?: { response?: string };
        type?: string;
      }>
    | undefined;

  const attendees: EventAttendee[] | undefined = rawAttendees?.map((a) => ({
    email: a.emailAddress?.address ?? "",
    name: a.emailAddress?.name ?? undefined,
    responseStatus: mapMicrosoftResponseStatus(a.status?.response),
    organizer: a.type === "required" ? undefined : undefined,
  }));

  // Map organizer
  const organizer = msEvent.organizer as
    | { emailAddress?: { address?: string; name?: string } }
    | undefined;
  if (organizer?.emailAddress?.address && attendees) {
    const orgAttendee = attendees.find(
      (a) => a.email === organizer.emailAddress?.address,
    );
    if (orgAttendee) {
      orgAttendee.organizer = true;
    }
  }

  // Determine busy status from showAs
  const showAs = (msEvent.showAs as string) ?? "busy";
  const busy = showAs !== "free" && showAs !== "unknown";

  // Status
  const isCancelled = (msEvent.isCancelled as boolean) ?? false;
  let status: CalendarEvent["status"] = "confirmed";
  if (isCancelled) {
    status = "cancelled";
  } else if (showAs === "tentative") {
    status = "tentative";
  }

  // Meeting URL
  const onlineMeeting = msEvent.onlineMeeting as
    | { joinUrl?: string }
    | undefined;
  const meetingUrl = onlineMeeting?.joinUrl ?? undefined;

  // Recurrence
  const recurrence = msEvent.recurrence as
    | { pattern?: Record<string, unknown>; range?: Record<string, unknown> }
    | undefined;
  let recurrenceString: string | undefined;
  if (recurrence?.pattern) {
    // Store as serialized JSON — a full RRULE conversion would require
    // additional logic and is out of scope here.
    recurrenceString = JSON.stringify(recurrence);
  }

  return {
    externalId: msEvent.id as string,
    provider: "microsoft",
    calendarId,
    title: (msEvent.subject as string) ?? "(No title)",
    description: (msEvent.bodyPreview as string) ?? undefined,
    location:
      (
        msEvent.location as
          | { displayName?: string }
          | undefined
      )?.displayName ?? undefined,
    startTime,
    endTime,
    timezone,
    allDay: isAllDay,
    status,
    busy,
    attendees: attendees?.length ? attendees : undefined,
    meetingUrl,
    recurrence: recurrenceString,
    updatedAt:
      (msEvent.lastModifiedDateTime as string) ?? new Date().toISOString(),
    rawData: msEvent,
  };
}

/**
 * Map the unified CalendarEvent format to the Microsoft Graph event shape.
 *
 * @param event - Partial CalendarEvent to convert.
 * @returns An object suitable for POST/PATCH to the Graph events endpoint.
 */
export function mapCalendarEventToMicrosoftEvent(
  event: Partial<CalendarEvent>,
): Record<string, unknown> {
  const msEvent: Record<string, unknown> = {};

  if (event.title !== undefined) {
    msEvent.subject = event.title;
  }

  if (event.description !== undefined) {
    msEvent.body = {
      contentType: "text",
      content: event.description,
    };
  }

  if (event.location !== undefined) {
    msEvent.location = {
      displayName: event.location,
    };
  }

  const tz = event.timezone ?? "UTC";

  if (event.startTime !== undefined) {
    msEvent.start = {
      dateTime: stripTimezoneOffset(event.startTime),
      timeZone: tz,
    };
  }

  if (event.endTime !== undefined) {
    msEvent.end = {
      dateTime: stripTimezoneOffset(event.endTime),
      timeZone: tz,
    };
  }

  if (event.allDay !== undefined) {
    msEvent.isAllDay = event.allDay;
  }

  if (event.busy !== undefined) {
    msEvent.showAs = event.busy ? "busy" : "free";
  }

  if (event.status !== undefined) {
    // Microsoft doesn't have a direct status field — we map through showAs
    // and isCancelled.
    if (event.status === "tentative") {
      msEvent.showAs = "tentative";
    } else if (event.status === "cancelled") {
      msEvent.isCancelled = true;
    }
  }

  if (event.attendees !== undefined) {
    msEvent.attendees = event.attendees.map((a) => ({
      emailAddress: {
        address: a.email,
        name: a.name ?? a.email,
      },
      type: a.organizer ? "required" : "required",
      status: {
        response: mapToMicrosoftResponseStatus(a.responseStatus),
      },
    }));
  }

  if (event.meetingUrl !== undefined) {
    msEvent.isOnlineMeeting = true;
    msEvent.onlineMeetingProvider = "teamsForBusiness";
  }

  return msEvent;
}

// ─── Internal Mapping Utilities ─────────────────────────────────

/**
 * Map a Microsoft response status string to our unified ResponseStatus.
 */
function mapMicrosoftResponseStatus(
  msStatus: string | undefined,
): EventAttendee["responseStatus"] {
  switch (msStatus) {
    case "accepted":
      return "accepted";
    case "declined":
      return "declined";
    case "tentativelyAccepted":
      return "tentative";
    case "none":
    case "notResponded":
    case "organizer":
    default:
      return "needsAction";
  }
}

/**
 * Map our unified ResponseStatus to the Microsoft response string.
 */
function mapToMicrosoftResponseStatus(
  status: EventAttendee["responseStatus"],
): string {
  switch (status) {
    case "accepted":
      return "accepted";
    case "declined":
      return "declined";
    case "tentative":
      return "tentativelyAccepted";
    case "needsAction":
    default:
      return "none";
  }
}

/**
 * Strip trailing "Z" or timezone offset from an ISO date string so it can be
 * used in the `dateTimeTimeZone` object (which expects a bare local datetime).
 *
 * e.g. "2026-02-06T10:00:00Z" -> "2026-02-06T10:00:00"
 */
function stripTimezoneOffset(isoString: string): string {
  return isoString.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
}
