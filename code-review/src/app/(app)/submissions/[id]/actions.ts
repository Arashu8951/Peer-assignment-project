"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/server/auth";
import { DomainError } from "@/server/errors";
import { addReviewer, removeReviewer } from "@/server/reviews";
import type { FormState } from "@/server/validation";

const id = z.string().min(1);

export async function addReviewerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.object({ submissionId: id, reviewerId: id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose a student to add" };
  try {
    await addReviewer(user.id, parsed.data.submissionId, parsed.data.reviewerId);
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/submissions/${parsed.data.submissionId}`);
}

export async function removeReviewerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.object({ reviewId: id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  try {
    const submissionId = await removeReviewer(user.id, parsed.data.reviewId);
    revalidatePath(`/submissions/${submissionId}`);
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
}
