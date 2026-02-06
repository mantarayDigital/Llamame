/**
 * AI features powered by OpenAI.
 *
 * Provides:
 * - Meeting briefs (pre-meeting preparation notes)
 * - Client intelligence (relationship insights)
 * - Smart rescheduling suggestions
 * - Vibe analysis
 */

// ─── Types ───────────────────────────────────────────────────────

export interface MeetingBriefInput {
  clientName: string;
  clientEmail: string;
  eventType: string;
  meetingNumber: number;
  previousNotes?: string;
  lastVibeCheck?: string;
  clientTags?: string[];
  upcomingTopics?: string[];
}

export interface MeetingBrief {
  summary: string;
  suggestedTopics: string[];
  clientInsight: string;
  preparationTips: string[];
}

export interface ClientIntelligenceInput {
  clientName: string;
  totalMeetings: number;
  totalRevenue: number;
  noShowCount: number;
  recentVibes: string[];
  meetingHistory: { date: string; type: string; outcome: string }[];
}

export interface ClientIntelligence {
  relationshipScore: number;
  riskLevel: "low" | "medium" | "high";
  insights: string[];
  recommendations: string[];
  predictedNextAction: string;
}

export interface RescheduleInput {
  originalTime: string;
  reason?: string;
  clientPreferences?: string;
  availableSlots: string[];
  energyProfile?: { peakStart: string; peakEnd: string };
}

export interface RescheduleSuggestion {
  suggestedSlots: { time: string; reason: string }[];
  message: string;
}

export interface VibeCheckInput {
  mood: string;
  goal?: string;
  context?: string;
  clientName?: string;
  eventType?: string;
}

export interface VibeAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high";
  suggestedApproach: string;
  talkingPoints: string[];
}

// ─── Configuration ───────────────────────────────────────────────

/** Whether an OpenAI API key is configured */
export const isAIConfigured: boolean = Boolean(process.env.OPENAI_API_KEY);

const MODEL = "gpt-4o-mini";

// ─── Lazy OpenAI client ──────────────────────────────────────────

type OpenAIClient = {
  chat: {
    completions: {
      create: (params: Record<string, unknown>) => Promise<{
        choices: { message: { content: string | null } }[];
      }>;
    };
  };
};

let _openaiClient: OpenAIClient | null = null;

/**
 * Lazily initialize and return the OpenAI client.
 * Returns null if no API key is configured.
 */
export async function getOpenAIClient(): Promise<OpenAIClient | null> {
  if (!isAIConfigured) return null;
  if (_openaiClient) return _openaiClient;

  try {
    const { default: OpenAI } = await import("openai");
    _openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) as unknown as OpenAIClient;
    return _openaiClient;
  } catch {
    console.warn("[ai] Failed to initialize OpenAI client");
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

async function chatJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T,
): Promise<T> {
  try {
    const client = await getOpenAIClient();
    if (!client) return fallback;

    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn("[ai] OpenAI call failed, returning fallback:", error);
    return fallback;
  }
}

// ─── Demo / fallback data ────────────────────────────────────────

function demoBrief(input: MeetingBriefInput): MeetingBrief {
  return {
    summary: `This is meeting #${input.meetingNumber} with ${input.clientName}. They booked a ${input.eventType}. ${input.previousNotes ? "Previous notes indicate ongoing collaboration." : "This appears to be a new engagement."}`,
    suggestedTopics: [
      `Review progress since last ${input.eventType}`,
      "Discuss upcoming goals and priorities",
      "Identify any blockers or concerns",
      ...(input.upcomingTopics ?? []),
    ],
    clientInsight: input.lastVibeCheck
      ? `Client's last vibe check was "${input.lastVibeCheck}". Tailor your approach accordingly.`
      : `${input.clientName} has had ${input.meetingNumber} meeting(s) so far. Build on the established rapport.`,
    preparationTips: [
      "Review any shared documents or previous action items",
      "Prepare 2-3 open-ended questions to encourage dialogue",
      "Have your calendar ready for scheduling follow-ups",
    ],
  };
}

