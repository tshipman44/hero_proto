import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createMockPrototypeSpec } from "@/lib/mockData";
import {
  GeminiApiError,
  GeminiJsonError,
  generatePrototypeFromGemini,
  type GeminiGenerationResult
} from "@/lib/gemini";
import {
  GenerateRequestSchema,
  repairPrototypeSpecInput,
  validatePrototypeSpec,
  type GenerationApiResult
} from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();
  let featureName = "Workshop Feature";

  try {
    const json = await request.json();
    const parsedRequest = GenerateRequestSchema.safeParse(json);

    if (!parsedRequest.success) {
      const fallback = createMockPrototypeSpec(featureName);
      const result: GenerationApiResult = {
        ok: false,
        mode: "fallback",
        data: fallback,
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        durationMs: Date.now() - startedAt,
        errorType: "validation_error",
        error: "The generation request was incomplete or included images that were still too large.",
        validationErrors: parsedRequest.error.issues.map((issue) => issue.message)
      };
      return NextResponse.json(result, { status: 400 });
    }

    const input = parsedRequest.data;
    featureName = input.featureName;
    const fallback = createMockPrototypeSpec(featureName);
    const mockMode = input.mock || process.env.MOCK_GEMINI === "true";
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (mockMode) {
      const result: GenerationApiResult = {
        ok: true,
        mode: "mock",
        data: fallback,
        model: "mock",
        durationMs: Date.now() - startedAt,
        rawJson: fallback
      };
      return NextResponse.json(result);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result: GenerationApiResult = {
        ok: false,
        mode: "fallback",
        data: fallback,
        model,
        durationMs: Date.now() - startedAt,
        errorType: "missing_api_key",
        error: "Set GEMINI_API_KEY in your environment, or set MOCK_GEMINI=true for development.",
        retryable: false,
        rawJson: fallback
      };
      return NextResponse.json(result);
    }

    let generation: GeminiGenerationResult | null = null;

    try {
      generation = await generatePrototypeFromGemini(input, apiKey);
      const repairedJson = repairPrototypeSpecInput(generation.rawJson, input.featureName);
      const spec = validatePrototypeSpec(repairedJson);
      const result: GenerationApiResult = {
        ok: true,
        mode: "live",
        data: spec,
        model: generation.model,
        durationMs: Date.now() - startedAt,
        rawApiResponse: generation.rawApiResponse,
        rawModelText: generation.rawModelText,
        rawJson: generation.rawJson
      };
      return NextResponse.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini generation failed.";
      const isBadJson =
        error instanceof GeminiJsonError ||
        error instanceof ZodError ||
        message.includes("JSON") ||
        message.includes("Stage interpretation") ||
        message.includes("Prototype screen");
      const isCredentialError =
        error instanceof GeminiApiError && (error.statusCode === 401 || error.statusCode === 403);
      const friendlyCredentialError = message.includes("reported as leaked")
        ? "Gemini rejected the API key because Google has marked it as leaked. Create a new key in Google AI Studio and update GEMINI_API_KEY. A sample fallback is shown."
        : `Gemini rejected the API key or project permissions. Check GEMINI_API_KEY and the selected model. A sample fallback is shown. ${message}`;

      const result: GenerationApiResult = {
        ok: false,
        mode: "fallback",
        data: fallback,
        model,
        durationMs: Date.now() - startedAt,
        errorType: isBadJson ? "bad_json" : "api_failure",
        error: isBadJson
          ? `Gemini returned an invalid prototype spec. A sample fallback is shown. ${message}`
          : isCredentialError
            ? friendlyCredentialError
            : `Gemini could not complete this request. A sample fallback is shown. ${message}`,
        retryable: !isBadJson && !isCredentialError,
        rawApiResponse:
          error instanceof GeminiJsonError || error instanceof GeminiApiError
            ? error.rawApiResponse
            : generation?.rawApiResponse,
        rawModelText:
          error instanceof GeminiJsonError ? error.rawModelText : generation?.rawModelText,
        rawJson: generation?.rawJson || fallback,
        validationErrors:
          error instanceof ZodError ? error.issues.map((issue) => issue.message) : undefined
      };
      return NextResponse.json(result);
    }
  } catch (error) {
    const fallback = createMockPrototypeSpec(featureName);
    const result: GenerationApiResult = {
      ok: false,
      mode: "fallback",
      data: fallback,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      durationMs: Date.now() - startedAt,
      errorType: "api_failure",
      error: error instanceof Error ? error.message : "The request could not be processed.",
      retryable: true,
      rawJson: fallback
    };
    return NextResponse.json(result, { status: 500 });
  }
}
