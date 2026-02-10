"use client";

import { Zap } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-text-sec text-sm mt-1">
            Automate emails, messages, and notifications when events happen.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-5">
          <Zap className="w-8 h-8 text-violet" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet/10 text-violet border border-violet/20 mb-4">
          Coming Soon
        </span>
        <h2 className="text-xl font-bold mb-2">Workflow Automation</h2>
        <p className="text-text-muted text-sm max-w-md leading-relaxed">
          Create automated workflows to send emails, WhatsApp messages, Slack
          notifications, and webhooks when bookings are created, confirmed, or
          cancelled.
        </p>
      </div>
    </>
  );
}
