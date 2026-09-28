import { db, type Tx } from "./db";

export type EventType = "SUBMITTED" | "REVIEWER_ASSIGNED" | "REVIEWER_REMOVED" | "REVIEW_SUBMITTED";

export async function recordEvent(
  tx: Tx,
  e: { submissionId: string; actorId: string; type: EventType; meta?: Record<string, unknown> },
) {
  await tx.activityEvent.create({
    data: { submissionId: e.submissionId, actorId: e.actorId, type: e.type, meta: JSON.stringify(e.meta ?? {}) },
  });
}

export function listEvents(submissionId: string) {
  return db.activityEvent.findMany({
    where: { submissionId },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { name: true } } },
  });
}
