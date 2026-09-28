import { db } from "./db";
import { DomainError } from "./errors";
import { recordEvent } from "./activity";
import type { ReviewInput } from "./validation";

export function listPendingReviews(userId: string) {
  return db.review.findMany({
    where: { reviewerId: userId, submittedAt: null },
    orderBy: { assignedAt: "asc" },
    include: {
      submission: { select: { id: true, title: true, language: true, author: { select: { name: true } } } },
    },
  });
}

export async function listAssignableUsers(submissionId: string) {
  const s = await db.submission.findUnique({
    where: { id: submissionId },
    include: { reviews: { select: { reviewerId: true } } },
  });
  if (!s) return [];
  return db.user.findMany({
    where: { id: { notIn: [s.authorId, ...s.reviews.map((r) => r.reviewerId)] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function addReviewer(authorId: string, submissionId: string, reviewerId: string) {
  return db.$transaction(async (tx) => {
    const s = await tx.submission.findUnique({ where: { id: submissionId } });
    if (!s || s.authorId !== authorId) throw new DomainError("Only the author can manage reviewers");
    if (reviewerId === authorId) throw new DomainError("You cannot review your own submission");
    const reviewer = await tx.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer) throw new DomainError("That user does not exist");
    const existing = await tx.review.findUnique({
      where: { submissionId_reviewerId: { submissionId, reviewerId } },
    });
    if (existing) throw new DomainError("That student is already a reviewer");
    await tx.review.create({ data: { submissionId, reviewerId } });
    await recordEvent(tx, {
      submissionId,
      actorId: authorId,
      type: "REVIEWER_ASSIGNED",
      meta: { reviewerId, reviewerName: reviewer.name, auto: false },
    });
  });
}

// Returns the submission id so the caller can revalidate its page.
export function removeReviewer(authorId: string, reviewId: string) {
  return db.$transaction(async (tx) => {
    const r = await tx.review.findUnique({
      where: { id: reviewId },
      include: { submission: true, reviewer: true },
    });
    if (!r || r.submission.authorId !== authorId) throw new DomainError("Only the author can manage reviewers");
    if (r.submittedAt) throw new DomainError("A submitted review cannot be removed");
    await tx.review.delete({ where: { id: reviewId } });
    await recordEvent(tx, {
      submissionId: r.submissionId,
      actorId: authorId,
      type: "REVIEWER_REMOVED",
      meta: { reviewerId: r.reviewerId, reviewerName: r.reviewer.name },
    });
    return r.submissionId;
  });
}

// Returns null unless the user is the assigned reviewer.
export async function getReviewForReviewer(reviewId: string, userId: string) {
  const r = await db.review.findUnique({
    where: { id: reviewId },
    include: {
      comments: { orderBy: { lineNumber: "asc" } },
      submission: {
        select: {
          id: true,
          title: true,
          language: true,
          description: true,
          code: true,
          author: { select: { name: true } },
        },
      },
    },
  });
  return r && r.reviewerId === userId ? r : null;
}

export function submitReview(userId: string, reviewId: string, input: ReviewInput) {
  return db.$transaction(async (tx) => {
    const r = await tx.review.findUnique({
      where: { id: reviewId },
      include: { submission: { select: { code: true } } },
    });
    if (!r || r.reviewerId !== userId) throw new DomainError("Review not found");
    if (r.submittedAt) throw new DomainError("This review has already been submitted");
    const lineCount = r.submission.code.split("\n").length;
    if (input.comments.some((c) => c.lineNumber > lineCount)) {
      throw new DomainError("A comment points at a line that does not exist");
    }
    await tx.review.update({
      where: { id: reviewId },
      data: {
        submittedAt: new Date(),
        verdict: input.verdict,
        summary: input.summary,
        correctness: input.correctness,
        readability: input.readability,
        structure: input.structure,
        comments: { create: input.comments },
      },
    });
    await recordEvent(tx, {
      submissionId: r.submissionId,
      actorId: userId,
      type: "REVIEW_SUBMITTED",
      meta: { verdict: input.verdict },
    });
    return r.submissionId;
  });
}

export async function listHistory(userId: string) {
  const [given, received] = await Promise.all([
    db.review.findMany({
      where: { reviewerId: userId },
      orderBy: { assignedAt: "desc" },
      include: {
        submission: { select: { id: true, title: true, author: { select: { name: true } } } },
        _count: { select: { comments: true } },
      },
    }),
    db.review.findMany({
      where: { submission: { authorId: userId } },
      orderBy: { assignedAt: "desc" },
      include: {
        reviewer: { select: { name: true } },
        submission: { select: { id: true, title: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);
  return { given, received };
}
