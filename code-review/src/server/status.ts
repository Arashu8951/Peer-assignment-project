export type SubmissionStatus = "PENDING" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";

type ReviewLike = { submittedAt: Date | null; verdict: string | null };

// Status is derived from the reviews every time, never stored, so it cannot drift.
export function deriveStatus(reviews: ReviewLike[]): SubmissionStatus {
  const done = reviews.filter((r) => r.submittedAt !== null);
  if (done.length === 0) return "PENDING";
  if (done.length < reviews.length) return "IN_REVIEW";
  return done.some((r) => r.verdict === "REQUEST_CHANGES") ? "CHANGES_REQUESTED" : "APPROVED";
}

export function reviewProgress(reviews: ReviewLike[]) {
  return { done: reviews.filter((r) => r.submittedAt !== null).length, total: reviews.length };
}
