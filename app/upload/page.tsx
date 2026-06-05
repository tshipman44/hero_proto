"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UploadCard from "@/components/UploadCard";
import { RESULT_SESSION_KEY, STAGES, UPLOAD_SESSION_KEY, type StageName } from "@/lib/constants";
import {
  compressImageFile,
  MAX_COMPRESSED_IMAGE_BYTES,
  type PosterImage
} from "@/lib/imageUtils";
import { readSessionValue, writeSessionValue } from "@/lib/session";
import type { GenerationApiResult } from "@/lib/schema";

type PosterMap = Partial<Record<StageName, PosterImage>>;

type UploadSession = {
  featureName: string;
  images: PosterImage[];
};

type StoredResult = {
  request: UploadSession;
  response: GenerationApiResult;
  createdAt: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [featureName, setFeatureName] = useState("");
  const [posters, setPosters] = useState<PosterMap>({});
  const [errors, setErrors] = useState<Partial<Record<StageName, string>>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const saved = readSessionValue<UploadSession>(UPLOAD_SESSION_KEY);
    if (saved) {
      setFeatureName(saved.featureName);
      setPosters(
        saved.images.reduce<PosterMap>((accumulator, image) => {
          accumulator[image.stage] = image;
          return accumulator;
        }, {})
      );
    }
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const storageError = writeSessionValue<UploadSession>(UPLOAD_SESSION_KEY, {
      featureName,
      images: STAGES.map((stage) => posters[stage.name]).filter(Boolean) as PosterImage[]
    });

    if (storageError) {
      setPageError(storageError);
    }
  }, [featureName, hasMounted, posters]);

  const allImagesPresent = useMemo(
    () => STAGES.every((stage) => Boolean(posters[stage.name])),
    [posters]
  );
  const canGenerate = featureName.trim().length > 0 && allImagesPresent && !isGenerating;

  async function handleFileSelected(stage: StageName, file: File) {
    setPageError(null);
    setErrors((current) => ({ ...current, [stage]: undefined }));

    try {
      const compressed = await compressImageFile(file, stage);
      setPosters((current) => ({ ...current, [stage]: compressed }));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [stage]: error instanceof Error ? error.message : "This image could not be prepared."
      }));
    }
  }

  function handleClear(stage: StageName) {
    setPosters((current) => {
      const next = { ...current };
      delete next[stage];
      return next;
    });
    setErrors((current) => ({ ...current, [stage]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canGenerate) {
      return;
    }

    setIsGenerating(true);
    setPageError(null);

    const requestSession: UploadSession = {
      featureName: featureName.trim(),
      images: STAGES.map((stage) => posters[stage.name]).filter(Boolean) as PosterImage[]
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          featureName: requestSession.featureName,
          images: requestSession.images.map((image) => ({
            stage: image.stage,
            mimeType: image.mimeType,
            data: image.base64,
            fileName: image.fileName
          }))
        })
      });

      const payload = (await response.json()) as GenerationApiResult;

      if (!payload.data) {
        throw new Error(payload.error || `Generation failed with status ${response.status}.`);
      }

      const storageError = writeSessionValue<StoredResult>(RESULT_SESSION_KEY, {
        request: requestSession,
        response: payload,
        createdAt: new Date().toISOString()
      });

      if (storageError) {
        throw new Error(storageError);
      }

      router.push("/result");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (isGenerating) {
    return (
      <main className="page-shell">
        <section className="generating-panel">
          <p className="eyebrow">Generation in progress</p>
          <h1>Interpreting the visual journey</h1>
          <p>
            The app is reading the posters as metaphors, mapping each stage to a product moment, and
            assembling a four-screen prototype for workshop discussion.
          </p>
          <div className="generation-steps" aria-label="Generation steps">
            <span>Reading posters</span>
            <span>Finding the bridge</span>
            <span>Building screens</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow">Four posters, one prototype</p>
        <h1>Upload the workshop posters</h1>
        <p>
          Add a short feature name and one photo for each required Hero's Journey stage. Each photo is
          compressed in the browser before generation.
        </p>
      </section>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="feature-field" htmlFor="feature-name">
          <span>Feature name</span>
          <input
            id="feature-name"
            maxLength={80}
            placeholder="Example: Signal Brief"
            type="text"
            value={featureName}
            onChange={(event) => setFeatureName(event.target.value)}
          />
        </label>

        <div className="upload-grid">
          {STAGES.map((stage) => (
            <UploadCard
              error={errors[stage.name]}
              image={posters[stage.name]}
              key={stage.id}
              maxBytes={MAX_COMPRESSED_IMAGE_BYTES}
              stage={stage}
              onClear={() => handleClear(stage.name)}
              onFileSelected={(file) => handleFileSelected(stage.name, file)}
            />
          ))}
        </div>

        {pageError ? <div className="error-banner">{pageError}</div> : null}

        <div className="form-actions">
          <button className="button button-primary" disabled={!canGenerate} type="submit">
            Generate prototype
          </button>
        </div>
      </form>
    </main>
  );
}
