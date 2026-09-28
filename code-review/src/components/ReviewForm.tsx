"use client";

import { Fragment, useActionState, useState } from "react";
import { submitReviewAction } from "@/app/(app)/reviews/[id]/actions";
import { FieldError, FormError } from "@/components/FormError";

type Draft = { lineNumber: number; body: string };

const RUBRIC = [
  { name: "correctness", label: "Correctness", hint: "Does it do what it claims, including edge cases?" },
  { name: "readability", label: "Readability", hint: "Naming, formatting, comments." },
  { name: "structure", label: "Structure", hint: "Decomposition, duplication, complexity." },
] as const;

export function ReviewForm({ reviewId, code }: { reviewId: string; code: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, undefined);
  const [comments, setComments] = useState<Draft[]>([]);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  // Controlled so a server-side validation error doesn't wipe what the reviewer typed.
  const [summary, setSummary] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState("");

  const lines = code.split("\n");

  function openLine(n: number) {
    setActiveLine(n);
    setDraft("");
  }

  function addComment() {
    const body = draft.trim();
    if (!body || activeLine === null) return;
    setComments((c) => [...c, { lineNumber: activeLine, body }].sort((a, b) => a.lineNumber - b.lineNumber));
    setActiveLine(null);
    setDraft("");
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="comments" value={JSON.stringify(comments)} />

      <section>
        <h2 className="section-title">Code</h2>
        <p className="mb-2 text-sm text-slate-500">Click a line number to comment on that line.</p>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {lines.map((line, i) => {
                const n = i + 1;
                const here = comments.filter((c) => c.lineNumber === n);
                return (
                  <Fragment key={n}>
                    <tr className={here.length > 0 || activeLine === n ? "bg-amber-50" : "hover:bg-slate-50"}>
                      <td className="w-12 border-r border-slate-200 text-right align-top">
                        <button
                          type="button"
                          onClick={() => openLine(n)}
                          aria-label={`Comment on line ${n}`}
                          className="w-full select-none px-3 text-right text-slate-400 hover:bg-indigo-100 hover:text-indigo-700"
                        >
                          {n}
                        </button>
                      </td>
                      <td className="px-3">
                        <pre className="whitespace-pre">{line || " "}</pre>
                      </td>
                    </tr>
                    {(here.length > 0 || activeLine === n) && (
                      <tr>
                        <td className="border-r border-slate-200" />
                        <td className="space-y-2 border-y border-amber-200 bg-amber-50/60 px-3 py-2 font-sans">
                          {here.map((c) => (
                            <div key={c.body + c.lineNumber} className="flex items-start justify-between gap-3 text-sm">
                              <p className="whitespace-pre-wrap text-slate-800">{c.body}</p>
                              <button
                                type="button"
                                onClick={() => setComments((all) => all.filter((x) => x !== c))}
                                className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {activeLine === n && (
                            <div className="space-y-2">
                              <textarea
                                autoFocus
                                rows={2}
                                maxLength={1000}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                aria-label={`Comment for line ${n}`}
                                placeholder={`Comment on line ${n}…`}
                                className="input"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={addComment} disabled={!draft.trim()} className="btn-secondary">
                                  Add comment
                                </button>
                                <button type="button" onClick={() => setActiveLine(null)} className="btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {comments.length} line comment{comments.length === 1 ? "" : "s"} added
        </p>
      </section>

      <section className="card space-y-5">
        <h2 className="section-title">Rubric</h2>
        {RUBRIC.map((r) => (
          <fieldset key={r.name}>
            <legend className="text-sm font-medium text-slate-700">{r.label}</legend>
            <p className="text-xs text-slate-500">{r.hint}</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="cursor-pointer">
                  <input
                    type="radio"
                    name={r.name}
                    value={v}
                    required
                    checked={scores[r.name] === String(v)}
                    onChange={(e) => setScores((s) => ({ ...s, [r.name]: e.target.value }))}
                    className="peer sr-only"
                  />
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-sm peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300">
                    {v}
                  </span>
                </label>
              ))}
            </div>
            <FieldError errors={state?.fieldErrors?.[r.name]} />
          </fieldset>
        ))}
      </section>

      <section className="card space-y-4">
        <div>
          <label htmlFor="summary" className="label">Overall feedback</label>
          <textarea
            id="summary"
            name="summary"
            required
            minLength={10}
            maxLength={4000}
            rows={5}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What works well? What should change, and why?"
            className="input"
          />
          <FieldError errors={state?.fieldErrors?.summary} />
        </div>
        <fieldset>
          <legend className="label">Verdict</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { value: "APPROVE", label: "Approve" },
              { value: "REQUEST_CHANGES", label: "Request changes" },
            ].map((o) => (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="verdict"
                  value={o.value}
                  required
                  checked={verdict === o.value}
                  onChange={(e) => setVerdict(e.target.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
          <FieldError errors={state?.fieldErrors?.verdict} />
        </fieldset>
        <FormError message={state?.error} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="btn">
            {pending ? "Submitting…" : "Submit review"}
          </button>
          <p className="text-xs text-slate-500">Reviews can&apos;t be edited after submitting.</p>
        </div>
      </section>
    </form>
  );
}
