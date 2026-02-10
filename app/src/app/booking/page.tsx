"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  CalendarX,
  RefreshCw,
} from "lucide-react";
import { appConfig, timezones, vibeCheckMoods } from "@/lib/config";
import { useUserByHandle, useEventTypeBySlug } from "@/lib/data";
import { btn, input as inputStyles, locationLabels as locationLabelMap, currencyFormatter } from "@/lib/theme";
import { generateSlots, getAvailableDates } from "@/lib/slots";
import { getEnergyForTime, type EnergySlotInfo } from "@/lib/scheduling";
import { analyzeVibeCheck, type VibeAnalysis } from "@/lib/ai";
import RescheduleModal from "@/components/RescheduleModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <BookingPageInner />
    </Suspense>
  );
}

function BookingPageInner() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") ?? "mantaray";
  const slug = searchParams.get("slug") ?? "discovery-call";

  const user = useUserByHandle(handle);
  const eventType = useEventTypeBySlug(slug);

  const locationLabel = eventType ? (locationLabelMap[eventType.location] ?? eventType.location) : "";
  const formattedPrice = eventType?.price ? currencyFormatter.format(eventType.price) : "Free";
  const now = new Date();
  const [step, setStep] = useState<Step>(2);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState("Optimistic");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    goal: "",
    context: "",
  });
  const [vibeAnalysis, setVibeAnalysis] = useState<VibeAnalysis | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!user || !eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-text-muted">Loading...</div>
      </div>
    );
  }

  // Generate available dates for the current month
  const availableDates = useMemo(
    () =>
      getAvailableDates(
        calYear,
        calMonth,
        eventType.availability ?? [],
        eventType.dateOverrides ?? []
      ),
    [calYear, calMonth]
  );

  // Generate time slots for the selected day
  const timeSlots = useMemo(() => {
    if (!selectedDay) return [];
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    return generateSlots({
      date: dateStr,
      duration: eventType.duration,
      availability: eventType.availability ?? [],
      dateOverrides: eventType.dateOverrides ?? [],
      bufferBefore: eventType.bufferBefore,
      bufferAfter: eventType.bufferAfter,
      minNotice: eventType.minNotice,
      maxAdvance: eventType.maxAdvance,
      maxPerDay: eventType.maxPerDay,
      slotInterval: 30,
    }).filter((s) => s.available);
  }, [selectedDay, calYear, calMonth]);

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [calYear, calMonth]);

  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();
  const today = now.getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const selectedDateStr = selectedDay
    ? `${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(calYear, calMonth, selectedDay).getDay()]}, ${MONTHS[calMonth]} ${selectedDay}`
    : "";

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

      <div className="relative z-[1] w-full max-w-[1100px] rounded-2xl border border-border bg-bg-card/80 backdrop-blur-xl overflow-hidden shadow-card-glow">
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
                {s.num < step ? <Check className="w-3 h-3" /> : s.num}
              </span>
              {s.label}
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-4" />
              )}
            </div>
          ))}
        </div>

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
            {/* Host Panel */}
            <div className="p-8 border-r border-border flex flex-col">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-3xl font-bold mb-4">
                {(user.name ?? "").charAt(0)}
              </div>
              <div className="text-xl font-bold mb-1">{user.name ?? ""}</div>
              <div className="text-text-muted text-sm mb-6">
                {appConfig.domain}/{user.handle}
              </div>

              <div className="p-4 rounded-lg border border-violet bg-violet-muted/50 mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-1 h-7 rounded bg-violet" />
                  <span className="font-semibold">{eventType.title}</span>
                </div>
                <div className="pl-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-text-sec">
                    <Clock className="w-4 h-4 opacity-70" />
                    {eventType.duration} minutes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-sec">
                    <Video className="w-4 h-4 opacity-70" />
                    {locationLabel}
                  </div>
                  {eventType.price && (
                    <div className="flex items-center gap-2 text-sm text-text-sec">
                      <DollarSign className="w-4 h-4 opacity-70" />
                      {formattedPrice} consultation fee
                    </div>
                  )}
                </div>
              </div>

              <p className="text-text-sec text-sm leading-relaxed mb-6 pb-6 border-b border-border">
                {eventType.description}
              </p>

              {/* Buffers & notice info */}
              {(eventType.bufferBefore || eventType.bufferAfter || eventType.minNotice) && (
                <div className="text-xs text-text-muted space-y-1 mb-6">
                  {eventType.bufferBefore ? <div>Buffer: {eventType.bufferBefore}min before</div> : null}
                  {eventType.bufferAfter ? <div>Buffer: {eventType.bufferAfter}min after</div> : null}
                  {eventType.minNotice ? <div>Min notice: {eventType.minNotice}h</div> : null}
                </div>
              )}

              <div className="mt-auto flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-border text-sm text-text-sec">
                <Globe className="w-4 h-4" />
                <select className="bg-transparent border-none text-text text-sm outline-none cursor-pointer">
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Panel */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {MONTHS[calMonth]} {calYear}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="w-9 h-9 rounded-lg border border-border bg-transparent text-text-sec hover:border-border-hover hover:text-text transition flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-9 h-9 rounded-lg border border-border bg-transparent text-text-sec hover:border-border-hover hover:text-text transition flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_200px] gap-6">
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                      key={d}
                      className="text-[0.72rem] font-semibold text-text-muted py-2.5 uppercase tracking-wider"
                    >
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    if (day === null)
                      return <div key={`empty-${i}`} className="aspect-square" />;

                    const isAvailable = availableDates.has(day);
                    const isPast = isCurrentMonth && day < today;
                    const isToday = isCurrentMonth && day === today;
                    const isSelected = day === selectedDay;

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          if (isAvailable && !isPast) {
                            setSelectedDay(day);
                            setSelectedTime(null);
                          }
                        }}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm cursor-pointer transition relative ${
                          isSelected
                            ? "bg-gradient-to-br from-accent to-violet text-white font-semibold"
                            : isAvailable && !isPast
                              ? "text-text font-medium hover:bg-white/[0.04]"
                              : "text-text-muted opacity-30 cursor-default"
                        } ${isToday && !isSelected ? "ring-1 ring-violet" : ""}`}
                      >
                        {day}
                        {isAvailable && !isPast && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="border-l border-border pl-6">
                  <h3 className="text-sm font-semibold mb-1">Available Times</h3>
                  <div className="text-xs text-text-muted mb-4">
                    {selectedDay ? selectedDateStr : "Select a date"}
                  </div>
                  {selectedDay && timeSlots.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarX className="w-8 h-8 text-text-muted mx-auto mb-2" />
                      <p className="text-sm text-text-muted">No available times</p>
                    </div>
                  )}
                  {selectedDay && timeSlots.length > 0 && (
                    <div className="flex items-center gap-3 text-[0.65rem] text-text-muted mb-2">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green" /> Peak</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Focus</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber" /> Moderate</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose" /> Low</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto">
                    {timeSlots.map((slot) => {
                      const energy = getEnergyForTime(slot.time);
                      return (
                        <div
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition flex items-center justify-between ${
                            selectedTime === slot.time
                              ? "bg-gradient-to-r from-accent to-violet border-transparent text-white"
                              : "border-border bg-white/[0.03] text-text-sec hover:border-accent hover:text-accent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${energy.color}`} />
                            {slot.label}
                            <span className="text-[0.65rem] text-text-muted">{energy.label}</span>
                          </div>
                          {selectedTime === slot.time && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStep(eventType.requiresVibeCheck ? 3 : 4);
                              }}
                              className="px-3 py-1 rounded-full bg-white text-accent text-xs font-semibold"
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      );
                    })}
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
                <div className="flex flex-wrap gap-2.5">
                  {vibeCheckMoods.map((m) => (
                    <div
                      key={m.label}
                      onClick={() => setSelectedMood(m.label)}
                      className={`flex-1 p-3.5 rounded-lg border text-center cursor-pointer transition ${
                        selectedMood === m.label
                          ? "border-violet bg-violet-muted"
                          : "border-border bg-white/[0.03] hover:border-border-hover"
                      }`}
                    >
                      <span className="text-3xl block mb-1.5">{m.emoji}</span>
                      <span className="text-xs font-medium text-text-sec">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  What&apos;s the #1 thing you want to walk away with?{" "}
                  <span className="text-text-muted font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., A clear marketing roadmap for Q2"
                  value={bookingForm.goal}
                  onChange={(e) => setBookingForm({ ...bookingForm, goal: e.target.value })}
                  className={inputStyles.base}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Anything we should know beforehand?{" "}
                  <span className="text-text-muted font-normal text-xs">(optional)</span>
                </label>
                <textarea
                  placeholder="Context, recent changes, challenges you're facing..."
                  value={bookingForm.context}
                  onChange={(e) => setBookingForm({ ...bookingForm, context: e.target.value })}
                  className={inputStyles.textarea}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Your name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  className={inputStyles.base}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className={inputStyles.base}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={async () => {
                    const analysis = await analyzeVibeCheck({
                      mood: selectedMood,
                      goal: bookingForm.goal,
                      context: bookingForm.context,
                      clientName: bookingForm.name,
                      eventType: eventType.title,
                    });
                    setVibeAnalysis(analysis);
                    setStep(4);
                  }}
                  className={btn.primary}
                >
                  Confirm Booking <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setStep(2)} className={btn.secondary}>
                  <ArrowLeft className="w-4 h-4" /> Back
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
              {eventType.title} with {user.name}
            </p>
            <div className="inline-flex flex-col gap-3 text-left bg-bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-text-sec">
                  {selectedDateStr}, {calYear} at {selectedTime}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Video className="w-4 h-4 text-accent" />
                <span className="text-text-sec">{locationLabel} (link sent via email)</span>
              </div>
              {eventType.price && (
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <span className="text-text-sec">{formattedPrice} consultation fee</span>
                </div>
              )}
            </div>

            {/* Vibe Analysis Insights */}
            {vibeAnalysis && (
              <div className="inline-flex flex-col gap-2 text-left bg-violet-muted/50 border border-violet/15 rounded-xl p-5 mb-4 max-w-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet">
                  <Sparkles className="w-3 h-3" /> Meeting Prep Insights
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    vibeAnalysis.sentiment === "positive"
                      ? "bg-green-muted text-green"
                      : vibeAnalysis.sentiment === "negative"
                        ? "bg-rose-muted text-rose"
                        : "bg-amber-muted text-amber"
                  }`}>
                    {vibeAnalysis.sentiment}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    vibeAnalysis.urgency === "high"
                      ? "bg-rose-muted text-rose"
                      : vibeAnalysis.urgency === "medium"
                        ? "bg-amber-muted text-amber"
                        : "bg-green-muted text-green"
                  }`}>
                    {vibeAnalysis.urgency} urgency
                  </span>
                </div>
                <p className="text-sm text-text-sec">{vibeAnalysis.suggestedApproach}</p>
                <ul className="space-y-1">
                  {vibeAnalysis.talkingPoints.map((tp) => (
                    <li key={tp} className="text-xs text-text-muted flex items-center gap-1.5">
                      <span className="text-violet">&gt;</span> {tp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reschedule / Cancel options */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setRescheduleOpen(true)}
                className={btn.ghost}
              >
                <RefreshCw className="w-4 h-4" /> Reschedule
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose hover:bg-rose-muted transition">
                Cancel Booking
              </button>
            </div>

            <div>
              <Link href="/" className={btn.primary}>
                Back to home
              </Link>
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center py-4 border-t border-border text-xs text-text-muted">
          Powered by{" "}
          <Link href="/" className="text-text-sec font-semibold">
            {appConfig.name}
          </Link>{" "}
          &middot; Smart scheduling for professionals
        </div>
      </div>

      <RescheduleModal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        onReschedule={(newTime, newDate, reason) => {
          setSelectedTime(newTime);
          setRescheduleOpen(false);
        }}
        bookingId="booking_demo"
        currentDate={selectedDateStr}
        currentTime={selectedTime ?? ""}
        clientName={bookingForm.name || "Guest"}
        eventTitle={eventType.title}
      />
    </div>
  );
}
