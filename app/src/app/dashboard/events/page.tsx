"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Clock,
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  MoreHorizontal,
  Repeat,
  Shield,
} from "lucide-react";
import {
  useEventTypes,
  demoUser,
  demoEventTypes,
  isConvexConnected,
} from "@/lib/data";
import type { EventType } from "@/lib/types";
import { appConfig } from "@/lib/config";
import {
  btn,
  input as inputStyles,
  colorToBg,
  locationLabels,
  currencyFormatter,
} from "@/lib/theme";
import EventTypeModal from "@/components/EventTypeModal";

export default function EventsPage() {
  const rawEvents = useEventTypes(
    isConvexConnected ? demoUser.id : undefined
  ) as EventType[];
  const [events, setEvents] = useState<EventType[]>(rawEvents);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const displayEvents = events.length > 0 ? events : rawEvents;

  const filtered = displayEvents.filter(
    (e) =>
      search === "" ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.slug.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = displayEvents.filter((e) => e.isActive).length;

  const toggleActive = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
    );
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setMenuOpenId(null);
  };

  const handleDuplicate = (event: EventType) => {
    const dup: EventType = {
      ...event,
      id: `evt_${Date.now()}`,
      title: `${event.title} (Copy)`,
      slug: `${event.slug}-copy`,
      isActive: false,
      createdAt: Date.now(),
    };
    setEvents((prev) => [...prev, dup]);
    setMenuOpenId(null);
  };

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${appConfig.domain}/${demoUser.handle}/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (data: Partial<EventType>) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...data } : e))
      );
    } else {
      const newEvent: EventType = {
        id: `evt_${Date.now()}`,
        userId: demoUser.id,
        title: data.title ?? "New Event",
        slug: data.slug ?? `event-${Date.now()}`,
        description: data.description,
        duration: data.duration ?? 30,
        color: data.color ?? "accent",
        location: data.location ?? "google_meet",
        price: data.price,
        currency: data.currency ?? "USD",
        isActive: true,
        requiresVibeCheck: data.requiresVibeCheck ?? true,
        requiresPayment: data.requiresPayment ?? false,
        bufferBefore: data.bufferBefore,
        bufferAfter: data.bufferAfter,
        minNotice: data.minNotice,
        maxAdvance: data.maxAdvance,
        maxPerDay: data.maxPerDay,
        availability: data.availability,
        dateOverrides: data.dateOverrides,
        customFields: data.customFields,
        recurrence: data.recurrence,
        groupBooking: data.groupBooking,
        redirectUrl: data.redirectUrl,
        confirmationMessage: data.confirmationMessage,
        createdAt: Date.now(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="text-text-sec text-sm mt-1">
            Create and manage your scheduling event types.
          </p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setModalOpen(true); }}
          className={btn.primary}
        >
          <Plus className="w-4 h-4" /> New Event Type
        </button>
      </div>

      {/* Stats + Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm">
          <span className="text-text-sec">
            <strong className="text-text">{displayEvents.length}</strong> event types
          </span>
          <span className="text-text-sec">
            <strong className="text-green">{activeCount}</strong> active
          </span>
          <span className="text-text-sec">
            <strong className="text-text-muted">{displayEvents.length - activeCount}</strong> inactive
          </span>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputStyles.search}
          />
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((et) => {
          const bgColor = colorToBg[et.color] ?? "bg-accent";
          const locLabel = locationLabels[et.location] ?? et.location;
          return (
            <div
              key={et.id}
              className={`rounded-xl border bg-bg-card p-5 transition group ${
                et.isActive ? "border-border hover:border-border-hover" : "border-border opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-2 h-12 rounded-full ${bgColor} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg truncate">{et.title}</h3>
                    {!et.isActive && (
                      <span className="px-2 py-0.5 rounded text-[0.68rem] font-semibold bg-white/[0.06] text-text-muted">
                        Inactive
                      </span>
                    )}
                    {et.recurrence && (
                      <Repeat className="w-3.5 h-3.5 text-violet" />
                    )}
                    {et.groupBooking?.enabled && (
                      <Users className="w-3.5 h-3.5 text-accent" />
                    )}
                  </div>
                  <p className="text-sm text-text-muted truncate">
                    /{demoUser.handle}/{et.slug}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyLink(et.slug, et.id)}
                    className={btn.iconSm}
                    title="Copy link"
                  >
                    {copiedId === et.id ? (
                      <span className="text-green text-xs">Done</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => { setEditingEvent(et); setModalOpen(true); }}
                    className={btn.iconSm}
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === et.id ? null : et.id)}
                      className={btn.iconSm}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {menuOpenId === et.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-bg-card shadow-card z-30">
                        <button
                          onClick={() => handleDuplicate(et)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-sec hover:bg-white/[0.03] transition"
                        >
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-sec hover:bg-white/[0.03] transition">
                          <ExternalLink className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleDelete(et.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose hover:bg-rose-muted transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-text-sec mb-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {et.duration} min
                </span>
                <span className="capitalize">{locLabel}</span>
                {et.price ? (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {currencyFormatter.format(et.price)}
                  </span>
                ) : (
                  <span className="text-green font-medium">Free</span>
                )}
                {et.requiresVibeCheck && (
                  <span className="flex items-center gap-1.5 text-violet">
                    <Shield className="w-3.5 h-3.5" /> Vibe Check
                  </span>
                )}
                {(et.bufferBefore || et.bufferAfter) && (
                  <span className="text-text-muted">
                    Buffer: {et.bufferBefore ?? 0}/{et.bufferAfter ?? 0}m
                  </span>
                )}
              </div>

              {/* Description */}
              {et.description && (
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {et.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => toggleActive(et.id)}
                  className="flex items-center gap-2 text-sm text-text-sec hover:text-text transition"
                >
                  {et.isActive ? (
                    <ToggleRight className="w-6 h-6 text-green" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                  {et.isActive ? "Active" : "Inactive"}
                </button>
                <Link
                  href="/booking"
                  className="text-xs text-accent font-medium hover:underline"
                >
                  Preview &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm mb-4">
            {search ? "No event types match your search." : "No event types yet."}
          </p>
          {!search && (
            <button
              onClick={() => { setEditingEvent(null); setModalOpen(true); }}
              className={btn.primary}
            >
              <Plus className="w-4 h-4" /> Create your first event type
            </button>
          )}
        </div>
      )}

      <EventTypeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSave}
        initialData={editingEvent}
      />
    </>
  );
}
