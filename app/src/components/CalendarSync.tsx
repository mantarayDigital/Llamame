"use client";

import { useState, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  Check,
  X,
  Loader2,
  Link2,
  Unlink,
  Shield,
} from "lucide-react";
import type { CalendarProvider } from "@/lib/calendar/types";
import { btn, card, badge } from "@/lib/theme";
import { useCurrentUserId, useIntegrations } from "@/lib/data";

// ─── Types ──────────────────────────────────────────────────────

interface CalendarSyncProps {
  className?: string;
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
    convexProvider: string;
  }
> = {
  google: {
    name: "Google Calendar",
    description: "Sync events with your Google account",
    color: "bg-blue-500",
    letter: "G",
    convexProvider: "google_calendar",
  },
  microsoft: {
    name: "Microsoft Outlook",
    description: "Sync events with your Outlook account",
    color: "bg-sky-600",
    letter: "M",
    convexProvider: "outlook",
  },
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
  const currentUserId = useCurrentUserId();
  const integrations = useIntegrations(currentUserId);
  const [connecting, setConnecting] = useState<CalendarProvider | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResultSummary[]>([]);

  // ── Connect handler — initiates OAuth flow ────────────────────

  const handleConnect = useCallback(
    async (provider: CalendarProvider) => {
      if (!currentUserId) return;
      setConnecting(provider);
      try {
        const res = await fetch("/api/calendar/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, userId: currentUserId }),
        });
        const data = await res.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          console.error("No auth URL returned:", data);
          setConnecting(null);
        }
      } catch (err) {
        console.error("Connect error:", err);
        setConnecting(null);
      }
    },
    [currentUserId],
  );

  // ── Disconnect handler ──────────────────────────────────────

  const confirmDisconnect = useCallback(
    async (_integrationId: string, provider: CalendarProvider) => {
      if (!currentUserId) return;
      try {
        await fetch("/api/calendar/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, userId: currentUserId }),
        });
      } catch (err) {
        console.error("Disconnect error:", err);
      }
      setDisconnecting(null);
    },
    [currentUserId],
  );

  // ── Sync Now handler ───────────────────────────────────────

  const handleSyncNow = useCallback(
    async (provider: CalendarProvider) => {
      if (!currentUserId) return;
      setSyncing(provider);
      try {
        const res = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, userId: currentUserId }),
        });
        const data = await res.json();
        if (data.success && data.result) {
          setSyncResults((prev) => {
            const filtered = prev.filter((r) => r.provider !== provider);
            return [
              ...filtered,
              {
                provider,
                eventsCreated: data.result.eventsCreated,
                eventsUpdated: data.result.eventsUpdated,
                eventsDeleted: data.result.eventsDeleted,
                syncedAt: data.result.syncedAt,
              },
            ];
          });
        }
      } catch (err) {
        console.error("Sync error:", err);
      } finally {
        setSyncing(null);
      }
    },
    [currentUserId],
  );

  // ── Derived state ──────────────────────────────────────────

  const getConnection = (provider: CalendarProvider) => {
    const convexProvider = PROVIDER_CONFIG[provider].convexProvider;
    return integrations.find(
      (i: any) => i.provider === convexProvider && i.status === "connected",
    );
  };

  const hasAnyConnection = integrations.some(
    (i: any) => i.status === "connected" && (i.provider === "google_calendar" || i.provider === "outlook"),
  );

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
            connection && disconnecting === connection._id;
          const isSyncing = syncing === provider;
          const connConfig = connection?.config as any;

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
                  Redirecting to {config.name}...
                </div>
              )}

              {/* Connected state */}
              {connection && (
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-text-muted" />
                    <span className="text-text-sec">
                      {connConfig?.email ?? "Connected"}
                    </span>
                  </div>

                  {/* Calendars */}
                  {connConfig?.calendars && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-2">
                        Synced calendars
                      </label>
                      <div className="space-y-1.5">
                        {(connConfig.calendars as any[])
                          .filter((c: any) => c.selected)
                          .map((cal: any) => (
                            <div
                              key={cal.id}
                              className="flex items-center gap-2 text-sm text-text-sec"
                            >
                              <Check className="w-3 h-3 text-green" />
                              {cal.name}
                              {cal.primary && (
                                <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

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
                      onClick={() => handleSyncNow(provider)}
                      disabled={isSyncing}
                      className={`${btn.ghost} flex-1 text-sm py-2 disabled:opacity-50`}
                    >
                      {isSyncing ? (
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
                        onClick={() => setDisconnecting(connection._id)}
                        className={`${btn.ghost} text-sm py-2 text-rose hover:text-rose border-rose/20 hover:border-rose/40 hover:bg-rose/5`}
                      >
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose">Confirm?</span>
                        <button
                          onClick={() =>
                            confirmDisconnect(connection._id, provider)
                          }
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

          {hasAnyConnection && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span className="text-xs text-text-muted">Connected</span>
            </span>
          )}
        </div>

        {!hasAnyConnection && syncResults.length === 0 ? (
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
