"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "../actions";
import { FieldError, FormError } from "@/components/FormError";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <h2 className="text-lg font-semibold">Log in</h2>
      <FormError message={state?.error} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
