"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/server/auth";
import { DomainError } from "@/server/errors";
import { submitReview } from "@/server/reviews";
import { reviewSchema, type FormState } from "@/server/validation";

export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const reviewId = formData.get("reviewId");
  if (typeof reviewId !== "string" || !reviewId) return { error: "Invalid request" };

  // Line comments are built client-side and travel as JSON in a hidden input.
  let comments: unknown;
  try {
    comments = JSON.parse(String(formData.get("comments") ?? "[]"));
  } catch {
    return { error: "Invalid comments" };
  }

  const parsed = reviewSchema.safeParse({
    verdict: formData.get("verdict") ?? undefined,
    summary: formData.get("summary") ?? "",
    correctness: formData.get("correctness") ?? undefined,
    readability: formData.get("readability") ?? undefined,
    structure: formData.get("structure") ?? undefined,
    comments,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  let submissionId: string;
  try {
    submissionId = await submitReview(user.id, reviewId, parsed.data);
  } catch (e) {
    if (e instanceof DomainError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect(`/submissions/${submissionId}`);
}
