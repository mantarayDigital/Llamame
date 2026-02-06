/**
 * Shared TypeScript types for Llamame.
 *
 * These mirror the Convex schema but are usable on the client
 * without importing Convex internals. When the backend is wired up,
 * these will be replaced by or derived from Convex's generated types.
 */

// ─── Plan & Billing ──────────────────────────────────────────────

export type PlanTier = "free" | "pro" | "team" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused";

export type BillingInterval = "monthly" | "yearly";

// ─── Users & Orgs ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl?: string;
  timezone: string;
  plan: PlanTier;
  orgId?: string;
  role?: OrgRole;
  energyProfile?: EnergyProfile;
  branding?: BrandingConfig;
  createdAt: number;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: PlanTier;
  subscriptionId?: string;
  branding?: BrandingConfig;
  settings?: OrgSettings;
  createdAt: number;
}

export interface OrgSettings {
  defaultTimezone: string;
  defaultCurrency: string;
  requireVibeCheck: boolean;
  enableAiBriefs: boolean;
  enableEnergyScheduling: boolean;
  enableFatigueProtection: boolean;
  maxMembersAllowed: number;
}

export interface TeamMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  invitedBy: string;
  joinedAt: number;
}

// ─── Branding ────────────────────────────────────────────────────

export interface BrandingConfig {
  logo?: string;
  accentColor?: string;
  bio?: string;
  customCss?: string;
  showPoweredBy?: boolean;
}

// ─── Energy ──────────────────────────────────────────────────────

export interface EnergyProfile {
  peakStart: string;
  peakEnd: string;
  lowStart: string;
  lowEnd: string;
}

export interface EnergyBlock {
  label: string;
  level: number;
  color: string;
}

// ─── Event Types ─────────────────────────────────────────────────

export type LocationType =
  | "google_meet"
  | "zoom"
  | "phone"
  | "in_person"
  | "custom";

export interface EventType {
  id: string;
  userId: string;
  orgId?: string;
  title: string;
  slug: string;
  description?: string;
  duration: number;
  color: string;
  location: LocationType;
  locationDetails?: string;
  price?: number;
  currency?: string;
  isActive: boolean;
  requiresVibeCheck: boolean;
  requiresPayment: boolean;
  bufferBefore?: number;
  bufferAfter?: number;
  maxPerDay?: number;
  availability?: AvailabilityRule[];
  createdAt: number;
}

export interface AvailabilityRule {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

// ─── Bookings ────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Booking {
  id: string;
  eventTypeId: string;
  hostId: string;
  orgId?: string;
  clientName: string;
  clientEmail: string;
  startTime: number;
  endTime: number;
  timezone: string;
  status: BookingStatus;
  meetingUrl?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentCurrency?: string;
  vibeCheck?: VibeCheckData;
  aiNotes?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  createdAt: number;
}

export interface VibeCheckData {
  mood: string;
  goal?: string;
  context?: string;
}

// ─── Clients ─────────────────────────────────────────────────────

export interface Client {
  id: string;
  userId: string;
  orgId?: string;
  name: string;
  email: string;
  company?: string;
  totalMeetings: number;
  totalRevenue: number;
  noShowCount: number;
  lastMeetingAt?: number;
  lastVibeCheck?: string;
  notes?: string;
  tags?: string[];
  createdAt: number;
}

// ─── Workflows ───────────────────────────────────────────────────

export type WorkflowTrigger =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_reminder"
  | "booking_completed"
  | "client_created"
  | "payment_received"
  | "payment_failed";

export type WorkflowAction =
  | "send_email"
  | "send_sms"
  | "send_whatsapp"
  | "send_slack"
  | "update_crm"
  | "create_invoice"
  | "add_to_list"
  | "webhook";

export interface Workflow {
  id: string;
  userId: string;
  orgId?: string;
  name: string;
  trigger: WorkflowTrigger;
  action: WorkflowAction;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: number;
}

// ─── Integrations ────────────────────────────────────────────────

export type IntegrationProvider =
  | "google_calendar"
  | "google_meet"
  | "outlook"
  | "zoom"
  | "stripe"
  | "paypal"
  | "whatsapp"
  | "slack"
  | "hubspot"
  | "mailchimp"
  | "notion"
  | "zapier";

export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "pending";

export interface Integration {
  id: string;
  userId: string;
  orgId?: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  config?: Record<string, unknown>;
  lastSyncAt?: number;
  createdAt: number;
}

// ─── API Keys ────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  userId: string;
  orgId?: string;
  name: string;
  keyPrefix: string; // first 8 chars for display
  keyHash: string; // hashed full key
  lastUsedAt?: number;
  expiresAt?: number;
  scopes: string[];
  createdAt: number;
}

// ─── Webhooks ────────────────────────────────────────────────────

export interface WebhookEndpoint {
  id: string;
  userId: string;
  orgId?: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDeliveryAt?: number;
  failureCount: number;
  createdAt: number;
}

// ─── Audit Log ───────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  orgId?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
}

// ─── Notifications ───────────────────────────────────────────────

export interface NotificationPreferences {
  emailConfirmations: boolean;
  emailReminders: boolean;
  whatsappReminders: boolean;
  slackNotifications: boolean;
  dailyDigest: boolean;
  reminderHoursBefore: number[];
}

// ─── Dashboard / UI ──────────────────────────────────────────────

export interface DashboardStats {
  meetingsThisWeek: number;
  meetingsChange: number;
  revenueCollected: number;
  revenueChange: number;
  showRate: number;
  showRateChange: number;
  energyScore: number;
}

export interface MeetingListItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  client: string;
  company: string;
  color: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface ClientListItem {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  meetings: number;
  vibe: string;
}
