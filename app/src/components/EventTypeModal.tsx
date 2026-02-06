"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Globe,
  DollarSign,
  Users,
  Repeat,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  btn,
  input as inputStyles,
  card,
  toggle,
  badge,
  colorToBg,
} from "@/lib/theme";
import { locationTypes, durationPresets, defaults } from "@/lib/config";
import type {
  EventType,
  AvailabilityRule,
  CustomField,
  CustomFieldType,
  RecurrenceRule,
  GroupBookingConfig,
  DateOverride,
} from "@/lib/types";

// ─── Props ──────────────────────────────────────────────────────

interface EventTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (eventType: Partial<EventType>) => void;
  initialData?: EventType | null;
}

// ─── Constants ──────────────────────────────────────────────────

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const COLOR_OPTIONS: { name: string; key: string }[] = [
  { name: "Accent", key: "accent" },
  { name: "Violet", key: "violet" },
  { name: "Green", key: "green" },
  { name: "Amber", key: "amber" },
  { name: "Rose", key: "rose" },
];

const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "MXN", "BRL", "COP"];

const CUSTOM_FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

/** Generate time slots in 30-min increments from 06:00 to 22:00 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 6; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/** Auto-generate a URL slug from a title */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Generate a random ID for custom fields and overrides */
function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Form Data Shape ────────────────────────────────────────────

interface FormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  customDuration: string;
  color: string;
  location: string;
  locationDetails: string;

  requiresPayment: boolean;
  price: string;
  currency: string;

  availability: Record<number, { enabled: boolean; startTime: string; endTime: string }>;
  dateOverrides: DateOverride[];

  bufferBefore: number;
  bufferAfter: number;
  minNotice: string;
  maxAdvance: string;
  maxPerDay: string;

  requiresVibeCheck: boolean;
  customFields: CustomField[];

  enableRecurrence: boolean;
  recurrence: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    interval: string;
    endDate: string;
  };

  enableGroupBooking: boolean;
  groupBooking: {
    maxAttendees: string;
    minAttendees: string;
  };

  redirectUrl: string;
  confirmationMessage: string;
}

function buildDefaultAvailability(): FormData["availability"] {
  const avail: FormData["availability"] = {};
  for (let d = 0; d <= 6; d++) {
    // Monday-Friday enabled by default
    const isWeekday = d >= 1 && d <= 5;
    avail[d] = {
      enabled: isWeekday,
      startTime: "09:00",
      endTime: "17:00",
    };
  }
  return avail;
}

function buildInitialFormData(data?: EventType | null): FormData {
  if (!data) {
    return {
      title: "",
      slug: "",
      description: "",
      duration: 30,
      customDuration: "",
      color: "accent",
      location: "google_meet",
      locationDetails: "",

      requiresPayment: false,
      price: "",
      currency: defaults.currency,

      availability: buildDefaultAvailability(),
      dateOverrides: [],

      bufferBefore: defaults.bufferBefore,
      bufferAfter: defaults.bufferAfter,
      minNotice: "",
      maxAdvance: "",
      maxPerDay: "",

      requiresVibeCheck: false,
      customFields: [],

      enableRecurrence: false,
      recurrence: {
        frequency: "weekly",
        interval: "1",
        endDate: "",
      },

      enableGroupBooking: false,
      groupBooking: {
        maxAttendees: "10",
        minAttendees: "",
      },

      redirectUrl: "",
      confirmationMessage: "",
    };
  }

  // Rebuild availability map from rules array
  const avail = buildDefaultAvailability();
  // First disable all days, then re-enable from data
  for (let d = 0; d <= 6; d++) {
    avail[d] = { enabled: false, startTime: "09:00", endTime: "17:00" };
  }
  if (data.availability) {
    for (const rule of data.availability) {
      avail[rule.day] = {
        enabled: true,
        startTime: rule.startTime,
        endTime: rule.endTime,
      };
    }
  } else {
    // If no availability rules, use default weekday schedule
    for (let d = 1; d <= 5; d++) {
      avail[d].enabled = true;
    }
  }

  const isPreset = (durationPresets as readonly number[]).includes(data.duration);

  return {
    title: data.title,
    slug: data.slug,
    description: data.description ?? "",
    duration: isPreset ? data.duration : 0,
    customDuration: isPreset ? "" : String(data.duration),
    color: data.color,
    location: data.location,
    locationDetails: data.locationDetails ?? "",

    requiresPayment: data.requiresPayment,
    price: data.price != null ? String(data.price) : "",
    currency: data.currency ?? defaults.currency,

    availability: avail,
    dateOverrides: data.dateOverrides ?? [],

    bufferBefore: data.bufferBefore ?? defaults.bufferBefore,
    bufferAfter: data.bufferAfter ?? defaults.bufferAfter,
    minNotice: data.minNotice != null ? String(data.minNotice) : "",
    maxAdvance: data.maxAdvance != null ? String(data.maxAdvance) : "",
    maxPerDay: data.maxPerDay != null ? String(data.maxPerDay) : "",

    requiresVibeCheck: data.requiresVibeCheck,
    customFields: data.customFields ?? [],

    enableRecurrence: !!data.recurrence,
    recurrence: data.recurrence
      ? {
          frequency: data.recurrence.frequency,
          interval: String(data.recurrence.interval),
          endDate: data.recurrence.endDate
            ? new Date(data.recurrence.endDate).toISOString().split("T")[0]
            : "",
        }
      : { frequency: "weekly", interval: "1", endDate: "" },

    enableGroupBooking: !!data.groupBooking?.enabled,
    groupBooking: data.groupBooking
      ? {
          maxAttendees: String(data.groupBooking.maxAttendees),
          minAttendees: data.groupBooking.minAttendees != null
            ? String(data.groupBooking.minAttendees)
            : "",
        }
      : { maxAttendees: "10", minAttendees: "" },

    redirectUrl: data.redirectUrl ?? "",
    confirmationMessage: data.confirmationMessage ?? "",
  };
}

