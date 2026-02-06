"use client";

import { useState } from "react";
import {
  DollarSign,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Payment {
  id: string;
  clientName: string;
  clientEmail: string;
  eventType: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "refunded" | "failed";
  date: string;
  method: string;
}

const demoPayments: Payment[] = [
  {
    id: "pay_001",
    clientName: "Sarah Chen",
    clientEmail: "sarah@techflow.io",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "paid",
    date: "Feb 6, 2026",
    method: "Stripe",
  },
  {
    id: "pay_002",
    clientName: "Lucas Sharma",
    clientEmail: "lucas@designco.com",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "paid",
    date: "Feb 5, 2026",
    method: "Stripe",
  },
  {
    id: "pay_003",
    clientName: "Ana Kovacs",
    clientEmail: "ana@growthlab.com",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "paid",
    date: "Feb 4, 2026",
    method: "Stripe",
  },
  {
    id: "pay_004",
    clientName: "Emily Watson",
    clientEmail: "emily@brandforge.co",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "pending",
    date: "Feb 7, 2026",
    method: "Stripe",
  },
  {
    id: "pay_005",
    clientName: "Alex Kim",
    clientEmail: "alex@nexusai.com",
    eventType: "Workshop",
    amount: 500,
    currency: "USD",
    status: "refunded",
    date: "Jan 28, 2026",
    method: "Stripe",
  },
  {
    id: "pay_006",
    clientName: "Sarah Chen",
    clientEmail: "sarah@techflow.io",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "paid",
    date: "Jan 27, 2026",
    method: "Stripe",
  },
  {
    id: "pay_007",
    clientName: "Ana Kovacs",
    clientEmail: "ana@growthlab.com",
    eventType: "Strategy Session",
    amount: 150,
    currency: "USD",
    status: "paid",
    date: "Jan 25, 2026",
    method: "PayPal",
  },
];

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    className: "bg-green-muted text-green",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-muted text-amber",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCw,
    className: "bg-violet-muted text-violet",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-rose-muted text-rose",
  },
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PaymentsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = demoPayments.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch =
      search === "" ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.eventType.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = demoPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = demoPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const refundedAmount = demoPayments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-text-sec text-sm mt-1">
            Track revenue, payment status, and transaction history.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white/[0.03] border border-border hover:bg-bg-card-hover transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-bold">
            {formatter.format(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +12% vs last month
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Pending
          </div>
          <div className="text-2xl font-bold text-amber">
            {formatter.format(pendingRevenue)}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {demoPayments.filter((p) => p.status === "pending").length}{" "}
            transactions
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Refunded
          </div>
          <div className="text-2xl font-bold text-violet">
            {formatter.format(refundedAmount)}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {demoPayments.filter((p) => p.status === "refunded").length}{" "}
            transactions
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Avg Transaction
          </div>
          <div className="text-2xl font-bold">
            {formatter.format(
              totalRevenue /
                Math.max(
                  demoPayments.filter((p) => p.status === "paid").length,
                  1
                )
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white/[0.03] text-sm text-text outline-none focus:border-accent transition placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "paid", "pending", "refunded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition capitalize ${
                filter === f
                  ? "bg-accent-muted border-accent/20 text-text"
                  : "border-border text-text-sec hover:text-text"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Client
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Event
              </th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Amount
              </th>
              <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Date
              </th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-3">
                Method
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = statusConfig[p.status];
              const StatusIcon = status.icon;
              return (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-b-0 hover:bg-white/[0.02] transition cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold">{p.clientName}</div>
                    <div className="text-xs text-text-muted">
                      {p.clientEmail}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-text-sec">
                      {p.eventType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold">
                      {formatter.format(p.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${status.className}`}
                    >
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-text-sec">{p.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-text-muted font-mono">
                      {p.method}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No payments found.
          </div>
        )}
      </div>
    </>
  );
}
