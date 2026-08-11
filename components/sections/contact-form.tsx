"use client";

import { useState } from "react";

// ponytail: no backend. The form composes a mailto and hands off to the reader's mail client
// — the inbox on the other end is a Gmail address either way, and a real POST route needs the
// Resend key that doesn't exist yet (Architecture.md; "real form backend" is deferred in
// SITE-MAP.md). Swap `onSubmit` for a fetch to /api/contact when the key lands; the markup,
// the validation and the states below don't change.
const MAIL = "climbxdigital@gmail.com";

const FIELD =
  "w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-base text-ink outline-none transition-colors duration-200 placeholder:text-ink/35 focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-brand";
const LABEL = "font-accent text-xs uppercase tracking-[0.2em] text-ink/45";

const budgets = ["Under ₹1L / month", "₹1L – ₹3L / month", "₹3L – ₹8L / month", "₹8L+ / month", "Not sure yet"];

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const body = [
      `Name: ${g("name")}`,
      `Email: ${g("email")}`,
      g("company") && `Company: ${g("company")}`,
      g("budget") && `Budget: ${g("budget")}`,
      "",
      g("message"),
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(
      `New enquiry — ${g("name")}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Name</span>
          <input name="name" required autoComplete="name" placeholder="Your name" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Company</span>
          <input
            name="company"
            autoComplete="organization"
            placeholder="Optional"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Monthly budget</span>
          <select name="budget" defaultValue="" className={FIELD}>
            <option value="">Optional</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>What are you trying to move?</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="The number that isn't moving, and what you've already tried."
          className={`${FIELD} resize-y`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          data-cursor="button"
          className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 font-accent text-base font-medium text-white transition-colors duration-300 ease-out hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98]"
        >
          Start the climb
        </button>
        {/* polite, not assertive: the reader is mid-handoff to their mail client */}
        <p aria-live="polite" className="text-sm text-graphite">
          {sent
            ? `Your mail app should be open with it drafted — if not, write to ${MAIL}.`
            : ""}
        </p>
      </div>
    </form>
  );
}
