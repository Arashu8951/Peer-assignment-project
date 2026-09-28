import type { SubmissionStatus } from "@/server/status";

const STYLES: Record<SubmissionStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-700 ring-slate-300" },
  IN_REVIEW: { label: "In review", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  CHANGES_REQUESTED: { label: "Changes requested", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-700 ring-green-200" },
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: string | null }) {
  if (!verdict) return <StatusBadge status="PENDING" />;
  return <StatusBadge status={verdict === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED"} />;
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500">
        {done} of {total} reviews
      </span>
    </div>
  );
}
