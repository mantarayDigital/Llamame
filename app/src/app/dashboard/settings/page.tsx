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
  X,
  ExternalLink,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "ai", label: "AI & Energy", icon: Brain },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API", icon: Code },
];

const integrations = [
  {
    name: "Google Calendar",
    desc: "Two-way calendar sync",
    connected: true,
  },
  {
    name: "Google Meet",
    desc: "Auto-generate meeting links",
    connected: true,
  },
  {
    name: "WhatsApp Business",
    desc: "Booking bot and notifications",
    connected: true,
  },
  {
    name: "Stripe",
    desc: "Payment processing",
    connected: true,
  },
  { name: "Slack", desc: "Booking notifications", connected: false },
  { name: "HubSpot", desc: "CRM sync", connected: false },
  { name: "Zapier", desc: "Connect 5000+ apps", connected: false },
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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition relative ${
              activeTab === tab.id
                ? "text-text bg-bg-card border border-border border-b-bg-card -mb-px"
                : "text-text-sec hover:text-text"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-2xl font-bold shrink-0">
              M
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
                defaultValue="MantaRay Digital"
                className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Handle
              </label>
              <div className="flex items-center gap-0">
                <span className="px-4 py-3 rounded-l-lg border border-r-0 border-border bg-bg-raised text-sm text-text-muted">
                  llamame.io/
                </span>
                <input
                  type="text"
                  defaultValue="mantaray"
                  className="flex-1 px-4 py-3 rounded-r-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="hello@mantaray.digital"
                className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Timezone
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-border bg-bg-card text-text text-sm outline-none focus:border-accent transition cursor-pointer">
                <option>America/New_York (EST)</option>
                <option>America/Chicago (CST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                defaultValue="Digital marketing consultancy helping brands grow through data-driven strategies."
                className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition min-h-[100px] resize-y"
              />
            </div>
            <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:-translate-y-0.5 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="max-w-2xl space-y-3">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-card"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-border flex items-center justify-center text-text-sec">
                <Plug className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{int.name}</div>
                <div className="text-xs text-text-muted">{int.desc}</div>
              </div>
              {int.connected ? (
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
          ))}
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
              <div className="w-10 h-[22px] rounded-full bg-green/30 relative cursor-pointer">
                <div className="absolute top-[3px] left-[21px] w-4 h-4 rounded-full bg-green" />
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
              {[
                { label: "Morning (9-11am)", level: 90, color: "bg-green" },
                { label: "Midday (11am-1pm)", level: 70, color: "bg-accent" },
                { label: "Afternoon (1-4pm)", level: 50, color: "bg-amber" },
                { label: "Late (4-6pm)", level: 30, color: "bg-rose" },
              ].map((period) => (
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
              <div className="w-10 h-[22px] rounded-full bg-green/30 relative cursor-pointer">
                <div className="absolute top-[3px] left-[21px] w-4 h-4 rounded-full bg-green" />
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
              {[
                "#22d3ee",
                "#a78bfa",
                "#4ade80",
                "#fb7185",
                "#fbbf24",
                "#3b82f6",
              ].map((color) => (
                <button
                  key={color}
                  className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-white/30 transition"
                  style={{ background: color }}
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
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:-translate-y-0.5 transition-all">
            Save Branding
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl space-y-3">
          {[
            {
              title: "Email confirmations",
              desc: "Send confirmation emails to clients when they book",
              on: true,
            },
            {
              title: "Email reminders",
              desc: "Send reminder emails 24h and 1h before meetings",
              on: true,
            },
            {
              title: "WhatsApp reminders",
              desc: "Send WhatsApp reminders for clients who booked via WhatsApp",
              on: true,
            },
            {
              title: "Slack notifications",
              desc: "Get notified in Slack when new bookings arrive",
              on: false,
            },
            {
              title: "Daily digest",
              desc: "Receive a daily summary of upcoming meetings",
              on: true,
            },
          ].map((notif) => (
            <div
              key={notif.title}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-card"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold">{notif.title}</div>
                <div className="text-xs text-text-muted">{notif.desc}</div>
              </div>
              <div
                className={`w-10 h-[22px] rounded-full relative cursor-pointer ${
                  notif.on ? "bg-green/30" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-[3px] w-4 h-4 rounded-full transition ${
                    notif.on
                      ? "left-[21px] bg-green"
                      : "left-[3px] bg-text-muted"
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
              className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-accent transition placeholder:text-text-muted font-mono"
            />
          </div>
          <div className="p-4 rounded-xl bg-accent-muted/50 border border-accent/15">
            <p className="text-sm text-text-sec">
              API documentation is available at{" "}
              <span className="text-accent font-mono text-xs">
                docs.llamame.io/api
              </span>
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:-translate-y-0.5 transition-all">
            Save Webhook
          </button>
        </div>
      )}
    </>
  );
}
