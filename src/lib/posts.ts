import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { deriveExcerpt } from "./markdown";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO 8601
  tags: string[];
  content: string; // markdown body
  excerpt: string;
  draft: boolean;
}

function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((t) => String(t).trim()).filter(Boolean);
  if (typeof input === "string") return input.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function toIso(value: unknown, fallback: string): string {
  if (!value) return fallback;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

function readPost(file: string): Post | null {
  try {
    const full = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { data, content } = matter(raw);
    const slug = String(data.slug || file.replace(/\.md$/i, "")).trim();
    if (!slug) return null;
    const mtime = fs.statSync(full).mtime.toISOString();
    return {
      slug,
      title: String(data.title || slug).trim(),
      date: toIso(data.date, mtime),
      tags: normalizeTags(data.tags),
      content,
      excerpt: data.excerpt ? String(data.excerpt) : deriveExcerpt(content),
      draft: data.draft === true || String(data.draft).toLowerCase() === "true",
    };
  } catch {
    return null;
  }
}

/** Every post on disk, newest first. Files starting with "_" are ignored. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.md$/i.test(f) && !f.startsWith("_"))
    .map(readPost)
    .filter((p): p is Post => p !== null);
  return posts.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? 1 : -1,
  );
}

/** Posts shown publicly (drafts hidden). */
export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((p) => !p.draft);
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
