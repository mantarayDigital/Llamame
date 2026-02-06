"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { useUserByHandle, useEventTypeBySlug, demoEventTypes, isConvexConnected } from "@/lib/data";

/**
 * Direct event type booking page.
 * URL: /{handle}/{slug}
 *
 * Fetches the event type by handle + slug from Convex.
 * Falls back to demo data when Convex isn't connected.
 */

export default function EventBookingPage() {
  const params = useParams<{ handle: string; slug: string }>();

  const user = useUserByHandle(params.handle);
  const liveEventType = useEventTypeBySlug(params.slug);
  const eventType =
    liveEventType ??
    (user ? demoEventTypes.find((et) => et.slug === params.slug && et.isActive) : null);

  if (!user || !eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <p className="text-text-sec mb-6">
            This event type doesn&apos;t exist or is no longer available.
          </p>
          <Link
            href={`/${params.handle}`}
            className="text-accent hover:underline text-sm font-medium"
          >
            View all events for {params.handle}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-2xl font-bold mx-auto mb-4">
          {user.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold mb-1">{eventType.title}</h1>
        <p className="text-text-sec text-sm mb-2">with {user.name}</p>
        <p className="text-text-muted text-sm mb-6">
          {eventType.duration} min
          {eventType.price ? ` · $${eventType.price}` : " · Free"}
        </p>
        {eventType.description && (
          <p className="text-text-sec text-sm mb-8 leading-relaxed">
            {eventType.description}
          </p>
        )}
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-accent text-bg hover:-translate-y-0.5 transition-all"
        >
          Select a time
        </Link>
        <div className="mt-8 text-xs text-text-muted">
          Powered by{" "}
          <Link href="/" className="text-text-sec font-semibold">
            {appConfig.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
