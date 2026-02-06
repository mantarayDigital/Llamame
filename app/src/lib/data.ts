"use client";

/**
 * Data access hooks for Llamame.
 *
 * Each hook tries to fetch from Convex. If Convex isn't connected
 * (no real URL configured), it returns demo data as a fallback.
 *
 * When you run `npx convex dev` and set NEXT_PUBLIC_CONVEX_URL,
 * the hooks automatically switch to live data.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  demoUser,
  demoEventTypes,
  demoDashboardStats,
  demoTodayMeetings,
  demoTomorrowMeetings,
  demoClients,
  demoEnergyBlocks,
  demoNotificationPrefs,
  demoConnectedIntegrations,
  demoTimeSlots,
  demoAiBrief,
  demoAiInsight,
} from "./demo-data";

// ─── Configuration ──────────────────────────────────────────────

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

/** True when a real Convex deployment URL is set. */
export const isConvexConnected =
  CONVEX_URL.length > 0 && !CONVEX_URL.includes("placeholder");

// ─── User Hooks ─────────────────────────────────────────────────

/**
 * Get the current user. When Convex is connected, queries by handle.
 * Falls back to demoUser.
 */
export function useCurrentUser(handle?: string) {
  const user = useQuery(
    api.users.getByHandle,
    isConvexConnected && handle ? { handle } : "skip"
  );
  if (!isConvexConnected) return demoUser;
  return user ?? undefined;
}

/**
 * Get a user by their public handle (for booking pages).
 */
export function useUserByHandle(handle: string) {
  const user = useQuery(
    api.users.getByHandle,
    isConvexConnected ? { handle } : "skip"
  );
  if (!isConvexConnected) {
    return handle === demoUser.handle ? demoUser : null;
  }
  return user;
}

// ─── Event Type Hooks ───────────────────────────────────────────

/**
 * List all event types for a user.
 */
export function useEventTypes(userId?: string) {
  const events = useQuery(
    api.eventTypes.listByUser,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoEventTypes;
  return events ?? [];
}

/**
 * List only active event types for a user.
 */
export function useActiveEventTypes(userId?: string) {
  const events = useQuery(
    api.eventTypes.listActiveByUser,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoEventTypes.filter((e) => e.isActive);
  return events ?? [];
}

/**
 * Get a single event type by slug.
 */
export function useEventTypeBySlug(slug: string) {
  const eventType = useQuery(
    api.eventTypes.getBySlug,
    isConvexConnected ? { slug } : "skip"
  );
  if (!isConvexConnected) {
    return demoEventTypes.find((e) => e.slug === slug) ?? null;
  }
  return eventType;
}

// ─── Dashboard Hooks ────────────────────────────────────────────

/**
 * Dashboard stats (meetings this week, revenue, show rate, energy score).
 */
export function useDashboardStats(userId?: string) {
  const stats = useQuery(
    api.dashboard.stats,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoDashboardStats;
  return stats ?? demoDashboardStats;
}

/**
 * Today's meetings for the dashboard.
 */
export function useTodayMeetings(userId?: string) {
  const meetings = useQuery(
    api.dashboard.todayMeetings,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoTodayMeetings;
  return meetings ?? [];
}

/**
 * Tomorrow's meetings for the dashboard.
 */
export function useTomorrowMeetings(userId?: string) {
  const meetings = useQuery(
    api.dashboard.tomorrowMeetings,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoTomorrowMeetings;
  return meetings ?? [];
}

// ─── Booking Hooks ──────────────────────────────────────────────

/**
 * Upcoming bookings for a host.
 */
export function useUpcomingBookings(userId?: string, limit?: number) {
  const bookings = useQuery(
    api.bookings.listUpcoming,
    isConvexConnected && userId ? { hostId: userId, limit } : "skip"
  );
  if (!isConvexConnected) return [];
  return bookings ?? [];
}

// ─── Client Hooks ───────────────────────────────────────────────

/**
 * List all clients for a user.
 */
export function useClients(userId?: string) {
  const clients = useQuery(
    api.clients.listByUser,
    isConvexConnected && userId ? { userId } : "skip"
  );
  if (!isConvexConnected) return demoClients;
  return clients ?? [];
}

// ─── Mutation Hooks ─────────────────────────────────────────────

/**
 * Create a booking mutation.
 */
export function useCreateBooking() {
  return useMutation(api.bookings.create);
}

/**
 * Update booking status mutation.
 */
export function useUpdateBookingStatus() {
  return useMutation(api.bookings.updateStatus);
}

/**
 * Cancel booking mutation.
 */
export function useCancelBooking() {
  return useMutation(api.bookings.cancel);
}

/**
 * Create event type mutation.
 */
export function useCreateEventType() {
  return useMutation(api.eventTypes.create);
}

/**
 * Update event type mutation.
 */
export function useUpdateEventType() {
  return useMutation(api.eventTypes.update);
}

/**
 * Toggle event type active/inactive mutation.
 */
export function useToggleEventType() {
  return useMutation(api.eventTypes.toggleActive);
}

/**
 * Delete event type mutation.
 */
export function useDeleteEventType() {
  return useMutation(api.eventTypes.remove);
}

/**
 * Update user profile mutation.
 */
export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}

/**
 * Update user branding mutation.
 */
export function useUpdateBranding() {
  return useMutation(api.users.updateBranding);
}

/**
 * Update notification preferences mutation.
 */
export function useUpdateNotificationPrefs() {
  return useMutation(api.users.updateNotificationPrefs);
}

/**
 * Update energy profile mutation.
 */
export function useUpdateEnergyProfile() {
  return useMutation(api.users.updateEnergyProfile);
}

// ─── Static Demo Data (available without hooks for SSR/non-component use) ──

export {
  demoUser,
  demoEventTypes,
  demoDashboardStats,
  demoTodayMeetings,
  demoTomorrowMeetings,
  demoClients,
  demoEnergyBlocks,
  demoNotificationPrefs,
  demoConnectedIntegrations,
  demoTimeSlots,
  demoAiBrief,
  demoAiInsight,
};
