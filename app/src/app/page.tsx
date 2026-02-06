import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  CalendarCheck,
  Brain,
  Globe,
  MessageCircle,
  HeartPulse,
  CreditCard,
  Workflow,
  Palette,
  BarChart3,
  Cpu,
  BatteryCharging,
  Shield,
  BookOpen,
  RefreshCw,
  Plug,
  Calendar,
  Mail,
  Video,
  Monitor,
  Smartphone,
  Hash,
  Database,
  Send,
  FileText,
  Zap,
  Wallet,
  Tag,
  Quote,
  Check,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart Availability",
    desc: "Buffer times, daily limits, seasonal schedules, and complex availability rules that respect your boundaries.",
    tag: "Core",
    tagClass: "bg-green-muted text-green",
    iconBg: "bg-green-muted",
    iconColor: "text-green",
  },
  {
    icon: Brain,
    title: "AI Meeting Prep",
    desc: "Walk into every call prepared. Auto-generated briefs with client history, notes, and suggested topics.",
    tag: "AI",
    tagClass: "bg-accent-muted text-accent",
    iconBg: "bg-accent-muted",
    iconColor: "text-accent",
  },
  {
    icon: Globe,
    title: "Timezone Intelligence",
    desc: "Automatic detection, local time display, smart conflict prevention across every timezone.",
    tag: "Unique",
    tagClass: "bg-violet-muted text-violet",
    iconBg: "bg-violet-muted",
    iconColor: "text-violet",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Booking",
    desc: "Conversational booking bot that lets clients schedule where they already communicate.",
    tag: "Unique",
    tagClass: "bg-green-muted text-green",
    iconBg: "bg-green-muted",
    iconColor: "text-green",
  },
  {
    icon: HeartPulse,
    title: "Vibe Check Intake",
    desc: "Pre-meeting questionnaire that captures mood, priorities, and context. Know before you connect.",
    tag: "Unique",
    tagClass: "bg-rose-muted text-rose",
    iconBg: "bg-rose-muted",
    iconColor: "text-rose",
  },
  {
    icon: CreditCard,
    title: "Built-in Payments",
    desc: "Stripe and PayPal integration. Collect deposits, full payments, or pay-what-you-want at booking.",
    tag: "Core",
    tagClass: "bg-amber-muted text-amber",
    iconBg: "bg-amber-muted",
    iconColor: "text-amber",
  },
  {
    icon: Workflow,
    title: "Smart Workflows",
    desc: "Trigger emails, SMS, Slack messages, and CRM updates automatically based on booking events.",
    tag: "Core",
    tagClass: "bg-accent-muted text-accent",
    iconBg: "bg-accent-muted",
    iconColor: "text-accent",
  },
  {
    icon: Palette,
    title: "Brand Studio",
    desc: "Custom booking pages with your colors, logo, and fonts. Fully white-label on Team plan.",
    tag: "Core",
    tagClass: "bg-violet-muted text-violet",
    iconBg: "bg-violet-muted",
    iconColor: "text-violet",
  },
  {
    icon: BarChart3,
    title: "Client Intelligence",
    desc: "Track meeting history, no-show rates, rebooking patterns, and client lifetime value.",
    tag: "AI",
    tagClass: "bg-accent-muted text-accent",
    iconBg: "bg-green-muted",
    iconColor: "text-green",
  },
];

const integrations = [
  { icon: Calendar, name: "Google Calendar", sub: "two-way sync" },
  { icon: Mail, name: "Outlook", sub: "cal + email" },
  { icon: Video, name: "Zoom", sub: "auto-create" },
  { icon: Monitor, name: "Google Meet", sub: "auto-link" },
  { icon: CreditCard, name: "Stripe", sub: "payments" },
  { icon: Smartphone, name: "WhatsApp", sub: "chat booking" },
  { icon: Hash, name: "Slack", sub: "notifications" },
  { icon: Database, name: "HubSpot", sub: "crm sync" },
  { icon: Send, name: "Mailchimp", sub: "auto-lists" },
  { icon: FileText, name: "Notion", sub: "meeting notes" },
  { icon: Zap, name: "Zapier", sub: "5000+ apps" },
  { icon: Wallet, name: "PayPal", sub: "payments" },
];

