import { z } from "zod";
import { STAGE_NAMES } from "./constants";

export const StageNameSchema = z.enum(STAGE_NAMES);

const layoutTypes = [
  "hero-dashboard",
  "guided-workflow",
  "action-center",
  "outcome-summary"
] as const;

const componentTypes = [
  "hero",
  "panel",
  "metric",
  "steps",
  "list",
  "form",
  "insight",
  "confirmation",
  "timeline"
] as const;

const defaultLayoutTypes = [...layoutTypes];
const allowedLayoutTypes = new Set<string>(layoutTypes);
const allowedComponentTypes = new Set<string>(componentTypes);

export const PrototypeComponentSchema = z
  .object({
    type: z.enum(componentTypes),
    title: z.string().max(120),
    body: z.string().max(600),
    items: z.array(z.string().max(160)).max(6),
    label: z.string().max(80),
    value: z.string().max(120)
  })
  .strict();

export const PrototypeScreenSchema = z
  .object({
    id: z.string().min(1).max(80),
    stage: StageNameSchema,
    title: z.string().min(1).max(120),
    subtitle: z.string().min(1).max(260),
    userState: z.string().min(1).max(160),
    primaryActionLabel: z.string().min(1).max(80),
    layoutType: z.enum(layoutTypes),
    components: z.array(PrototypeComponentSchema).min(2).max(6),
    transitionToNext: z.string().min(1).max(220)
  })
  .strict();

export const StageInterpretationSchema = z
  .object({
    stage: StageNameSchema,
    imageDescription: z.string().min(1).max(900),
    inferredMeaning: z.string().min(1).max(700),
    evidence: z.array(z.string().min(1).max(180)).min(1).max(6),
    assumptions: z.array(z.string().min(1).max(180)).max(6),
    uncertainty: z.string().min(1).max(260)
  })
  .strict();

export const PrototypeSpecSchema = z
  .object({
    featureName: z.string().min(1).max(80),
    overallConcept: z.string().min(1).max(900),
    inferredUser: z.string().min(1).max(260),
    inferredUserGoal: z.string().min(1).max(260),
    interpretationSummary: z.string().min(1).max(900),
    stageInterpretations: z.array(StageInterpretationSchema).length(4),
    prototype: z
      .object({
        screens: z.array(PrototypeScreenSchema).length(4)
      })
      .strict(),
    globalAssumptions: z.array(z.string().min(1).max(220)).max(8),
    missingInformation: z.array(z.string().min(1).max(220)).max(8),
    confidence: z.number().min(0).max(1)
  })
  .strict();

export type PrototypeComponent = z.infer<typeof PrototypeComponentSchema>;
export type PrototypeScreen = z.infer<typeof PrototypeScreenSchema>;
export type StageInterpretation = z.infer<typeof StageInterpretationSchema>;
export type PrototypeSpec = z.infer<typeof PrototypeSpecSchema>;

export const ImagePayloadSchema = z
  .object({
    stage: StageNameSchema,
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    data: z.string().min(200).max(900_000),
    fileName: z.string().max(180).optional()
  })
  .strict();

export const GenerateRequestSchema = z
  .object({
    featureName: z.string().trim().min(1).max(80),
    images: z.array(ImagePayloadSchema).length(4),
    mock: z.boolean().optional()
  })
  .strict();

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export type GenerationApiResult = {
  ok: boolean;
  mode: "live" | "mock" | "fallback";
  data: PrototypeSpec;
  model: string;
  durationMs: number;
  errorType?: "missing_api_key" | "api_failure" | "bad_json" | "validation_error";
  error?: string;
  retryable?: boolean;
  rawApiResponse?: unknown;
  rawModelText?: string;
  rawJson?: unknown;
  validationErrors?: string[];
};

export function validatePrototypeSpec(input: unknown): PrototypeSpec {
  const parsed = PrototypeSpecSchema.parse(input);

  const stageInterpretationStages = parsed.stageInterpretations.map((item) => item.stage);
  const screenStages = parsed.prototype.screens.map((screen) => screen.stage);

  for (let index = 0; index < STAGE_NAMES.length; index += 1) {
    const expected = STAGE_NAMES[index];

    if (stageInterpretationStages[index] !== expected) {
      throw new Error(`Stage interpretation ${index + 1} must be ${expected}.`);
    }

    if (screenStages[index] !== expected) {
      throw new Error(`Prototype screen ${index + 1} must be ${expected}.`);
    }
  }

  return parsed;
}

