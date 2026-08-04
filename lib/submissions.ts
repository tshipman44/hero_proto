import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { z } from "zod";
import { PrototypeSpecSchema, type PrototypeSpec } from "./schema";

const SUBMISSION_PREFIX = "prototype-submissions/";
const LOCAL_SUBMISSION_DIRECTORY = path.join(process.cwd(), ".data", "submissions");
const MAX_LISTED_SUBMISSIONS = 500;

const StoredSubmissionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    featureName: z.string().min(1).max(80),
    prototype: PrototypeSpecSchema
  })
  .strict();

export type StoredSubmission = z.infer<typeof StoredSubmissionSchema>;

export type SubmissionSummary = Pick<StoredSubmission, "id" | "createdAt" | "featureName">;

export async function saveSubmission(prototype: PrototypeSpec): Promise<StoredSubmission> {
  const submission: StoredSubmission = {
    schemaVersion: 1,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    featureName: prototype.featureName,
    prototype
  };

  const serializedSubmission = JSON.stringify(submission);

  if (hasBlobStorage()) {
    await put(blobPath(submission.id), serializedSubmission, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return submission;
  }

  assertLocalStorageAvailable();
  await mkdir(LOCAL_SUBMISSION_DIRECTORY, { recursive: true });
  await writeFile(localPath(submission.id), serializedSubmission, {
    encoding: "utf-8",
    flag: "wx"
  });
  return submission;
}

export async function listSubmissionSummaries(): Promise<SubmissionSummary[]> {
  const submissions = hasBlobStorage()
    ? await listBlobSubmissions()
    : await listLocalSubmissions();

  return submissions
    .map(({ id, createdAt, featureName }) => ({ id, createdAt, featureName }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getSubmission(id: string): Promise<StoredSubmission | null> {
  if (!z.string().uuid().safeParse(id).success) {
    return null;
  }

  if (hasBlobStorage()) {
    const blob = await get(blobPath(id), { access: "private", useCache: false });

    if (!blob || blob.statusCode !== 200) {
      return null;
    }

    return parseSubmission(await new Response(blob.stream).text());
  }

  assertLocalStorageAvailable();

  try {
    return parseSubmission(await readFile(localPath(id), "utf-8"));
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

async function listBlobSubmissions(): Promise<StoredSubmission[]> {
  const result = await list({
    prefix: SUBMISSION_PREFIX,
    limit: MAX_LISTED_SUBMISSIONS
  });

  const settled = await Promise.allSettled(
    result.blobs.map(async (blob) => {
      const storedBlob = await get(blob.pathname, { access: "private", useCache: false });

      if (!storedBlob || storedBlob.statusCode !== 200) {
        return null;
      }

      return parseSubmission(await new Response(storedBlob.stream).text());
    })
  );

  return settled.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : []
  );
}

async function listLocalSubmissions(): Promise<StoredSubmission[]> {
  assertLocalStorageAvailable();

  try {
    const fileNames = (await readdir(LOCAL_SUBMISSION_DIRECTORY))
      .filter((fileName) => fileName.endsWith(".json"))
      .slice(0, MAX_LISTED_SUBMISSIONS);
    const settled = await Promise.allSettled(
      fileNames.map(async (fileName) =>
        parseSubmission(await readFile(path.join(LOCAL_SUBMISSION_DIRECTORY, fileName), "utf-8"))
      )
    );

    return settled.flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : []
    );
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  }
}

function parseSubmission(serializedSubmission: string): StoredSubmission | null {
  try {
    return StoredSubmissionSchema.parse(JSON.parse(serializedSubmission));
  } catch {
    return null;
  }
}

function blobPath(id: string): string {
  return `${SUBMISSION_PREFIX}${id}.json`;
}

function localPath(id: string): string {
  return path.join(LOCAL_SUBMISSION_DIRECTORY, `${id}.json`);
}

function hasBlobStorage(): boolean {
  // Vercel's current Blob integration injects the store ID as a project
  // variable and supplies its short-lived OIDC token through the request
  // context. The token therefore does not have to exist as a static env var.
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function assertLocalStorageAvailable(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Submission storage is not configured. Connect a private Vercel Blob store to this project."
    );
  }
}

function isMissingFileError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
  );
}
