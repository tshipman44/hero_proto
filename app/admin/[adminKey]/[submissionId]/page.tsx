import Link from "next/link";
import { notFound } from "next/navigation";
import GeneratedResultContent from "@/components/GeneratedResultContent";
import { isValidAdminUrlKey } from "@/lib/adminAccess";
import { getSubmission } from "@/lib/submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminSubmissionPageProps = {
  params: Promise<{ adminKey: string; submissionId: string }>;
};

export default async function AdminSubmissionPage({ params }: AdminSubmissionPageProps) {
  const { adminKey, submissionId } = await params;

  if (!isValidAdminUrlKey(adminKey)) {
    notFound();
  }

  const submission = await getSubmission(submissionId);

  if (!submission) {
    notFound();
  }

  return (
    <main className="page-shell result-shell admin-detail-shell">
      <nav className="admin-breadcrumb" aria-label="Admin navigation">
        <Link href={`/admin/${encodeURIComponent(adminKey)}`}>← All submissions</Link>
      </nav>

      <section className="result-heading admin-result-heading">
        <div>
          <p className="eyebrow">Submitted prototype</p>
          <h1>{submission.featureName}</h1>
          <p>{submission.prototype.interpretationSummary}</p>
        </div>
        <time dateTime={submission.createdAt}>{formatSubmissionTime(submission.createdAt)}</time>
      </section>

      <GeneratedResultContent spec={submission.prototype} />
    </main>
  );
}

function formatSubmissionTime(createdAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(createdAt));
}
