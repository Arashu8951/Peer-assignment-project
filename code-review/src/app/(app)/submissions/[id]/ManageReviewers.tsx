"use client";

import { useActionState } from "react";
import { addReviewerAction, removeReviewerAction } from "./actions";
import { FormError } from "@/components/FormError";

export function AddReviewerForm({
  submissionId,
  candidates,
}: {
  submissionId: string;
  candidates: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(addReviewerAction, undefined);
  if (candidates.length === 0) return null;
  return (
    <form action={action} className="mt-4 space-y-2 border-t border-slate-200 pt-4">
      <label htmlFor="reviewerId" className="label">Add a reviewer</label>
      <div className="flex gap-2">
        <input type="hidden" name="submissionId" value={submissionId} />
        <select id="reviewerId" name="reviewerId" required defaultValue="" className="input">
          <option value="" disabled>Choose a classmate…</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn-secondary shrink-0">Add</button>
      </div>
      <FormError message={state?.error} />
    </form>
  );
}

export function RemoveReviewerButton({ reviewId, name }: { reviewId: string; name: string }) {
  const [state, action, pending] = useActionState(removeReviewerAction, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="reviewId" value={reviewId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Remove ${name} as reviewer`}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
      >
        Remove
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
