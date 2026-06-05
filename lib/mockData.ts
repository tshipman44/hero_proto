import type { PrototypeSpec } from "./schema";
import type { StageName } from "./constants";

const stageInterpretation = (
  stage: StageName,
  imageDescription: string,
  inferredMeaning: string,
  evidence: string[],
  assumptions: string[],
  uncertainty: string
) => ({
  stage,
  imageDescription,
  inferredMeaning,
  evidence,
  assumptions,
  uncertainty
});

export function createMockPrototypeSpec(featureName = "Signal Brief"): PrototypeSpec {
  return {
    featureName,
    overallConcept:
      `${featureName} appears to be a lightweight decision-support feature that turns scattered signals into a guided, confidence-building workflow. The posters suggest a user who starts with ambiguity, enters a structured path, performs one decisive synthesis action, and receives a clear recommendation or status update.`,
    inferredUser:
      "A busy B2B operator, product lead, or account owner who needs to make sense of scattered information quickly.",
    inferredUserGoal:
      "Move from uncertainty to a shareable next step without manually assembling every clue.",
    interpretationSummary:
      "The visual journey reads as a transformation from scattered pressure into guided clarity. Metaphorical objects are treated as evidence of workflow states rather than literal interface widgets.",
    stageInterpretations: [
      stageInterpretation(
        "Call to Adventure",
        "The first poster is interpreted as a moment of friction: multiple visual signals, a central tension point, and a sense that something needs attention.",
        "The feature should open by naming the user's trigger and making the unresolved need visible.",
        ["Clustered shapes imply scattered inputs.", "A focal mark suggests urgency.", "Open space suggests the user has not committed to a path yet."],
        ["The trigger is business-related rather than personal.", "The user needs help prioritizing rather than creating content from scratch."],
        "The exact domain is unclear because the poster has no written labels."
      ),
      stageInterpretation(
        "Crossing the Threshold",
        "The second poster suggests movement into a defined path, with boundary-like forms and a more organized arrangement than the first poster.",
        "The user should be invited into a guided workflow that converts uncertainty into structured inputs.",
        ["A path-like composition implies transition.", "Grouped marks imply steps or checkpoints.", "The layout feels more directional than the first poster."],
        ["The workflow should feel low effort.", "The user is willing to share a small amount of context once value is visible."],
        "It is not certain whether the threshold is onboarding, filtering, or approving a recommended path."
      ),
      stageInterpretation(
        "Seizing the Sword",
        "The third poster is interpreted as the breakthrough moment: a central decisive symbol, sharper contrast, and supporting elements arranged around it.",
        "The core value-producing action is synthesis: selecting, combining, or approving the best next move.",
        ["A strong central element implies a decisive action.", "Surrounding marks imply inputs being resolved.", "The composition suggests focus and agency."],
        ["The feature should include a clear primary action.", "The action should produce a visible artifact or recommendation."],
        "The poster does not reveal whether the user or the system performs the final decision."
      ),
      stageInterpretation(
        "Hero's Reward",
        "The final poster reads as calmer and more complete, with visual balance and a sense of arrival.",
        "The user receives confidence, a concise output, and a way to share or act on the result.",
        ["Balanced composition suggests resolution.", "Contained forms imply a finished deliverable.", "Reduced visual tension implies confidence."],
        ["The reward should be practical and communicable.", "The outcome should include enough evidence to trust the recommendation."],
        "The specific success metric is not visible."
      )
    ],
    prototype: {
      screens: [
        {
          id: "call-to-adventure",
          stage: "Call to Adventure",
          title: `${featureName} finds the signal that needs attention`,
          subtitle:
            "A calm opening view surfaces the unresolved situation, the most recent signals, and why the user should act now.",
          userState: "Aware of a possible issue, but not yet sure where to focus.",
          primaryActionLabel: "Review the signal",
          layoutType: "hero-dashboard",
          transitionToNext: "The user chooses to inspect the signal and enters a guided workspace.",
          components: [
            {
              type: "hero",
              title: "Priority signal detected",
              body: "Recent activity points to a decision that needs a closer look before the team loses momentum.",
              items: ["New activity pattern", "Open decision point", "Recommended review path"],
              label: "Status",
              value: "Needs review"
            },
            {
              type: "metric",
              title: "Confidence baseline",
              body: "The system has enough evidence to begin a guided review, but not enough to recommend action yet.",
              items: [],
              label: "Starting confidence",
              value: "42%"
            },
            {
              type: "list",
              title: "Signals to inspect",
              body: "The first view groups ambiguous inputs into a short, readable queue.",
              items: ["Customer activity shifted", "Internal note flagged risk", "Timeline changed"],
              label: "Input set",
              value: "3 signals"
            }
          ]
        },
        {
          id: "crossing-the-threshold",
          stage: "Crossing the Threshold",
          title: "Enter the guided review",
          subtitle:
            "The workflow asks only for the minimum confirmation needed to turn rough signals into an actionable path.",
          userState: "Committed to the workflow and ready to clarify the situation.",
          primaryActionLabel: "Start guided review",
          layoutType: "guided-workflow",
          transitionToNext: "The review transforms loose clues into a focused synthesis task.",
          components: [
            {
              type: "steps",
              title: "Three-step review path",
              body: "A compact path keeps the user moving without demanding a long setup process.",
              items: ["Confirm the trigger", "Select relevant context", "Let the system prepare a recommendation"],
              label: "Workflow",
              value: "Guided"
            },
            {
              type: "form",
              title: "Context check",
              body: "The user confirms the situation with short, structured fields instead of writing a full explanation.",
              items: ["Impact area", "Urgency", "Owner"],
              label: "Focus area",
              value: "Pending decision"
            },
            {
              type: "insight",
              title: "What the system is learning",
              body: "The feature is separating symptoms from causes so the next screen can focus on the key action.",
              items: ["Pattern strength", "Relevant history", "Likely next step"],
              label: "Analysis",
              value: "In progress"
            }
          ]
        },
        {
          id: "seizing-the-sword",
          stage: "Seizing the Sword",
          title: "Choose the strongest next move",
          subtitle:
            "The decisive screen presents one recommended action, supporting evidence, and a clear way to commit.",
          userState: "Ready to act, but needs confidence that the recommendation is grounded.",
          primaryActionLabel: "Approve recommendation",
          layoutType: "action-center",
          transitionToNext: "Approving the recommendation creates a shareable outcome and closes the loop.",
          components: [
            {
              type: "panel",
              title: "Recommended move",
              body: "Send a concise alignment brief that names the risk, proposed response, and owner for follow-up.",
              items: ["Low effort", "High clarity", "Ready to share"],
              label: "Action",
              value: "Alignment brief"
            },
            {
              type: "timeline",
              title: "Evidence trail",
              body: "The feature explains why this move is stronger than waiting or escalating without context.",
              items: ["Signal appeared", "Pattern strengthened", "Recommendation generated"],
              label: "Trace",
              value: "3 events"
            },
            {
              type: "metric",
              title: "Decision confidence",
              body: "Confidence increases when the user confirms the core context and accepts the synthesized recommendation.",
              items: [],
              label: "Confidence",
              value: "81%"
            }
          ]
        },
        {
          id: "heros-reward",
          stage: "Hero's Reward",
          title: "Walk away with a clear brief",
          subtitle:
            "The final screen gives the user a concise outcome, visible reasoning, and a clean handoff to the team.",
          userState: "Confident, complete, and ready to share the decision.",
          primaryActionLabel: "Replay the prototype",
          layoutType: "outcome-summary",
          transitionToNext: "The journey can be replayed from the beginning for workshop discussion.",
          components: [
            {
              type: "confirmation",
              title: "Brief ready",
              body: "The user receives a polished summary that can be sent to stakeholders or used in a standup.",
              items: ["Decision stated", "Evidence summarized", "Owner assigned"],
              label: "Outcome",
              value: "Ready"
            },
            {
              type: "list",
              title: "What changed",
              body: "The reward screen makes the user's progress explicit and easy to discuss.",
              items: ["Ambiguity reduced", "Next action selected", "Team handoff prepared"],
              label: "Result",
              value: "Clear path"
            },
            {
              type: "insight",
              title: "Confidence note",
              body: "The system explains what it knows, what it assumed, and what the team may still need to validate.",
              items: ["Based on visible signals", "Assumes business workflow", "Needs real domain copy"],
              label: "Trust",
              value: "Explainable"
            }
          ]
        }
      ]
    },
    globalAssumptions: [
      "The posters describe a B2B workflow rather than a consumer entertainment feature.",
      "Visual symbols represent journey states and value moments, not literal interface objects.",
      "The feature should ask for minimal input because the workshop only supplies a short feature name."
    ],
    missingInformation: [
      "Exact target audience was intentionally not provided.",
      "Domain-specific terminology is unknown.",
      "Success metrics and operational constraints are not visible in wordless posters."
    ],
    confidence: 0.74
  };
}
