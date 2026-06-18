"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password.");
        setPending(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: "22rem", margin: "2rem auto" }}>
      <h1 className="article-title" style={{ fontSize: "1.8rem" }}>
        The writing desk
      </h1>
      <p className="lede">This area is for the author. Enter the password to continue.</p>
      <form onSubmit={submit}>
        {error && <div className="notice error">{error}</div>}
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
