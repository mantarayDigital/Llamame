"use client";

import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { currencyFormatter } from "@/lib/theme";
import {
  useDashboardStats,
  useCurrentUserId,
  useUpcomingBookings,
  useEventTypes,
  useClients,
} from "@/lib/data";

export default function AnalyticsPage() {
  const currentUserId = useCurrentUserId();
  const stats = useDashboardStats(currentUserId);
  const bookings = useUpcomingBookings(currentUserId);
  const eventTypes = useEventTypes(currentUserId);
  const clients = useClients(currentUserId);

  const hasData = bookings.length > 0 || stats.meetingsThisWeek > 0;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-text-sec text-sm mt-1">
            Insights into your bookings, revenue, and client patterns.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Calendar className="w-3.5 h-3.5" /> Meetings This Week
          </div>
          <div className="text-2xl font-bold">{stats.meetingsThisWeek}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <DollarSign className="w-3.5 h-3.5" /> Revenue
          </div>
          <div className="text-2xl font-bold">{currencyFormatter.format(stats.revenueCollected)}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Users className="w-3.5 h-3.5" /> Clients
          </div>
          <div className="text-2xl font-bold">{clients.length}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Clock className="w-3.5 h-3.5" /> Show Rate
          </div>
          <div className="text-2xl font-bold">
            {stats.showRate > 0 ? `${stats.showRate}%` : "—"}
          </div>
        </div>
      </div>

      {!hasData ? (
        /* Empty state */
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Once you start receiving bookings, your analytics will appear here
            with charts for bookings, revenue trends, and peak hours.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Event Types */}
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <h3 className="font-semibold mb-4">Event Types</h3>
            <div className="space-y-4">
              {eventTypes.length === 0 ? (
                <p className="text-sm text-text-muted">No event types created yet.</p>
              ) : (
                eventTypes.map((et: any) => (
                  <div key={et._id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{et.title}</span>
                      <span className="text-text-sec">
                        {et.duration} min
                        {et.price
                          ? ` · ${currencyFormatter.format(et.price)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <h3 className="font-semibold mb-4">Upcoming Bookings</h3>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-sm text-text-muted">No upcoming bookings.</p>
              ) : (
                bookings.slice(0, 5).map((b: any) => (
                  <div key={b._id} className="flex justify-between text-sm">
                    <span className="font-medium">{b.clientName}</span>
                    <span className="text-text-sec">
                      {new Date(b.startTime).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