// ─── Collapsible Section Sub-Component ──────────────────────────

function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={card.base}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-text-sec">{icon}</span>}
          <span className="text-sm font-semibold text-text">{title}</span>
        </div>
        <span className="text-text-sec">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Switch Sub-Component ────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`${toggle.track} ${checked ? toggle.trackOn : toggle.trackOff}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <div
          className={`${toggle.thumb} ${checked ? toggle.thumbOn : toggle.thumbOff}`}
        />
      </div>
      {label && <span className="text-sm text-text">{label}</span>}
    </label>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function EventTypeModal({
  open,
  onClose,
  onSave,
  initialData,
}: EventTypeModalProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    buildInitialFormData(initialData),
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Re-initialize when initialData or open changes
  useEffect(() => {
    if (open) {
      setFormData(buildInitialFormData(initialData));
      setSlugManuallyEdited(!!initialData);
    }
  }, [open, initialData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugManuallyEdited]);

  if (!open) return null;

  // ── Helpers ────────────────────────────────────────────────

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSave() {
    const duration =
      formData.duration > 0
        ? formData.duration
        : parseInt(formData.customDuration, 10) || 30;

    // Build availability rules from the map
    const availabilityRules: AvailabilityRule[] = [];
    for (let d = 0; d <= 6; d++) {
      const slot = formData.availability[d];
      if (slot && slot.enabled) {
        availabilityRules.push({
          day: d,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }

    // Build recurrence rule
    let recurrence: RecurrenceRule | undefined;
    if (formData.enableRecurrence) {
      recurrence = {
        frequency: formData.recurrence.frequency,
        interval: parseInt(formData.recurrence.interval, 10) || 1,
        endDate: formData.recurrence.endDate
          ? new Date(formData.recurrence.endDate).getTime()
          : undefined,
      };
    }

    // Build group booking config
    let groupBooking: GroupBookingConfig | undefined;
    if (formData.enableGroupBooking) {
      groupBooking = {
        enabled: true,
        maxAttendees: parseInt(formData.groupBooking.maxAttendees, 10) || 10,
        minAttendees: formData.groupBooking.minAttendees
          ? parseInt(formData.groupBooking.minAttendees, 10)
          : undefined,
      };
    }

    const result: Partial<EventType> = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || undefined,
      duration,
      color: formData.color,
      location: formData.location as EventType["location"],
      locationDetails: formData.locationDetails || undefined,
      requiresPayment: formData.requiresPayment,
      price: formData.requiresPayment
        ? parseFloat(formData.price) || 0
        : undefined,
      currency: formData.requiresPayment ? formData.currency : undefined,
      availability: availabilityRules,
      dateOverrides:
        formData.dateOverrides.length > 0
          ? formData.dateOverrides
          : undefined,
      bufferBefore: formData.bufferBefore,
      bufferAfter: formData.bufferAfter,
      minNotice: formData.minNotice
        ? parseInt(formData.minNotice, 10)
        : undefined,
      maxAdvance: formData.maxAdvance
        ? parseInt(formData.maxAdvance, 10)
        : undefined,
      maxPerDay: formData.maxPerDay
        ? parseInt(formData.maxPerDay, 10)
        : undefined,
      requiresVibeCheck: formData.requiresVibeCheck,
      customFields:
        formData.customFields.length > 0 ? formData.customFields : undefined,
      recurrence,
      groupBooking,
      redirectUrl: formData.redirectUrl || undefined,
      confirmationMessage: formData.confirmationMessage || undefined,
      isActive: initialData?.isActive ?? true,
    };

    onSave(result);
  }

  // ── Availability helpers ───────────────────────────────────

  function updateDayAvailability(
    day: number,
    patch: Partial<FormData["availability"][number]>,
  ) {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], ...patch },
      },
    }));
  }

  function copyToAllWeekdays() {
    // Find the first enabled day to copy from
    const source =
      formData.availability[1]?.enabled
        ? formData.availability[1]
        : Object.values(formData.availability).find((s) => s.enabled);
    if (!source) return;
    setFormData((prev) => {
      const updated = { ...prev.availability };
      for (let d = 1; d <= 5; d++) {
        updated[d] = {
          enabled: true,
          startTime: source.startTime,
          endTime: source.endTime,
        };
      }
      return { ...prev, availability: updated };
    });
  }

  // ── Date override helpers ──────────────────────────────────

  function addDateOverride() {
    const newOverride: DateOverride = {
      date: "",
      available: false,
      startTime: "09:00",
      endTime: "17:00",
      reason: "",
    };
    update("dateOverrides", [...formData.dateOverrides, newOverride]);
  }

  function updateDateOverride(index: number, patch: Partial<DateOverride>) {
    const updated = formData.dateOverrides.map((o, i) =>
      i === index ? { ...o, ...patch } : o,
    );
    update("dateOverrides", updated);
  }

  function removeDateOverride(index: number) {
    update(
      "dateOverrides",
      formData.dateOverrides.filter((_, i) => i !== index),
    );
  }

  // ── Custom field helpers ───────────────────────────────────

  function addCustomField() {
    const field: CustomField = {
      id: randomId(),
      label: "",
      type: "text",
      required: false,
      placeholder: "",
    };
    update("customFields", [...formData.customFields, field]);
  }

  function updateCustomField(id: string, patch: Partial<CustomField>) {
    const updated = formData.customFields.map((f) =>
      f.id === id ? { ...f, ...patch } : f,
    );
    update("customFields", updated);
  }

  function removeCustomField(id: string) {
    update(
      "customFields",
      formData.customFields.filter((f) => f.id !== id),
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-bg-card border border-border rounded-2xl shadow-card w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">
            {initialData ? "Edit Event Type" : "New Event Type"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={btn.iconSm}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ──────────────── 1. Basic Info ──────────────── */}
          <Section title="Basic Info" icon={<FileText size={16} />} defaultOpen>
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Title <span className="text-rose">*</span>
              </label>
              <input
                type="text"
                className={inputStyles.base}
                placeholder="e.g. Discovery Call"
                value={formData.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Slug
              </label>
              <input
                type="text"
                className={inputStyles.base}
                placeholder="discovery-call"
                value={formData.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  update("slug", slugify(e.target.value));
                }}
              />
              <p className="text-xs text-text-muted mt-1">
                URL path: /{formData.slug || "..."}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Description
              </label>
              <textarea
                className={inputStyles.textarea}
                placeholder="Brief description of this event type..."
                rows={3}
                value={formData.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {durationPresets.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      update("duration", d);
                      update("customDuration", "");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      formData.duration === d
                        ? "bg-accent text-bg"
                        : "bg-white/[0.03] border border-border text-text-sec hover:border-border-hover hover:text-text"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => update("duration", 0)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    formData.duration === 0
                      ? "bg-accent text-bg"
                      : "bg-white/[0.03] border border-border text-text-sec hover:border-border-hover hover:text-text"
                  }`}
                >
                  Custom
                </button>
              </div>
              {formData.duration === 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    className={`${inputStyles.base} max-w-[120px]`}
                    placeholder="Minutes"
                    min={5}
                    value={formData.customDuration}
                    onChange={(e) => update("customDuration", e.target.value)}
                  />
                  <span className="text-sm text-text-sec">minutes</span>
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Color
              </label>
              <div className="flex gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => update("color", c.key)}
                    className={`w-7 h-7 rounded-full ${colorToBg[c.key]} transition-all ${
                      formData.color === c.key
                        ? "ring-2 ring-offset-2 ring-offset-bg-card ring-white/40 scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    title={c.name}
                    aria-label={`Select ${c.name} color`}
                  />
                ))}
              </div>
            </div>

            {/* Location type */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Location
              </label>
              <select
                className={inputStyles.select}
                value={formData.location}
                onChange={(e) => update("location", e.target.value)}
              >
                {locationTypes.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location details (for custom/in_person) */}
            {(formData.location === "custom" ||
              formData.location === "in_person") && (
              <div>
                <label className="block text-xs font-medium text-text-sec mb-1.5">
                  {formData.location === "in_person"
                    ? "Address"
                    : "Meeting link or instructions"}
                </label>
                <input
                  type="text"
                  className={inputStyles.base}
                  placeholder={
                    formData.location === "in_person"
                      ? "123 Main St, City, State"
                      : "https://meet.example.com/..."
                  }
                  value={formData.locationDetails}
                  onChange={(e) => update("locationDetails", e.target.value)}
                />
              </div>
            )}
          </Section>

          {/* ──────────────── 2. Pricing ─────────────────── */}
          <Section title="Pricing" icon={<DollarSign size={16} />}>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                checked={formData.requiresPayment}
                onChange={(val) => update("requiresPayment", val)}
                label="Requires payment"
              />
              {formData.requiresPayment && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.green}`}
                >
                  Paid event
                </span>
              )}
            </div>

            {formData.requiresPayment && (
              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-sec mb-1.5">
                    Price
                  </label>
                  <input
                    type="number"
                    className={inputStyles.base}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    value={formData.price}
                    onChange={(e) => update("price", e.target.value)}
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-text-sec mb-1.5">
                    Currency
                  </label>
                  <select
                    className={inputStyles.select}
                    value={formData.currency}
                    onChange={(e) => update("currency", e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </Section>

          {/* ──────────────── 3. Availability ────────────── */}
          <Section title="Availability" icon={<Clock size={16} />}>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const slot = formData.availability[day];
                return (
                  <div
                    key={day}
                    className="flex items-center gap-3 flex-wrap sm:flex-nowrap"
                  >
                    <div className="w-24 shrink-0">
                      <ToggleSwitch
                        checked={slot.enabled}
                        onChange={(val) =>
                          updateDayAvailability(day, { enabled: val })
                        }
                        label={DAY_LABELS[day].slice(0, 3)}
                      />
                    </div>
                    {slot.enabled && (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          className={`${inputStyles.select} max-w-[130px]`}
                          value={slot.startTime}
                          onChange={(e) =>
                            updateDayAvailability(day, {
                              startTime: e.target.value,
                            })
                          }
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <span className="text-text-muted text-sm">to</span>
                        <select
                          className={`${inputStyles.select} max-w-[130px]`}
                          value={slot.endTime}
                          onChange={(e) =>
                            updateDayAvailability(day, {
                              endTime: e.target.value,
                            })
                          }
                        >
                          {TIME_SLOTS.filter((t) => t > slot.startTime).map(
                            (t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={copyToAllWeekdays}
              className={btn.ghost}
            >
              Copy to all weekdays
            </button>

            {/* Date Overrides */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-sec">
                  Date Overrides
                </span>
                <button
                  type="button"
                  onClick={addDateOverride}
                  className={btn.iconSm}
                  aria-label="Add date override"
                >
                  <Plus size={14} />
                </button>
              </div>
              {formData.dateOverrides.length === 0 && (
                <p className="text-xs text-text-muted">
                  No date overrides. Add one to block or customize a specific
                  date.
                </p>
              )}
              <div className="space-y-3">
                {formData.dateOverrides.map((override, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-border"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className={`${inputStyles.base} max-w-[170px]`}
                          value={override.date}
                          onChange={(e) =>
                            updateDateOverride(idx, { date: e.target.value })
                          }
                        />
                        <ToggleSwitch
                          checked={override.available}
                          onChange={(val) =>
                            updateDateOverride(idx, { available: val })
                          }
                          label={override.available ? "Available" : "Blocked"}
                        />
                      </div>
                      {override.available && (
                        <div className="flex items-center gap-2">
                          <select
                            className={`${inputStyles.select} max-w-[120px]`}
                            value={override.startTime ?? "09:00"}
                            onChange={(e) =>
                              updateDateOverride(idx, {
                                startTime: e.target.value,
                              })
                            }
                          >
                            {TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <span className="text-text-muted text-sm">to</span>
                          <select
                            className={`${inputStyles.select} max-w-[120px]`}
                            value={override.endTime ?? "17:00"}
                            onChange={(e) =>
                              updateDateOverride(idx, {
                                endTime: e.target.value,
                              })
                            }
                          >
                            {TIME_SLOTS.filter(
                              (t) => t > (override.startTime ?? "09:00"),
                            ).map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <input
                        type="text"
                        className={inputStyles.base}
                        placeholder="Reason (optional)"
                        value={override.reason ?? ""}
                        onChange={(e) =>
                          updateDateOverride(idx, { reason: e.target.value })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDateOverride(idx)}
                      className={btn.iconSm}
                      aria-label="Remove date override"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ──────────────── 4. Buffers & Limits ────────── */}
          <Section title="Buffers & Limits" icon={<Shield size={16} />}>
            <div className="grid grid-cols-2 gap-4">
              {/* Buffer before */}
              <div>
                <label className="block text-xs font-medium text-text-sec mb-1.5">
                  Buffer before (min)
                </label>
                <select
                  className={inputStyles.select}
                  value={formData.bufferBefore}
                  onChange={(e) =>
                    update("bufferBefore", parseInt(e.target.value, 10))
                  }
                >
                  {BUFFER_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v === 0 ? "None" : `${v} min`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buffer after */}
              <div>
                <label className="block text-xs font-medium text-text-sec mb-1.5">
                  Buffer after (min)
                </label>
                <select
                  className={inputStyles.select}
                  value={formData.bufferAfter}
                  onChange={(e) =>
                    update("bufferAfter", parseInt(e.target.value, 10))
                  }
                >
                  {BUFFER_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v === 0 ? "None" : `${v} min`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum notice */}
              <div>
                <label className="block text-xs font-medium text-text-sec mb-1.5">
                  Minimum notice (hours)
                </label>
                <input
                  type="number"
                  className={inputStyles.base}
                  placeholder="e.g. 24"
                  min={0}
                  value={formData.minNotice}
                  onChange={(e) => update("minNotice", e.target.value)}
                />
              </div>

              {/* Max advance booking */}
              <div>
                <label className="block text-xs font-medium text-text-sec mb-1.5">
                  Max advance booking (days)
                </label>
                <input
                  type="number"
                  className={inputStyles.base}
                  placeholder="e.g. 60"
                  min={1}
                  value={formData.maxAdvance}
                  onChange={(e) => update("maxAdvance", e.target.value)}
                />
              </div>
            </div>

            {/* Max bookings per day */}
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Max bookings per day
              </label>
              <input
                type="number"
                className={`${inputStyles.base} max-w-[200px]`}
                placeholder="0 = unlimited"
                min={0}
                value={formData.maxPerDay}
                onChange={(e) => update("maxPerDay", e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1">
                Set to 0 or leave empty for unlimited.
              </p>
            </div>
          </Section>

          {/* ──────────────── 5. Booking Form ────────────── */}
          <Section title="Booking Form" icon={<FileText size={16} />}>
            <ToggleSwitch
              checked={formData.requiresVibeCheck}
              onChange={(val) => update("requiresVibeCheck", val)}
              label="Require Vibe Check"
            />

            {/* Custom fields */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-sec">
                  Custom Fields
                </span>
                <button
                  type="button"
                  onClick={addCustomField}
                  className={btn.iconSm}
                  aria-label="Add custom field"
                >
                  <Plus size={14} />
                </button>
              </div>
              {formData.customFields.length === 0 && (
                <p className="text-xs text-text-muted">
                  No custom fields. Standard name and email are always
                  collected.
                </p>
              )}
              <div className="space-y-3">
                {formData.customFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-border space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted cursor-grab">
                        <GripVertical size={14} />
                      </span>
                      <input
                        type="text"
                        className={`${inputStyles.base} flex-1`}
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) =>
                          updateCustomField(field.id, {
                            label: e.target.value,
                          })
                        }
                      />
                      <select
                        className={`${inputStyles.select} w-32`}
                        value={field.type}
                        onChange={(e) =>
                          updateCustomField(field.id, {
                            type: e.target.value as CustomFieldType,
                          })
                        }
                      >
                        {CUSTOM_FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCustomField(field.id)}
                        className={btn.iconSm}
                        aria-label="Remove field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pl-6">
                      <input
                        type="text"
                        className={`${inputStyles.base} flex-1`}
                        placeholder="Placeholder text"
                        value={field.placeholder ?? ""}
                        onChange={(e) =>
                          updateCustomField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                      <ToggleSwitch
                        checked={field.required}
                        onChange={(val) =>
                          updateCustomField(field.id, { required: val })
                        }
                        label="Required"
                      />
                    </div>

                    {/* Options input for select type */}
                    {field.type === "select" && (
                      <div className="pl-6">
                        <label className="block text-xs font-medium text-text-sec mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          className={inputStyles.base}
                          placeholder="Option 1, Option 2, Option 3"
                          value={(field.options ?? []).join(", ")}
                          onChange={(e) =>
                            updateCustomField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ──────────────── 6. Recurring & Group ───────── */}
          <Section title="Recurring & Group" icon={<Repeat size={16} />}>
            {/* Recurring */}
            <div className="space-y-3">
              <ToggleSwitch
                checked={formData.enableRecurrence}
                onChange={(val) => update("enableRecurrence", val)}
                label="Enable recurring bookings"
              />

              {formData.enableRecurrence && (
                <div className="pl-1 space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-sec mb-1.5">
                        Frequency
                      </label>
                      <select
                        className={inputStyles.select}
                        value={formData.recurrence.frequency}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: {
                              ...prev.recurrence,
                              frequency: e.target.value as RecurrenceRule["frequency"],
                            },
                          }))
                        }
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-sec mb-1.5">
                        Interval
                      </label>
                      <input
                        type="number"
                        className={inputStyles.base}
                        min={1}
                        value={formData.recurrence.interval}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: {
                              ...prev.recurrence,
                              interval: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-sec mb-1.5">
                      End date (optional)
                    </label>
                    <input
                      type="date"
                      className={`${inputStyles.base} max-w-[200px]`}
                      value={formData.recurrence.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurrence: {
                            ...prev.recurrence,
                            endDate: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Group booking */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-text-sec" />
                <ToggleSwitch
                  checked={formData.enableGroupBooking}
                  onChange={(val) => update("enableGroupBooking", val)}
                  label="Enable group booking"
                />
              </div>

              {formData.enableGroupBooking && (
                <div className="pl-1 grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-text-sec mb-1.5">
                      Max attendees
                    </label>
                    <input
                      type="number"
                      className={inputStyles.base}
                      min={2}
                      value={formData.groupBooking.maxAttendees}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupBooking: {
                            ...prev.groupBooking,
                            maxAttendees: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-sec mb-1.5">
                      Min attendees (optional)
                    </label>
                    <input
                      type="number"
                      className={inputStyles.base}
                      min={1}
                      placeholder="No minimum"
                      value={formData.groupBooking.minAttendees}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          groupBooking: {
                            ...prev.groupBooking,
                            minAttendees: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ──────────────── 7. Advanced ────────────────── */}
          <Section title="Advanced" icon={<Globe size={16} />}>
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Redirect URL after booking
              </label>
              <input
                type="url"
                className={inputStyles.base}
                placeholder="https://example.com/thank-you"
                value={formData.redirectUrl}
                onChange={(e) => update("redirectUrl", e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1">
                Leave empty to show the default confirmation page.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Custom confirmation message
              </label>
              <textarea
                className={inputStyles.textarea}
                placeholder="Thanks for booking! Looking forward to our meeting..."
                rows={3}
                value={formData.confirmationMessage}
                onChange={(e) =>
                  update("confirmationMessage", e.target.value)
                }
              />
            </div>
          </Section>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className={btn.ghost}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} className={btn.primary}>
            {initialData ? "Save Changes" : "Create Event Type"}
          </button>
        </div>
      </div>
    </div>
  );
}