export function repairPrototypeSpecInput(input: unknown, fallbackFeatureName: string): unknown {
  if (!isRecord(input)) {
    return input;
  }

  const stageInterpretations = Array.isArray(input.stageInterpretations)
    ? input.stageInterpretations.slice(0, 4)
    : [];
  const prototype = isRecord(input.prototype) ? input.prototype : {};
  const screens = Array.isArray(prototype.screens) ? prototype.screens.slice(0, 4) : [];

  return {
    featureName: asString(input.featureName, fallbackFeatureName),
    overallConcept: asString(input.overallConcept, `${fallbackFeatureName} is inferred from the four poster stages.`),
    inferredUser: asString(input.inferredUser, "A user inferred from the visual journey."),
    inferredUserGoal: asString(input.inferredUserGoal, "Complete the journey represented by the posters."),
    interpretationSummary: asString(
      input.interpretationSummary,
      "The posters are interpreted as a sequence from need to action to outcome."
    ),
    stageInterpretations: STAGE_NAMES.map((stage, index) =>
      repairStageInterpretation(stageInterpretations[index], stage)
    ),
    prototype: {
      screens: STAGE_NAMES.map((stage, index) => repairScreen(screens[index], stage, index))
    },
    globalAssumptions: asStringArray(input.globalAssumptions).slice(0, 8),
    missingInformation: asStringArray(input.missingInformation).slice(0, 8),
    confidence: asConfidence(input.confidence)
  };
}

function repairStageInterpretation(input: unknown, stage: (typeof STAGE_NAMES)[number]) {
  const record = isRecord(input) ? input : {};

  return {
    stage,
    imageDescription: asString(record.imageDescription, "The poster has visible metaphorical cues for this stage."),
    inferredMeaning: asString(
      record.inferredMeaning,
      `The ${stage} poster suggests a product moment in the user journey.`
    ),
    evidence: asStringArray(record.evidence, ["Visual symbols and composition suggest this stage's meaning."]).slice(
      0,
      6
    ),
    assumptions: asStringArray(record.assumptions).slice(0, 6),
    uncertainty: asString(record.uncertainty, "Some meaning remains uncertain because the poster is wordless.")
  };
}

function repairScreen(input: unknown, stage: (typeof STAGE_NAMES)[number], index: number) {
  const record = isRecord(input) ? input : {};
  const components = Array.isArray(record.components) ? record.components.slice(0, 5) : [];
  const paddedComponents = components.length >= 2 ? components : [...components, ...Array(2 - components.length).fill(null)];

  return {
    id: asString(record.id, stage.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
    stage,
    title: asString(record.title, stage),
    subtitle: asString(record.subtitle, "A focused prototype screen generated from the poster interpretation."),
    userState: asString(record.userState, "The user is moving through this stage of the journey."),
    primaryActionLabel: asString(record.primaryActionLabel, index === 3 ? "Replay the prototype" : "Continue"),
    layoutType: allowedLayoutTypes.has(String(record.layoutType))
      ? String(record.layoutType)
      : defaultLayoutTypes[index],
    components: paddedComponents.map((component, componentIndex) =>
      repairComponent(component, componentIndex)
    ),
    transitionToNext: asString(record.transitionToNext, defaultTransition(index))
  };
}

function repairComponent(input: unknown, index: number) {
  const record = isRecord(input) ? input : {};

  return {
    type: allowedComponentTypes.has(String(record.type)) ? String(record.type) : index === 0 ? "hero" : "panel",
    title: asString(record.title, index === 0 ? "Key moment" : "Supporting detail"),
    body: asString(record.body, "This element supports the generated prototype screen."),
    items: asStringArray(record.items).slice(0, 6),
    label: asString(record.label, "Status"),
    value: asString(record.value, "Ready")
  };
}

function defaultTransition(index: number): string {
  if (index >= STAGE_NAMES.length - 1) {
    return "The journey can be replayed from the beginning for workshop discussion.";
  }

  return `The user moves from ${STAGE_NAMES[index]} to ${STAGE_NAMES[index + 1]}.`;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const strings = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim())
  );
  return strings.length ? strings.map((item) => item.trim()) : fallback;
}

