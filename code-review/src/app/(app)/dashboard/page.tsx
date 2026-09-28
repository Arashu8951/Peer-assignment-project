import Link from "next/link";
import { requireUser } from "@/server/auth";
import { listMySubmissions } from "@/server/submissions";
import { listPendingReviews } from "@/server/reviews";
import { deriveStatus, reviewProgress } from "@/server/status";
import { ProgressBar, StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const [submissions, pending] = await Promise.all([listMySubmissions(user.id), listPendingReviews(user.id)]);

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Reviews waiting for me</h1>
          <span className="text-sm text-slate-500">{pending.length} pending</span>
        </div>
        {pending.length === 0 ? (
          <p className="card text-sm text-slate-500">Nothing to review right now.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{r.submission.title}</p>
                  <p className="text-sm text-slate-500">
                    {r.submission.language} · by {r.submission.author.name} · assigned {formatDate(r.assignedAt)}
                  </p>
                </div>
                <Link href={`/reviews/${r.id}`} className="btn">Start review</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">My submissions</h2>
          <Link href="/submissions/new" className="btn-secondary">Submit code</Link>
        </div>
        {submissions.length === 0 ? (
          <p className="card text-sm text-slate-500">
            You haven&apos;t submitted any code yet. Submit some and two classmates will be assigned to review it.
          </p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((s) => (
              <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/submissions/${s.id}`} className="font-medium text-indigo-700 hover:underline">
                    {s.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {s.language} · submitted {formatDate(s.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressBar {...reviewProgress(s.reviews)} />
                  <StatusBadge status={deriveStatus(s.reviews)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
