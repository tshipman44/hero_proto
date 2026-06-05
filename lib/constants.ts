export const STAGE_NAMES = [
  "Call to Adventure",
  "Crossing the Threshold",
  "Seizing the Sword",
  "Hero's Reward"
] as const;

export type StageName = (typeof STAGE_NAMES)[number];

export const STAGES: Array<{
  id: string;
  name: StageName;
  shortName: string;
  hint: string;
}> = [
  {
    id: "call-to-adventure",
    name: "Call to Adventure",
    shortName: "Call",
    hint: "User trigger, unmet need, or problem."
  },
  {
    id: "crossing-the-threshold",
    name: "Crossing the Threshold",
    shortName: "Threshold",
    hint: "User enters the feature or begins the workflow."
  },
  {
    id: "seizing-the-sword",
    name: "Seizing the Sword",
    shortName: "Sword",
    hint: "User completes the key value-producing action."
  },
  {
    id: "heros-reward",
    name: "Hero's Reward",
    shortName: "Reward",
    hint: "User receives value, outcome, confidence, approval, insight, or completion."
  }
];

export const UPLOAD_SESSION_KEY = "hero-prototype-upload-v1";
export const RESULT_SESSION_KEY = "hero-prototype-result-v1";
