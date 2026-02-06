"use client";

import { useState } from "react";
import {
  X,
  Zap,
  Mail,
  MessageCircle,
  Bell,
  Globe,
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  Code,
  Send,
  FileText,
} from "lucide-react";
import { btn, input as inputStyles, card, toggle } from "@/lib/theme";
import type { WorkflowTrigger, WorkflowAction } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────

interface WorkflowActionStep {
  id: string;
  action: WorkflowAction;
  config: Record<string, unknown>;
}

interface WorkflowFormData {
  id?: string;
  name: string;
  trigger: WorkflowTrigger;
  triggerConfig: Record<string, unknown>;
  actions: WorkflowActionStep[];
  isActive: boolean;
}

interface WorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (workflow: WorkflowFormData) => void;
  initialData?: WorkflowFormData | null;
}

// ─── Trigger definitions ─────────────────────────────────────────

interface TriggerDef {
  value: WorkflowTrigger;
  label: string;
  icon: typeof Zap;
}

const TRIGGERS: TriggerDef[] = [
  { value: "booking_created", label: "When a booking is created", icon: Zap },
  { value: "booking_confirmed", label: "When a booking is confirmed", icon: Zap },
  { value: "booking_cancelled", label: "When a booking is cancelled", icon: Zap },
  { value: "booking_reminder", label: "Before a meeting starts", icon: Clock },
  { value: "booking_completed", label: "When a meeting ends", icon: Zap },
  { value: "client_created", label: "When a new client is added", icon: Zap },
  { value: "payment_received", label: "When payment is received", icon: Zap },
  { value: "payment_failed", label: "When payment fails", icon: Zap },
];

// ─── Action definitions ──────────────────────────────────────────

interface ActionDef {
  value: WorkflowAction;
  label: string;
  icon: typeof Mail;
}

const ACTIONS: ActionDef[] = [
  { value: "send_email", label: "Send Email", icon: Mail },
  { value: "send_sms", label: "Send SMS", icon: MessageCircle },
  { value: "send_whatsapp", label: "Send WhatsApp", icon: MessageCircle },
  { value: "send_slack", label: "Post to Slack", icon: Bell },
  { value: "update_crm", label: "Update CRM", icon: FileText },
  { value: "create_invoice", label: "Create Invoice", icon: FileText },
  { value: "add_to_list", label: "Add to List", icon: Plus },
  { value: "webhook", label: "Send Webhook", icon: Globe },
];

// ─── Template variables ──────────────────────────────────────────

const TEMPLATE_VARIABLES = [
  "{{clientName}}",
  "{{meetingDate}}",
  "{{meetingTime}}",
  "{{eventType}}",
  "{{meetingUrl}}",
] as const;

// ─── Helpers ─────────────────────────────────────────────────────

let idCounter = 0;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `action-${Date.now()}-${idCounter}`;
}

function defaultFormData(): WorkflowFormData {
  return {
    name: "",
    trigger: "booking_created",
    triggerConfig: {},
    actions: [
      {
        id: generateId(),
        action: "send_email",
        config: { subject: "", body: "" },
      },
    ],
    isActive: true,
  };
}

function defaultConfigForAction(action: WorkflowAction): Record<string, unknown> {
  switch (action) {
    case "send_email":
      return { subject: "", body: "" };
    case "send_sms":
    case "send_whatsapp":
      return { message: "" };
    case "send_slack":
      return { channel: "", message: "" };
    case "webhook":
      return { url: "", headers: "" };
    case "update_crm":
    case "create_invoice":
    case "add_to_list":
      return { note: "" };
    default:
      return {};
  }
}

// ─── Component ───────────────────────────────────────────────────

