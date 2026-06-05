"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DebugPanel from "@/components/DebugPanel";
import PosterStrip from "@/components/PosterStrip";
import PrototypeViewer from "@/components/PrototypeViewer";
import StageInterpretation from "@/components/StageInterpretation";
import { RESULT_SESSION_KEY, UPLOAD_SESSION_KEY } from "@/lib/constants";
import type { PosterImage } from "@/lib/imageUtils";
import { readSessionValue, removeSessionValues } from "@/lib/session";
import type { GenerationApiResult } from "@/lib/schema";

type UploadSession = {
  featureName: string;
  images: PosterImage[];
};

type StoredResult = {
  request: UploadSession;
  response: GenerationApiResult;
  createdAt: string;
};

export default function ResultPage() {
  const router = useRouter();
  const [storedResult, setStoredResult] = useState<StoredResult | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setStoredResult(readSessionValue<StoredResult>(RESULT_SESSION_KEY));
    setHasMounted(true);
  }, []);

  function handleStartOver() {
    removeSessionValues([UPLOAD_SESSION_KEY, RESULT_SESSION_KEY]);
    router.push("/upload");
  }

  if (!hasMounted) {
    return (
      <main className="page-shell">
        <div className="loading-card">Loading prototype...</div>
      </main>
    );
  }

  if (!storedResult) {
    return (
      <main className="page-shell">
        <section className="empty-result">
          <p className="eyebrow">No session result</p>
          <h1>No prototype is available yet</h1>
          <p>Generate a workshop prototype from the upload page to see the interpretation and screens.</p>
          <Link className="button button-primary" href="/upload">
            Go to upload
          </Link>
        </section>
      </main>
    );
  }

  const { request, response } = storedResult;
  const spec = response.data;

  return (
    <main className="page-shell result-shell">
      <section className="result-heading">
        <div>
          <p className="eyebrow">Generated workshop result</p>
          <h1>{spec.featureName || request.featureName}</h1>
          <p>{spec.interpretationSummary}</p>
        </div>
        <button className="button button-secondary" type="button" onClick={handleStartOver}>
          Start Over
        </button>
      </section>

      {!response.ok ? (
        <section className="warning-banner">
          <strong>{response.errorType === "missing_api_key" ? "Setup needed" : "Fallback prototype shown"}</strong>
          <span>{response.error}</span>
        </section>
      ) : null}

      <section className="meta-row" aria-label="Generation details">
        <div>
          <span>Mode</span>
          <strong>{response.mode}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{response.model}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{response.durationMs} ms</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{Math.round(spec.confidence * 100)}%</strong>
        </div>
      </section>

      <PosterStrip images={request.images} />

      <section className="interpretation-grid">
        <article className="concept-card">
          <p className="eyebrow">Inferred concept</p>
          <h2>{spec.overallConcept}</h2>
          <dl>
            <div>
              <dt>Inferred user</dt>
              <dd>{spec.inferredUser}</dd>
            </div>
            <div>
              <dt>User goal</dt>
              <dd>{spec.inferredUserGoal}</dd>
            </div>
          </dl>
        </article>

        <article className="assumption-card">
          <h2>Assumptions and uncertainty</h2>
          <h3>Global assumptions</h3>
          <ul>
            {spec.globalAssumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Missing information</h3>
          <ul>
            {spec.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="stage-interpretations">
        <div className="section-heading">
          <p className="eyebrow">Poster-to-feature bridge</p>
          <h2>How the AI read each stage</h2>
        </div>
        <div className="stage-interpretation-grid">
          {spec.stageInterpretations.map((stage, index) => (
            <StageInterpretation interpretation={stage} key={stage.stage} poster={request.images[index]} />
          ))}
        </div>
      </section>

      <section className="prototype-section">
        <div className="section-heading">
          <p className="eyebrow">Clickable prototype</p>
          <h2>Four responsive screens</h2>
        </div>
        <PrototypeViewer prototype={spec.prototype} />
      </section>

      <DebugPanel response={response} />
    </main>
  );
}
