"use client";

import { useState } from "react";
import {
  User,
  Plug,
  Palette,
  Brain,
  Bell,
  Users,
  Code,
  Check,
  Plus,
  Trash2,
  Copy,
  Key,
  Globe,
  Shield,
  RefreshCw,
  Send,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { appConfig, defaults, timezones } from "@/lib/config";
import { btn, input as inputStyles, toggle, card, badge } from "@/lib/theme";
import { settingsTabs } from "@/lib/navigation";
import { integrations, type IntegrationCategory } from "@/lib/integrations";
import {
  demoUser,
  demoEnergyBlocks,
  demoNotificationPrefs,
  demoConnectedIntegrations,
} from "@/lib/data";

/* ─── Icon Map ───────────────────────────────────────────────── */

const iconMap: Record<string, LucideIcon> = {
  User,
  Plug,
  Palette,
  Brain,
  Bell,
  Users,
  Code,
};

/* ─── Team / API Demo Data ───────────────────────────────────── */

type TeamRole = "owner" | "admin" | "member" | "viewer";

const demoTeamMembers: {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  initials: string;
  gradient: string;
  joinedAt: string;
}[] = [
  { id: "tm_001", name: "Alex Rivera", email: "alex@mantaray.digital", role: "owner", initials: "AR", gradient: "from-accent to-violet", joinedAt: "Jan 2026" },
  { id: "tm_002", name: "Priya Patel", email: "priya@mantaray.digital", role: "admin", initials: "PP", gradient: "from-violet to-rose", joinedAt: "Jan 2026" },
  { id: "tm_003", name: "Marcus Chen", email: "marcus@mantaray.digital", role: "member", initials: "MC", gradient: "from-green to-accent", joinedAt: "Feb 2026" },
];

const demoPendingInvites: {
  id: string;
  email: string;
  role: TeamRole;
  sentAt: string;
}[] = [
  { id: "inv_001", email: "sarah@mantaray.digital", role: "member", sentAt: "2 days ago" },
];

const demoApiKeys = [
  { id: "key_001", name: "Production", prefix: "llm_sk_7f3a", createdAt: "Jan 15, 2026", lastUsed: "2 hours ago" },
  { id: "key_002", name: "Development", prefix: "llm_sk_test", createdAt: "Feb 1, 2026", lastUsed: "Never" },
];

const demoWebhooks = [
  { id: "wh_001", url: "https://api.example.com/webhooks/llamame", events: ["booking.created", "booking.cancelled"], isActive: true, failureCount: 0, lastDelivery: "1 hour ago" },
];

/* ─── Constants ──────────────────────────────────────────────── */

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeSlotOptions = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const categoryOrder: IntegrationCategory[] = [
  "calendar", "video", "messaging", "payments", "crm", "productivity", "automation",
];

const categoryLabels: Record<IntegrationCategory, string> = {
  calendar: "Calendar",
  video: "Video",
  messaging: "Messaging",
  payments: "Payments",
  crm: "CRM",
  productivity: "Productivity",
  automation: "Automation",
};

type NotifKey = "emailConfirmations" | "emailReminders" | "whatsappReminders" | "slackNotifications" | "dailyDigest";

const notifItems: { key: NotifKey; title: string; desc: string }[] = [
  { key: "emailConfirmations", title: "Email confirmations", desc: "Send confirmation emails to clients when they book" },
  { key: "emailReminders", title: "Email reminders", desc: "Send reminder emails before meetings" },
  { key: "whatsappReminders", title: "WhatsApp reminders", desc: "Send WhatsApp reminders for clients who booked via WhatsApp" },
  { key: "slackNotifications", title: "Slack notifications", desc: "Get notified in Slack when new bookings arrive" },
  { key: "dailyDigest", title: "Daily digest", desc: "Receive a daily summary of upcoming meetings" },
];

const reminderOptions = [
  { hours: 24, label: "24 hours before" },
  { hours: 2, label: "2 hours before" },
  { hours: 1, label: "1 hour before" },
  { hours: 0.25, label: "15 minutes before" },
];

const webhookEventOptions = [
  "booking.created",
  "booking.cancelled",
  "booking.rescheduled",
  "booking.completed",
  "payment.received",
  "payment.refunded",
  "client.created",
];

const apiScopeOptions = [
  "bookings:read",
  "bookings:write",
  "event_types:read",
  "event_types:write",
  "clients:read",
  "clients:write",
  "webhooks:manage",
];

const roleBadgeColor: Record<TeamRole, string> = {
  owner: badge.violet,
  admin: badge.accent,
  member: badge.green,
  viewer: badge.amber,
};

/* ─── Helpers ────────────────────────────────────────────────── */

function generateSecret(): string {
  return "whsec_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
}

function generateApiKey(): string {
  return "llm_sk_" + Array.from({ length: 40 }, () => Math.random().toString(36)[2]).join("");
}

/* ─── Toggle Component ───────────────────────────────────────── */

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${toggle.track} ${on ? toggle.trackOn : toggle.trackOff}`}
    >
      <div className={`${toggle.thumb} ${on ? toggle.thumbOn : toggle.thumbOff}`} />
    </button>
  );
}

/* ─── Page Component ─────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  /* ── Profile ── */
  const [profile, setProfile] = useState({
    name: demoUser.name,
    handle: demoUser.handle,
    email: demoUser.email,
    timezone: demoUser.timezone,
    bio: demoUser.branding?.bio ?? "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [workingHours, setWorkingHours] = useState(
    weekDays.map((_, i) => ({ enabled: i < 5, start: "09:00", end: "17:00" })),
  );

  /* ── Integrations ── */
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([
    ...demoConnectedIntegrations,
  ]);

  /* ── Branding ── */
  const [accentColor, setAccentColor] = useState(
    demoUser.branding?.accentColor ?? defaults.accentColors[0].value,
  );
  const [customCss, setCustomCss] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(
    demoUser.branding?.showPoweredBy ?? true,
  );
  const [brandingSaved, setBrandingSaved] = useState(false);

  /* ── AI & Energy ── */
  const [aiBriefs, setAiBriefs] = useState(true);
  const [energyBlocks, setEnergyBlocks] = useState(
    demoEnergyBlocks.map((b) => ({ ...b })),
  );
  const [fatigueProtection, setFatigueProtection] = useState(true);
  const [maxMeetingsPerDay, setMaxMeetingsPerDay] = useState(8);
  const [minBreak, setMinBreak] = useState(15);

  /* ── Notifications ── */
  const [notifPrefs, setNotifPrefs] = useState({ ...demoNotificationPrefs });
  const [reminderTimings, setReminderTimings] = useState<number[]>([
    ...demoNotificationPrefs.reminderHoursBefore,
  ]);
  const [notifSaved, setNotifSaved] = useState(false);

  /* ── Team ── */
  const [teamMembers, setTeamMembers] = useState(
    demoTeamMembers.map((m) => ({ ...m })),
  );
  const [pendingInvites, setPendingInvites] = useState(
    demoPendingInvites.map((inv) => ({ ...inv })),
  );
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [roundRobinEnabled, setRoundRobinEnabled] = useState(false);
  const [distributionMethod, setDistributionMethod] = useState<
    "equal" | "weighted" | "availability"
  >("equal");
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  /* ── API ── */
  const [apiKeys, setApiKeys] = useState(demoApiKeys.map((k) => ({ ...k })));
  const [webhooks, setWebhooks] = useState(demoWebhooks.map((w) => ({ ...w })));
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [newWebhookSecret, setNewWebhookSecret] = useState(generateSecret());
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [webhookTested, setWebhookTested] = useState<string | null>(null);

  /* ── Handlers ── */

  const flashSave = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleIntegration = (provider: string) => {
    setConnectedIntegrations((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider],
    );
  };

  const toggleNotif = (key: NotifKey) => {
    setNotifPrefs((prev) => {
      const next = { ...prev };
      next[key] = !next[key];
      return next;
    });
  };

  const toggleReminder = (hours: number) => {
    setReminderTimings((prev) =>
      prev.includes(hours) ? prev.filter((h) => h !== hours) : [...prev, hours],
    );
  };

  const updateWorkingHour = (
    index: number,
    field: "enabled" | "start" | "end",
    value: string | boolean,
  ) => {
    setWorkingHours((prev) =>
      prev.map((wh, i) => (i === index ? { ...wh, [field]: value } : wh)),
    );
  };

  const updateEnergyBlock = (index: number, level: number) => {
    setEnergyBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, level } : b)),
    );
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const fullKey = generateApiKey();
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      prefix: fullKey.slice(0, 12),
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUsed: "Never",
    };
    setApiKeys((prev) => [...prev, newKey]);
    setNewlyCreatedKey(fullKey);
    setNewKeyName("");
    setNewKeyScopes([]);
    setShowNewKeyForm(false);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    setRevokingKeyId(null);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl.trim() || newWebhookEvents.length === 0) return;
    const wh = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: [...newWebhookEvents],
      isActive: true,
      failureCount: 0,
      lastDelivery: "Never",
    };
    setWebhooks((prev) => [...prev, wh]);
    setNewWebhookUrl("");
    setNewWebhookEvents([]);
    setShowNewWebhookForm(false);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    setDeletingWebhookId(null);
  };

  const testWebhook = (id: string) => {
    setWebhookTested(id);
    setTimeout(() => setWebhookTested(null), 2000);
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    setPendingInvites((prev) => [
      ...prev,
      { id: `inv_${Date.now()}`, email: inviteEmail, role: inviteRole, sentAt: "Just now" },
    ]);
    setInviteEmail("");
    setInviteRole("member");
    setShowInviteForm(false);
  };

  const removeMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    setRemovingMemberId(null);
  };

  const revokeInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((inv) => inv.id !== id));
  };

  const updateMemberRole = (id: string, role: TeamRole) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m)),
    );
  };

  const isTeamPlan = demoUser.plan === "team" || demoUser.plan === "enterprise";

  /* ─────────────────────────── JSX ──────────────────────────── */

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-sec text-sm mt-1">
          Manage your account, integrations, and preferences.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-8 border-b border-border pb-px overflow-x-auto">
        {settingsTabs.map((tab) => {
          const Icon = iconMap[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-text bg-bg-card border border-border border-b-bg-card -mb-px"
                  : "text-text-sec hover:text-text"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════ PROFILE ═══════════════════════ */}
      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-8">
          {/* Avatar */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-2xl font-bold shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Profile Photo</h3>
              <p className="text-sm text-text-muted mb-3">
                This appears on your booking page.
              </p>
              <button className={btn.ghost}>Upload new photo</button>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className={inputStyles.base}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Handle</label>
              <div className="flex items-center">
                <span className="px-4 py-3 rounded-l-lg border border-r-0 border-border bg-bg-raised text-sm text-text-muted">
                  {appConfig.domain}/
                </span>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(e) => setProfile((p) => ({ ...p, handle: e.target.value }))}
                  className={`${inputStyles.base} flex-1 rounded-l-none`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className={inputStyles.base}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                className={inputStyles.select}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className={inputStyles.textarea}
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">Working Hours</h3>
            <p className="text-sm text-text-sec mb-4">
              Set your weekly availability for meetings.
            </p>
            <div className="space-y-3">
              {weekDays.map((day, i) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-28">{day}</span>
                  <ToggleSwitch
                    on={workingHours[i].enabled}
                    onToggle={() => updateWorkingHour(i, "enabled", !workingHours[i].enabled)}
                  />
                  {workingHours[i].enabled ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={workingHours[i].start}
                        onChange={(e) => updateWorkingHour(i, "start", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-bg-card text-sm text-text outline-none focus:border-accent transition cursor-pointer"
                      >
                        {timeSlotOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-text-muted text-sm">to</span>
                      <select
                        value={workingHours[i].end}
                        onChange={(e) => updateWorkingHour(i, "end", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-bg-card text-sm text-text outline-none focus:border-accent transition cursor-pointer"
                      >
                        {timeSlotOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button className={btn.primary} onClick={() => flashSave(setProfileSaved)}>
              <Check className="w-4 h-4" />
              Save Changes
            </button>
            {profileSaved && (
              <span className="text-sm text-green font-medium">Saved!</span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ INTEGRATIONS ═══════════════════ */}
      {activeTab === "integrations" && (
        <div className="max-w-2xl space-y-8">
          {categoryOrder.map((cat) => {
            const catIntegrations = integrations.filter((i) => i.category === cat);
            if (catIntegrations.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  {categoryLabels[cat]}
                </h3>
                <div className="space-y-3">
                  {catIntegrations.map((intg) => {
                    const isConnected = connectedIntegrations.includes(intg.provider);
                    return (
                      <div
                        key={intg.provider}
                        className={`${card.base} p-4 flex items-center gap-4`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-border flex items-center justify-center text-text-sec">
                          <Plug className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{intg.name}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isConnected ? "bg-green" : "bg-text-muted/40"
                              }`}
                            />
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {intg.description}
                          </div>
                        </div>
                        {isConnected ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.green}`}
                            >
                              <Check className="w-3 h-3" /> Connected
                            </span>
                            <button
                              onClick={() => toggleIntegration(intg.provider)}
                              className="text-xs text-text-muted hover:text-rose transition"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(intg.provider)}
                            className={btn.ghost}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════ BRANDING ═══════════════════════ */}
      {activeTab === "branding" && (
        <div className="max-w-2xl space-y-6">
          {/* Accent color */}
          <div className={`${card.base} p-5`}>
            <label className="block text-sm font-semibold mb-1">Accent Color</label>
            <p className="text-sm text-text-sec mb-4">
              Choose a brand color for your booking page and emails.
            </p>
            <div className="flex flex-wrap gap-2">
              {defaults.accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`w-10 h-10 rounded-lg transition ${
                    accentColor === color.value
                      ? "ring-2 ring-white ring-offset-2 ring-offset-bg scale-110"
                      : "border-2 border-transparent hover:border-white/30"
                  }`}
                  style={{ background: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Logo upload */}
          <div className={`${card.base} p-5`}>
            <label className="block text-sm font-semibold mb-1">Logo</label>
            <p className="text-sm text-text-sec mb-4">
              Upload a logo for your booking page.
            </p>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-border-hover transition cursor-pointer">
              <p className="text-sm text-text-muted">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-text-muted mt-1">
                SVG, PNG, or JPG up to 2MB
              </p>
            </div>
          </div>

          {/* Custom CSS */}
          <div className={`${card.base} p-5`}>
            <label className="block text-sm font-semibold mb-1">Custom CSS</label>
            <p className="text-sm text-text-sec mb-4">
              Add custom styles to your booking page for advanced branding.
            </p>
            <textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder={`/* Example */\n.booking-page {\n  font-family: 'Inter', sans-serif;\n}`}
              className={`${inputStyles.textarea} font-mono text-xs`}
              rows={6}
            />
          </div>

          {/* Powered by toggle */}
          <div className={`${card.base} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Show &quot;Powered by {appConfig.name}&quot;
                </h3>
                <p className="text-sm text-text-sec mt-0.5">
                  Display the {appConfig.name} badge on your booking page.
                </p>
              </div>
              <ToggleSwitch
                on={showPoweredBy}
                onToggle={() => setShowPoweredBy((prev) => !prev)}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button className={btn.primary} onClick={() => flashSave(setBrandingSaved)}>
              <Check className="w-4 h-4" />
              Save Branding
            </button>
            {brandingSaved && (
              <span className="text-sm text-green font-medium">Saved!</span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ AI & ENERGY ═══════════════════ */}
      {activeTab === "ai" && (
        <div className="max-w-2xl space-y-6">
          {/* AI Meeting Briefs */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">AI Meeting Briefs</h3>
            <p className="text-sm text-text-sec mb-4">
              Get auto-generated meeting prep notes before each call with client
              history and suggested topics.
            </p>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                on={aiBriefs}
                onToggle={() => setAiBriefs((prev) => !prev)}
              />
              <span className="text-sm text-text-sec">
                {aiBriefs ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Energy Blocks */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">Energy-Aware Scheduling</h3>
            <p className="text-sm text-text-sec mb-4">
              Map meeting types to your energy levels throughout the day.
            </p>
            <div className="space-y-5 mt-4">
              {energyBlocks.map((block, i) => (
                <div key={block.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-sec">{block.label}</span>
                    <span className="text-xs font-semibold text-text-muted">
                      {block.level}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={block.level}
                    onChange={(e) => updateEnergyBlock(i, parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/[0.06] accent-accent"
                  />
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${block.color} transition-all`}
                      style={{ width: `${block.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fatigue Protection */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">Fatigue Protection</h3>
            <p className="text-sm text-text-sec mb-4">
              Get warnings when your schedule is overloaded and automatic
              rescheduling suggestions.
            </p>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                on={fatigueProtection}
                onToggle={() => setFatigueProtection((prev) => !prev)}
              />
              <span className="text-sm text-text-sec">
                {fatigueProtection ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Meeting limits */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">Meeting Limits</h3>
            <p className="text-sm text-text-sec mb-4">
              Set boundaries to protect your focus time.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max meetings per day
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={maxMeetingsPerDay}
                  onChange={(e) =>
                    setMaxMeetingsPerDay(parseInt(e.target.value) || 0)
                  }
                  className={`${inputStyles.base} max-w-[140px]`}
                />
                <p className="text-xs text-text-muted mt-1">
                  Set to 0 for unlimited.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum break between meetings (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  step={5}
                  value={minBreak}
                  onChange={(e) => setMinBreak(parseInt(e.target.value) || 0)}
                  className={`${inputStyles.base} max-w-[140px]`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ NOTIFICATIONS ═══════════════════ */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl space-y-6">
          {/* Notification toggles */}
          <div className="space-y-3">
            {notifItems.map((item) => (
              <div
                key={item.key}
                className={`${card.base} p-4 flex items-center gap-4`}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-text-muted">{item.desc}</div>
                </div>
                <ToggleSwitch
                  on={notifPrefs[item.key]}
                  onToggle={() => toggleNotif(item.key)}
                />
              </div>
            ))}
          </div>

          {/* Reminder timing */}
          <div className={`${card.base} p-5`}>
            <h3 className="font-semibold mb-1">Reminder Timing</h3>
            <p className="text-sm text-text-sec mb-4">
              Choose when to send meeting reminders to clients.
            </p>
            <div className="space-y-2">
              {reminderOptions.map((opt) => (
                <label
                  key={opt.hours}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={reminderTimings.includes(opt.hours)}
                    onChange={() => toggleReminder(opt.hours)}
                    className="w-4 h-4 rounded border-border bg-white/[0.03] accent-accent"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button className={btn.primary} onClick={() => flashSave(setNotifSaved)}>
              <Check className="w-4 h-4" />
              Save Notifications
            </button>
            {notifSaved && (
              <span className="text-sm text-green font-medium">Saved!</span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════ TEAM ═══════════════════════ */}
      {activeTab === "team" && (
        <div className="max-w-2xl space-y-6">
          {!isTeamPlan ? (
            <div className={`${card.base} p-8 text-center`}>
              <Users className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Plan Required</h3>
              <p className="text-sm text-text-sec mb-6 max-w-md mx-auto">
                Team management, round-robin scheduling, and member roles are
                available on the Team plan. Upgrade to unlock collaborative
                scheduling for your organization.
              </p>
              <button className={btn.primary}>Upgrade to Team</button>
            </div>
          ) : (
            <>
              {/* Team Members */}
              <div className={`${card.base} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Team Members</h3>
                    <p className="text-sm text-text-sec mt-0.5">
                      {teamMembers.length} member{teamMembers.length !== 1 && "s"} in
                      your team.
                    </p>
                  </div>
                  <button
                    className={btn.primary}
                    onClick={() => setShowInviteForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </button>
                </div>

                {/* Invite form */}
                {showInviteForm && (
                  <div className="mb-4 p-4 rounded-lg border border-accent/20 bg-accent-muted/10">
                    <div className="flex items-end gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className={inputStyles.base}
                        />
                      </div>
                      <div className="w-36">
                        <label className="block text-xs font-semibold mb-1">
                          Role
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) =>
                            setInviteRole(
                              e.target.value as "admin" | "member" | "viewer",
                            )
                          }
                          className={inputStyles.select}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <button className={btn.primary} onClick={handleSendInvite}>
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                      <button
                        className={btn.ghost}
                        onClick={() => setShowInviteForm(false)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Members list */}
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-sm font-bold shrink-0`}
                      >
                        {member.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{member.name}</div>
                        <div className="text-xs text-text-muted truncate">
                          {member.email}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeColor[member.role]}`}
                      >
                        {member.role}
                      </span>
                      <span className="text-xs text-text-muted hidden sm:inline">
                        {member.joinedAt}
                      </span>
                      {member.role !== "owner" && (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              updateMemberRole(member.id, e.target.value as TeamRole)
                            }
                            className="px-2 py-1 rounded-lg border border-border bg-bg-card text-xs text-text outline-none focus:border-accent transition cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          {removingMemberId === member.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => removeMember(member.id)}
                                className="text-xs text-rose font-semibold hover:underline"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setRemovingMemberId(null)}
                                className="text-xs text-text-muted hover:text-text"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRemovingMemberId(member.id)}
                              className="text-text-muted hover:text-rose transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div className={`${card.base} p-5`}>
                  <h3 className="font-semibold mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-border flex items-center justify-center text-text-muted">
                          <Send className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{invite.email}</div>
                          <div className="text-xs text-text-muted">
                            Sent {invite.sentAt}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeColor[invite.role]}`}
                        >
                          {invite.role}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-accent hover:underline">
                            Resend
                          </button>
                          <button
                            onClick={() => revokeInvite(invite.id)}
                            className="text-xs text-text-muted hover:text-rose transition"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Round-Robin */}
              <div className={`${card.base} p-5`}>
                <h3 className="font-semibold mb-1">Round-Robin Configuration</h3>
                <p className="text-sm text-text-sec mb-4">
                  Automatically distribute meetings across team members.
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <ToggleSwitch
                    on={roundRobinEnabled}
                    onToggle={() => setRoundRobinEnabled((prev) => !prev)}
                  />
                  <span className="text-sm text-text-sec">
                    {roundRobinEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {roundRobinEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Distribution Method
                      </label>
                      <select
                        value={distributionMethod}
                        onChange={(e) =>
                          setDistributionMethod(
                            e.target.value as "equal" | "weighted" | "availability",
                          )
                        }
                        className={inputStyles.select}
                      >
                        <option value="equal">Equal Distribution</option>
                        <option value="weighted">Weighted Distribution</option>
                        <option value="availability">Availability-Based</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Priority Order
                      </label>
                      <div className="space-y-1">
                        {teamMembers.map((member, idx) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-white/[0.02]"
                          >
                            <span className="text-xs text-text-muted w-5">
                              {idx + 1}.
                            </span>
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-xs font-bold`}
                            >
                              {member.initials}
                            </div>
                            <span className="text-sm">{member.name}</span>
                            <Globe className="w-3.5 h-3.5 text-text-muted ml-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════ API ═══════════════════════ */}
      {activeTab === "api" && (
        <div className="max-w-2xl space-y-6">
          {/* API Keys */}
          <div className={`${card.base} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm text-text-sec mt-0.5">
                  Manage your API keys for programmatic access.
                </p>
              </div>
              <button
                className={btn.primary}
                onClick={() => {
                  setShowNewKeyForm(true);
                  setNewlyCreatedKey(null);
                }}
              >
                <Plus className="w-4 h-4" />
                Create New Key
              </button>
            </div>

            {/* Newly created key warning */}
            {newlyCreatedKey && (
              <div className="mb-4 p-4 rounded-lg border border-amber/30 bg-amber-muted/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber mb-1">
                      Save your API key now
                    </p>
                    <p className="text-xs text-text-sec mb-2">
                      This key will not be shown again. Copy it and store it
                      securely.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-bg-raised border border-border text-xs font-mono text-text break-all">
                        {newlyCreatedKey}
                      </code>
                      <button
                        className={btn.iconSm}
                        onClick={() =>
                          copyToClipboard(newlyCreatedKey, "new-key")
                        }
                      >
                        {copiedText === "new-key" ? (
                          <Check className="w-3.5 h-3.5 text-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewlyCreatedKey(null)}
                    className="text-text-muted hover:text-text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* New key form */}
            {showNewKeyForm && (
              <div className="mb-4 p-4 rounded-lg border border-accent/20 bg-accent-muted/10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Production, Staging"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className={inputStyles.base}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Scopes
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {apiScopeOptions.map((scope) => (
                        <label
                          key={scope}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newKeyScopes.includes(scope)}
                            onChange={() =>
                              setNewKeyScopes((prev) =>
                                prev.includes(scope)
                                  ? prev.filter((s) => s !== scope)
                                  : [...prev, scope],
                              )
                            }
                            className="w-4 h-4 rounded border-border bg-white/[0.03] accent-accent"
                          />
                          <span className="text-xs font-mono">{scope}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={btn.primary}
                      onClick={handleCreateApiKey}
                    >
                      <Key className="w-4 h-4" />
                      Create Key
                    </button>
                    <button
                      className={btn.ghost}
                      onClick={() => setShowNewKeyForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Keys list */}
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-white/[0.02]"
                >
                  <Key className="w-4 h-4 text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{key.name}</div>
                    <div className="text-xs text-text-muted font-mono">
                      {key.prefix}...****
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-xs text-text-muted">
                      Created {key.createdAt}
                    </div>
                    <div className="text-xs text-text-muted">
                      Last used: {key.lastUsed}
                    </div>
                  </div>
                  {revokingKeyId === key.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="text-xs text-rose font-semibold hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokingKeyId(null)}
                        className="text-xs text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokingKeyId(key.id)}
                      className="text-xs text-text-muted hover:text-rose transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {apiKeys.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No API keys yet. Create one to get started.
                </p>
              )}
            </div>
          </div>

          {/* Webhooks */}
          <div className={`${card.base} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Webhooks</h3>
                <p className="text-sm text-text-sec mt-0.5">
                  Receive real-time notifications when events happen.
                </p>
              </div>
              <button
                className={btn.primary}
                onClick={() => {
                  setShowNewWebhookForm(true);
                  setNewWebhookSecret(generateSecret());
                }}
              >
                <Plus className="w-4 h-4" />
                Add Webhook
              </button>
            </div>

            {/* New webhook form */}
            {showNewWebhookForm && (
              <div className="mb-4 p-4 rounded-lg border border-accent/20 bg-accent-muted/10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Endpoint URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-app.com/webhooks/llamame"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className={`${inputStyles.base} font-mono`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Events
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {webhookEventOptions.map((evt) => (
                        <label
                          key={evt}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newWebhookEvents.includes(evt)}
                            onChange={() =>
                              setNewWebhookEvents((prev) =>
                                prev.includes(evt)
                                  ? prev.filter((e) => e !== evt)
                                  : [...prev, evt],
                              )
                            }
                            className="w-4 h-4 rounded border-border bg-white/[0.03] accent-accent"
                          />
                          <span className="text-xs font-mono">{evt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Signing Secret
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-bg-raised border border-border text-xs font-mono text-text-sec truncate">
                        {newWebhookSecret}
                      </code>
                      <button
                        className={btn.iconSm}
                        onClick={() =>
                          copyToClipboard(newWebhookSecret, "wh-secret")
                        }
                      >
                        {copiedText === "wh-secret" ? (
                          <Check className="w-3.5 h-3.5 text-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={btn.primary}
                      onClick={handleCreateWebhook}
                    >
                      <Globe className="w-4 h-4" />
                      Add Webhook
                    </button>
                    <button
                      className={btn.ghost}
                      onClick={() => setShowNewWebhookForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks list */}
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3 rounded-lg border border-border bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <Globe className="w-4 h-4 text-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono truncate">{wh.url}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            wh.isActive ? "bg-green" : "bg-rose"
                          }`}
                        />
                        <span className="text-xs text-text-muted">
                          {wh.events.length} event{wh.events.length !== 1 && "s"}
                        </span>
                        <span className="text-xs text-text-muted">
                          {wh.failureCount > 0
                            ? `${wh.failureCount} failure${wh.failureCount !== 1 ? "s" : ""}`
                            : "No failures"}
                        </span>
                        <span className="text-xs text-text-muted">
                          Last: {wh.lastDelivery}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className={btn.ghost}
                        onClick={() => testWebhook(wh.id)}
                      >
                        {webhookTested === wh.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green" /> Sent
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Test
                          </>
                        )}
                      </button>
                      {deletingWebhookId === wh.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteWebhook(wh.id)}
                            className="text-xs text-rose font-semibold hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingWebhookId(null)}
                            className="text-xs text-text-muted hover:text-text"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingWebhookId(wh.id)}
                          className="text-text-muted hover:text-rose transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 pl-8">
                    {wh.events.map((evt) => (
                      <span
                        key={evt}
                        className={`px-2 py-0.5 rounded-full text-xs font-mono ${badge.accent}`}
                      >
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No webhooks configured yet.
                </p>
              )}
            </div>
          </div>

          {/* API Documentation */}
          <div className="p-4 rounded-xl bg-accent-muted/50 border border-accent/15">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-text-sec">
                API documentation is available at{" "}
                <a
                  href={`https://${appConfig.docsUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-mono text-xs hover:underline"
                >
                  {appConfig.docsUrl}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
