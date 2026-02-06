"use client";

import { useState } from "react";
import {
  Plus,
  Copy,
  Clock,
  Video,
  Phone,
  DollarSign,
  Pencil,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Monitor,
  MapPin,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { btn, colorToBg as colorBgMapTheme, locationLabels as locationLabelMapTheme } from "@/lib/theme";
import type { EventType } from "@/lib/types";
import { useEventTypes, useToggleEventType, demoUser, isConvexConnected } from "@/lib/data";

/** Map location type to Lucide icon component */
const locationIconMap: Record<string, LucideIcon> = {
  google_meet: Monitor,
  zoom: Video,
  phone: Phone,
  in_person: MapPin,
  custom: Link2,
};


export default function EventTypesPage() {
  const liveEvents = useEventTypes(isConvexConnected ? demoUser.id : undefined) as EventType[];
  const [localEvents, setLocalEvents] = useState<EventType[]>(liveEvents);
  const toggleMutation = useToggleEventType();

  // Keep local state in sync with Convex data
  const events: EventType[] = isConvexConnected ? liveEvents : localEvents;

  const toggleActive = async (id: string) => {
    if (isConvexConnected) {
      await toggleMutation({ id: id as any });
    } else {
      setLocalEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
      );
    }
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
        <button className={btn.primary}>
          <Plus className="w-4 h-4" /> New Event Type
        </button>
      </div>

      <div className="grid gap-4">
        {events.map((et) => {
          const LocationIcon = locationIconMap[et.location] ?? Monitor;
          const locationLabel = locationLabelMapTheme[et.location] ?? et.location;
          const bgColor = colorBgMapTheme[et.color] ?? "bg-accent";
          return (
            <div
              key={et.id}
              className={`rounded-xl border bg-bg-card overflow-hidden transition ${
                et.isActive ? "border-border" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start gap-5 p-6">
                {/* Color indicator */}
                <div
                  className={`w-2 h-16 rounded-full ${bgColor} mt-1 shrink-0`}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{et.title}</h3>
                    {!et.isActive && (
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
                      <LocationIcon className="w-3.5 h-3.5" /> {locationLabel}
                    </span>
                    {et.price && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> ${et.price}
                      </span>
                    )}
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
                    title={et.isActive ? "Deactivate" : "Activate"}
                  >
                    {et.isActive ? (
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
                  {appConfig.domain}/{demoUser.handle}/{et.slug}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
