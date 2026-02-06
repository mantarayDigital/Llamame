"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { appConfig } from "@/lib/config";
import { demoUser, demoEventTypes } from "@/lib/demo-data";
import { Clock, Video, Phone, Monitor, MapPin, LinkIcon } from "lucide-react";

/**
 * Public booking page for a user/org.
 * URL: /{handle}
 *
 * In production, this fetches the user by handle from Convex,
 * loads their active event types, and applies their branding.
 * Currently uses demo data as a placeholder.
 */

const locationIcons: Record<string, React.ElementType> = {
  google_meet: Monitor,
  zoom: Video,
  phone: Phone,
  in_person: MapPin,
  custom: LinkIcon,
};

const locationLabels: Record<string, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  phone: "Phone",
  in_person: "In Person",
  custom: "Custom",
};

export default function PublicBookingPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle;

  // TODO: Replace with Convex query: useQuery(api.users.getByHandle, { handle })
  const user = handle === demoUser.handle ? demoUser : null;
  const eventTypes = user
    ? demoEventTypes.filter((et) => et.isActive)
    : [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-text-sec mb-6">
            No booking page exists for &ldquo;{handle}&rdquo;
          </p>
          <Link
            href="/"
            className="text-accent hover:underline text-sm font-medium"
          >
            Go to {appConfig.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10 relative">
      {/* Background glow */}
      <div
        className="fixed top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-[1] w-full max-w-[600px]">
        {/* Host info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-text-muted text-sm font-mono">
            {appConfig.domain}/{user.handle}
          </p>
          {user.branding?.bio && (
            <p className="text-text-sec text-sm mt-3 max-w-md mx-auto leading-relaxed">
              {user.branding.bio}
            </p>
          )}
        </div>

        {/* Event types */}
        <div className="space-y-3">
          {eventTypes.map((et) => {
            const LocIcon = locationIcons[et.location] ?? LinkIcon;
            return (
              <Link
                key={et.id}
                href={`/${handle}/${et.slug}`}
                className="block p-5 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-hover transition group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-1.5 h-12 rounded-full bg-${et.color} shrink-0 mt-0.5`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-accent transition">
                      {et.title}
                    </h3>
                    {et.description && (
                      <p className="text-text-sec text-sm mt-1 line-clamp-2">
                        {et.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {et.duration} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <LocIcon className="w-3.5 h-3.5" />{" "}
                        {locationLabels[et.location]}
                      </span>
                      {et.price != null && et.price > 0 && (
                        <span className="font-medium text-text-sec">
                          ${et.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Powered by */}
        {user.branding?.showPoweredBy !== false && (
          <div className="text-center mt-8 text-xs text-text-muted">
            Powered by{" "}
            <Link href="/" className="text-text-sec font-semibold">
              {appConfig.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
