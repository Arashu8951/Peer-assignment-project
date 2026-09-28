import Link from "next/link";
import { requireUser } from "@/server/auth";
import { listHistory } from "@/server/reviews";
import { VerdictBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approve", label: "Approved" },
  { key: "request_changes", label: "Changes requested" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

type Row = {
  id: string;
  submissionId: string;
  title: string;
  person: string;
  assignedAt: Date;
  submittedAt: Date | null;
  verdict: string | null;
  comments: number;
  average: string;
};

function matches(filter: FilterKey, r: { submittedAt: Date | null; verdict: string | null }) {
  if (filter === "pending") return r.submittedAt === null;
  if (filter === "approve") return r.verdict === "APPROVE";
  if (filter === "request_changes") return r.verdict === "REQUEST_CHANGES";
  return true;
}

function average(r: { correctness: number | null; readability: number | null; structure: number | null }) {
  if (r.correctness === null || r.readability === null || r.structure === null) return "–";
  return ((r.correctness + r.readability + r.structure) / 3).toFixed(1);
}

function HistoryTable({ rows, personHeading, empty }: { rows: Row[]; personHeading: string; empty: string }) {
  if (rows.length === 0) return <p className="card text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Submission</th>
            <th className="px-4 py-2">{personHeading}</th>
            <th className="px-4 py-2">Assigned</th>
            <th className="px-4 py-2">Submitted</th>
            <th className="px-4 py-2">Verdict</th>
            <th className="px-4 py-2 text-right">Comments</th>
            <th className="px-4 py-2 text-right">Avg score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2">
                <Link href={`/submissions/${r.submissionId}`} className="font-medium text-indigo-700 hover:underline">
                  {r.title}
                </Link>
              </td>
              <td className="px-4 py-2">{r.person}</td>
              <td className="whitespace-nowrap px-4 py-2 text-slate-600">{formatDate(r.assignedAt)}</td>
              <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                {r.submittedAt ? formatDate(r.submittedAt) : "Pending"}
              </td>
              <td className="px-4 py-2"><VerdictBadge verdict={r.verdict} /></td>
              <td className="px-4 py-2 text-right">{r.comments}</td>
              <td className="px-4 py-2 text-right">{r.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HistoryPage({ searchParams }: PageProps<"/history">) {
  const user = await requireUser();
  const sp = await searchParams;
  const requested = typeof sp.state === "string" ? sp.state : "all";
  const filter: FilterKey = FILTERS.some((f) => f.key === requested) ? (requested as FilterKey) : "all";

  const { given, received } = await listHistory(user.id);
  const givenRows: Row[] = given
    .filter((r) => matches(filter, r))
    .map((r) => ({
      id: r.id,
      submissionId: r.submission.id,
      title: r.submission.title,
      person: r.submission.author.name,
      assignedAt: r.assignedAt,
      submittedAt: r.submittedAt,
      verdict: r.verdict,
      comments: r._count.comments,
      average: average(r),
    }));
  const receivedRows: Row[] = received
    .filter((r) => matches(filter, r))
    .map((r) => ({
      id: r.id,
      submissionId: r.submission.id,
      title: r.submission.title,
      person: r.reviewer.name,
      assignedAt: r.assignedAt,
      submittedAt: r.submittedAt,
      verdict: r.verdict,
      comments: r._count.comments,
      average: average(r),
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Review history</h1>
        <nav aria-label="Filter reviews" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/history" : `/history?state=${f.key}`}
              aria-current={f.key === filter ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                f.key === filter ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>
      <section>
        <h2 className="section-title">Reviews I gave</h2>
        <HistoryTable rows={givenRows} personHeading="Author" empty="No reviews match this filter." />
      </section>
      <section>
        <h2 className="section-title">Reviews I received</h2>
        <HistoryTable rows={receivedRows} personHeading="Reviewer" empty="No reviews match this filter." />
      </section>
    </div>
  );
}
