"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  DollarSign,
  Globe,
  Check,
  Sparkles,
} from "lucide-react";

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

const moods = [
  { emoji: "\u{1F680}", label: "Excited" },
  { emoji: "\u{1F60A}", label: "Optimistic" },
  { emoji: "\u{1F914}", label: "Curious" },
  { emoji: "\u{1F624}", label: "Stressed" },
  { emoji: "\u{1F610}", label: "Neutral" },
];

const calendarDays = [
  // Week 1: empty slots then 1
  { day: 0 },
  { day: 0 },
  { day: 0 },
  { day: 0 },
  { day: 0 },
  { day: 0 },
  { day: 1, disabled: true },
  // Week 2
  { day: 2, disabled: true },
  { day: 3, disabled: true },
  { day: 4, disabled: true },
  { day: 5, disabled: true },
  { day: 6, available: true, today: true },
  { day: 7 },
  { day: 8 },
  // Week 3
  { day: 9, available: true },
  { day: 10, available: true },
  { day: 11, available: true },
  { day: 12, available: true },
  { day: 13, available: true },
  { day: 14 },
  { day: 15 },
  // Week 4
  { day: 16, available: true },
  { day: 17, available: true },
  { day: 18, available: true },
  { day: 19, available: true },
  { day: 20, available: true },
  { day: 21 },
  { day: 22 },
  // Week 5
  { day: 23, available: true },
  { day: 24, available: true },
  { day: 25, available: true },
  { day: 26, available: true },
  { day: 27, available: true },
  { day: 28 },
  { day: 0 },
];

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  const [step, setStep] = useState<Step>(2);
  const [selectedDay, setSelectedDay] = useState(10);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedMood, setSelectedMood] = useState("Optimistic");

  const steps = [
    { num: 1, label: "Event Type" },
    { num: 2, label: "Date & Time" },
    { num: 3, label: "Vibe Check" },
    { num: 4, label: "Confirm" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-10 relative">
      {/* Background glows */}
      <div
        className="fixed top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-[1] w-full max-w-[1100px] rounded-2xl border border-border bg-bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(34,211,238,0.04)]">
        {/* Steps */}
        <div className="flex px-8 py-5 border-b border-border gap-0">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`flex-1 flex items-center gap-2.5 text-sm ${
                s.num < step
                  ? "text-text-sec"
                  : s.num === step
                    ? "text-text"
                    : "text-text-muted"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  s.num < step
                    ? "bg-green-muted border border-green/30 text-green"
                    : s.num === step
                      ? "bg-gradient-to-br from-accent to-violet text-white"
                      : "border border-border text-text-muted"
                }`}
              >
                {s.num < step ? (
                  <Check className="w-3 h-3" />
                ) : (
                  s.num
                )}
              </span>
              {s.label}
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-4" />
              )}
            </div>
          ))}
        </div>

        {step === 2 && (
          <div className="grid grid-cols-[320px_1fr]">
            {/* Host Panel */}
            <div className="p-8 border-r border-border flex flex-col">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-3xl font-bold mb-4">
                M
              </div>
              <div className="text-xl font-bold mb-1">MantaRay Digital</div>
              <div className="text-text-muted text-sm mb-6">
                llamame.io/mantaray
              </div>

              <div className="p-4 rounded-lg border border-violet bg-violet-muted/50 mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-1 h-7 rounded bg-violet" />
                  <span className="font-semibold">Strategy Session</span>
                </div>
                <div className="pl-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-text-sec">
                    <Clock className="w-4 h-4 opacity-70" />
                    60 minutes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-sec">
                    <Video className="w-4 h-4 opacity-70" />
                    Google Meet
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-sec">
                    <DollarSign className="w-4 h-4 opacity-70" />
                    $150 consultation fee
                  </div>
                </div>
              </div>

              <p className="text-text-sec text-sm leading-relaxed mb-6 pb-6 border-b border-border">
                A deep-dive strategy session to discuss your digital marketing
                goals, current challenges, and create an actionable roadmap.
                Come prepared with your top 3 priorities.
              </p>

              <div className="mt-auto flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-border text-sm text-text-sec">
                <Globe className="w-4 h-4" />
                <select className="bg-transparent border-none text-text text-sm outline-none cursor-pointer">
                  <option>America/New_York (EST)</option>
                  <option>America/Chicago (CST)</option>
                  <option>America/Denver (MST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                  <option>Europe/Madrid (CET)</option>
                </select>
              </div>
            </div>

            {/* Calendar Panel */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">February 2026</h2>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-lg border border-border bg-transparent text-text-sec hover:border-border-hover hover:text-text transition flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-lg border border-border bg-transparent text-text-sec hover:border-border-hover hover:text-text transition flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_200px] gap-6">
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-[0.72rem] font-semibold text-text-muted py-2.5 uppercase tracking-wider"
                      >
                        {d}
                      </div>
                    )
                  )}
                  {calendarDays.map((d, i) => {
                    if (d.day === 0)
                      return <div key={`empty-${i}`} className="aspect-square" />;
                    const isSelected = d.day === selectedDay;
                    return (
                      <div
                        key={d.day}
                        onClick={() => d.available && setSelectedDay(d.day)}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm cursor-pointer transition relative ${
                          isSelected
                            ? "bg-gradient-to-br from-accent to-violet text-white font-semibold"
                            : d.available
                              ? "text-text font-medium hover:bg-white/[0.04]"
                              : d.disabled
                                ? "text-text-muted opacity-30 cursor-default"
                                : "text-text-muted cursor-default"
                        } ${d.today && !isSelected ? "ring-1 ring-violet" : ""}`}
                      >
                        {d.day}
                        {d.available && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="border-l border-border pl-6">
                  <h3 className="text-sm font-semibold mb-1">
                    Available Times
                  </h3>
                  <div className="text-xs text-text-muted mb-4">
                    Tuesday, Feb {selectedDay}
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto">
                    {timeSlots.map((t) => (
                      <div
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition flex items-center justify-between ${
                          selectedTime === t
                            ? "bg-gradient-to-r from-accent to-violet border-transparent text-white"
                            : "border-border bg-white/[0.03] text-text-sec hover:border-accent hover:text-accent"
                        }`}
                      >
                        {t}
                        {selectedTime === t && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStep(3);
                            }}
                            className="px-3 py-1 rounded-full bg-white text-accent text-xs font-semibold"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold">Quick Vibe Check</h2>
            </div>
            <p className="text-text-sec text-sm mb-8">
              Help us make this meeting amazing. This takes 30 seconds.
            </p>

            <div className="flex flex-col gap-6 max-w-[600px]">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  How are you feeling about this meeting?
                </label>
                <div className="flex gap-2.5">
                  {moods.map((m) => (
                    <div
                      key={m.label}
                      onClick={() => setSelectedMood(m.label)}
                      className={`flex-1 p-3.5 rounded-lg border text-center cursor-pointer transition ${
                        selectedMood === m.label
                          ? "border-violet bg-violet-muted"
                          : "border-border bg-white/[0.03] hover:border-border-hover"
                      }`}
                    >
                      <span className="text-3xl block mb-1.5">
                        {m.emoji}
                      </span>
                      <span className="text-xs font-medium text-text-sec">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  What&apos;s the #1 thing you want to walk away with?{" "}
                  <span className="text-text-muted font-normal text-xs">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., A clear marketing roadmap for Q2"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-violet transition placeholder:text-text-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Anything we should know beforehand?{" "}
                  <span className="text-text-muted font-normal text-xs">
                    (optional)
                  </span>
                </label>
                <textarea
                  placeholder="Context, recent changes, challenges you're facing..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-violet transition placeholder:text-text-muted min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-violet transition placeholder:text-text-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white/[0.03] text-text text-sm outline-none focus:border-violet transition placeholder:text-text-muted"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm bg-accent text-bg shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all"
                >
                  Confirm Booking
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm bg-white/[0.03] text-text border border-border hover:bg-bg-card-hover transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-muted border border-green/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You&apos;re booked!</h2>
            <p className="text-text-sec mb-8">
              Strategy Session with MantaRay Digital
            </p>
            <div className="inline-flex flex-col gap-3 text-left bg-bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-text-sec">
                  Tuesday, February {selectedDay}, 2026 at {selectedTime}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Video className="w-4 h-4 text-accent" />
                <span className="text-text-sec">Google Meet (link sent via email)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="text-text-sec">$150 consultation fee</span>
              </div>
            </div>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-bg hover:-translate-y-0.5 transition-all"
              >
                Back to home
              </Link>
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center py-4 border-t border-border text-xs text-text-muted">
          Powered by{" "}
          <Link href="/" className="text-text-sec font-semibold">
            Llamame
          </Link>{" "}
          &middot; Smart scheduling for professionals
        </div>
      </div>
    </div>
  );
}
