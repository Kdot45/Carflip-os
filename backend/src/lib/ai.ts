import Anthropic from "@anthropic-ai/sdk";

/**
 * AI is advisory only, everywhere in this app. Every response carries this
 * disclaimer and the frontend must render it next to any AI output.
 */
export const AI_DISCLAIMER =
  "This is an estimate only and not a certified mechanical or legal opinion. " +
  "Always consult a professional mechanic and check title history before buying.";

const SYSTEM_PROMPT = `You are the advisory assistant inside CarFlip OS, a tool that helps people \
evaluate private-party used car deals before they buy. You are NOT a certified \
mechanic, inspector, or lawyer, and you must never imply otherwise.

Rules:
- Be concrete and practical, like an experienced flipper thinking out loud — not \
generic or hedgy.
- Base suggestions only on what the user actually gave you (listing text, OBD \
codes, symptoms, photos description). Do not invent facts about the specific car.
- Prefer flagging uncertainty over false confidence. If something needs an \
in-person inspection to confirm, say so.
- Never state or imply a certified diagnosis, an appraisal, or legal advice about \
title/lien status.`;

export type RiskLevel = "low" | "medium" | "high";

export interface TriageSuggestedLineItem {
  category: "mechanical" | "body" | "electrical" | "tires" | "other";
  title: string;
  description: string;
  severity: "safety" | "required" | "cosmetic";
  estimatedPartsCost: number;
  estimatedLaborHours: number;
  diyOk: boolean;
}

export interface TriageResult {
  riskLevel: RiskLevel;
  summary: string;
  obdExplanation: string | null;
  suggestedLineItems: TriageSuggestedLineItem[];
  disclaimer: string;
}

export interface TriageInput {
  vehicleDescription: string;
  listingNotes: string | null;
  obdCodes: string | null;
  symptoms: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  vehicleDescription: string;
  listingNotes: string | null;
  obdCodes: string | null;
}

export interface ChatResult {
  reply: string;
  disclaimer: string;
}

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export async function runTriage(input: TriageInput): Promise<TriageResult> {
  const client = getClient();
  if (!client) {
    return mockTriage(input);
  }

  const userPrompt = `Vehicle: ${input.vehicleDescription}

Listing notes from the seller (pasted by the buyer):
${input.listingNotes ?? "(none provided)"}

OBD-II trouble codes reported:
${input.obdCodes ?? "(none provided)"}

Symptoms described by the buyer:
${input.symptoms ?? "(none provided)"}

Respond with ONLY a JSON object matching this shape, no prose outside the JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "summary": string (2-4 sentences, plain language),
  "obdExplanation": string | null (plain-language explanation of any codes given, or null),
  "suggestedLineItems": [
    {
      "category": "mechanical" | "body" | "electrical" | "tires" | "other",
      "title": string,
      "description": string,
      "severity": "safety" | "required" | "cosmetic",
      "estimatedPartsCost": number,
      "estimatedLaborHours": number,
      "diyOk": boolean
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response from model");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model response did not contain JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      riskLevel: parsed.riskLevel ?? "medium",
      summary: parsed.summary ?? "",
      obdExplanation: parsed.obdExplanation ?? null,
      suggestedLineItems: Array.isArray(parsed.suggestedLineItems) ? parsed.suggestedLineItems : [],
      disclaimer: AI_DISCLAIMER,
    };
  } catch (err) {
    console.error("[ai.runTriage] falling back to mock response:", err);
    return mockTriage(input);
  }
}

export async function runChat(
  history: ChatMessage[],
  context: ChatContext
): Promise<ChatResult> {
  const client = getClient();
  if (!client) {
    return mockChat(history);
  }

  const contextPrefix = `Context for this conversation — vehicle: ${context.vehicleDescription}. ` +
    `Listing notes: ${context.listingNotes ?? "(none)"}. OBD codes: ${context.obdCodes ?? "(none)"}.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: `${SYSTEM_PROMPT}\n\n${contextPrefix}`,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return { reply, disclaimer: AI_DISCLAIMER };
  } catch (err) {
    console.error("[ai.runChat] falling back to mock response:", err);
    return mockChat(history);
  }
}

/** Used when ANTHROPIC_API_KEY isn't set, or if a live call fails, so the
 * rest of the app stays usable without an AI subscription. Clearly labeled
 * as a mock in the returned text so it's never mistaken for a real triage. */
function mockTriage(input: TriageInput): TriageResult {
  const suggestedLineItems: TriageSuggestedLineItem[] = [];

  if (input.obdCodes && input.obdCodes.trim().length > 0) {
    suggestedLineItems.push({
      category: "mechanical",
      title: "Diagnose reported OBD-II codes",
      description:
        `AI assistant is not configured (no ANTHROPIC_API_KEY), so this is a placeholder line item. ` +
        `Have a mechanic scan and diagnose: ${input.obdCodes}`,
      severity: "required",
      estimatedPartsCost: 0,
      estimatedLaborHours: 1,
      diyOk: false,
    });
  }

  return {
    riskLevel: "medium",
    summary:
      "AI assistant is not configured on this deployment (ANTHROPIC_API_KEY is unset), so this is a " +
      "placeholder response. Set ANTHROPIC_API_KEY in backend/.env to get real triage suggestions.",
    obdExplanation: input.obdCodes
      ? "AI assistant not configured — add ANTHROPIC_API_KEY to get a plain-language explanation of these codes."
      : null,
    suggestedLineItems,
    disclaimer: AI_DISCLAIMER,
  };
}

function mockChat(history: ChatMessage[]): ChatResult {
  const lastMessage = history[history.length - 1]?.content ?? "";
  return {
    reply:
      `AI assistant is not configured on this deployment (ANTHROPIC_API_KEY is unset), so this is a ` +
      `placeholder reply rather than a real answer to: "${lastMessage.slice(0, 120)}". ` +
      `Set ANTHROPIC_API_KEY in backend/.env to enable the live assistant.`,
    disclaimer: AI_DISCLAIMER,
  };
}
