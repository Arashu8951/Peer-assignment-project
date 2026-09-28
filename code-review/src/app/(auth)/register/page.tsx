"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "../actions";
import { FieldError, FormError } from "@/components/FormError";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <h2 className="text-lg font-semibold">Create an account</h2>
      <FormError message={state?.error} />
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" autoComplete="name" required className="input" />
        <FieldError errors={state?.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link>
      </p>
    </form>
  );
}
