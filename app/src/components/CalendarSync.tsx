"use client";

import { useState, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  Check,
  X,
  Loader2,
  ChevronDown,
  Link2,
  Unlink,
  Shield,
} from "lucide-react";
import type { CalendarProvider, SyncDirection } from "@/lib/calendar/types";
import { btn, card, badge, toggle, input } from "@/lib/theme";

// ─── Types ──────────────────────────────────────────────────────

interface CalendarSyncProps {
  className?: string;
}

interface DemoConnection {
  id: string;
  provider: CalendarProvider;
  email: string;
  syncDirection: SyncDirection;
  selectedCalendars: string[];
  lastSyncAt: number | null;
  syncStatus: "idle" | "syncing" | "error";
}

interface SyncResultSummary {
  provider: CalendarProvider;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  syncedAt: number;
  error?: string;
}

// ─── Constants ──────────────────────────────────────────────────

const PROVIDER_CONFIG: Record<
  CalendarProvider,
  {
    name: string;
    description: string;
    color: string;
    letter: string;
    email: string;
    calendars: string[];
  }
> = {
  google: {
    name: "Google Calendar",
    description: "Sync events with your Google account",
    color: "bg-blue-500",
    letter: "G",
    email: "hello@mantaray.digital",
    calendars: ["Primary", "Work", "Personal"],
  },
  microsoft: {
    name: "Microsoft Outlook",
    description: "Sync events with your Outlook account",
    color: "bg-sky-600",
    letter: "M",
    email: "hello@mantaray.digital",
    calendars: ["Calendar", "Meetings", "Personal"],
  },
};

const SYNC_DIRECTION_LABELS: Record<SyncDirection, string> = {
  both: "Both ways",
  from_external: "From external only",
  to_external: "To external only",
};

// ─── Helpers ────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ─── Component ──────────────────────────────────────────────────

