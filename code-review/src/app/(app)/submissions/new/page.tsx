"use client";

import { useActionState } from "react";
import { createSubmissionAction } from "./actions";
import { FieldError, FormError } from "@/components/FormError";
import { LANGUAGES } from "@/server/validation";

export default function NewSubmissionPage() {
  const [state, action, pending] = useActionState(createSubmissionAction, undefined);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold">Submit code for review</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Two classmates with the lightest review load are assigned automatically. You can change reviewers afterwards.
      </p>
      <form action={action} className="card space-y-4">
        <FormError message={state?.error} />
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" name="title" required minLength={3} maxLength={120} className="input" />
            <FieldError errors={state?.fieldErrors?.title} />
          </div>
          <div>
            <label htmlFor="language" className="label">Language</label>
            <select id="language" name="language" required defaultValue="" className="input">
              <option value="" disabled>Choose…</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <FieldError errors={state?.fieldErrors?.language} />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label">What does it do? What should reviewers focus on?</label>
          <textarea id="description" name="description" required minLength={10} maxLength={2000} rows={3} className="input" />
          <FieldError errors={state?.fieldErrors?.description} />
        </div>
        <div>
          <label htmlFor="code" className="label">Code</label>
          <textarea id="code" name="code" required rows={20} spellCheck={false} className="input font-mono" />
          <FieldError errors={state?.fieldErrors?.code} />
        </div>
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
