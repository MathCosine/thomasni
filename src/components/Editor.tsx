"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

export interface EditorPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string;
  published: number;
}

export function Editor({ post }: { post?: EditorPost }) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [tags, setTags] = useState(post?.tags ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(!!post?.published);
  const [previewHtml, setPreviewHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Debounced live preview that goes through the exact publishing pipeline,
  // so what you see is what readers will get.
  useEffect(() => {
    const handle = setTimeout(async () => {
      const myId = ++reqId.current;
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: content }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (myId === reqId.current) setPreviewHtml(data.html ?? "");
      } catch {
        /* keep last good preview */
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [content]);

  function onTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(isEdit ? `/api/posts/${post!.id}` : "/api/posts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content, tags, published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save the post.");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form className="page wide" onSubmit={save}>
      <a className="back-link" href="/admin">
        ← Back to desk
      </a>
      <h1 className="article-title" style={{ fontSize: "1.8rem" }}>
        {isEdit ? "Edit post" : "New post"}
      </h1>
      {error && <div className="notice error">{error}</div>}

      <div className="row">
        <div className="field" style={{ flex: "2 1 18rem" }}>
          <label htmlFor="e-title">Title</label>
          <input
            id="e-title"
            type="text"
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="e-slug">Slug</label>
          <input
            id="e-slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="e-tags">
          Tags{" "}
          <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--muted)" }}>
            — comma separated
          </span>
        </label>
        <input
          id="e-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. number theory, olympiad"
        />
      </div>

      <div className="editor">
        <div>
          <div className="pane-label">Markdown &amp; LaTeX</div>
          <textarea
            className="body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"Write here.\n\nInline math with $…$, display math with $$…$$ (centred)."}
          />
        </div>
        <div>
          <div className="pane-label">Preview</div>
          <div
            className="preview prose"
            dangerouslySetInnerHTML={{
              __html:
                previewHtml ||
                "<p style='color:var(--muted);font-style:italic'>Nothing to preview yet.</p>",
            }}
          />
        </div>
      </div>

      <div className="editor-actions">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />{" "}
          Published
        </label>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </button>
        <a className="btn secondary" href="/admin">
          Cancel
        </a>
      </div>
    </form>
  );
}