export default function CalendarSync({ className }: CalendarSyncProps) {
  const [connections, setConnections] = useState<DemoConnection[]>([]);
  const [connecting, setConnecting] = useState<CalendarProvider | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResultSummary[]>([]);

  // ── Connect handler ─────────────────────────────────────────

  const handleConnect = useCallback((provider: CalendarProvider) => {
    setConnecting(provider);

    setTimeout(() => {
      const config = PROVIDER_CONFIG[provider];
      const newConnection: DemoConnection = {
        id: `${provider}-${Date.now()}`,
        provider,
        email: config.email,
        syncDirection: "both",
        selectedCalendars: config.calendars.slice(0, 2),
        lastSyncAt: Date.now(),
        syncStatus: "idle",
      };

      setConnections((prev) => [...prev, newConnection]);
      setSyncResults((prev) => [
        ...prev,
        {
          provider,
          eventsCreated: 12,
          eventsUpdated: 3,
          eventsDeleted: 0,
          syncedAt: Date.now(),
        },
      ]);
      setConnecting(null);
    }, 1500);
  }, []);

  // ── Disconnect handler ──────────────────────────────────────

  const handleDisconnect = useCallback((connectionId: string) => {
    setDisconnecting(connectionId);
  }, []);

  const confirmDisconnect = useCallback((connectionId: string) => {
    setConnections((prev) => {
      const removed = prev.find((c) => c.id === connectionId);
      if (removed) {
        setSyncResults((sr) =>
          sr.filter((r) => r.provider !== removed.provider),
        );
      }
      return prev.filter((c) => c.id !== connectionId);
    });
    setDisconnecting(null);
  }, []);

  // ── Sync Now handler ───────────────────────────────────────

  const handleSyncNow = useCallback((connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId ? { ...c, syncStatus: "syncing" as const } : c,
      ),
    );

    setTimeout(() => {
      const now = Date.now();
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId
            ? { ...c, syncStatus: "idle" as const, lastSyncAt: now }
            : c,
        ),
      );
      setConnections((prev) => {
        const conn = prev.find((c) => c.id === connectionId);
        if (conn) {
          setSyncResults((sr) => {
            const filtered = sr.filter((r) => r.provider !== conn.provider);
            return [
              ...filtered,
              {
                provider: conn.provider,
                eventsCreated: Math.floor(Math.random() * 5),
                eventsUpdated: Math.floor(Math.random() * 8) + 1,
                eventsDeleted: Math.floor(Math.random() * 2),
                syncedAt: now,
              },
            ];
          });
        }
        return prev;
      });
    }, 2000);
  }, []);

  // ── Update sync direction ──────────────────────────────────

  const handleSyncDirectionChange = useCallback(
    (connectionId: string, direction: SyncDirection) => {
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId ? { ...c, syncDirection: direction } : c,
        ),
      );
    },
    [],
  );

  // ── Toggle calendar selection ──────────────────────────────

  const handleCalendarToggle = useCallback(
    (connectionId: string, calendarName: string) => {
      setConnections((prev) =>
        prev.map((c) => {
          if (c.id !== connectionId) return c;
          const selected = c.selectedCalendars.includes(calendarName)
            ? c.selectedCalendars.filter((cal) => cal !== calendarName)
            : [...c.selectedCalendars, calendarName];
          return { ...c, selectedCalendars: selected };
        }),
      );
    },
    [],
  );

  // ── Derived state ──────────────────────────────────────────

  const getConnection = (provider: CalendarProvider) =>
    connections.find((c) => c.provider === provider);

  const hasAnyConnection = connections.length > 0;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold tracking-tight">Calendar Sync</h2>
        </div>
        <p className="text-text-sec text-sm">
          Connect your calendars for 2-way sync
        </p>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(["google", "microsoft"] as CalendarProvider[]).map((provider) => {
          const config = PROVIDER_CONFIG[provider];
          const connection = getConnection(provider);
          const isConnecting = connecting === provider;
          const isDisconnecting =
            connection && disconnecting === connection.id;

          return (
            <div key={provider} className={`${card.base} p-5`}>
              {/* Provider header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`${config.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {config.letter}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{config.name}</h3>
                    <p className="text-text-muted text-xs mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    connection ? badge.green : badge.rose
                  }`}
                >
                  {connection ? (
                    <>
                      <Check className="w-3 h-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" />
                      Disconnected
                    </>
                  )}
                </span>
              </div>

              {/* Not connected state */}
              {!connection && !isConnecting && (
                <button
                  onClick={() => handleConnect(provider)}
                  className={`${btn.primary} w-full mt-2`}
                >
                  <Link2 className="w-4 h-4" />
                  Connect {config.name}
                </button>
              )}

              {/* Connecting state */}
              {isConnecting && (
                <div className="flex items-center justify-center gap-2 py-3 text-text-sec text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </div>
              )}

              {/* Connected state */}
              {connection && (
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-text-muted" />
                    <span className="text-text-sec">{connection.email}</span>
                  </div>

                  {/* Sync direction */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Sync direction
                    </label>
                    <div className="relative">
                      <select
                        value={connection.syncDirection}
                        onChange={(e) =>
                          handleSyncDirectionChange(
                            connection.id,
                            e.target.value as SyncDirection,
                          )
                        }
                        className={`${input.select} pr-10 appearance-none text-sm py-2`}
                      >
                        {(
                          Object.entries(SYNC_DIRECTION_LABELS) as [
                            SyncDirection,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Calendar selection */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-2">
                      Calendars to sync
                    </label>
                    <div className="space-y-2">
                      {config.calendars.map((calName) => {
                        const isSelected =
                          connection.selectedCalendars.includes(calName);
                        return (
                          <label
                            key={calName}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isSelected}
                              onClick={() =>
                                handleCalendarToggle(connection.id, calName)
                              }
                              className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                                isSelected
                                  ? "bg-accent border-accent"
                                  : "border-border bg-white/[0.03] group-hover:border-border-hover"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-bg" />
                              )}
                            </button>
                            <span className="text-sm text-text">{calName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Last sync */}
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <RefreshCw className="w-3 h-3" />
                    Last sync:{" "}
                    {connection.lastSyncAt
                      ? timeAgo(connection.lastSyncAt)
                      : "Never"}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSyncNow(connection.id)}
                      disabled={connection.syncStatus === "syncing"}
                      className={`${btn.ghost} flex-1 text-sm py-2 disabled:opacity-50`}
                    >
                      {connection.syncStatus === "syncing" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Sync Now
                        </>
                      )}
                    </button>

                    {!isDisconnecting ? (
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        className={`${btn.ghost} text-sm py-2 text-rose hover:text-rose border-rose/20 hover:border-rose/40 hover:bg-rose/5`}
                      >
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose">Confirm?</span>
                        <button
                          onClick={() => confirmDisconnect(connection.id)}
                          className={`${btn.iconSm} text-rose border-rose/30 hover:bg-rose/10`}
                          aria-label="Confirm disconnect"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDisconnecting(null)}
                          className={btn.iconSm}
                          aria-label="Cancel disconnect"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sync Status Panel */}
      <div className={`${card.base} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text">Sync Status</h3>

          {/* Overall health indicator */}
          {hasAnyConnection && (
            <span className="ml-auto flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connections.some((c) => c.syncStatus === "error")
                    ? "bg-rose"
                    : connections.some((c) => c.syncStatus === "syncing")
                      ? "bg-amber animate-pulse"
                      : "bg-green"
                }`}
              />
              <span className="text-xs text-text-muted">
                {connections.some((c) => c.syncStatus === "error")
                  ? "Sync error"
                  : connections.some((c) => c.syncStatus === "syncing")
                    ? "Syncing..."
                    : "All healthy"}
              </span>
            </span>
          )}
        </div>

        {!hasAnyConnection ? (
          <p className="text-text-muted text-sm text-center py-6">
            No calendars connected. Connect a calendar above to start syncing.
          </p>
        ) : (
          <div className="space-y-3">
            {syncResults.map((result) => {
              const config = PROVIDER_CONFIG[result.provider];
              return (
                <div
                  key={result.provider}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${config.color} w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold text-xs`}
                    >
                      {config.letter}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">
                        {config.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {timeAgo(result.syncedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-sec">
                    {result.error ? (
                      <span className="text-rose">{result.error}</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <span className="text-green font-medium">
                            +{result.eventsCreated}
                          </span>{" "}
                          created
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-amber font-medium">
                            ~{result.eventsUpdated}
                          </span>{" "}
                          updated
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-rose font-medium">
                            -{result.eventsDeleted}
                          </span>{" "}
                          deleted
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
