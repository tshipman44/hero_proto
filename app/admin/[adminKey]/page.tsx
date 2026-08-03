import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidAdminUrlKey } from "@/lib/adminAccess";
import { listSubmissionSummaries, type SubmissionSummary } from "@/lib/submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminGalleryPageProps = {
  params: Promise<{ adminKey: string }>;
};

export default async function AdminGalleryPage({ params }: AdminGalleryPageProps) {
  const { adminKey } = await params;

  if (!isValidAdminUrlKey(adminKey)) {
    notFound();
  }

  let submissions: SubmissionSummary[] = [];
  let storageError: string | null = null;

  try {
    submissions = await listSubmissionSummaries();
  } catch (error) {
    storageError =
      error instanceof Error ? error.message : "The submission gallery could not be loaded.";
  }

  return (
    <main className="page-shell admin-shell">
      <section className="admin-heading">
        <div>
          <p className="eyebrow">Facilitator view</p>
          <h1>Prototype submissions</h1>
          <p>
            Open any generated submission to review its interpretation and replay the four-screen
            prototype.
          </p>
        </div>
        <div className="submission-count" aria-label={`${submissions.length} submissions`}>
          <strong>{submissions.length}</strong>
          <span>{submissions.length === 1 ? "submission" : "submissions"}</span>
        </div>
      </section>

      {storageError ? (
        <section className="warning-banner" role="alert">
          <strong>Submission storage unavailable</strong>
          <span>{storageError}</span>
        </section>
      ) : null}

      {!storageError && submissions.length === 0 ? (
        <section className="empty-result admin-empty">
          <p className="eyebrow">Waiting for submissions</p>
          <h2>No prototypes have been generated yet</h2>
          <p>This page will populate automatically as participants complete generation.</p>
        </section>
      ) : null}

      {submissions.length > 0 ? (
        <section className="submission-list" aria-label="Generated prototypes">
          {submissions.map((submission) => (
            <Link
              className="submission-row"
              href={`/admin/${encodeURIComponent(adminKey)}/${submission.id}`}
              key={submission.id}
            >
              <div>
                <h2>{submission.featureName}</h2>
                <time dateTime={submission.createdAt}>
                  {formatSubmissionTime(submission.createdAt)}
                </time>
              </div>
              <span aria-hidden="true">View prototype →</span>
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function formatSubmissionTime(createdAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(createdAt));
}
