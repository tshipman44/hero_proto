import { STAGES } from "./constants";
import type { GenerateRequest } from "./schema";
import { GEMINI_RESPONSE_JSON_SCHEMA } from "./schema";

export type GeminiGenerationResult = {
  rawApiResponse: unknown;
  rawModelText: string;
  rawJson: unknown;
  model: string;
};

export class GeminiApiError extends Error {
  rawApiResponse?: unknown;

  constructor(message: string, rawApiResponse?: unknown) {
    super(message);
    this.name = "GeminiApiError";
    this.rawApiResponse = rawApiResponse;
  }
}

export class GeminiJsonError extends Error {
  rawApiResponse: unknown;
  rawModelText: string;

  constructor(message: string, rawApiResponse: unknown, rawModelText: string) {
    super(message);
    this.name = "GeminiJsonError";
    this.rawApiResponse = rawApiResponse;
    this.rawModelText = rawModelText;
  }
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 75_000;

export async function generatePrototypeFromGemini(
  input: GenerateRequest,
  apiKey: string
): Promise<GeminiGenerationResult> {
  const model = normalizeModelName(process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(buildGeminiRequest(input)),
        signal: controller.signal
      }
    );

    const rawText = await response.text();
    const rawApiResponse = safeParseJson(rawText) ?? rawText;

    if (!response.ok) {
      const message =
        typeof rawApiResponse === "object" && rawApiResponse && "error" in rawApiResponse
          ? JSON.stringify((rawApiResponse as { error: unknown }).error)
          : rawText;
      throw new GeminiApiError(`Gemini API returned ${response.status}: ${message}`, rawApiResponse);
    }

    const rawModelText = extractModelText(rawApiResponse);
    if (!rawModelText) {
      throw new GeminiApiError("Gemini returned no text content.", rawApiResponse);
    }

    let rawJson: unknown;
    try {
      rawJson = parseModelJson(rawModelText);
    } catch (error) {
      throw new GeminiJsonError(
        error instanceof Error ? error.message : "Gemini returned invalid JSON.",
        rawApiResponse,
        rawModelText
      );
    }

    return {
      rawApiResponse,
      rawModelText,
      rawJson,
      model
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini generation timed out. Try again with smaller photos or mock mode.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeModelName(model: string): string {
  return model.trim().replace(/^models\//, "") || DEFAULT_GEMINI_MODEL;
}

function buildGeminiRequest(input: GenerateRequest) {
  const parts: Array<Record<string, unknown>> = [
    {
      text: buildPrompt(input.featureName)
    }
  ];

  for (const stage of STAGES) {
    const image = input.images.find((item) => item.stage === stage.name);
    if (!image) {
      continue;
    }

    parts.push({
      text: `Poster ${STAGES.indexOf(stage) + 1}: ${stage.name}. Product-design meaning: ${stage.hint}`
    });
    parts.push({
      inline_data: {
        mime_type: image.mimeType,
        data: image.data
      }
    });
  }

  return {
    contents: [
      {
        role: "user",
        parts
      }
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 8192,
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: GEMINI_RESPONSE_JSON_SCHEMA
        }
      }
    }
  };
}

function buildPrompt(featureName: string): string {
  return `
You are interpreting a workshop team's four wordless physical posters and producing a structured prototype specification.

Workshop context:
- Participants created four posters that visually define a feature using stages from Joseph Campbell's Hero's Journey.
- The posters contain no words. Interpret visual composition, objects, symbols, relationships, emotion, motion, contrast, and sequence.
- The only text the team supplied is the short feature name: "${featureName}".
- Do not ask for target user, problem statement, market, or extra explanatory text.

Required stages and product-design meanings:
1. Call to Adventure = user trigger, unmet need, or problem.
2. Crossing the Threshold = user enters the feature or begins the workflow.
3. Seizing the Sword = user completes the key value-producing action.
4. Hero's Reward = user receives the value, outcome, confidence, approval, insight, or completion.

Important interpretation rule:
- Treat clip art, icons, marker drawings, and symbols as metaphorical evidence about the user journey.
- Do not assume every object in the poster should become a literal UI element.
- Examples: a lightbulb may mean insight, a cog may mean process complexity, a bridge may mean transition, and a sword may mean the core action or breakthrough.

Your task:
- Infer a feature concept from the four images.
- Make assumptions and uncertainty visible.
- Generate exactly four prototype screens, one for each required stage in the exact order above.
- Use realistic generated UI copy for headings, supporting text, button labels, cards, labels, empty states, confirmations, and outcomes.
- Keep the visual language appropriate for a modern B2B SaaS marketing/product prototype.
- The app renderer, not you, turns JSON into UI. Do not generate React, HTML, Markdown, or explanations.

Return only valid JSON matching the provided schema.`;
}

function safeParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractModelText(rawApiResponse: unknown): string {
  if (!rawApiResponse || typeof rawApiResponse !== "object") {
    return "";
  }

  const candidates = (rawApiResponse as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return "";
  }

  const firstCandidate = candidates[0] as { content?: { parts?: Array<{ text?: string }> } };
  const parts = firstCandidate.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts.map((part) => part.text || "").join("").trim();
}

function parseModelJson(rawModelText: string): unknown {
  const direct = safeParseJson(rawModelText);
  if (direct) {
    return direct;
  }

  const withoutFences = rawModelText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const unfenced = safeParseJson(withoutFences);
  if (unfenced) {
    return unfenced;
  }

  const start = rawModelText.indexOf("{");
  const end = rawModelText.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const sliced = safeParseJson(rawModelText.slice(start, end + 1));
    if (sliced) {
      return sliced;
    }
  }

  throw new Error("Gemini returned text that could not be parsed as JSON.");
}