const pricingPlans = [
  {
    tier: "free",
    price: "$0",
    unit: "/mo",
    desc: "For individuals getting started with smart scheduling.",
    features: [
      "1 event type",
      "Google Calendar sync",
      "Email notifications",
      "Booking page",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    tier: "pro",
    price: "$12",
    unit: "/mo",
    desc: "AI scheduling, all integrations, and full customization.",
    features: [
      "Unlimited event types",
      "AI Meeting Briefs",
      "All integrations",
      "WhatsApp booking bot",
      "Payments + Vibe Check",
      "Custom branding",
      "Energy-aware scheduling",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    tier: "team",
    price: "$24",
    unit: "/seat/mo",
    desc: "Round-robin, collective booking, and team analytics.",
    features: [
      "Everything in Pro",
      "Team scheduling",
      "Client Intelligence dashboard",
      "Advanced analytics",
      "API access",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

const testimonials = [
  {
    quote:
      "The AI meeting briefs alone are worth it. I walk into every call knowing exactly what to discuss. My clients think I have superhuman memory.",
    name: "Jamie Rodriguez",
    role: "Business Coach",
    initials: "JR",
    gradient: "from-accent to-violet",
  },
  {
    quote:
      "WhatsApp booking changed everything for my Latin American clients. They don't want to visit a website — they want to text. Llamame gets it.",
    name: "Ana Kovacs",
    role: "Marketing Consultant",
    initials: "AK",
    gradient: "from-violet to-rose",
  },
  {
    quote:
      "Energy-aware scheduling is genius. No more back-to-back calls that leave me drained. My calendar finally works for me, not against me.",
    name: "Lucas Sharma",
    role: "UX Designer",
    initials: "LS",
    gradient: "from-green to-accent",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Grid BG */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
        }}
      />
      {/* Top Glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-400px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 h-14 px-8 bg-bg/80 backdrop-blur-xl border-b border-border flex items-center">
        <div className="max-w-[1140px] w-full mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Llama<span className="text-accent">me</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="#features"
              className="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-sec hover:text-text hover:bg-white/[0.03] transition"
            >
              Features
            </Link>
            <Link
              href="#integrations"
              className="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-sec hover:text-text hover:bg-white/[0.03] transition"
            >
              Integrations
            </Link>
            <Link
              href="#pricing"
              className="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-sec hover:text-text hover:bg-white/[0.03] transition"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-sec hover:text-text hover:bg-white/[0.03] transition"
            >
              Sign in
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" /> Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-[1] max-w-[1140px] mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 pl-1.5 bg-accent-muted border border-accent/15 rounded-full text-xs font-medium text-accent mb-7">
          <span className="w-4.5 h-4.5 rounded-full bg-accent/15 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
          AI-powered scheduling, now available
        </div>

        <h1 className="text-[clamp(2.8rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-2px] mb-5 max-w-[720px] mx-auto">
          Scheduling that
          <br />
          <span className="bg-gradient-to-br from-accent to-violet bg-clip-text text-transparent">
            works as hard as you do
          </span>
        </h1>

        <p className="text-lg text-text-sec max-w-[500px] mx-auto mb-9 leading-relaxed">
          Smart availability, AI meeting prep, integrated payments, and client
          intelligence. Everything in one place.
        </p>

        <div className="flex gap-2.5 justify-center mb-5">
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Start free
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-bg-card text-text border border-border-hover hover:border-border-strong hover:bg-bg-card-hover transition-all"
          >
            How it works
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3.5 mb-16">
          <div className="flex">
            {["JR", "AK", "LS", "MP"].map((initials, i) => {
              const gradients = [
                "from-accent to-violet",
                "from-violet to-rose",
                "from-green to-accent",
                "from-amber to-rose",
              ];
              return (
                <div
                  key={initials}
                  className={`w-7 h-7 rounded-full border-2 border-bg flex items-center justify-center text-[0.55rem] font-bold text-white bg-gradient-to-br ${gradients[i]} ${i > 0 ? "-ml-1.5" : ""}`}
                >
                  {initials}
                </div>
              );
            })}
          </div>
          <span className="text-sm text-text-muted">
            Trusted by <strong className="text-text-sec font-semibold">2,000+</strong> professionals
          </span>
        </div>

        {/* Preview */}
        <div className="max-w-[980px] mx-auto rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.4),0_0_80px_rgba(34,211,238,0.04)] bg-bg-card border border-border">
          <div className="flex items-center px-4 py-2.5 border-b border-border bg-bg-raised">
            <div className="flex gap-1.5 mr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted/30" />
            </div>
            <div className="flex-1 text-center font-mono text-xs text-text-muted px-3 py-1 bg-white/[0.03] rounded-md mr-12">
              llamame.io/mantaray
            </div>
          </div>
          <div className="grid grid-cols-[250px_1fr] min-h-[380px]">
            <div className="p-6 border-r border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-lg text-white mb-3">
                M
              </div>
              <div className="font-bold text-[0.95rem] mb-0.5">
                MantaRay Digital
              </div>
              <div className="text-xs text-text-muted font-mono mb-5">
                /mantaray
              </div>
              {[
                {
                  color: "bg-accent",
                  name: "Discovery Call",
                  meta: "30 min \u00b7 Video",
                },
                {
                  color: "bg-violet",
                  name: "Strategy Session",
                  meta: "60 min \u00b7 $150",
                },
                {
                  color: "bg-green",
                  name: "Quick Check-in",
                  meta: "15 min \u00b7 Phone",
                },
              ].map((evt) => (
                <div
                  key={evt.name}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border mb-1.5 cursor-pointer hover:border-border-hover hover:bg-white/[0.03] transition"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${evt.color} shrink-0`}
                  />
                  <div>
                    <strong className="text-sm font-semibold block">
                      {evt.name}
                    </strong>
                    <span className="text-xs text-text-muted">{evt.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[0.95rem] font-semibold">
                  February 2026
                </h3>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-md border border-border bg-transparent text-text-sec text-sm hover:border-border-hover hover:text-text transition">
                    &larr;
                  </button>
                  <button className="w-7 h-7 rounded-md border border-border bg-transparent text-text-sec text-sm hover:border-border-hover hover:text-text transition">
                    &rarr;
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center mb-5">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div
                    key={d}
                    className="text-[0.68rem] font-semibold text-text-muted py-2 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
                {/* Row 1 - empty slots then 1 */}
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`e1-${i}`} className="py-2 text-sm opacity-20" />
                  ))}
                <div className="py-2 text-sm text-text-muted opacity-20">
                  1
                </div>
                {/* Row 2 */}
                {[2, 3, 4, 5].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-sm text-text-muted opacity-20"
                  >
                    {d}
                  </div>
                ))}
                <div className="py-2 text-sm text-text-sec font-medium">6</div>
                <div className="py-2 text-sm text-text-muted">7</div>
                <div className="py-2 text-sm text-text-muted">8</div>
                {/* Row 3 */}
                <div className="py-2 text-sm text-text-sec font-medium">9</div>
                <div className="py-2 text-sm bg-accent text-bg font-semibold rounded-lg">
                  10
                </div>
                {[11, 12, 13].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-sm text-text-sec font-medium"
                  >
                    {d}
                  </div>
                ))}
                <div className="py-2 text-sm text-text-muted">14</div>
                <div className="py-2 text-sm text-text-muted">15</div>
                {/* Row 4 */}
                {[16, 17, 18, 19, 20].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-sm text-text-sec font-medium"
                  >
                    {d}
                  </div>
                ))}
                <div className="py-2 text-sm text-text-muted">21</div>
                <div className="py-2 text-sm text-text-muted">22</div>
                {/* Row 5 */}
                {[23, 24, 25, 26, 27].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-sm text-text-sec font-medium"
                  >
                    {d}
                  </div>
                ))}
                <div className="py-2 text-sm text-text-muted">28</div>
                <div className="py-2 text-sm" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "9:00 AM",
                  "10:00 AM",
                  "11:00 AM",
                  "1:00 PM",
                  "2:30 PM",
                  "4:00 PM",
                ].map((t, i) => (
                  <div
                    key={t}
                    className={`px-4 py-2 rounded-md text-sm font-medium border cursor-pointer transition ${
                      i === 1
                        ? "bg-accent text-bg border-accent"
                        : "border-border text-text-sec hover:border-accent hover:text-accent"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 pb-24 relative z-[1]">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid grid-cols-4 gap-px rounded-xl overflow-hidden border border-border">
            {[
              { val: "94%", label: "Show rate", color: "text-accent" },
              { val: "2 min", label: "Setup time", color: "text-green" },
              { val: "12+", label: "Integrations", color: "text-violet" },
              { val: "4.9", label: "User rating", color: "text-amber" },
            ].map((s) => (
              <div key={s.label} className="p-7 text-center bg-bg-card">
                <div
                  className={`text-3xl font-extrabold tracking-tight mb-0.5 ${s.color}`}
                >
                  {s.val}
                </div>
                <div className="text-sm text-text-muted font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 px-8 relative z-[1] bg-bg-raised border-y border-border"
      >
        <div className="max-w-[1140px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent mb-3">
            <Layers className="w-3.5 h-3.5" /> Features
          </div>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight mb-3 leading-tight">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="text-text-sec max-w-[480px] mb-13">
            Professional scheduling tools with AI intelligence built in from day
            one.
          </p>

          <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-border">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-7 bg-bg-card hover:bg-bg-card-hover transition relative group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-accent-glow to-transparent transition-opacity pointer-events-none" />
                <div
                  className={`w-10 h-10 rounded-lg ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-4 relative z-[1]`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1.5 relative z-[1]">
                  {f.title}
                </h3>
                <p className="text-sm text-text-sec leading-relaxed relative z-[1]">
                  {f.desc}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[0.65rem] font-semibold mt-3.5 font-mono uppercase tracking-wider relative z-[1] ${f.tagClass}`}
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-8 relative z-[1]">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Chat Preview */}
            <div className="rounded-xl overflow-hidden border border-border bg-bg-card shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.4)]">
              <div className="px-4 py-3 border-b border-border bg-bg-raised flex items-center gap-2 text-sm font-semibold text-accent">
                <Sparkles className="w-3.5 h-3.5" /> AI Scheduling Assistant
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="p-3 px-4 rounded-xl bg-bg-raised border border-border rounded-bl-sm text-sm text-text-sec leading-relaxed max-w-[88%]">
                  <div className="flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wider text-accent mb-1">
                    <Sparkles className="w-2.5 h-2.5" /> Llamame
                  </div>
                  You have 6 meetings tomorrow with no breaks. Want me to
                  optimize your schedule?
                </div>
                <div className="p-3 px-4 rounded-xl bg-gradient-to-br from-accent/10 to-violet/[0.08] border border-accent/15 rounded-br-sm text-sm ml-auto max-w-[88%]">
                  Yes, move the non-urgent ones to Thursday
                </div>
                <div className="p-3 px-4 rounded-xl bg-bg-raised border border-border rounded-bl-sm text-sm text-text-sec leading-relaxed max-w-[88%]">
                  <div className="flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wider text-accent mb-1">
                    <Sparkles className="w-2.5 h-2.5" /> Llamame
                  </div>
                  Done. Moved 2 check-ins to Thursday afternoon (their preferred
                  time). Added 30-min buffers between deep-work sessions. Your
                  energy score improved from 32 to 78.
                </div>
                <div className="p-3 px-4 rounded-xl bg-gradient-to-br from-accent/10 to-violet/[0.08] border border-accent/15 rounded-br-sm text-sm ml-auto max-w-[88%]">
                  Brief me on the Alex strategy call
                </div>
                <div className="p-3 px-4 rounded-xl bg-bg-raised border border-border rounded-bl-sm text-sm text-text-sec leading-relaxed max-w-[88%]">
                  <div className="flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wider text-accent mb-1">
                    <Sparkles className="w-2.5 h-2.5" /> Llamame
                  </div>
                  <strong className="text-text">Alex Chen</strong> &middot;
                  TechFlow Inc &middot; Meeting #4
                  <br />
                  Last call: Q1 roadmap discussion. Wants budget reallocation
                  follow-up. She submitted Vibe Check as &ldquo;Excited.&rdquo;
                  Suggested topic: paid ads interest she mentioned.
                </div>
              </div>
            </div>

            {/* Right info */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent mb-3">
                <Cpu className="w-3.5 h-3.5" /> AI Intelligence
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight mb-6 leading-tight">
                Your scheduling
                <br />
                co-pilot
              </h2>
              <div className="flex flex-col gap-5">
                {[
                  {
                    icon: BatteryCharging,
                    color: "text-accent",
                    title: "Energy-Aware Scheduling",
                    desc: "Maps meeting types to your peak and low energy windows automatically.",
                  },
                  {
                    icon: Shield,
                    color: "text-rose",
                    title: "Fatigue Protection",
                    desc: "Detects overbooked days and proactively suggests rescheduling.",
                  },
                  {
                    icon: BookOpen,
                    color: "text-violet",
                    title: "Client Memory",
                    desc: "Every interaction stored. Context surfaced automatically before each meeting.",
                  },
                  {
                    icon: RefreshCw,
                    color: "text-green",
                    title: "Smart Rescheduling",
                    desc: "One-click reschedule with optimal time suggestions for both parties.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3.5">
                    <div
                      className={`w-10 h-10 min-w-[40px] rounded-lg border border-border flex items-center justify-center ${item.color}`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <h4 className="text-[0.92rem] font-semibold mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-sec leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section
        id="integrations"
        className="py-24 px-8 relative z-[1] bg-bg-raised border-y border-border"
      >
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent mb-3 justify-center">
              <Plug className="w-3.5 h-3.5" /> Integrations
            </div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
              Works with your stack
            </h2>
            <p className="text-text-sec mt-2">
              One-click setup. Real-time sync. Zero configuration.
            </p>
          </div>
          <div className="grid grid-cols-6 gap-px rounded-xl overflow-hidden border border-border">
            {integrations.map((int) => (
              <div
                key={int.name}
                className="px-3 py-6 bg-bg-card text-center hover:bg-bg-card-hover transition"
              >
                <div className="flex items-center justify-center mx-auto mb-2 text-text-sec">
                  <int.icon className="w-5 h-5" />
                </div>
                <h4 className="text-[0.8rem] font-semibold mb-0.5">
                  {int.name}
                </h4>
                <p className="text-[0.68rem] text-text-muted font-mono">
                  {int.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-8 relative z-[1]">
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-13">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent mb-3 justify-center">
              <Tag className="w-3.5 h-3.5" /> Pricing
            </div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-text-sec mt-2">
              Start free. Scale when ready. No surprises.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.tier}
                className={`p-8 rounded-xl bg-bg-card border transition hover:border-border-hover relative ${
                  plan.featured
                    ? "border-accent shadow-[0_0_40px_rgba(34,211,238,0.06)]"
                    : "border-border"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-2.5 left-6 px-3 py-0.5 bg-accent text-bg rounded text-[0.72rem] font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-1.5 font-mono">
                  {plan.tier}
                </div>
                <div className="text-[2.8rem] font-extrabold tracking-tight mb-1">
                  {plan.price}
                  <span className="text-sm font-normal text-text-muted">
                    {" "}
                    {plan.unit}
                  </span>
                </div>
                <p className="text-text-sec text-[0.88rem] mb-6 pb-6 border-b border-border">
                  {plan.desc}
                </p>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[0.88rem] text-text-sec"
                    >
                      <Check className="w-4 h-4 text-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/booking"
                  className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5"
                      : "bg-bg-card text-text border border-border-hover hover:border-border-strong hover:bg-bg-card-hover"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 relative z-[1] bg-bg-raised border-y border-border">
        <div className="max-w-[1140px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent mb-3 justify-center">
            <Quote className="w-3.5 h-3.5" /> Testimonials
          </div>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
            Loved by professionals
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-12">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-xl bg-bg-card border border-border text-left"
              >
                <div className="text-amber text-sm mb-3.5 tracking-widest">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </div>
                <blockquote className="text-[0.88rem] text-text-sec leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-[0.65rem] font-bold text-white shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold">
                      {t.name}
                    </strong>
                    <span className="text-xs text-text-muted">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 relative z-[1] text-center">
        <div className="max-w-[1140px] mx-auto">
          <div className="py-18 px-12 rounded-2xl bg-gradient-to-br from-accent/[0.06] to-violet/[0.04] border border-accent/10 relative overflow-hidden">
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-50%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "400px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
              }}
            />
            <h2 className="relative z-[1] text-[2.2rem] font-extrabold tracking-tight mb-2.5">
              Ready to schedule smarter?
            </h2>
            <p className="relative z-[1] text-text-sec text-lg mb-7">
              Set up in under 2 minutes. No credit card required.
            </p>
            <div className="relative z-[1] flex gap-2.5 justify-center">
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Start free
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-bg-card text-text border border-border-hover hover:border-border-strong hover:bg-bg-card-hover transition-all"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[1] px-8 pt-12 pb-6 border-t border-border">
        <div className="max-w-[1140px] mx-auto grid grid-cols-[2fr_repeat(3,1fr)] gap-8 mb-10">
          <div>
            <div className="text-lg font-bold tracking-tight">
              Llama<span className="text-accent">me</span>
            </div>
            <p className="text-text-muted text-sm mt-2 max-w-[260px] leading-relaxed">
              Smart scheduling for professionals who value their time and their
              clients&apos; experience.
            </p>
          </div>
          {[
            {
              title: "product",
              links: ["Features", "Integrations", "Pricing", "API"],
            },
            {
              title: "company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
            { title: "legal", links: ["Privacy", "Terms", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.68rem] font-semibold uppercase tracking-[1.5px] text-text-muted mb-3.5 font-mono">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-text-sec text-[0.88rem] hover:text-text transition"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1140px] mx-auto pt-5 border-t border-border flex justify-between items-center text-xs text-text-muted">
          <span>&copy; 2026 Llamame by MantaRay Digital</span>
          <span>Built for professionals who respect their time</span>
        </div>
      </footer>
    </>
  );
}
