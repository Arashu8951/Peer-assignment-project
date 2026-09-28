"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/server/auth";
import { createSubmission } from "@/server/submissions";
import { submissionSchema, type FormState } from "@/server/validation";

export async function createSubmissionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  // Browsers send textarea newlines as CRLF; normalise so line numbers match what reviewers see.
  const code = parsed.data.code.replace(/\r\n?/g, "\n");
  const id = await createSubmission(user.id, { ...parsed.data, code });
  revalidatePath("/dashboard");
  redirect(`/submissions/${id}`);
}
