import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { deriveExcerpt } from "./markdown";
import { loadSeedPosts } from "./seed";

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithCounts extends Post {
  heart_count: number;
  comment_count: number;
}

export interface Comment {
  id: number;
  post_id: number;
  author: string;
  body: string;
  created_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __mcDb: Database.Database | undefined;
}

function resolveDbPath(): string {
  const custom = process.env.DATABASE_PATH;
  if (custom) {
    const dir = path.dirname(custom);
    if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return custom;
  }
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "blog.db");
}

function migrate(db: Database.Database): void {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      excerpt     TEXT NOT NULL DEFAULT '',
      tags        TEXT NOT NULL DEFAULT '',
      published   INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hearts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      visitor     TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      UNIQUE(post_id, visitor)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author      TEXT NOT NULL,
      body        TEXT NOT NULL,
      created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hearts_post ON hearts(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
  `);
}

function seedIfEmpty(db: Database.Database): void {
  const row = db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number };
  if (row.n > 0) return;
  const insert = db.prepare(
    `INSERT INTO posts (slug, title, content, excerpt, tags, published, created_at, updated_at)
     VALUES (@slug, @title, @content, @excerpt, @tags, 1, @created, @created)`,
  );
  const tx = db.transaction((posts: ReturnType<typeof loadSeedPosts>) => {
    for (const p of posts) {
      insert.run({
        slug: p.slug,
        title: p.title,
        content: p.body,
        excerpt: deriveExcerpt(p.body),
        tags: p.tags,
        created: p.created,
      });
    }
  });
  tx(loadSeedPosts());
}

/** Lazily open (and migrate/seed) the database on first use. Deferring this
 *  keeps the native binding from loading during build/prerender passes. */
function getDb(): Database.Database {
  if (globalThis.__mcDb) return globalThis.__mcDb;
  const db = new Database(resolveDbPath());
  migrate(db);
  seedIfEmpty(db);
  globalThis.__mcDb = db;
  return db;
}

/* ----------------------------- Posts ----------------------------- */

const WITH_COUNTS = `
  SELECT p.*,
    (SELECT COUNT(*) FROM hearts h   WHERE h.post_id = p.id) AS heart_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
  FROM posts p`;

export function getPublishedPosts(): PostWithCounts[] {
  return getDb()
    .prepare(`${WITH_COUNTS} WHERE p.published = 1 ORDER BY p.created_at DESC`)
    .all() as PostWithCounts[];
}

export function getAllPosts(): PostWithCounts[] {
  return getDb().prepare(`${WITH_COUNTS} ORDER BY p.created_at DESC`).all() as PostWithCounts[];
}

export function getPostBySlug(slug: string): Post | undefined {
  return getDb().prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as Post | undefined;
}

export function getPostById(id: number): Post | undefined {
  return getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post | undefined;
}

export function slugExists(slug: string, exceptId?: number): boolean {
  const db = getDb();
  const row = exceptId
    ? db.prepare("SELECT id FROM posts WHERE slug = ? AND id <> ?").get(slug, exceptId)
    : db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
  return !!row;
}

/** Append -2, -3, … until the slug is unique. */
export function uniqueSlug(base: string, exceptId?: number): string {
  let slug = base;
  let n = 2;
  while (slugExists(slug, exceptId)) slug = `${base}-${n++}`;
  return slug;
}

export interface PostInput {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  published: number;
}

export function createPost(input: PostInput): Post {
  const now = new Date().toISOString();
  const info = getDb()
    .prepare(
      `INSERT INTO posts (slug, title, content, excerpt, tags, published, created_at, updated_at)
       VALUES (@slug, @title, @content, @excerpt, @tags, @published, @now, @now)`,
    )
    .run({ ...input, now });
  return getPostById(Number(info.lastInsertRowid))!;
}

export function updatePost(id: number, input: PostInput): Post | undefined {
  getDb()
    .prepare(
      `UPDATE posts
         SET slug = @slug, title = @title, content = @content, excerpt = @excerpt,
             tags = @tags, published = @published, updated_at = @now
       WHERE id = @id`,
    )
    .run({ ...input, id, now: new Date().toISOString() });
  return getPostById(id);
}

export function deletePost(id: number): void {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/* ----------------------------- Hearts ----------------------------- */

export function countHearts(postId: number): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM hearts WHERE post_id = ?")
    .get(postId) as { n: number };
  return row.n;
}

export function hasHearted(postId: number, visitor: string): boolean {
  if (!visitor) return false;
  const row = getDb()
    .prepare("SELECT id FROM hearts WHERE post_id = ? AND visitor = ?")
    .get(postId, visitor);
  return !!row;
}

export function toggleHeart(postId: number, visitor: string): { count: number; hearted: boolean } {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM hearts WHERE post_id = ? AND visitor = ?")
    .get(postId, visitor) as { id: number } | undefined;
  if (existing) {
    db.prepare("DELETE FROM hearts WHERE id = ?").run(existing.id);
    return { count: countHearts(postId), hearted: false };
  }
  db.prepare("INSERT INTO hearts (post_id, visitor, created_at) VALUES (?, ?, ?)").run(
    postId,
    visitor,
    new Date().toISOString(),
  );
  return { count: countHearts(postId), hearted: true };
}

/* ---------------------------- Comments ---------------------------- */

export function getComments(postId: number): Comment[] {
  return getDb()
    .prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC")
    .all(postId) as Comment[];
}

export function addComment(postId: number, author: string, body: string): Comment {
  const info = getDb()
    .prepare("INSERT INTO comments (post_id, author, body, created_at) VALUES (?, ?, ?, ?)")
    .run(postId, author, body, new Date().toISOString());
  return getDb()
    .prepare("SELECT * FROM comments WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Comment;
}

export function deleteComment(id: number): void {
  getDb().prepare("DELETE FROM comments WHERE id = ?").run(id);
}
