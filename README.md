# MathCosine

A clean, scholarly blog — in the spirit of academic math blogs like Evan Chen's.
Narrow serif column, centred LaTeX, and nothing in the way of the writing.

- **Read:** a quiet home page of posts, each with full LaTeX rendering.
- **React:** readers can leave a **heart** and write **comments** (Markdown + `$LaTeX$` allowed).
- **Write:** posts are plain **Markdown files in `content/posts/`**. Add a file, commit it,
  and it appears on the site — no login, no database for content.

Built with Next.js (App Router), KaTeX, and a hand-written stylesheet (no UI framework).
Hearts and comments are the only dynamic data, stored in a small SQLite file.

---

## Writing a post

A post is one Markdown file in [`content/posts/`](content/posts) with a little
front matter at the top:

```markdown
---
title: A cosine identity worth keeping
date: 2026-06-17
tags: trigonometry, problem-solving
# draft: true   # optional — hides it from the site
---
Your post body, in Markdown.

Inline math like $a^2 + b^2 = c^2$, and a centred display equation:

$$\int_0^1 x^2 \, dx = \frac{1}{3}.$$
```

- The **file name becomes the URL**: `content/posts/my-note.md` → `/posts/my-note`.
- `date` controls ordering and the displayed date. `tags` is optional (comma separated).
- Add `draft: true` to keep a file in the repo without publishing it.
- See [`content/posts/_TEMPLATE.md`](content/posts/_TEMPLATE.md) (files starting
  with `_` are ignored).

**To publish:** commit the new file and push. Once the host redeploys (or pulls the
new commit), the post is live — no build step to babysit and no admin screen.

> Working with Claude Code? Just hand over the post (a `.md` file, or the title and
> body) and ask it to add the file to `content/posts/` and commit it.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional; sensible defaults work for local dev
npm run dev               # http://localhost:3000
```

### Environment variables

| Variable        | Purpose                                                         |
| --------------- | -------------------------------------------------------------- |
| `SITE_URL`      | Public base URL (used by the RSS feed and canonical links).    |
| `DATABASE_PATH` | Optional. Where the hearts/comments SQLite file lives (default `./data/blog.db`). |

---

## How it works

- **Content** is read from the Markdown files in `content/posts/` at request time, so
  a new commit shows up as soon as it is deployed. Front matter is parsed with `gray-matter`.
- **LaTeX** renders with KaTeX through a `remark` → `rehype` pipeline. Inline math uses
  `$…$`; a whole equation on its own line in `$$…$$` is centred. The same pipeline renders
  posts and comments.
- **Sanitisation:** all rendered HTML passes through `rehype-sanitize`, and KaTeX runs with
  `trust: false`, so reader comments can include mathematics without opening an XSS hole.
- **Hearts & comments** live in SQLite (`./data/blog.db`), keyed by the post's slug.
  Mutating endpoints check the request origin, apply rate limits, and screen a honeypot field.

### Project layout

```
content/posts/        Your posts — one Markdown file each (this is what you edit)
src/app/              Routes: home, posts/[slug], about, api/{hearts,comments}, rss.xml
src/components/        Header, Footer, HeartButton, Comments
src/lib/              posts (file reader), db (hearts/comments), markdown/LaTeX, helpers
```

---

## Deployment

Posts are static files, but hearts and comments need a writable SQLite file, so deploy to a
host that runs Node and keeps a persistent disk — e.g. Railway, Render, Fly.io, or a small VPS.
Connect it to this repo so each push redeploys.

```bash
npm run build
npm start
```

Set `SITE_URL` in the host's environment, and point `DATABASE_PATH` at the persistent volume.

> **Serverless note:** platforms with an ephemeral/read-only filesystem (e.g. Vercel) won't
> persist the SQLite file between requests. The posts would still render fine there; to keep
> hearts/comments, swap the storage in `src/lib/db.ts` for a hosted database (Turso/libSQL or
> Postgres). Everything else is unaffected.

The SQLite files (`*.db`) and `.env` are git-ignored and never committed.
