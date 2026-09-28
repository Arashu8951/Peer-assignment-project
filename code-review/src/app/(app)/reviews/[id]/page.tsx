import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getReviewForReviewer } from "@/server/reviews";
import { CodeViewer } from "@/components/CodeViewer";
import { ReviewForm } from "@/components/ReviewForm";
import { VerdictBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";

export default async function ReviewPage({ params }: PageProps<"/reviews/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const review = await getReviewForReviewer(id, user.id);
  if (!review) notFound();
  const s = review.submission;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-sm text-slate-500">Reviewing</p>
        <h1 className="text-xl font-semibold">{s.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {s.language} · by {s.author.name}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{s.description}</p>
      </header>

      {review.submittedAt ? (
        <>
          <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            You submitted this review on {formatDateTime(review.submittedAt)}. Submitted reviews can&apos;t be edited.{" "}
            <Link href={`/submissions/${s.id}`} className="font-medium text-indigo-600 hover:underline">
              View submission
            </Link>
          </p>
          <CodeViewer
            code={s.code}
            comments={review.comments.map((c) => ({ lineNumber: c.lineNumber, body: c.body, reviewerName: "You" }))}
          />
          <section className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title mb-0">Your review</h2>
              <VerdictBadge verdict={review.verdict} />
            </div>
            <p className="text-sm text-slate-600">
              Correctness {review.correctness}/5 · Readability {review.readability}/5 · Structure {review.structure}/5
            </p>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{review.summary}</p>
          </section>
        </>
      ) : (
        <ReviewForm reviewId={review.id} code={s.code} />
      )}
    </div>
  );
}
