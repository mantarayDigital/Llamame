"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Copy,
  MoreHorizontal,
  Clock,
  Video,
  Phone,
  DollarSign,
  Pencil,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Monitor,
} from "lucide-react";

const eventTypes = [
  {
    id: 1,
    name: "Discovery Call",
    slug: "discovery-call",
    duration: 30,
    location: "Google Meet",
    locationIcon: Monitor,
    price: null,
    color: "bg-accent",
    colorRing: "ring-accent/30",
    bookings: 42,
    active: true,
    description:
      "A quick introductory call to understand your needs and see if we're a good fit.",
  },
  {
    id: 2,
    name: "Strategy Session",
    slug: "strategy-session",
    duration: 60,
    location: "Google Meet",
    locationIcon: Monitor,
    price: 150,
    color: "bg-violet",
    colorRing: "ring-violet/30",
    bookings: 28,
    active: true,
    description:
      "A deep-dive strategy session to discuss your digital marketing goals and create an actionable roadmap.",
  },
  {
    id: 3,
    name: "Quick Check-in",
    slug: "quick-checkin",
    duration: 15,
    location: "Phone",
    locationIcon: Phone,
    price: null,
    color: "bg-green",
    colorRing: "ring-green/30",
    bookings: 67,
    active: true,
    description:
      "A brief catch-up call for existing clients to discuss quick updates or questions.",
  },
  {
    id: 4,
    name: "Workshop",
    slug: "workshop",
    duration: 120,
    location: "Zoom",
    locationIcon: Video,
    price: 500,
    color: "bg-amber",
    colorRing: "ring-amber/30",
    bookings: 5,
    active: false,
    description:
      "An intensive hands-on workshop covering advanced marketing strategies.",
  },
];

export default function EventTypesPage() {
  const [events, setEvents] = useState(eventTypes);

  const toggleActive = (id: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="text-text-sec text-sm mt-1">
            Manage your scheduling options. Toggle visibility, edit details, or
            create new types.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> New Event Type
        </button>
      </div>

      <div className="grid gap-4">
        {events.map((et) => (
          <div
            key={et.id}
            className={`rounded-xl border bg-bg-card overflow-hidden transition ${
              et.active ? "border-border" : "border-border opacity-60"
            }`}
          >
            <div className="flex items-start gap-5 p-6">
              {/* Color indicator */}
              <div
                className={`w-2 h-16 rounded-full ${et.color} mt-1 shrink-0`}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold">{et.name}</h3>
                  {!et.active && (
                    <span className="px-2 py-0.5 rounded text-[0.68rem] font-semibold bg-white/[0.06] text-text-muted">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-sec mb-3 max-w-xl">
                  {et.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {et.duration} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <et.locationIcon className="w-3.5 h-3.5" /> {et.location}
                  </span>
                  {et.price && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> ${et.price}
                    </span>
                  )}
                  <span className="text-text-muted">
                    {et.bookings} bookings
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-sec border border-border hover:bg-white/[0.03] hover:text-text transition"
                  title="Copy link"
                >
                  <Copy className="w-3 h-3" />
                  Copy link
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-sec border border-border hover:bg-white/[0.03] hover:text-text transition"
                  title="Preview"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-sec border border-border hover:bg-white/[0.03] hover:text-text transition"
                  title="Edit"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(et.id)}
                  className="text-text-sec hover:text-text transition"
                  title={et.active ? "Deactivate" : "Activate"}
                >
                  {et.active ? (
                    <ToggleRight className="w-8 h-8 text-green" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            {/* Booking link */}
            <div className="px-6 py-3 bg-white/[0.02] border-t border-border flex items-center gap-2">
              <span className="text-xs text-text-muted font-mono">
                llamame.io/mantaray/{et.slug}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
