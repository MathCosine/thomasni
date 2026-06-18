# MathCosine

A clean, scholarly blog — in the spirit of academic math blogs like Evan Chen's.
Narrow serif column, centred LaTeX, and nothing in the way of the writing.

- **Read:** a quiet home page of posts, each with full LaTeX rendering.
- **React:** readers can leave a **heart** and write **comments** (Markdown + `$LaTeX$` allowed).
- **Write:** scroll to the footer and follow **✎ Write** into a password-protected
  author area with a live, two-pane Markdown/LaTeX editor.

Built with Next.js (App Router), SQLite, KaTeX, and a hand-written stylesheet — no UI framework.

---

## Quick start

```bash
npm install
cp .env.example .env      # then edit the values (see below)
npm run dev               # http://localhost:3000
```

Open the site, scroll to the bottom, click **✎ Write**, and sign in with your
`ADMIN_PASSWORD` to start posting.

### Environment variables

| Variable         | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `ADMIN_PASSWORD` | Password for the author area. **Required** to be able to log in. |
| `SESSION_SECRET` | Long random string used to sign the admin session cookie.      |
| `SITE_URL`       | Public base URL (used by the RSS feed and canonical links).    |
| `DATABASE_PATH`  | Optional. Override the SQLite file location (default `./data/blog.db`). |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## How it works

- **Content & data** live in a single SQLite database (`./data/blog.db` by default),
  created and seeded automatically on first run. Posts, hearts, and comments are all stored there.
- **LaTeX** is rendered with KaTeX through a `remark` → `rehype` pipeline. Inline math
  uses `$…$`; display math uses `$$…$$` and is centred. The same pipeline renders posts,
  comments, and the editor preview, so the preview is faithful.
- **Sanitisation:** all rendered HTML passes through `rehype-sanitize`, and KaTeX runs
  with `trust: false`, so reader comments can include mathematics without opening an XSS hole.
- **Auth** is a single shared password (`ADMIN_PASSWORD`) and a signed, HTTP-only session
  cookie. Mutating endpoints check the session, the request origin, and basic rate limits.

### Project layout

```
content/seed/         Markdown for the starter posts (seeded on first run)
src/app/              Routes: home, posts/[slug], about, admin, api/*, rss.xml
src/components/        Header, Footer, HeartButton, Comments, Editor, admin controls
src/lib/              db (SQLite), auth, markdown/LaTeX, formatting, security helpers
```

---

## Writing posts

1. Scroll to the footer and click **✎ Write** (or go to `/admin`).
2. Sign in with `ADMIN_PASSWORD`.
3. **New post** → write Markdown with LaTeX on the left, watch the live preview on the right.
4. Tick **Published** when ready, or leave it unticked to keep a private draft
   (drafts are visible only while you are signed in).

Comments can be moderated (deleted) inline on each post while signed in.

---

## Deployment

This is a dynamic app with a writable database, so it wants a host that keeps a
persistent disk and runs Node — e.g. Railway, Render, Fly.io, or a small VPS.

```bash
npm run build
npm start
```

Set `ADMIN_PASSWORD`, `SESSION_SECRET`, and `SITE_URL` in the host's environment,
and point `DATABASE_PATH` at a path on the persistent volume.

> **Serverless note:** platforms with an ephemeral/read-only filesystem (e.g. Vercel)
> won't persist a local SQLite file between requests. To deploy there, swap the storage
> in `src/lib/db.ts` for a hosted database (Turso/libSQL or Postgres) — the rest of the
> app is unaffected.

The SQLite files (`*.db`) and `.env` are git-ignored and never committed.
