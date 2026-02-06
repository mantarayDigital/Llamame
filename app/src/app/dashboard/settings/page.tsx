"use client";

import { useState } from "react";
import {
  User,
  Plug,
  Palette,
  Brain,
  Bell,
  Code,
  Check,
  Users,
  type LucideIcon,
} from "lucide-react";
import { appConfig, defaults, timezones } from "@/lib/config";
import { btn, input as inputStyles, toggle } from "@/lib/theme";
import { settingsTabs } from "@/lib/navigation";
import { integrations } from "@/lib/integrations";
import {
  useUpdateProfile,
  useUpdateBranding,
  useUpdateNotificationPrefs,
  useUpdateEnergyProfile,
  demoUser,
  demoEnergyBlocks,
  demoNotificationPrefs,
  demoConnectedIntegrations,
  isConvexConnected,
} from "@/lib/data";

/** Map icon name strings from settingsTabs to actual Lucide components */
const iconMap: Record<string, LucideIcon> = {
  User,
  Plug,
  Palette,
  Brain,
  Bell,
  Users,
  Code,
};

/** Map notification preference keys to display properties */
const notificationItems: {
  key: string;
  title: string;
  desc: string;
  on: boolean;
}[] = [
  {
    key: "emailConfirmations",
    title: "Email confirmations",
    desc: "Send confirmation emails to clients when they book",
    on: demoNotificationPrefs.emailConfirmations,
  },
  {
    key: "emailReminders",
    title: "Email reminders",
    desc: "Send reminder emails 24h and 1h before meetings",
    on: demoNotificationPrefs.emailReminders,
  },
  {
    key: "whatsappReminders",
    title: "WhatsApp reminders",
    desc: "Send WhatsApp reminders for clients who booked via WhatsApp",
    on: demoNotificationPrefs.whatsappReminders,
  },
  {
    key: "slackNotifications",
    title: "Slack notifications",
    desc: "Get notified in Slack when new bookings arrive",
    on: demoNotificationPrefs.slackNotifications,
  },
  {
    key: "dailyDigest",
    title: "Daily digest",
    desc: "Receive a daily summary of upcoming meetings",
    on: demoNotificationPrefs.dailyDigest,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-sec text-sm mt-1">
          Manage your account, integrations, and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border pb-px">
        {settingsTabs.map((tab) => {
          const Icon = iconMap[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition relative ${
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

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-2xl font-bold shrink-0">
              {demoUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Profile Photo</h3>
              <p className="text-sm text-text-muted mb-3">
                This appears on your booking page.
              </p>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.03] border border-border hover:bg-bg-card-hover transition">
                Upload new photo
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue={demoUser.name}
                className={inputStyles.base}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Handle
              </label>
              <div className="flex items-center gap-0">
                <span className="px-4 py-3 rounded-l-lg border border-r-0 border-border bg-bg-raised text-sm text-text-muted">
                  {appConfig.domain}/
                </span>
                <input
                  type="text"
                  defaultValue={demoUser.handle}
                  className={`${inputStyles.base} flex-1 rounded-r-lg rounded-l-none`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={demoUser.email}
                className={inputStyles.base}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Timezone
              </label>
              <select className={inputStyles.select}>
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
                defaultValue={demoUser.branding?.bio ?? ""}
                className={inputStyles.textarea}
              />
            </div>
            <button className={btn.primary}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="max-w-2xl space-y-3">
          {integrations.map((int) => {
            const isConnected = demoConnectedIntegrations.includes(int.provider);
            return (
              <div
                key={int.provider}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-border flex items-center justify-center text-text-sec">
                  <Plug className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{int.name}</div>
                  <div className="text-xs text-text-muted">
                    {int.description}
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-muted text-green">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                    <button className="text-xs text-text-muted hover:text-rose transition">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.03] border border-border hover:bg-bg-card-hover hover:border-border-hover transition">
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI & Energy Tab */}
      {activeTab === "ai" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-5 rounded-xl border border-border bg-bg-card">
            <h3 className="font-semibold mb-1">AI Meeting Briefs</h3>
            <p className="text-sm text-text-sec mb-4">
              Get auto-generated meeting prep notes before each call with client
              history and suggested topics.
            </p>
            <div className="flex items-center gap-3">
              <div className={`${toggle.track} ${toggle.trackOn}`}>
                <div className={`${toggle.thumb} ${toggle.thumbOn}`} />
              </div>
              <span className="text-sm text-text-sec">Enabled</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-bg-card">
            <h3 className="font-semibold mb-1">Energy-Aware Scheduling</h3>
            <p className="text-sm text-text-sec mb-4">
              Map meeting types to your energy levels throughout the day.
            </p>
            <div className="space-y-3 mt-4">
              {demoEnergyBlocks.map((period) => (
                <div key={period.label} className="flex items-center gap-4">
                  <span className="text-sm text-text-sec w-40">
                    {period.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${period.color}`}
                      style={{ width: `${period.level}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-8">
                    {period.level}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-bg-card">
            <h3 className="font-semibold mb-1">Fatigue Protection</h3>
            <p className="text-sm text-text-sec mb-4">
              Get warnings when your schedule is overloaded and automatic
              rescheduling suggestions.
            </p>
            <div className="flex items-center gap-3">
              <div className={`${toggle.track} ${toggle.trackOn}`}>
                <div className={`${toggle.thumb} ${toggle.thumbOn}`} />
              </div>
              <span className="text-sm text-text-sec">Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === "branding" && (
        <div className="max-w-2xl space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              {defaults.accentColors.map((color) => (
                <button
                  key={color.value}
                  className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-white/30 transition"
                  style={{ background: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Logo
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-border-hover transition cursor-pointer">
              <p className="text-sm text-text-muted">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-text-muted mt-1">
                SVG, PNG, or JPG up to 2MB
              </p>
            </div>
          </div>
          <button className={btn.primary}>
            Save Branding
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl space-y-3">
          {notificationItems.map((notif) => (
            <div
              key={notif.key}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-card"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold">{notif.title}</div>
                <div className="text-xs text-text-muted">{notif.desc}</div>
              </div>
              <div
                className={`${toggle.track} ${
                  notif.on ? toggle.trackOn : toggle.trackOff
                }`}
              >
                <div
                  className={`${toggle.thumb} ${
                    notif.on
                      ? toggle.thumbOn
                      : toggle.thumbOff
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Tab */}
      {activeTab === "api" && (
        <div className="max-w-2xl space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="llm_sk_7f3a...b42e"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-bg-raised text-text-sec text-sm font-mono"
              />
              <button className="px-4 py-3 rounded-lg text-sm font-medium bg-white/[0.03] border border-border hover:bg-bg-card-hover transition">
                Regenerate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://your-app.com/webhooks/llamame"
              className={`${inputStyles.base} font-mono`}
            />
          </div>
          <div className="p-4 rounded-xl bg-accent-muted/50 border border-accent/15">
            <p className="text-sm text-text-sec">
              API documentation is available at{" "}
              <span className="text-accent font-mono text-xs">
                {appConfig.docsUrl}
              </span>
            </p>
          </div>
          <button className={btn.primary}>
            Save Webhook
          </button>
        </div>
      )}
    </>
  );
}
