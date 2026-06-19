"use client";

import { useState, type FormEvent } from "react";
import { formatDate } from "@/lib/format";

export interface RenderedComment {
  id: number;
  author: string;
  created_at: string;
  html: string;
}

interface Props {
  slug: string;
  initialComments: RenderedComment[];
}

export function Comments({ slug, initialComments }: Props) {
  const [comments, setComments] = useState<RenderedComment[]>(initialComments);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, author, body, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", msg: data.error || "Could not post your comment." });
      } else {
        if (data.comment) setComments((cs) => [...cs, data.comment as RenderedComment]);
        setBody("");
        setStatus({ type: "ok", msg: "Posted — thank you for writing." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="comments" id="comments">
      <h2 className="section-label">
        {comments.length} comment{comments.length === 1 ? "" : "s"}
      </h2>

      {comments.length === 0 && <p className="comment-empty">No comments yet — be the first.</p>}

      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <div>
            <span className="who">{c.author}</span>
            <span className="when">{formatDate(c.created_at)}</span>
          </div>
          <div className="body" dangerouslySetInnerHTML={{ __html: c.html }} />
        </div>
      ))}

      <form onSubmit={submit}>
        <h3 className="section-label" style={{ marginTop: "2.4rem" }}>
          Leave a comment
        </h3>
        {status && <div className={`notice ${status.type}`}>{status.msg}</div>}

        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input
            id="c-name"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={80}
            required
          />
        </div>

        {/* Honeypot: real people leave this empty. */}
        <input
          className="honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Leave this field empty"
        />

        <div className="field">
          <label htmlFor="c-body">
            Comment{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--muted)" }}>
              — Markdown &amp; $LaTeX$ welcome
            </span>
          </label>
          <textarea
            id="c-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            required
          />
        </div>

        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