function demoIntelligence(input: ClientIntelligenceInput): ClientIntelligence {
  const noShowRate =
    input.totalMeetings > 0 ? input.noShowCount / input.totalMeetings : 0;
  const avgRevenue =
    input.totalMeetings > 0 ? input.totalRevenue / input.totalMeetings : 0;

  let riskLevel: "low" | "medium" | "high" = "low";
  if (noShowRate > 0.3) riskLevel = "high";
  else if (noShowRate > 0.1) riskLevel = "medium";

  const score = Math.min(
    100,
    Math.round(
      50 +
        input.totalMeetings * 3 +
        (input.totalRevenue > 0 ? 15 : 0) -
        input.noShowCount * 10,
    ),
  );

  return {
    relationshipScore: Math.max(0, score),
    riskLevel,
    insights: [
      `${input.clientName} has attended ${input.totalMeetings} meeting(s) generating $${input.totalRevenue} in revenue.`,
      noShowRate > 0
        ? `No-show rate of ${Math.round(noShowRate * 100)}% — consider sending additional reminders.`
        : "Perfect attendance record — a reliable client.",
      avgRevenue > 100
        ? "High-value client — prioritize responsiveness."
        : "Growing relationship — look for upsell opportunities.",
    ],
    recommendations: [
      "Send a personalized follow-up after each meeting",
      input.totalMeetings > 5
        ? "Consider offering a loyalty discount or package deal"
        : "Focus on building trust through consistent delivery",
      "Schedule regular check-ins to maintain engagement",
    ],
    predictedNextAction:
      input.totalMeetings > 3
        ? "Likely to book another session within 2 weeks"
        : "May need a nudge — send a follow-up within 5 days",
  };
}

function demoReschedule(input: RescheduleInput): RescheduleSuggestion {
  const slots = input.availableSlots.slice(0, 3).map((time, idx) => ({
    time,
    reason:
      idx === 0
        ? "Earliest available slot"
        : idx === 1
          ? "Within your peak energy hours"
          : "Good spacing from other meetings",
  }));

  return {
    suggestedSlots: slots.length > 0 ? slots : [],
    message: input.reason
      ? `Based on the reschedule reason "${input.reason}", we suggest the following times.`
      : "Here are the best available times for rescheduling.",
  };
}

function demoVibeAnalysis(input: VibeCheckInput): VibeAnalysis {
  const positiveKeywords = ["excited", "happy", "great", "optimistic"];
  const negativeKeywords = ["stressed", "anxious", "frustrated", "worried"];

  const moodLower = input.mood.toLowerCase();
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveKeywords.some((kw) => moodLower.includes(kw)))
    sentiment = "positive";
  if (negativeKeywords.some((kw) => moodLower.includes(kw)))
    sentiment = "negative";

  let urgency: "low" | "medium" | "high" = "medium";
  if (sentiment === "negative") urgency = "high";
  if (sentiment === "positive") urgency = "low";

  return {
    sentiment,
    urgency,
    suggestedApproach:
      sentiment === "positive"
        ? "Build on the positive energy — move quickly to action items."
        : sentiment === "negative"
          ? "Start with empathy. Acknowledge their state before diving into business."
          : "Keep a balanced, professional tone. Read the room as the meeting progresses.",
    talkingPoints: [
      input.goal
        ? `Address their primary goal: ${input.goal}`
        : "Ask what they hope to accomplish today",
      "Check in on any outstanding action items",
      input.context
        ? `Be mindful of context: ${input.context}`
        : "Ask about any recent changes or updates",
      "End with clear next steps and a timeline",
    ],
  };
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Generate a pre-meeting preparation brief for an upcoming meeting.
 */
