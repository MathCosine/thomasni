"use client";

import { useState } from "react";

interface Props {
  slug: string;
  initialCount: number;
  initialHearted: boolean;
}

export function HeartButton({ slug, initialCount, initialHearted }: Props) {
  const [count, setCount] = useState(initialCount);
  const [hearted, setHearted] = useState(initialHearted);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/hearts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = (await res.json()) as { count: number; hearted: boolean };
        setCount(data.count);
        setHearted(data.hearted);
      }
    } catch {
      /* ignore network hiccups */
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="heartbar">
      <button
        type="button"
        className={`heart-btn${hearted ? " active" : ""}`}
        onClick={toggle}
        disabled={pending}
        aria-pressed={hearted}
        aria-label={hearted ? "Remove heart" : "Add a heart"}
      >
        <span className="glyph" aria-hidden="true">
          {hearted ? "♥" : "♡"}
        </span>
        <span>{count}</span>
      </button>
      <span className="hint">{hearted ? "Thank you." : "Did this help?"}</span>
    </div>
  );
}
