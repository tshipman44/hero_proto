"use client";

import type { GenerationApiResult } from "@/lib/schema";

type DebugPanelProps = {
  response: GenerationApiResult;
};

export default function DebugPanel({ response }: DebugPanelProps) {
  return (
    <details className="debug-panel">
      <summary>Debug</summary>
      <div className="debug-grid">
        <DebugBlock title="Structured JSON spec" value={response.data} />
        <DebugBlock title="Raw JSON" value={response.rawJson} />
        <DebugBlock title="Raw model text" value={response.rawModelText || "Not available"} />
        <DebugBlock title="Raw API response" value={response.rawApiResponse || "Not available"} />
        {response.validationErrors?.length ? (
          <DebugBlock title="Validation errors" value={response.validationErrors} />
        ) : null}
      </div>
    </details>
  );
}

function DebugBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h3>{title}</h3>
      <pre>{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}
