"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginAction } from "@/app/desk/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="h-11 w-full rounded-lg bg-paper px-3 shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-bad" role="alert">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink font-medium text-[#efe9de] transition-colors hover:bg-ink-3 disabled:opacity-60"
      >
        <Lock className="h-4 w-4" /> {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
