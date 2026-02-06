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
  FileText,
  type LucideIcon,
} from "lucide-react";
import { btn } from "@/lib/theme";
import WorkflowModal from "@/components/WorkflowModal";
import type { WorkflowTrigger, WorkflowAction } from "@/lib/types";

interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  triggerLabel: string;
  actions: { action: WorkflowAction; actionLabel: string; actionIcon: string }[];
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const actionIcons: Record<string, LucideIcon> = {
  send_email: Mail,
  send_whatsapp: MessageCircle,
  send_sms: MessageCircle,
  send_slack: Bell,
  webhook: Globe,
  update_crm: FileText,
  create_invoice: FileText,
  add_to_list: Plus,
};

const demoWorkflows: Workflow[] = [
  {
    id: "wf_001",
    name: "Booking Confirmation Email",
    trigger: "booking_created",
    triggerLabel: "Booking Created",
    actions: [{ action: "send_email", actionLabel: "Send Email", actionIcon: "send_email" }],
    isActive: true,
    lastTriggered: "2 hours ago",
    triggerCount: 156,
  },
  {
    id: "wf_002",
    name: "24h Reminder",
    trigger: "booking_reminder",
    triggerLabel: "24h Before Meeting",
    actions: [{ action: "send_email", actionLabel: "Send Email", actionIcon: "send_email" }],
    isActive: true,
    lastTriggered: "Yesterday",
    triggerCount: 89,
  },
  {
    id: "wf_003",
    name: "WhatsApp Reminder",
    trigger: "booking_reminder",
    triggerLabel: "1h Before Meeting",
    actions: [{ action: "send_whatsapp", actionLabel: "Send WhatsApp", actionIcon: "send_whatsapp" }],
    isActive: true,
    lastTriggered: "3 hours ago",
    triggerCount: 45,
  },
  {
    id: "wf_004",
    name: "Slack New Booking Alert",
    trigger: "booking_created",
    triggerLabel: "Booking Created",
    actions: [{ action: "send_slack", actionLabel: "Post to Slack", actionIcon: "send_slack" }],
    isActive: false,
    lastTriggered: "1 week ago",
    triggerCount: 12,
  },
  {
    id: "wf_005",
    name: "Cancellation Notice",
    trigger: "booking_cancelled",
    triggerLabel: "Booking Cancelled",
    actions: [{ action: "send_email", actionLabel: "Send Email", actionIcon: "send_email" }],
    isActive: true,
    lastTriggered: "3 days ago",
    triggerCount: 8,
  },
  {
    id: "wf_006",
    name: "Payment Receipt + CRM Update",
    trigger: "payment_received",
    triggerLabel: "Payment Received",
    actions: [
      { action: "send_email", actionLabel: "Send Receipt", actionIcon: "send_email" },
      { action: "update_crm", actionLabel: "Update CRM", actionIcon: "update_crm" },
    ],
    isActive: true,
    lastTriggered: "5 hours ago",
    triggerCount: 34,
  },
  {
    id: "wf_007",
    name: "Post-Meeting Follow-up",
    trigger: "booking_completed",
    triggerLabel: "Meeting Completed",
    actions: [
      { action: "send_email", actionLabel: "Send Follow-up", actionIcon: "send_email" },
      { action: "webhook", actionLabel: "Notify CRM", actionIcon: "webhook" },
    ],
    isActive: true,
    lastTriggered: "Yesterday",
    triggerCount: 67,
  },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(demoWorkflows);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleDelete = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setDeleteConfirm(null);
  };

  const handleSave = (data: {
    name: string;
    trigger: WorkflowTrigger;
    triggerConfig: Record<string, unknown>;
    actions: { id: string; action: WorkflowAction; config: Record<string, unknown> }[];
    isActive: boolean;
  }) => {
    const triggerLabels: Record<string, string> = {
      booking_created: "Booking Created",
      booking_confirmed: "Booking Confirmed",
      booking_cancelled: "Booking Cancelled",
      booking_reminder: "Booking Reminder",
      booking_completed: "Meeting Completed",
      client_created: "New Client",
      payment_received: "Payment Received",
      payment_failed: "Payment Failed",
    };

    const actionLabels: Record<string, string> = {
      send_email: "Send Email",
      send_sms: "Send SMS",
      send_whatsapp: "Send WhatsApp",
      send_slack: "Post to Slack",
      update_crm: "Update CRM",
      create_invoice: "Create Invoice",
      add_to_list: "Add to List",
      webhook: "Send Webhook",
    };

    if (editingWorkflow) {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === editingWorkflow.id
            ? {
                ...w,
                name: data.name,
                trigger: data.trigger,
                triggerLabel: triggerLabels[data.trigger] ?? data.trigger,
                actions: data.actions.map((a) => ({
                  action: a.action,
                  actionLabel: actionLabels[a.action] ?? a.action,
                  actionIcon: a.action,
                })),
                isActive: data.isActive,
              }
            : w
        )
      );
    } else {
      const newWf: Workflow = {
        id: `wf_${Date.now()}`,
        name: data.name,
        trigger: data.trigger,
        triggerLabel: triggerLabels[data.trigger] ?? data.trigger,
        actions: data.actions.map((a) => ({
          action: a.action,
          actionLabel: actionLabels[a.action] ?? a.action,
          actionIcon: a.action,
        })),
        isActive: data.isActive,
        triggerCount: 0,
      };
      setWorkflows((prev) => [...prev, newWf]);
    }
    setModalOpen(false);
    setEditingWorkflow(null);
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
        <button
          onClick={() => { setEditingWorkflow(null); setModalOpen(true); }}
          className={btn.primary}
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">Active Workflows</div>
          <div className="text-2xl font-bold">
            {activeCount}{" "}
            <span className="text-sm text-text-muted font-normal">/ {workflows.length}</span>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">Total Executions</div>
          <div className="text-2xl font-bold">{totalTriggers}</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-card">
          <div className="text-xs text-text-muted font-medium mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green">98.5%</div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="space-y-3">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`rounded-xl border bg-bg-card p-5 transition ${
              wf.isActive ? "border-border" : "border-border opacity-60"
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

                {/* Trigger → Actions visual */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-accent-muted/50 text-accent text-xs font-medium">
                    {wf.triggerLabel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  {wf.actions.map((a, idx) => {
                    const ActionIcon = actionIcons[a.actionIcon] ?? Mail;
                    return (
                      <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-muted/50 text-violet text-xs font-medium">
                        <ActionIcon className="w-3 h-3" />
                        {a.actionLabel}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 mr-4 hidden sm:block">
                <div className="text-sm font-semibold">{wf.triggerCount} runs</div>
                <div className="text-xs text-text-muted">
                  {wf.lastTriggered ? `Last: ${wf.lastTriggered}` : "Never triggered"}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setEditingWorkflow(wf); setModalOpen(true); }}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-text hover:bg-white/[0.03] transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDeleteConfirm(deleteConfirm === wf.id ? null : wf.id)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-sec hover:text-rose hover:bg-rose-muted transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirm === wf.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-bg-card shadow-card z-30 p-3">
                      <p className="text-xs text-text-sec mb-2">Delete this workflow?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(wf.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose text-white hover:bg-rose/80 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-white/[0.03] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm mb-4">No workflows yet. Create one to automate your scheduling.</p>
          <button
            onClick={() => { setEditingWorkflow(null); setModalOpen(true); }}
            className={btn.primary}
          >
            <Plus className="w-4 h-4" /> Create Workflow
          </button>
        </div>
      )}

      <WorkflowModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingWorkflow(null); }}
        onSave={handleSave}
        initialData={
          editingWorkflow
            ? {
                id: editingWorkflow.id,
                name: editingWorkflow.name,
                trigger: editingWorkflow.trigger,
                triggerConfig: {},
                actions: editingWorkflow.actions.map((a, i) => ({
                  id: `action_${i}`,
                  action: a.action,
                  config: {},
                })),
                isActive: editingWorkflow.isActive,
              }
            : null
        }
      />
    </>
  );
}
