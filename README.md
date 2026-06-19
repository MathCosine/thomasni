# MathCosine

A clean, scholarly blog — in the spirit of academic math blogs like Evan Chen's.
Narrow serif column, centred LaTeX, and nothing in the way of the writing.

It is a **static site**: posts are Markdown files, the pages and all the LaTeX are
pre-rendered at build time, and it deploys to **GitHub Pages** automatically on every push.
Comments and ❤️ reactions are provided by **Giscus** (GitHub Discussions).

- **Read:** a quiet home page of posts, each with full LaTeX rendering.
- **React & discuss:** Giscus gives every post a reaction bar and threaded comments.
- **Write:** add a Markdown file to `content/posts/`, commit, and push — that's the whole flow.

Built with Next.js (App Router, static export), KaTeX, and a hand-written stylesheet.

---

## Writing a post

A post is one Markdown file in [`content/posts/`](content/posts) with a little
front matter at the top:

```markdown
---
title: A cosine identity worth keeping
date: 2026-06-17
tags: trigonometry, problem-solving
# draft: true   # optional — keeps it out of the published site
---
Your post body, in Markdown.

Inline math like $a^2 + b^2 = c^2$, and a centred display equation:

$$\int_0^1 x^2 \, dx = \frac{1}{3}.$$
```

- The **file name becomes the URL**: `content/posts/my-note.md` → `/posts/my-note`.
- `date` controls ordering and the displayed date; `tags` is optional (comma separated).
- Add `draft: true` to keep a file in the repo without publishing it.
- See [`content/posts/_TEMPLATE.md`](content/posts/_TEMPLATE.md) (files starting with `_` are ignored).

**To publish:** commit the file and push to `main`. The GitHub Action rebuilds and
redeploys the site — no build step to run by hand, no admin screen.

> Working with Claude Code? Just hand over the post (a `.md` file, or the title and
> body) and ask it to add the file to `content/posts/` and commit it.

---

## Deploying to GitHub Pages (one-time setup)

1. Push this repo to GitHub (public repo, so Pages is free).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually). The site
   builds and publishes to `https://<user>.github.io/<repo>/`.

The workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) figures out
the correct base path and site URL for you via `actions/configure-pages`.

### Turning on comments & reactions (Giscus)

1. Make sure the repo is public and **Discussions** is enabled (Settings → General → Features).
2. Install the **giscus** GitHub App on the repo: <https://github.com/apps/giscus>.
3. Go to <https://giscus.app>, enter your repo, and copy the four values it gives you:
   `repo`, `repo-id`, `category`, `category-id`.
4. Paste them into [`src/config.ts`](src/config.ts) (the `giscus` block), **or** add them as
   repository **Variables** named `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`,
   `GISCUS_CATEGORY_ID`.

Until that's done, posts show a small "comments aren't set up yet" note instead of the widget.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:3000

# or build the static site exactly as Pages will, and preview it:
npm run build      # outputs ./out  (and generates public/rss.xml)
npm run preview    # serves ./out
```

---

## How it works

- **Content** is read from `content/posts/*.md` at build time (front matter parsed with
  `gray-matter`). Each published post is pre-rendered to a static HTML page.
- **LaTeX** renders with KaTeX through a `remark` → `rehype` pipeline. Inline math uses `$…$`;
  a whole equation on its own line in `$$…$$` is centred. The HTML is sanitised with
  `rehype-sanitize`, and KaTeX runs with `trust: false`.
- **Comments & reactions** are Giscus, backed by GitHub Discussions — no server or database.
- **The feed** (`/rss.xml`) is generated from the posts by `scripts/build-feed.mjs` during the build.

### Project layout

```
content/posts/         Your posts — one Markdown file each (this is what you edit)
src/app/               Routes: home, posts/[slug], about
src/components/         Header, Footer, Giscus
src/lib/               posts (file reader), markdown/LaTeX, formatting helpers
src/config.ts          Site title/tagline + Giscus settings
scripts/build-feed.mjs RSS generator (runs in `npm run build`)
.github/workflows/     GitHub Pages deploy
```