export default function WorkflowModal({
  open,
  onClose,
  onSave,
  initialData,
}: WorkflowModalProps) {
  const [formData, setFormData] = useState<WorkflowFormData>(
    initialData ?? defaultFormData(),
  );

  // Reset form when modal opens with new data
  // (kept simple — parent controls open/initialData)

  if (!open) return null;

  // ── Field helpers ────────────────────────────────────────────

  function setName(name: string) {
    setFormData((prev) => ({ ...prev, name }));
  }

  function setTrigger(trigger: WorkflowTrigger) {
    setFormData((prev) => ({
      ...prev,
      trigger,
      triggerConfig:
        trigger === "booking_reminder"
          ? { hoursBefore: prev.triggerConfig.hoursBefore ?? 1 }
          : {},
    }));
  }

  function setTriggerConfigValue(key: string, value: unknown) {
    setFormData((prev) => ({
      ...prev,
      triggerConfig: { ...prev.triggerConfig, [key]: value },
    }));
  }

  function toggleActive() {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  }

  // ── Action helpers ───────────────────────────────────────────

  function updateActionType(stepId: string, newAction: WorkflowAction) {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === stepId
          ? { ...a, action: newAction, config: defaultConfigForAction(newAction) }
          : a,
      ),
    }));
  }

  function updateActionConfig(stepId: string, key: string, value: unknown) {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === stepId ? { ...a, config: { ...a.config, [key]: value } } : a,
      ),
    }));
  }

  function addAction() {
    setFormData((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: generateId(),
          action: "send_email",
          config: defaultConfigForAction("send_email"),
        },
      ],
    }));
  }

  function removeAction(stepId: string) {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== stepId),
    }));
  }

  function insertVariable(stepId: string, field: string, variable: string) {
    const step = formData.actions.find((a) => a.id === stepId);
    if (!step) return;
    const current = (step.config[field] as string) ?? "";
    updateActionConfig(stepId, field, current + variable);
  }

  // ── Submit ───────────────────────────────────────────────────

  function handleSave() {
    onSave(formData);
  }

  // ── Determine which actions show a message field (for variable buttons) ──

  function hasMessageField(action: WorkflowAction): boolean {
    return ["send_email", "send_sms", "send_whatsapp", "send_slack"].includes(action);
  }

  function messageFieldKey(action: WorkflowAction): string {
    return action === "send_email" ? "body" : "message";
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl shadow-card w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap size={18} className="text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-text">
              {initialData?.id ? "Edit Workflow" : "Create Workflow"}
            </h2>
          </div>
          <button onClick={onClose} className={btn.iconSm}>
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable content ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ── Workflow name + active toggle ──────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text">
                Workflow Name
              </label>
              <button
                type="button"
                onClick={toggleActive}
                className={`${toggle.track} ${formData.isActive ? toggle.trackOn : toggle.trackOff}`}
                aria-label="Toggle workflow active"
              >
                <span
                  className={`${toggle.thumb} ${formData.isActive ? toggle.thumbOn : toggle.thumbOff}`}
                />
              </button>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Send confirmation email on booking"
              className={inputStyles.base}
            />
          </div>

          {/* ── Trigger selector ───────────────────────────────── */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text">
              Trigger
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map((t) => {
                const selected = formData.trigger === t.value;
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTrigger(t.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition ${
                      selected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-white/[0.02] text-text-sec hover:border-border-hover hover:text-text"
                    }`}
                  >
                    <Icon size={15} className={selected ? "text-accent" : "text-text-muted"} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reminder config */}
            {formData.trigger === "booking_reminder" && (
              <div className="flex items-center gap-3 mt-2 pl-1">
                <label className="text-sm text-text-sec">Remind before</label>
                <input
                  type="number"
                  min={1}
                  value={(formData.triggerConfig.hoursBefore as number) ?? 1}
                  onChange={(e) =>
                    setTriggerConfigValue(
                      "hoursBefore",
                      Math.max(1, parseInt(e.target.value, 10) || 1),
                    )
                  }
                  className={`${inputStyles.base} !w-20 text-center`}
                />
                <span className="text-sm text-text-muted">hours</span>
              </div>
            )}
          </div>

          {/* ── Arrow visualization ────────────────────────────── */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2 text-text-muted">
              <ArrowRight size={16} />
              <span className="text-sm font-medium">Then...</span>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Actions ────────────────────────────────────────── */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text">
              Actions
            </label>

            {formData.actions.map((step, idx) => (
              <ActionCard
                key={step.id}
                step={step}
                index={idx}
                totalActions={formData.actions.length}
                onChangeAction={(action) => updateActionType(step.id, action)}
                onChangeConfig={(key, value) =>
                  updateActionConfig(step.id, key, value)
                }
                onInsertVariable={(field, variable) =>
                  insertVariable(step.id, field, variable)
                }
                onRemove={() => removeAction(step.id)}
                hasMessageField={hasMessageField}
                messageFieldKey={messageFieldKey}
              />
            ))}

            <button
              type="button"
              onClick={addAction}
              className={`${btn.ghost} w-full`}
            >
              <Plus size={16} />
              Add Action
            </button>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className={btn.ghost}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} className={btn.primary}>
            <Send size={16} />
            {initialData?.id ? "Save Changes" : "Create Workflow"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ActionCard sub-component ───────────────────────────────────

interface ActionCardProps {
  step: WorkflowActionStep;
  index: number;
  totalActions: number;
  onChangeAction: (action: WorkflowAction) => void;
  onChangeConfig: (key: string, value: unknown) => void;
  onInsertVariable: (field: string, variable: string) => void;
  onRemove: () => void;
  hasMessageField: (action: WorkflowAction) => boolean;
  messageFieldKey: (action: WorkflowAction) => string;
}

function ActionCard({
  step,
  index,
  totalActions,
  onChangeAction,
  onChangeConfig,
  onInsertVariable,
  onRemove,
  hasMessageField,
  messageFieldKey,
}: ActionCardProps) {
  const actionDef = ACTIONS.find((a) => a.value === step.action);
  const Icon = actionDef?.icon ?? Code;

  return (
    <div className={`${card.base} p-4 space-y-3`}>
      {/* Action header row */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-accent" />
        </div>

        <select
          value={step.action}
          onChange={(e) => onChangeAction(e.target.value as WorkflowAction)}
          className={inputStyles.select}
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          className={btn.iconSm}
          disabled={totalActions <= 1}
          title="Remove action"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Config fields per action type */}
      {step.action === "send_email" && (
        <div className="space-y-3">
          <input
            type="text"
            value={(step.config.subject as string) ?? ""}
            onChange={(e) => onChangeConfig("subject", e.target.value)}
            placeholder="Email subject"
            className={inputStyles.base}
          />
          <textarea
            value={(step.config.body as string) ?? ""}
            onChange={(e) => onChangeConfig("body", e.target.value)}
            placeholder="Email body..."
            className={inputStyles.textarea}
            rows={4}
          />
          <VariableButtons
            onInsert={(variable) => onInsertVariable("body", variable)}
          />
        </div>
      )}

      {(step.action === "send_sms" || step.action === "send_whatsapp") && (
        <div className="space-y-3">
          <textarea
            value={(step.config.message as string) ?? ""}
            onChange={(e) => onChangeConfig("message", e.target.value)}
            placeholder={
              step.action === "send_sms" ? "SMS message..." : "WhatsApp message..."
            }
            className={inputStyles.textarea}
            rows={3}
          />
          <VariableButtons
            onInsert={(variable) => onInsertVariable("message", variable)}
          />
        </div>
      )}

      {step.action === "send_slack" && (
        <div className="space-y-3">
          <input
            type="text"
            value={(step.config.channel as string) ?? ""}
            onChange={(e) => onChangeConfig("channel", e.target.value)}
            placeholder="#channel-name"
            className={inputStyles.base}
          />
          <textarea
            value={(step.config.message as string) ?? ""}
            onChange={(e) => onChangeConfig("message", e.target.value)}
            placeholder="Slack message..."
            className={inputStyles.textarea}
            rows={3}
          />
          <VariableButtons
            onInsert={(variable) => onInsertVariable("message", variable)}
          />
        </div>
      )}

      {step.action === "webhook" && (
        <div className="space-y-3">
          <input
            type="url"
            value={(step.config.url as string) ?? ""}
            onChange={(e) => onChangeConfig("url", e.target.value)}
            placeholder="https://example.com/webhook"
            className={inputStyles.base}
          />
          <textarea
            value={(step.config.headers as string) ?? ""}
            onChange={(e) => onChangeConfig("headers", e.target.value)}
            placeholder='Optional headers (JSON)&#10;{"Authorization": "Bearer ..."}'
            className={inputStyles.textarea}
            rows={2}
          />
        </div>
      )}

      {(step.action === "update_crm" ||
        step.action === "create_invoice" ||
        step.action === "add_to_list") && (
        <div>
          <input
            type="text"
            value={(step.config.note as string) ?? ""}
            onChange={(e) => onChangeConfig("note", e.target.value)}
            placeholder={
              step.action === "update_crm"
                ? "CRM update note..."
                : step.action === "create_invoice"
                  ? "Invoice description..."
                  : "List name or description..."
            }
            className={inputStyles.base}
          />
        </div>
      )}
    </div>
  );
}

// ─── VariableButtons sub-component ──────────────────────────────

interface VariableButtonsProps {
  onInsert: (variable: string) => void;
}

function VariableButtons({ onInsert }: VariableButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-text-muted mr-1">Insert:</span>
      {TEMPLATE_VARIABLES.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(v)}
          className="px-2 py-0.5 rounded text-xs font-mono bg-accent/10 text-accent hover:bg-accent/20 transition"
        >
          {v}
        </button>
      ))}
    </div>
  );
}
