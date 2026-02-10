"use client";

/**
 * Data access hooks for Llamame.
 *
 * Each hook queries Convex directly. Returns undefined while loading.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// ─── User Hooks ─────────────────────────────────────────────────

export function useCurrentUser() {
  const user = useQuery(api.users.getMe);
  return user ?? undefined;
}

export function useCurrentUserId(): string | undefined {
  const user = useQuery(api.users.getMe);
  return user?._id;
}

export function useUserByHandle(handle?: string) {
  const user = useQuery(
    api.users.getByHandle,
    handle ? { handle } : "skip"
  );
  return user;
}

// ─── Event Type Hooks ───────────────────────────────────────────

export function useEventTypes(userId?: string) {
  const events = useQuery(
    api.eventTypes.listByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return events ?? [];
}

export function useActiveEventTypes(userId?: string) {
  const events = useQuery(
    api.eventTypes.listActiveByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return events ?? [];
}

export function useEventTypeBySlug(slug?: string) {
  const eventType = useQuery(
    api.eventTypes.getBySlug,
    slug ? { slug } : "skip"
  );
  return eventType;
}

// ─── Dashboard Hooks ────────────────────────────────────────────

const defaultStats = {
  meetingsThisWeek: 0,
  meetingsChange: 0,
  revenueCollected: 0,
  revenueChange: 0,
  showRate: 0,
  showRateChange: 0,
  energyScore: 0,
};

export function useDashboardStats(userId?: string) {
  const stats = useQuery(
    api.dashboard.stats,
    userId ? { userId: userId as any } : "skip"
  );
  return stats ?? defaultStats;
}

export function useTodayMeetings(userId?: string) {
  const meetings = useQuery(
    api.dashboard.todayMeetings,
    userId ? { userId: userId as any } : "skip"
  );
  return meetings ?? [];
}

export function useTomorrowMeetings(userId?: string) {
  const meetings = useQuery(
    api.dashboard.tomorrowMeetings,
    userId ? { userId: userId as any } : "skip"
  );
  return meetings ?? [];
}

// ─── Booking Hooks ──────────────────────────────────────────────

export function useUpcomingBookings(userId?: string, limit?: number) {
  const bookings = useQuery(
    api.bookings.listUpcoming,
    userId ? { hostId: userId as any, limit } : "skip"
  );
  return bookings ?? [];
}

export function useBookingsWithPayments(userId?: string, limit?: number) {
  const bookings = useQuery(
    api.bookings.listWithPayments,
    userId ? { hostId: userId as any, limit } : "skip"
  );
  return bookings ?? [];
}

// ─── Client Hooks ───────────────────────────────────────────────

export function useClients(userId?: string) {
  const clients = useQuery(
    api.clients.listByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return clients ?? [];
}

// ─── Audit Log Hooks ────────────────────────────────────────────

export function useAuditLog(userId?: string, options?: { limit?: number; resource?: string }) {
  const entries = useQuery(
    api.auditLog.listByUser,
    userId ? { userId: userId as any, limit: options?.limit, resource: options?.resource } : "skip"
  );
  return entries ?? [];
}

// ─── Integration Hooks ──────────────────────────────────────────

export function useIntegrations(userId?: string) {
  const integrations = useQuery(
    api.integrations.listByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return integrations ?? [];
}

// ─── API Key Hooks ──────────────────────────────────────────────

export function useApiKeys(userId?: string) {
  const keys = useQuery(
    api.apiKeys.listByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return keys ?? [];
}

// ─── Webhook Hooks ──────────────────────────────────────────────

export function useWebhooks(userId?: string) {
  const webhooks = useQuery(
    api.webhookEndpoints.listByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return webhooks ?? [];
}

// ─── Subscription Hooks ─────────────────────────────────────────

export function useSubscription(userId?: string) {
  const sub = useQuery(
    api.subscriptions.getByUser,
    userId ? { userId: userId as any } : "skip"
  );
  return sub;
}

// ─── Mutation Hooks ─────────────────────────────────────────────

export function useCreateBooking() {
  return useMutation(api.bookings.create);
}

export function useUpdateBookingStatus() {
  return useMutation(api.bookings.updateStatus);
}

export function useCancelBooking() {
  return useMutation(api.bookings.cancel);
}

export function useCreateEventType() {
  return useMutation(api.eventTypes.create);
}

export function useUpdateEventType() {
  return useMutation(api.eventTypes.update);
}

export function useToggleEventType() {
  return useMutation(api.eventTypes.toggleActive);
}

export function useDeleteEventType() {
  return useMutation(api.eventTypes.remove);
}

export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}

export function useUpdateBranding() {
  return useMutation(api.users.updateBranding);
}

export function useUpdateNotificationPrefs() {
  return useMutation(api.users.updateNotificationPrefs);
}

export function useUpdateEnergyProfile() {
  return useMutation(api.users.updateEnergyProfile);
}

export function useCreateAuditLog() {
  return useMutation(api.auditLog.create);
}

export function useConnectIntegration() {
  return useMutation(api.integrations.connect);
}

export function useDisconnectIntegration() {
  return useMutation(api.integrations.disconnect);
}

export function useCreateApiKey() {
  return useMutation(api.apiKeys.create);
}

export function useRevokeApiKey() {
  return useMutation(api.apiKeys.revoke);
}

export function useCreateWebhook() {
  return useMutation(api.webhookEndpoints.create);
}

export function useRemoveWebhook() {
  return useMutation(api.webhookEndpoints.remove);
}
