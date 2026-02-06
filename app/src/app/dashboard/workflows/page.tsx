"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Mail,
  MessageCircle,
  Bell,
  Globe,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";

/** Demo workflow data */
interface Workflow {
  id: string;
  name: string;
  trigger: string;
  triggerLabel: string;
  action: string;
  actionLabel: string;
  actionIcon: string;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const triggerLabels: Record<string, string> = {
  booking_created: "Booking Created",
  booking_confirmed: "Booking Confirmed",
  booking_cancelled: "Booking Cancelled",
  booking_reminder: "Booking Reminder",
  booking_completed: "Booking Completed",
  payment_received: "Payment Received",
};

const actionIcons: Record<string, LucideIcon> = {
  send_email: Mail,
  send_whatsapp: MessageCircle,
  send_slack: Bell,
  webhook: Globe,
};

const demoWorkflows: Workflow[] = [
  {
    id: "wf_001",
    name: "Booking Confirmation Email",
    trigger: "booking_created",
    triggerLabel: "Booking Created",
    action: "send_email",
    actionLabel: "Send Email",
    actionIcon: "send_email",
    isActive: true,
    lastTriggered: "2 hours ago",
    triggerCount: 156,
  },
  {
    id: "wf_002",
    name: "24h Reminder",
    trigger: "booking_reminder",
    triggerLabel: "24h Before Meeting",
    action: "send_email",
    actionLabel: "Send Email",
    actionIcon: "send_email",
    isActive: true,
    lastTriggered: "Yesterday",
    triggerCount: 89,
  },
  {
    id: "wf_003",
    name: "WhatsApp Reminder",
    trigger: "booking_reminder",
    triggerLabel: "1h Before Meeting",
    action: "send_whatsapp",
    actionLabel: "Send WhatsApp",
    actionIcon: "send_whatsapp",
    isActive: true,
    lastTriggered: "3 hours ago",
    triggerCount: 45,
  },
  {
    id: "wf_004",
    name: "Slack New Booking Alert",
    trigger: "booking_created",
    triggerLabel: "Booking Created",
    action: "send_slack",
    actionLabel: "Post to Slack",
    actionIcon: "send_slack",
    isActive: false,
    lastTriggered: "1 week ago",
    triggerCount: 12,
  },
  {
    id: "wf_005",
    name: "Cancellation Notice",
    trigger: "booking_cancelled",
    triggerLabel: "Booking Cancelled",
    action: "send_email",
    actionLabel: "Send Email",
    actionIcon: "send_email",
    isActive: true,
    lastTriggered: "3 days ago",
    triggerCount: 8,
  },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(demoWorkflows);

  const toggleActive = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isActive: !w.isActive } : w
      )
    );
  };

  const activeCount = workflows.filter((w) => w.isActive).length;
  const totalTriggers = workflows.reduce((sum, w) => sum + w.triggerCount, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-text-sec text-sm mt-1">
            Automate emails, messages, and notifications when events happen.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Active Workflows
          </div>
          <div className="text-2xl font-bold">
            {activeCount}{" "}
            <span className="text-sm text-text-muted font-normal">
              / {workflows.length}
            </span>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Total Executions
          </div>
          <div className="text-2xl font-bold">{totalTriggers}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">
            Success Rate
          </div>
          <div className="text-2xl font-bold text-green">98.5%</div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="space-y-3">
        {workflows.map((wf) => {
          const ActionIcon = actionIcons[wf.actionIcon] ?? Mail;
          return (
            <div
              key={wf.id}
              className={`rounded-xl border bg-bg-card p-5 transition ${
                wf.isActive
                  ? "border-border"
                  : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-5">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-violet-muted border border-violet/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-violet" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{wf.name}</h3>
                    {!wf.isActive && (
                      <span className="px-2 py-0.5 rounded text-[0.68rem] font-semibold bg-white/[0.06] text-text-muted">
                        Paused
                      </span>
                    )}
                  </div>

                  {/* Trigger → Action visual */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2.5 py-1 rounded-md bg-accent-muted/50 text-accent text-xs font-medium">
                      {wf.triggerLabel}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-muted/50 text-violet text-xs font-medium">
                      <ActionIcon className="w-3 h-3" />
                      {wf.actionLabel}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0 mr-4">
                  <div className="text-sm font-semibold">
                    {wf.triggerCount} runs
                  </div>
                  <div className="text-xs text-text-muted">
                    {wf.lastTriggered
                      ? `Last: ${wf.lastTriggered}`
                      : "Never triggered"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-text hover:bg-white/[0.03] transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-rose hover:bg-rose-muted transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className="text-text-sec hover:text-text transition"
                  >
                    {wf.isActive ? (
                      <ToggleRight className="w-8 h-8 text-green" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
