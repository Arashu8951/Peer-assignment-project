import { db } from "./db";
import { autoAssign } from "./assign";
import { recordEvent } from "./activity";
import type { SubmissionInput } from "./validation";

export function createSubmission(authorId: string, input: SubmissionInput) {
  // One transaction: a submission never exists without its event and reviewers.
  return db.$transaction(async (tx) => {
    const s = await tx.submission.create({ data: { ...input, authorId } });
    await recordEvent(tx, { submissionId: s.id, actorId: authorId, type: "SUBMITTED" });
    await autoAssign(tx, s.id, authorId);
    return s.id;
  });
}

// Returns null when the user is neither the author nor an assigned reviewer.
export async function getSubmissionForUser(id: string, userId: string) {
  const s = await db.submission.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      reviews: {
        orderBy: { assignedAt: "asc" },
        include: {
          reviewer: { select: { id: true, name: true } },
          comments: { orderBy: { lineNumber: "asc" } },
        },
      },
    },
  });
  if (!s) return null;
  const allowed = s.authorId === userId || s.reviews.some((r) => r.reviewerId === userId);
  return allowed ? s : null;
}

export function listMySubmissions(userId: string) {
  return db.submission.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { reviews: { select: { submittedAt: true, verdict: true } } },
  });
}
