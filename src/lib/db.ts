import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Posts live as Markdown files in /content/posts (see src/lib/posts.ts).
// This database only holds the dynamic reader interactions — hearts and
// comments — keyed by a post's slug.

export interface Comment {
  id: number;
  slug: string;
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS hearts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL,
      visitor     TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      UNIQUE(slug, visitor)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL,
      author      TEXT NOT NULL,
      body        TEXT NOT NULL,
      created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hearts_slug ON hearts(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
  `);
}

function getDb(): Database.Database {
  if (globalThis.__mcDb) return globalThis.__mcDb;
  const db = new Database(resolveDbPath());
  migrate(db);
  globalThis.__mcDb = db;
  return db;
}

/* ----------------------------- Hearts ----------------------------- */

export function countHearts(slug: string): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM hearts WHERE slug = ?").get(slug) as {
    n: number;
  };
  return row.n;
}

export function hasHearted(slug: string, visitor: string): boolean {
  if (!visitor) return false;
  return !!getDb().prepare("SELECT 1 FROM hearts WHERE slug = ? AND visitor = ?").get(slug, visitor);
}

export function toggleHeart(slug: string, visitor: string): { count: number; hearted: boolean } {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM hearts WHERE slug = ? AND visitor = ?")
    .get(slug, visitor) as { id: number } | undefined;
  if (existing) {
    db.prepare("DELETE FROM hearts WHERE id = ?").run(existing.id);
    return { count: countHearts(slug), hearted: false };
  }
  db.prepare("INSERT INTO hearts (slug, visitor, created_at) VALUES (?, ?, ?)").run(
    slug,
    visitor,
    new Date().toISOString(),
  );
  return { count: countHearts(slug), hearted: true };
}

/** Heart counts for every slug at once, for list views. */
export function heartCounts(): Record<string, number> {
  const rows = getDb().prepare("SELECT slug, COUNT(*) AS n FROM hearts GROUP BY slug").all() as {
    slug: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.slug, r.n]));
}

/* ---------------------------- Comments ---------------------------- */

export function getComments(slug: string): Comment[] {
  return getDb()
    .prepare("SELECT * FROM comments WHERE slug = ? ORDER BY created_at ASC")
    .all(slug) as Comment[];
}

export function addComment(slug: string, author: string, body: string): Comment {
  const info = getDb()
    .prepare("INSERT INTO comments (slug, author, body, created_at) VALUES (?, ?, ?, ?)")
    .run(slug, author, body, new Date().toISOString());
  return getDb()
    .prepare("SELECT * FROM comments WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Comment;
}

export function commentCounts(): Record<string, number> {
  const rows = getDb().prepare("SELECT slug, COUNT(*) AS n FROM comments GROUP BY slug").all() as {
    slug: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.slug, r.n]));
}
