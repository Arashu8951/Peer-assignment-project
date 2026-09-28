import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getSubmissionForUser } from "@/server/submissions";
import { listAssignableUsers } from "@/server/reviews";
import { listEvents } from "@/server/activity";
import { deriveStatus, reviewProgress } from "@/server/status";
import { CodeViewer } from "@/components/CodeViewer";
import { ProgressBar, StatusBadge, VerdictBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/format";
import { AddReviewerForm, RemoveReviewerButton } from "./ManageReviewers";

function describeEvent(type: string, actor: string, rawMeta: string) {
  let meta: { reviewerName?: string; auto?: boolean; verdict?: string } = {};
  try {
    meta = JSON.parse(rawMeta);
  } catch {
    // Malformed meta only costs the detail text.
  }
  const who = meta.reviewerName ?? "A reviewer";
  switch (type) {
    case "SUBMITTED":
      return `${actor} submitted this code`;
    case "REVIEWER_ASSIGNED":
      return meta.auto ? `${who} was auto-assigned as reviewer` : `${actor} added ${who} as reviewer`;
    case "REVIEWER_REMOVED":
      return `${actor} removed ${who} as reviewer`;
    case "REVIEW_SUBMITTED":
      return `${actor} submitted a review: ${meta.verdict === "APPROVE" ? "Approve" : "Request changes"}`;
    default:
      return type;
  }
}

export default async function SubmissionPage({ params }: PageProps<"/submissions/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const s = await getSubmissionForUser(id, user.id);
  if (!s) notFound();

  const isAuthor = s.authorId === user.id;
  const [events, candidates] = await Promise.all([
    listEvents(s.id),
    isAuthor ? listAssignableUsers(s.id) : Promise.resolve([]),
  ]);
  const submitted = s.reviews.filter((r) => r.submittedAt);
  const comments = submitted.flatMap((r) =>
    r.comments.map((c) => ({ lineNumber: c.lineNumber, body: c.body, reviewerName: r.reviewer.name })),
  );

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{s.title}</h1>
          <StatusBadge status={deriveStatus(s.reviews)} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {s.language} · by {s.author.name} · {formatDate(s.createdAt)}
        </p>
        <div className="mt-3">
          <ProgressBar {...reviewProgress(s.reviews)} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{s.description}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="section-title">Code</h2>
            <CodeViewer code={s.code} comments={comments} />
          </section>

          <section>
            <h2 className="section-title">Feedback</h2>
            {submitted.length === 0 ? (
              <p className="card text-sm text-slate-500">No reviews submitted yet.</p>
            ) : (
              <ul className="space-y-3">
                {submitted.map((r) => (
                  <li key={r.id} className="card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{r.reviewer.name}</p>
                      <VerdictBadge verdict={r.verdict} />
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                      {(
                        [
                          ["Correctness", r.correctness],
                          ["Readability", r.readability],
                          ["Structure", r.structure],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="rounded-md bg-slate-50 py-2">
                          <dt className="text-xs text-slate-500">{label}</dt>
                          <dd className="font-semibold">{value}/5</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{r.summary}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {r.comments.length} line comment{r.comments.length === 1 ? "" : "s"} ·{" "}
                      {formatDateTime(r.submittedAt!)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section className="card">
            <h2 className="section-title">Reviewers</h2>
            {s.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No classmates were available to assign.</p>
            ) : (
              <ul className="space-y-3">
                {s.reviews.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">{r.reviewer.name}</p>
                      <p className="text-xs text-slate-500">
                        {r.submittedAt ? `Reviewed ${formatDate(r.submittedAt)}` : "Review pending"}
                      </p>
                    </div>
                    {r.submittedAt ? (
                      <VerdictBadge verdict={r.verdict} />
                    ) : r.reviewerId === user.id ? (
                      <Link href={`/reviews/${r.id}`} className="font-medium text-indigo-600 hover:underline">
                        Write review
                      </Link>
                    ) : isAuthor ? (
                      <RemoveReviewerButton reviewId={r.id} name={r.reviewer.name} />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {isAuthor && <AddReviewerForm submissionId={s.id} candidates={candidates} />}
          </section>

          <section className="card">
            <h2 className="section-title">Activity</h2>
            <ol className="space-y-3 border-l border-slate-200 pl-4">
              {events.map((e) => (
                <li key={e.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-400" />
                  <p className="text-slate-700">{describeEvent(e.type, e.actor.name, e.meta)}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