export async function generateMeetingBrief(
  input: MeetingBriefInput,
): Promise<MeetingBrief> {
  const fallback = demoBrief(input);

  const systemPrompt = `You are an AI assistant for a scheduling platform called Llamame. Generate concise, actionable meeting preparation briefs. Respond with a JSON object containing: "summary" (string), "suggestedTopics" (string[]), "clientInsight" (string), "preparationTips" (string[]).`;

  const userPrompt = `Generate a meeting brief for:
- Client: ${input.clientName} (${input.clientEmail})
- Event type: ${input.eventType}
- Meeting number: ${input.meetingNumber}
${input.previousNotes ? `- Previous notes: ${input.previousNotes}` : ""}
${input.lastVibeCheck ? `- Last vibe check: ${input.lastVibeCheck}` : ""}
${input.clientTags?.length ? `- Client tags: ${input.clientTags.join(", ")}` : ""}
${input.upcomingTopics?.length ? `- Upcoming topics: ${input.upcomingTopics.join(", ")}` : ""}`;

  return chatJSON<MeetingBrief>(systemPrompt, userPrompt, fallback);
}

/**
 * Analyze client data and return relationship insights and recommendations.
 */
export async function generateClientIntelligence(
  input: ClientIntelligenceInput,
): Promise<ClientIntelligence> {
  const fallback = demoIntelligence(input);

  const systemPrompt = `You are an AI assistant for a scheduling platform called Llamame. Analyze client data and provide relationship intelligence. Respond with a JSON object containing: "relationshipScore" (number 0-100), "riskLevel" ("low"|"medium"|"high"), "insights" (string[]), "recommendations" (string[]), "predictedNextAction" (string).`;

  const history = input.meetingHistory
    .map((m) => `${m.date}: ${m.type} — ${m.outcome}`)
    .join("\n  ");

  const userPrompt = `Analyze this client relationship:
- Client: ${input.clientName}
- Total meetings: ${input.totalMeetings}
- Total revenue: $${input.totalRevenue}
- No-shows: ${input.noShowCount}
- Recent vibes: ${input.recentVibes.join(", ") || "none recorded"}
- Meeting history:
  ${history || "No detailed history available"}`;

  return chatJSON<ClientIntelligence>(systemPrompt, userPrompt, fallback);
}

/**
 * Suggest optimal reschedule times based on energy profile and preferences.
 */
export async function suggestReschedule(
  input: RescheduleInput,
): Promise<RescheduleSuggestion> {
  const fallback = demoReschedule(input);

  const systemPrompt = `You are an AI assistant for a scheduling platform called Llamame. Suggest optimal reschedule times considering the user's energy profile, client preferences, and available slots. Respond with a JSON object containing: "suggestedSlots" (array of { "time": string, "reason": string }), "message" (string).`;

  const userPrompt = `Suggest reschedule times:
- Original time: ${input.originalTime}
${input.reason ? `- Reason: ${input.reason}` : ""}
${input.clientPreferences ? `- Client preferences: ${input.clientPreferences}` : ""}
- Available slots: ${input.availableSlots.join(", ")}
${input.energyProfile ? `- User peak energy: ${input.energyProfile.peakStart} to ${input.energyProfile.peakEnd}` : ""}`;

  return chatJSON<RescheduleSuggestion>(systemPrompt, userPrompt, fallback);
}

/**
 * Analyze a vibe check submission to determine sentiment and suggest approach.
 */
export async function analyzeVibeCheck(
  input: VibeCheckInput,
): Promise<VibeAnalysis> {
  const fallback = demoVibeAnalysis(input);

  const systemPrompt = `You are an AI assistant for a scheduling platform called Llamame. Analyze a client's pre-meeting "vibe check" and suggest the best approach for the meeting. Respond with a JSON object containing: "sentiment" ("positive"|"neutral"|"negative"), "urgency" ("low"|"medium"|"high"), "suggestedApproach" (string), "talkingPoints" (string[]).`;

  const userPrompt = `Analyze this vibe check:
- Mood: ${input.mood}
${input.goal ? `- Goal: ${input.goal}` : ""}
${input.context ? `- Context: ${input.context}` : ""}
${input.clientName ? `- Client: ${input.clientName}` : ""}
${input.eventType ? `- Event type: ${input.eventType}` : ""}`;

  return chatJSON<VibeAnalysis>(systemPrompt, userPrompt, fallback);
}
