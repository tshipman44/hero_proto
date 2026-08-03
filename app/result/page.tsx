"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DebugPanel from "@/components/DebugPanel";
import GeneratedResultContent from "@/components/GeneratedResultContent";
import PosterStrip from "@/components/PosterStrip";
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

      {response.ok && response.submission?.status === "saved" ? (
        <section className="success-banner" role="status">
          <strong>Saved for the facilitator</strong>
          <span>This prototype is now available in the admin gallery.</span>
        </section>
      ) : null}

      {response.ok && response.submission?.status === "failed" ? (
        <section className="warning-banner" role="alert">
          <strong>Prototype generated, but not saved</strong>
          <span>{response.submission.error}</span>
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

      <GeneratedResultContent posters={request.images} spec={spec} />

      <DebugPanel response={response} />
    </main>
  );
}
