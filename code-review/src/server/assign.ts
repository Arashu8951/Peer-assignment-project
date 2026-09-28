import type { Tx } from "./db";
import { recordEvent } from "./activity";

export type Candidate = { id: string; load: number };

export const DEFAULT_REVIEWERS = 2;

// Shuffle first so equal-load ties break randomly, then stable-sort by load.
export function pickReviewers(candidates: Candidate[], n: number, rng: () => number = Math.random): string[] {
  const pool = [...candidates];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  pool.sort((a, b) => a.load - b.load);
  return pool.slice(0, Math.max(0, n)).map((c) => c.id);
}

// Load = reviews a student has been assigned but not yet submitted.
export async function autoAssign(tx: Tx, submissionId: string, authorId: string, n = DEFAULT_REVIEWERS) {
  const already = await tx.review.findMany({ where: { submissionId }, select: { reviewerId: true } });
  const excluded = [authorId, ...already.map((r) => r.reviewerId)];
  const users = await tx.user.findMany({
    where: { id: { notIn: excluded } },
    select: { id: true, name: true, _count: { select: { reviews: { where: { submittedAt: null } } } } },
  });
  const picked = pickReviewers(
    users.map((u) => ({ id: u.id, load: u._count.reviews })),
    n,
  );
  for (const reviewerId of picked) {
    await tx.review.create({ data: { submissionId, reviewerId } });
    const reviewerName = users.find((u) => u.id === reviewerId)!.name;
    await recordEvent(tx, {
      submissionId,
      actorId: authorId,
      type: "REVIEWER_ASSIGNED",
      meta: { reviewerId, reviewerName, auto: true },
    });
  }
  return picked;
}