function asConfidence(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return 0.6;
  }

  return Math.min(1, Math.max(0, numeric));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const stringSchema = (description: string, maxLength?: number) => ({
  type: "string",
  description,
  ...(maxLength ? { maxLength } : {})
});

const stringArraySchema = (description: string, maxItems: number) => ({
  type: "array",
  description,
  maxItems,
  items: {
    type: "string"
  }
});

export const GEMINI_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    featureName: stringSchema("The short feature name supplied by the workshop team.", 80),
    overallConcept: stringSchema("The inferred product feature concept from all four posters.", 900),
    inferredUser: stringSchema("The user or buyer persona inferred from visual evidence only.", 260),
    inferredUserGoal: stringSchema("The practical goal the inferred user appears to be pursuing.", 260),
    interpretationSummary: stringSchema(
      "A concise bridge explaining how the four visual posters combine into a product idea.",
      900
    ),
    stageInterpretations: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          stage: {
            type: "string",
            enum: [...STAGE_NAMES],
            description: "The Hero's Journey stage for this poster."
          },
          imageDescription: stringSchema("A visual description of the poster without inventing words.", 900),
          inferredMeaning: stringSchema(
            "The product-design meaning inferred from the visual metaphor.",
            700
          ),
          evidence: stringArraySchema("Specific visual evidence from the poster.", 6),
          assumptions: stringArraySchema("Visible assumptions made while interpreting the poster.", 6),
          uncertainty: stringSchema("What is uncertain or ambiguous in this interpretation.", 260)
        },
        required: [
          "stage",
          "imageDescription",
          "inferredMeaning",
          "evidence",
          "assumptions",
          "uncertainty"
        ]
      }
    },
    prototype: {
      type: "object",
      additionalProperties: false,
      properties: {
        screens: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: stringSchema("Stable screen id in kebab-case.", 80),
              stage: {
                type: "string",
                enum: [...STAGE_NAMES],
                description: "The Hero's Journey stage represented by this screen."
              },
              title: stringSchema("Realistic SaaS screen heading.", 120),
              subtitle: stringSchema("Short supporting copy that explains value to the user.", 260),
              userState: stringSchema("The user's emotional or workflow state on this screen.", 160),
              primaryActionLabel: stringSchema("Primary CTA label for this screen.", 80),
              layoutType: {
                type: "string",
                enum: [...layoutTypes],
                description: "Renderer layout variant."
              },
              components: {
                type: "array",
                minItems: 2,
                maxItems: 6,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    type: {
                      type: "string",
                      enum: [...componentTypes],
                      description: "Renderer component type."
                    },
                    title: stringSchema("Component title.", 120),
                    body: stringSchema("Component body copy.", 600),
                    items: stringArraySchema("List items for list, steps, timeline, or insight components.", 6),
                    label: stringSchema("Short label for form, metric, or panel components.", 80),
                    value: stringSchema("Short value for metric, form, or status components.", 120)
                  },
                  required: ["type", "title", "body", "items", "label", "value"]
                }
              },
              transitionToNext: stringSchema(
                "What changes after the primary action moves the user to the next stage.",
                220
              )
            },
            required: [
              "id",
              "stage",
              "title",
              "subtitle",
              "userState",
              "primaryActionLabel",
              "layoutType",
              "components",
              "transitionToNext"
            ]
          }
        }
      },
      required: ["screens"]
    },
    globalAssumptions: stringArraySchema("Assumptions that affect the entire inferred concept.", 8),
    missingInformation: stringArraySchema("Information not available because the posters are wordless.", 8),
    confidence: {
      type: "number",
      description: "Confidence from 0 to 1."
    }
  },
  required: [
    "featureName",
    "overallConcept",
    "inferredUser",
    "inferredUserGoal",
    "interpretationSummary",
    "stageInterpretations",
    "prototype",
    "globalAssumptions",
    "missingInformation",
    "confidence"
  ]
} as const;
