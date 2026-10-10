"use client";

import { useId, useState } from "react";
import { site } from "@/data/site";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; stored: boolean }
  | { kind: "error"; message: string };

export function WaitlistForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState({ kind: "error", message: "That email doesn't look right. Check it and try again." });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState({ kind: "done", stored: Boolean(data.stored) });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Couldn't reach the server. Try again in a minute.",
      });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className="border-2 border-void p-4">
        <p className="display text-5xl">You&apos;re on the list.</p>
        <p className="mt-2">We&apos;ll email {email.trim()} before {site.nextDrop.name} opens.</p>
        {!state.stored && (
          <p className="mt-2 text-sm font-semibold">
            Preview build: signups aren&apos;t saved yet, so this one won&apos;t get an email.
          </p>
        )}
      </div>
    );
  }

  const error = state.kind === "error" ? state.message : null;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <label htmlFor={`${id}-email`} className="font-semibold">
        Email
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-12 flex-1 border-2 border-void bg-chalk px-4 text-void placeholder:text-dim-studio"
        />
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="min-h-12 border-2 border-void bg-void px-6 font-semibold text-chalk hover:bg-chalk hover:text-void disabled:opacity-70"
        >
          {state.kind === "sending" ? "Joining…" : `Get ${site.nextDrop.name} first`}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 bg-void px-3 py-2 text-sm font-semibold text-chalk">
          {error}
        </p>
      )}
    </form>
  );
}
