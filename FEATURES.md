# Llamame — Full Feature Documentation

> **Smart Scheduling for Professionals**
> AI-powered scheduling with meeting briefs, client intelligence, WhatsApp booking, and energy-aware scheduling.

**Organization:** MantaRay Digital
**Stack:** Next.js 16 · Convex · Tailwind CSS v4 · TypeScript · Lucide React
**Design:** Dark Professional (zinc-black, cyan accent, violet secondary)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Implementation Status Summary](#2-implementation-status-summary)
3. [Core Features — Scheduling](#3-core-features--scheduling)
4. [AI-Powered Features](#4-ai-powered-features)
5. [Client Experience Features](#5-client-experience-features)
6. [Payments & Revenue](#6-payments--revenue)
7. [Workflows & Automation](#7-workflows--automation)
8. [Integrations](#8-integrations)
9. [Customization & Branding](#9-customization--branding)
10. [Analytics & Intelligence](#10-analytics--intelligence)
11. [Pages & Routes](#11-pages--routes)
12. [Database Schema](#12-database-schema)
13. [API Keys & Environment Variables Required](#13-api-keys--environment-variables-required)
14. [Future Roadmap](#14-future-roadmap)
15. [Getting Started](#15-getting-started)

---

## 1. Project Overview

Llamame is a Calendly clone built for MantaRay Digital with unique differentiators including AI meeting prep, client mood tracking (Vibe Check), WhatsApp booking, energy-aware scheduling, and client intelligence. The project consists of:

| Component | Description | Location |
|---|---|---|
| HTML Mockups | 11 static HTML design explorations (6 pages + 5 theme variants) | `/mockups/` |
| Next.js App | Full React application with 7 routes + 2 dynamic routes | `/app/` |
| Convex Backend | Database schema with 15 tables (multi-tenant SaaS) | `/app/convex/` |
| Config Layer | 6 centralised config/data modules — zero hardcoded assumptions | `/app/src/lib/` |
| GitHub Pages | Deployment workflow for mockups | `/.github/workflows/` |

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | App Router, React framework |
| React | 19.2.4 | UI library |
| Convex | 1.31.7 | Real-time backend, database, serverless functions |
| Tailwind CSS | 4.1.18 | Utility-first CSS with `@theme` custom tokens |
| TypeScript | 5.9.3 | Type safety |
| Lucide React | 0.563.0 | Icon library |

---

## 2. Implementation Status Summary

### Status Legend
- **UI Done** — Frontend component built with mock data
- **Schema Done** — Database table/fields defined in Convex
- **Needs Backend** — Convex queries/mutations not yet written
- **Needs API Key** — Requires third-party API credentials
- **Needs Auth** — Requires authentication system
- **Not Started** — Feature not yet built

| # | Feature | UI | Schema | Backend | API Key | Status |
|---|---|---|---|---|---|---|
| 1 | Landing page | Done | — | — | — | **Complete** |
| 2 | Booking flow (calendar + time picker) | Done | Done | Needs Backend | — | UI Done |
| 3 | Vibe Check intake form | Done | Done | Needs Backend | — | UI Done |
| 4 | Dashboard overview | Done | Done | Needs Backend | Needs Auth | UI Done |
| 5 | Event type management | Done | Done | Needs Backend | Needs Auth | UI Done |
| 6 | Settings (6 tabs) | Done | Done | Needs Backend | Needs Auth | UI Done |
| 7 | AI Meeting Briefs | Done | Done | Needs Backend | Needs AI Key | UI Done |
| 8 | Energy-aware scheduling | Done | Done | Needs Backend | — | UI Done |
| 9 | Fatigue protection | Done | Done | Needs Backend | — | UI Done |
| 10 | Client memory / intelligence | Done | Done | Needs Backend | — | UI Done |
| 11 | Smart availability rules | — | Done | Needs Backend | — | Schema Only |
| 12 | Payments (Stripe/PayPal) | Done | Done | Needs Backend | Needs API Key | UI Done |
| 13 | Google Calendar sync | — | — | Not Started | Needs API Key | Not Started |
| 14 | Google Meet auto-links | — | — | Not Started | Needs API Key | Not Started |
| 15 | Zoom auto-create | — | — | Not Started | Needs API Key | Not Started |
| 16 | WhatsApp booking bot | — | Done | Not Started | Needs API Key | Schema Only |
| 17 | Slack notifications | — | Done | Not Started | Needs API Key | Schema Only |
| 18 | HubSpot CRM sync | — | — | Not Started | Needs API Key | Not Started |
| 19 | Mailchimp auto-lists | — | — | Not Started | Needs API Key | Not Started |
| 20 | Notion meeting notes | — | — | Not Started | Needs API Key | Not Started |
| 21 | Zapier connector | — | — | Not Started | Needs API Key | Not Started |
| 22 | Workflows engine | — | Done | Needs Backend | — | Schema Only |
| 23 | Authentication | — | Done | Not Started | Needs Auth Provider | Not Started |
| 24 | Email sending | — | Done | Not Started | Needs API Key | Not Started |
| 25 | SMS sending | — | Done | Not Started | Needs API Key | Not Started |
| 26 | Brand studio / white-label | Done | Done | Needs Backend | — | UI Done |
| 27 | API & webhooks | Done | — | Not Started | — | UI Only |
| 28 | Calendar view page | — | — | Not Started | — | Not Started |
| 29 | Clients page | — | Done | Not Started | — | Not Started |
| 30 | Messages page | — | — | Not Started | — | Not Started |
| 31 | Payments page | — | — | Not Started | — | Not Started |
| 32 | Analytics page | — | — | Not Started | — | Not Started |
| 33 | Workflows page | — | Done | Not Started | — | Not Started |

---

## 3. Core Features — Scheduling

### 3.1 Smart Availability
**Status:** Schema Done · UI Pending

Set complex availability rules including:
- Day-of-week availability windows (e.g., Mon-Fri 9am-5pm)
- Buffer time before/after meetings (`bufferBefore`, `bufferAfter` in minutes)
- Maximum meetings per day (`maxPerDay`)
- Seasonal/date-range overrides (future)

**Schema fields:** `eventTypes.availability[]`, `eventTypes.bufferBefore`, `eventTypes.bufferAfter`, `eventTypes.maxPerDay`

### 3.2 Event Types
**Status:** UI Done · Schema Done · Needs Backend

Create multiple meeting types with different configurations:

| Event Type | Duration | Price | Location |
|---|---|---|---|
| Discovery Call | 30 min | Free | Google Meet |
| Strategy Session | 60 min | $150 | Google Meet |
| Quick Check-in | 15 min | Free | Phone |
| Workshop | 120 min | $500 | Zoom |

Each event type has: title, slug, description, duration, color, location type, price, payment requirement, Vibe Check toggle, active/inactive state.

**Schema fields:** `eventTypes.*` (16 fields)

### 3.3 Timezone Intelligence
**Status:** UI Done · Needs Backend

- Auto-detect client timezone
- Display times in client's local timezone
- Timezone selector on booking page (EST, CST, MST, PST, GMT, CET)
- Store timezone per booking for reference

**Schema fields:** `bookings.timezone`

### 3.4 Booking Flow
**Status:** UI Done · Needs Backend

4-step interactive booking process:
1. **Event Type Selection** — Choose from available meeting types
2. **Date & Time** — Calendar picker + time slot selection
3. **Vibe Check** — Mood, goals, context form (optional per event type)
4. **Confirmation** — Booking details + add-to-calendar

---

## 4. AI-Powered Features

### 4.1 AI Meeting Briefs
**Status:** UI Done (mock) · Schema Done · Needs Backend + AI API Key

Auto-generated meeting prep notes before each call containing:
- Client name, company, meeting count
- Summary of last meeting and outstanding items
- Vibe Check mood from client
- Suggested discussion topics
- Action items from previous meetings

**Example (from dashboard):**
> **Sarah from TechFlow** — This is her 3rd Strategy Session. Last time you discussed SEO migration and she wanted a progress update. She completed the Vibe Check as "Excited".
> - Follow up on SEO migration timeline
> - Review Q1 content calendar she submitted
> - She mentioned interest in paid ads

**Needs:** OpenAI/Anthropic API key for generating briefs from client history

### 4.2 AI Scheduling Assistant
**Status:** UI Done (mock chat) · Not Started

Conversational AI that can:
- Analyze your schedule and suggest optimizations
- Move non-urgent meetings to better time slots
- Add buffer times between deep-work sessions
- Generate meeting briefs on demand
- Calculate energy score impact of changes

**Needs:** AI API key, Convex action functions

### 4.3 Energy-Aware Scheduling
**Status:** UI Done · Schema Done · Needs Backend

Maps meeting types to your energy levels throughout the day:

| Time Block | Energy Level | Best For |
|---|---|---|
| Morning (9-11am) | 90% (Peak) | Strategy sessions, workshops |
| Midday (11am-1pm) | 70% (High) | Discovery calls, check-ins |
| Afternoon (1-4pm) | 50% (Medium) | Quick check-ins, admin |
| Late (4-6pm) | 30% (Low) | Light meetings only |

**Schema fields:** `users.energyProfile` (peakStart, peakEnd, lowStart, lowEnd)

### 4.4 Fatigue Protection
**Status:** UI Done (toggle) · Needs Backend

- Detect when daily/weekly meeting load exceeds healthy thresholds
- Display energy score on dashboard (0-100)
- Proactively suggest rescheduling overbooked days
- AI insight banner warns about schedule overload

### 4.5 Client Memory
**Status:** UI Done · Schema Done · Needs Backend

Every client interaction is stored and surfaced:
- Meeting count, last meeting date
- Revenue generated per client
- No-show history and rate
- Vibe Check history (mood trends)
- Custom notes and tags
- Company association

**Schema fields:** `clients.*` (13 fields)

---

## 5. Client Experience Features

### 5.1 Vibe Check Intake
**Status:** UI Done · Schema Done · Needs Backend

Pre-meeting questionnaire presented during booking:

| Field | Type | Required |
|---|---|---|
| Mood | 5 emoji options (Excited, Optimistic, Curious, Stressed, Neutral) | Yes |
| #1 Goal | Text input | Optional |
| Context | Textarea | Optional |
| Name | Text input | Yes |
| Email | Email input | Yes |

**Schema fields:** `bookings.vibeCheck` (mood, goal, context), `eventTypes.requiresVibeCheck`

### 5.2 Custom Booking Pages
**Status:** UI Done · Schema Done · Needs Backend

Branded booking URLs: `llamame.io/[handle]`
- Host avatar, name, and description
- Event type cards with color coding
- Meeting details (duration, location, price)
- Powered by Llamame footer

### 5.3 Booking Confirmation
**Status:** UI Done · Needs Backend

Post-booking confirmation showing:
- Date, time, and timezone
- Meeting location and link
- Payment status (if applicable)
- Add to Google Calendar / Outlook buttons (future)

### 5.4 WhatsApp Booking Bot
**Status:** Schema Done · Needs Backend + API Key

Allow clients to book via WhatsApp conversation:
- Send available times via WhatsApp
- Conversational slot selection
- Booking confirmation via WhatsApp
- Reminder messages before meetings

**Needs:** WhatsApp Business API credentials (Meta Business Platform)

---

## 6. Payments & Revenue

### 6.1 Stripe Integration
**Status:** UI Done (settings) · Schema Done · Needs Backend + API Key

- Collect payments at time of booking
- Support deposits, full payments, pay-what-you-want
- Track payment status (pending/paid/refunded)
- Revenue dashboard

**Schema fields:** `bookings.paymentStatus`, `bookings.paymentAmount`, `eventTypes.price`, `eventTypes.currency`
**Needs:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### 6.2 PayPal Integration
**Status:** Referenced in UI · Not Started

- Alternative payment method
- Same flow as Stripe

**Needs:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`

### 6.3 Revenue Tracking
**Status:** UI Done (mock) · Schema Done · Needs Backend

Dashboard shows: total revenue collected, per-client revenue, per-event-type revenue.

---

## 7. Workflows & Automation

### 7.1 Workflow Engine
**Status:** Schema Done · Needs Backend

Trigger-based automation system:

**Triggers:**
| Trigger | When |
|---|---|
| `booking_created` | New booking submitted |
| `booking_confirmed` | Booking confirmed (after payment or manual) |
| `booking_cancelled` | Client or host cancels |
| `booking_reminder` | X hours before meeting |
| `booking_completed` | After meeting ends |

**Actions:**
| Action | What |
|---|---|
| `send_email` | Send email notification |
| `send_sms` | Send SMS message |
| `send_whatsapp` | Send WhatsApp message |
| `send_slack` | Post to Slack channel |
| `update_crm` | Sync data to HubSpot/CRM |

**Schema:** `workflows` table with userId, name, trigger, action, config (flexible JSON), isActive

### 7.2 Notification Preferences
**Status:** UI Done · Needs Backend

Configurable in Settings > Notifications:
- Email confirmations (on/off)
- Email reminders — 24h and 1h before meetings (on/off)
- WhatsApp reminders (on/off)
- Slack notifications for new bookings (on/off)
- Daily digest email (on/off)

---

## 8. Integrations

### Status Overview

| Integration | Category | UI | Backend | API Key Required |
|---|---|---|---|---|
| **Google Calendar** | Calendar | Settings toggle | Not Started | Google OAuth + Calendar API |
| **Outlook** | Calendar | Listed | Not Started | Microsoft Graph API |
| **Google Meet** | Video | Settings toggle | Not Started | Google Meet API (via Calendar) |
| **Zoom** | Video | Listed | Not Started | Zoom OAuth App |
| **Stripe** | Payments | Settings toggle | Not Started | Stripe API keys |
| **PayPal** | Payments | Listed | Not Started | PayPal REST API keys |
| **WhatsApp** | Messaging | Settings toggle | Not Started | Meta WhatsApp Business API |
| **Slack** | Notifications | Listed | Not Started | Slack Bot Token |
| **HubSpot** | CRM | Listed | Not Started | HubSpot API key |
| **Mailchimp** | Email Marketing | Listed | Not Started | Mailchimp API key |
| **Notion** | Productivity | Listed | Not Started | Notion API key |
| **Zapier** | Automation | Listed | Not Started | Zapier Webhook URLs |

### Integration Details

**Google Calendar** — Two-way sync. When a booking is created, add to host's Google Calendar. When host blocks time in Google Calendar, update Llamame availability.
**Needs:** Google Cloud project, OAuth 2.0 credentials, Calendar API enabled

**Google Meet** — Auto-generate Meet links when a booking is confirmed for video meetings.
**Needs:** Google Meet API (part of Google Calendar API)

**Zoom** — Auto-create Zoom meeting rooms for Zoom-type events.
**Needs:** Zoom Marketplace app, OAuth credentials

**Stripe** — Process payments at booking time, handle webhooks for payment events.
**Needs:** Stripe account, publishable + secret keys, webhook endpoint

**WhatsApp Business** — Send booking confirmations and reminders, support conversational booking.
**Needs:** Meta Business account, WhatsApp Business API access, phone number

**Slack** — Post notifications to a channel when new bookings arrive.
**Needs:** Slack App with Bot Token, webhook URL

**HubSpot** — Sync booking data as contacts/deals in HubSpot CRM.
**Needs:** HubSpot private app token

---

## 9. Customization & Branding

### 9.1 Brand Studio
**Status:** UI Done · Schema Done · Needs Backend

| Setting | Type | Location |
|---|---|---|
| Accent Color | 6 preset options | Settings > Branding |
| Logo Upload | SVG/PNG/JPG (up to 2MB) | Settings > Branding |
| Display Name | Text | Settings > Profile |
| Handle (URL slug) | Text | Settings > Profile |
| Bio/Description | Textarea | Settings > Profile |
| Profile Photo | Image upload | Settings > Profile |

**Schema fields:** `users.branding` (logo, accentColor, bio), `users.name`, `users.handle`

### 9.2 Design System (Implemented)
**Status:** Complete

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#09090b` | Page background |
| `--color-bg-raised` | `#111113` | Sidebar, elevated surfaces |
| `--color-bg-card` | `#18181b` | Cards, panels |
| `--color-accent` | `#22d3ee` | CTAs, links, highlights |
| `--color-violet` | `#a78bfa` | Secondary accent |
| `--color-green` | `#4ade80` | Success, active states |
| `--color-amber` | `#fbbf24` | Warnings, pending |
| `--color-rose` | `#fb7185` | Errors, destructive |
| `--font-sans` | Inter | Body text |
| `--font-mono` | JetBrains Mono | Labels, API keys, data |

---

## 10. Analytics & Intelligence

### 10.1 Dashboard Stats
**Status:** UI Done · Needs Backend

| Metric | Current (Mock) | Source |
|---|---|---|
| Meetings This Week | 18 | Count bookings in date range |
| Revenue Collected | $2,450 | Sum booking payments |
| Show Rate | 94% | (completed / total) * 100 |
| Energy Score | 78/100 | AI calculation from schedule |

### 10.2 Client Intelligence
**Status:** UI Done · Schema Done · Needs Backend

Per-client tracking:
- Total meetings count
- Total revenue generated
- No-show rate
- Last meeting date
- Last Vibe Check mood
- Custom tags (e.g., "VIP", "Enterprise")

### 10.3 AI Insights
**Status:** UI Done (mock) · Needs Backend + AI Key

Dashboard AI banner showing actionable insights:
> "Your no-show rate dropped 23% this month after adding the reminder workflow. Clients who complete the Vibe Check are 4x more likely to show up."

---

## 11. Pages & Routes

### Implemented Routes (7 static + 2 dynamic)

| Route | Component | Type | Description |
|---|---|---|---|
| `/` | `page.tsx` | Server | Landing page — hero, features, AI section, integrations, pricing, testimonials, CTA, footer |
| `/booking` | `booking/page.tsx` | Client | 4-step booking flow — event type, date/time, Vibe Check, confirmation |
| `/dashboard` | `dashboard/page.tsx` | Client | Admin dashboard — AI banner, stats, meetings, event types, clients |
| `/dashboard/events` | `dashboard/events/page.tsx` | Client | Event type cards with toggle, copy link, preview, edit actions |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Client | 7 tabs: Profile, Integrations, Branding, AI & Energy, Notifications, Team, API |
| `/[handle]` | `[handle]/page.tsx` | Dynamic | Public booking page per user (shows active event types) |
| `/[handle]/[slug]` | `[handle]/[slug]/page.tsx` | Dynamic | Direct event type booking page |

### Middleware

| File | Purpose |
|---|---|
| `src/middleware.ts` | Auth middleware stub — protects `/dashboard/*` routes. Ready for Clerk/Auth0/Convex Auth. |

### Planned Routes (Not Yet Built)

| Route | Description | Priority |
|---|---|---|
| `/dashboard/calendar` | Full calendar view | High |
| `/dashboard/clients` | Client list with intelligence data | High |
| `/dashboard/messages` | Messaging / chat interface | Medium |
| `/dashboard/payments` | Payment history and invoices | Medium |
| `/dashboard/analytics` | Charts, reports, trends | Medium |
| `/dashboard/workflows` | Workflow builder and management | Medium |
| `/auth/login` | Authentication | High |
| `/auth/signup` | Registration | High |
| `/booking/confirmation/[id]` | Dynamic confirmation page | Medium |

---

## 12. Database Schema

### Convex Tables (15) — Multi-tenant SaaS

All tenant-scoped tables include an optional `orgId` field for team/enterprise multi-tenant support.

```
users
├── name: string
├── email: string (indexed)
├── handle: string (indexed)
├── externalId?: string (auth provider ID)
├── avatarUrl?: string
├── timezone: string
├── plan: "free" | "pro" | "team" | "enterprise"
├── orgId?: Id<"organizations">
├── role?: "owner" | "admin" | "member" | "viewer"
├── energyProfile?: { peakStart, peakEnd, lowStart, lowEnd }
├── branding?: { logo?, accentColor?, bio?, customCss?, showPoweredBy? }
├── notificationPrefs?: { emailConfirmations, emailReminders, whatsappReminders, slackNotifications, dailyDigest, reminderHoursBefore }
├── onboardingCompleted?: boolean
├── lastLoginAt?: number
└── createdAt: number

organizations
├── name: string
├── slug: string (indexed)
├── ownerId: Id<"users"> (indexed)
├── plan: "free" | "pro" | "team" | "enterprise"
├── settings?: { defaultTimezone, defaultCurrency, defaultLocale, maxTeamMembers }
├── branding?: { logo?, accentColor?, customCss?, showPoweredBy? }
└── createdAt: number

teamMembers (junction: organizations ↔ users)
├── orgId: Id<"organizations"> (indexed)
├── userId: Id<"users"> (indexed)
├── role: "owner" | "admin" | "member" | "viewer"
├── invitedBy?: Id<"users">
└── joinedAt: number

invitations
├── orgId: Id<"organizations"> (indexed)
├── email: string (indexed)
├── role: "admin" | "member" | "viewer"
├── invitedBy: Id<"users">
├── status: "pending" | "accepted" | "expired"
├── token: string (indexed, unique)
└── createdAt: number

subscriptions
├── userId?: Id<"users"> (indexed)
├── orgId?: Id<"organizations"> (indexed)
├── plan: "free" | "pro" | "team" | "enterprise"
├── status: "active" | "past_due" | "cancelled" | "trialing"
├── interval: "monthly" | "yearly"
├── externalId?: string (Stripe subscription ID)
├── currentPeriodStart?: number
├── currentPeriodEnd?: number
├── cancelAtPeriodEnd?: boolean
└── createdAt: number

eventTypes
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── title: string
├── slug: string (indexed)
├── description?: string
├── duration: number (minutes)
├── color: string
├── location: "google_meet" | "zoom" | "phone" | "in_person" | "custom"
├── locationDetails?: string
├── price?: number
├── currency?: string
├── isActive: boolean
├── requiresVibeCheck: boolean
├── requiresPayment: boolean
├── bufferBefore?: number (minutes)
├── bufferAfter?: number (minutes)
├── maxPerDay?: number
├── minNotice?: number (hours)
├── maxAdvance?: number (days)
├── availability?: [{ day, startTime, endTime }]
├── dateOverrides?: [{ date, startTime?, endTime?, blocked? }]
├── customFields?: [{ name, type, required }]
├── redirectUrl?: string
├── confirmationMessage?: string
├── createdAt: number
└── updatedAt?: number

bookings
├── eventTypeId: Id<"eventTypes">
├── hostId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── clientName: string
├── clientEmail: string (indexed)
├── clientPhone?: string
├── startTime: number (indexed)
├── endTime: number
├── timezone: string
├── status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show"
├── meetingUrl?: string
├── calendarEventId?: string
├── paymentStatus?: "pending" | "paid" | "refunded" | "failed"
├── paymentAmount?: number
├── paymentCurrency?: string
├── paymentExternalId?: string
├── vibeCheck?: { mood, goal?, context? }
├── customFieldAnswers?: any
├── aiNotes?: string
├── cancellationReason?: string
├── rescheduledFrom?: Id<"bookings">
├── source?: string
├── createdAt: number
└── updatedAt?: number

clients
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── name: string
├── email: string (indexed)
├── company?: string
├── totalMeetings: number
├── totalRevenue: number
├── noShowCount: number
├── lastMeetingAt?: number
├── lastVibeCheck?: string
├── notes?: string
├── tags?: string[]
└── createdAt: number

workflows
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── name: string
├── trigger: "booking_created" | "booking_confirmed" | "booking_cancelled" | "booking_reminder" | "booking_completed" | "booking_rescheduled" | "payment_received" | "no_show_detected"
├── action: "send_email" | "send_sms" | "send_whatsapp" | "send_slack" | "update_crm" | "create_invoice" | "add_to_list"
├── config: any
├── isActive: boolean
└── createdAt: number

workflowLogs
├── workflowId: Id<"workflows"> (indexed)
├── bookingId?: Id<"bookings">
├── status: "success" | "failure" | "skipped"
├── error?: string
└── executedAt: number

integrations
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── provider: string (indexed)
├── status: "connected" | "disconnected" | "error"
├── credentials?: any (encrypted at rest)
├── config?: any
├── lastSyncAt?: number
└── connectedAt: number

apiKeys
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── name: string
├── keyHash: string (indexed)
├── prefix: string
├── lastUsedAt?: number
├── expiresAt?: number
└── createdAt: number

webhookEndpoints
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── url: string
├── events: string[]
├── secret: string
├── isActive: boolean
├── lastDeliveryAt?: number
└── createdAt: number

webhookDeliveries
├── webhookId: Id<"webhookEndpoints"> (indexed)
├── event: string
├── payload: any
├── statusCode?: number
├── response?: string
├── attempts: number
└── deliveredAt: number

auditLog
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations"> (indexed)
├── action: string (indexed)
├── resource: string
├── resourceId?: string
├── details?: any
├── ipAddress?: string
└── createdAt: number (indexed)

emailTemplates
├── userId: Id<"users"> (indexed)
├── orgId?: Id<"organizations">
├── name: string
├── subject: string
├── bodyHtml: string
├── bodyText?: string
├── variables?: string[]
├── isDefault: boolean
└── createdAt: number
```

---

## 12b. Config-Driven Architecture

All hardcoded values, brand references, and mock data have been extracted into 6 centralised modules. No page component contains assumptions — everything flows from config.

| Module | File | Purpose |
|---|---|---|
| **App Config** | `src/lib/config.ts` | Brand names, domain, URLs, env vars, timezones, moods, location types, duration presets, accent colors, default settings |
| **Types** | `src/lib/types.ts` | ~40 TypeScript interfaces mirroring Convex schema for client use (`UserProfile`, `EventType`, `Booking`, `Client`, `Organization`, etc.) |
| **Plans** | `src/lib/plans.ts` | 4 plan tiers (free/pro/team/enterprise), `PlanLimits` with 22 boolean/numeric feature flags, `hasFeature()`, `getLimit()` helpers |
| **Integrations** | `src/lib/integrations.ts` | 12 integration definitions (provider, name, icon, category, requiredPlan, requiredEnvVars, authType), with `getIntegrationsByCategory()` and `getAvailableIntegrations(planTier)` |
| **Navigation** | `src/lib/navigation.ts` | `dashboardNav` (3 groups), `marketingNav`, `footerNav` (3 columns), `settingsTabs` (7 tabs) — all with `requiredPlan` gating |
| **Demo Data** | `src/lib/demo-data.ts` | ALL mock data (`demoUser`, `demoEventTypes`, `demoDashboardStats`, meetings, clients, energy blocks, notification prefs, testimonials, connected integrations, time slots) |

### Key Design Principles

1. **Single Source of Truth** — Change a brand name, add a timezone, or update plan limits in one file and it propagates everywhere.
2. **Plan-Gated Features** — `hasFeature('free', 'aiBriefs')` returns `false`. Navigation items and settings tabs have `requiredPlan` fields.
3. **Environment-First** — Domain, URLs, and service endpoints come from `process.env.NEXT_PUBLIC_*` with sensible fallbacks.
4. **Demo ↔ Production Swap** — Pages import from `demo-data.ts` now; when Convex is wired up, swap to `useQuery()` calls with identical types.
5. **Multi-Tenant Ready** — Every tenant-scoped schema table has optional `orgId`. Types include `Organization`, `TeamMember`, `OrgSettings`.

### Environment Variables

All required environment variables are documented in `app/.env.example` (25+ variables organized by service).

---

## 13. API Keys & Environment Variables Required

### Required for Basic Functionality

| Variable | Service | Purpose | Priority |
|---|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex | Backend connection | **Critical** |
| `CONVEX_DEPLOY_KEY` | Convex | Deployment | **Critical** |

### Required for Authentication

| Variable | Service | Purpose | Priority |
|---|---|---|---|
| Auth provider credentials | Clerk / Auth0 / Convex Auth | User login/signup | **Critical** |

### Required for Integrations

| Variable | Service | Purpose | Priority |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Google | OAuth for Calendar/Meet | High |
| `GOOGLE_CLIENT_SECRET` | Google | OAuth for Calendar/Meet | High |
| `STRIPE_SECRET_KEY` | Stripe | Payment processing | High |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client-side payments | High |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Payment event webhooks | High |
| `WHATSAPP_BUSINESS_TOKEN` | Meta | WhatsApp Business API | Medium |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta | WhatsApp sender ID | Medium |
| `ZOOM_CLIENT_ID` | Zoom | Meeting creation | Medium |
| `ZOOM_CLIENT_SECRET` | Zoom | Meeting creation | Medium |
| `SLACK_BOT_TOKEN` | Slack | Notifications | Medium |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot | CRM sync | Low |
| `MAILCHIMP_API_KEY` | Mailchimp | Email list management | Low |
| `NOTION_API_KEY` | Notion | Meeting notes sync | Low |
| `PAYPAL_CLIENT_ID` | PayPal | Alternative payments | Low |
| `PAYPAL_CLIENT_SECRET` | PayPal | Alternative payments | Low |

### Required for AI Features

| Variable | Service | Purpose | Priority |
|---|---|---|---|
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | OpenAI / Anthropic | AI meeting briefs, scheduling assistant, insights | High |

---

## 14. Future Roadmap

### Phase 1 — Core Backend (Next Priority)
- [ ] Set up Convex deployment and connect `NEXT_PUBLIC_CONVEX_URL`
- [ ] Implement authentication (Clerk or Convex Auth)
- [ ] Write Convex queries: list event types, get bookings, get clients
- [ ] Write Convex mutations: create booking, update event type, update settings
- [ ] Connect all forms to mutations (booking flow, settings, event editor)
- [x] Dynamic booking pages (`/[handle]` and `/[handle]/[slug]`) — UI stubs done
- [x] Auth middleware stub for `/dashboard/*` route protection
- [ ] Real availability calculation from event type rules

### Phase 2 — Calendar & Payments
- [ ] Google Calendar OAuth + two-way sync
- [ ] Google Meet auto-link generation
- [ ] Stripe payment processing at booking
- [ ] Stripe webhook handling (payment confirmation, refunds)
- [ ] Full calendar view page (`/dashboard/calendar`)
- [ ] Clients management page (`/dashboard/clients`)

### Phase 3 — AI Intelligence
- [ ] AI meeting brief generation (using OpenAI/Anthropic)
- [ ] Client memory context builder
- [ ] Energy score calculation algorithm
- [ ] Fatigue detection and rescheduling suggestions
- [ ] AI insights generation from booking patterns
- [ ] AI scheduling assistant chat interface

### Phase 4 — Messaging & Workflows
- [ ] WhatsApp Business API integration
- [ ] Workflow engine (trigger → action execution)
- [ ] Email sending (Resend, SendGrid, or AWS SES)
- [ ] SMS sending (Twilio)
- [ ] Slack bot for notifications
- [ ] Workflows builder page (`/dashboard/workflows`)

### Phase 5 — Advanced Integrations
- [ ] Zoom meeting creation
- [ ] Outlook calendar sync (Microsoft Graph API)
- [ ] HubSpot CRM sync
- [ ] Mailchimp list management
- [ ] Notion meeting notes
- [ ] Zapier webhook connector
- [ ] PayPal payments

### Phase 6 — Polish & Scale
- [ ] Team scheduling (round-robin, collective booking)
- [ ] Analytics dashboard with charts
- [ ] Public API with documentation
- [ ] Webhook system for external consumers
- [ ] White-label mode (Team plan)
- [ ] Mobile responsive refinements
- [ ] Embed widget for external websites
- [ ] Multi-language support (Spanish first)
- [ ] Smart rescheduling with optimal time suggestions

---

## 15. Getting Started

### Local Development

```bash
# Navigate to the app
cd app

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Convex URL

# Start Convex dev server (in separate terminal)
npx convex dev

# Start Next.js dev server
npm run dev
```

### Build for Production

```bash
cd app
npm run build
npm start
```

### View HTML Mockups

The static HTML mockups are deployed via GitHub Pages:
- Landing: `/mockups/index.html`
- Booking: `/mockups/booking.html`
- Dashboard: `/mockups/dashboard.html`
- Event Editor: `/mockups/event-editor.html`
- Confirmation: `/mockups/confirmation.html`
- Settings: `/mockups/settings.html`
- Design Variants: `variant-aurora.html`, `variant-neon.html`, `variant-luxe.html`, `variant-pro.html`, `variant-dark-pro.html`

---

## Pricing Plans (Configured in `lib/plans.ts`)

| Feature | Free | Pro ($12/mo) | Team ($24/seat/mo) | Enterprise (Custom) |
|---|---|---|---|---|
| Event types | 3 | 25 | Unlimited | Unlimited |
| Bookings/month | 50 | 500 | 5,000 | Unlimited |
| Team members | — | — | 25 | Unlimited |
| Calendar integrations | Yes | Yes | Yes | Yes |
| Video integrations | — | Yes | Yes | Yes |
| Payment integrations | — | Yes | Yes | Yes |
| AI Meeting Briefs | — | Yes | Yes | Yes |
| Energy scheduling | — | Yes | Yes | Yes |
| Fatigue protection | — | Yes | Yes | Yes |
| Client intelligence | — | — | Yes | Yes |
| Vibe Check | — | Yes | Yes | Yes |
| Custom branding | — | Yes | Yes | Yes |
| White-label | — | — | — | Yes |
| API access | — | — | Yes | Yes |
| Webhooks | — | — | 10 | Unlimited |
| Workflows | — | 5 | 50 | Unlimited |
| Analytics | Basic | Advanced | Full | Full |
| Priority support | — | — | — | Yes |

Feature gating is enforced via `hasFeature(tier, feature)` and `getLimit(tier, feature)` from `lib/plans.ts`.

---

*Document generated for Llamame by MantaRay Digital — February 2026*
