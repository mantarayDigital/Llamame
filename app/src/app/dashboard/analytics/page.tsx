"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type TimeRange = "7d" | "30d" | "90d";

const rangeLabels: Record<TimeRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

/** Mock chart data — bar heights as percentages */
const bookingsByDay: Record<TimeRange, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 60 },
    { label: "Tue", value: 85 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 90 },
    { label: "Fri", value: 70 },
    { label: "Sat", value: 15 },
    { label: "Sun", value: 10 },
  ],
  "30d": [
    { label: "W1", value: 70 },
    { label: "W2", value: 85 },
    { label: "W3", value: 60 },
    { label: "W4", value: 95 },
  ],
  "90d": [
    { label: "Dec", value: 55 },
    { label: "Jan", value: 75 },
    { label: "Feb", value: 90 },
  ],
};

const revenueByMonth = [
  { label: "Sep", value: 800 },
  { label: "Oct", value: 1200 },
  { label: "Nov", value: 1600 },
  { label: "Dec", value: 1400 },
  { label: "Jan", value: 2100 },
  { label: "Feb", value: 2450 },
];
const maxRevenue = Math.max(...revenueByMonth.map((r) => r.value));

const topEventTypes = [
  { name: "Strategy Session", bookings: 42, revenue: 6300, pct: 48 },
  { name: "Discovery Call", bookings: 35, revenue: 0, pct: 40 },
  { name: "Quick Check-in", bookings: 18, revenue: 0, pct: 20 },
  { name: "Workshop", bookings: 3, revenue: 1500, pct: 8 },
];

const peakHours = [
  { hour: "9am", pct: 45 },
  { hour: "10am", pct: 90 },
  { hour: "11am", pct: 75 },
  { hour: "12pm", pct: 20 },
  { hour: "1pm", pct: 60 },
  { hour: "2pm", pct: 80 },
  { hour: "3pm", pct: 65 },
  { hour: "4pm", pct: 30 },
];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("7d");
  const chartData = bookingsByDay[range];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-text-sec text-sm mt-1">
            Insights into your bookings, revenue, and client patterns.
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["7d", "30d", "90d"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 text-sm font-medium transition ${
                range === r
                  ? "bg-accent-muted text-text"
                  : "text-text-sec hover:text-text"
              } ${r !== "7d" ? "border-l border-border" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Calendar className="w-3.5 h-3.5" /> Bookings
          </div>
          <div className="text-2xl font-bold">98</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +14%
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <DollarSign className="w-3.5 h-3.5" /> Revenue
          </div>
          <div className="text-2xl font-bold">{formatter.format(2450)}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +8%
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Users className="w-3.5 h-3.5" /> New Clients
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +25%
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium mb-2">
            <Clock className="w-3.5 h-3.5" /> Avg Response
          </div>
          <div className="text-2xl font-bold">2.4h</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-rose font-semibold">
            <ArrowDownRight className="w-3 h-3" /> +0.3h
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bookings Chart */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold mb-1">Bookings</h3>
          <p className="text-xs text-text-muted mb-6">{rangeLabels[range]}</p>
          <div className="flex items-end gap-2 h-40">
            {chartData.map((d) => (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-accent to-violet/70 transition-all duration-300"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-[0.65rem] text-text-muted">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold mb-1">Revenue Trend</h3>
          <p className="text-xs text-text-muted mb-6">Last 6 months</p>
          <div className="flex items-end gap-2 h-40">
            {revenueByMonth.map((d) => (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-green/80 to-accent/60 transition-all duration-300"
                  style={{
                    height: `${(d.value / maxRevenue) * 100}%`,
                  }}
                />
                <span className="text-[0.65rem] text-text-muted">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Event Types */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold mb-4">Top Event Types</h3>
          <div className="space-y-4">
            {topEventTypes.map((et) => (
              <div key={et.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{et.name}</span>
                  <span className="text-text-sec">
                    {et.bookings} bookings
                    {et.revenue > 0 &&
                      ` · ${formatter.format(et.revenue)}`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-violet"
                    style={{ width: `${et.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold mb-4">Peak Booking Hours</h3>
          <div className="space-y-3">
            {peakHours.map((h) => (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-10 text-right font-mono">
                  {h.hour}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      h.pct >= 80
                        ? "bg-rose"
                        : h.pct >= 50
                          ? "bg-amber"
                          : "bg-green"
                    }`}
                    style={{ width: `${h.pct}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted w-8">
                  {h.pct}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green" /> Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber" /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose" /> High
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
