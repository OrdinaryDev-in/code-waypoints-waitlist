"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setPosition(data.position ?? null);
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setMessage("Network error — check your connection and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-md bg-accent" aria-hidden />
          <span className="font-semibold tracking-tight">CodeWaypoints</span>
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Private beta &middot; Autumn 2026
        </span>
      </header>

      <section className="flex-1 flex items-center px-6 sm:px-10">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-serif font-medium leading-tight mb-6">
            Any repository, turned into a course you can actually finish.
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Launching soon. One email from us when the doors open, and you
            can start indexing.
          </p>

          {status === "success" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
              <p className="font-semibold">
                You&apos;re in{position != null ? ` — #${position} in line` : ""}!
              </p>
              <p className="text-sm mt-1 text-emerald-300/80">
                Check your inbox for a confirmation link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <label htmlFor="name" className="sr-only">
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:hidden rounded-lg bg-panel border border-white/10 px-4 py-3 text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-accent"
              />
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@company.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg bg-panel border border-white/10 px-4 py-3 text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-ink hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-400 text-sm mt-3">{message}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/10 text-sm">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-accent mb-1">
                01 &middot; Submit
              </p>
              <p className="text-slate-400">
                Paste a GitHub URL. We check the licence, then read the repo
                end to end.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-accent mb-1">
                02 &middot; Chapters
              </p>
              <p className="text-slate-400">
                Seven to twenty chapters in dependency order, each tied to a
                real file.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-accent mb-1">
                03 &middot; Read
              </p>
              <p className="text-slate-400">
                Explanation on the left, source on the right, a short quiz at
                the end.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-6 sm:px-10 text-xs text-slate-500 border-t border-white/10">
        <span>No spam. One email, on launch day.</span>
        <div className="flex gap-4">
          <a href="https://twitter.com/codewaypoints" className="hover:text-slate-300">
            @codewaypoints
          </a>
          <a href="mailto:hello@codewaypoints.dev" className="hover:text-slate-300">
            hello@codewaypoints.dev
          </a>
        </div>
      </footer>
    </main>
  );
}
