// Generates public/rss.xml from the Markdown files in content/posts before the
// static export. Runs as part of `npm run build`.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT = path.join(PUBLIC_DIR, "rss.xml");
const SITE = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

function esc(s) {
  return String(s).replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c],
  );
}

function excerpt(md, max = 240) {
  const t = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t;
}

const posts = (fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : [])
  .filter((f) => /\.md$/i.test(f) && !f.startsWith("_"))
  .map((f) => {
    const full = path.join(POSTS_DIR, f);
    const { data, content } = matter(fs.readFileSync(full, "utf8"));
    const slug = String(data.slug || f.replace(/\.md$/i, "")).trim();
    const draft = data.draft === true || String(data.draft).toLowerCase() === "true";
    const parsed = data.date ? new Date(data.date) : fs.statSync(full).mtime;
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return {
      slug,
      title: String(data.title || slug),
      date,
      draft,
      excerpt: data.excerpt ? String(data.excerpt) : excerpt(content),
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => b.date - a.date);

const items = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/posts/${p.slug}/</link>
      <guid isPermaLink="true">${SITE}/posts/${p.slug}/</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MathCosine</title>
    <link>${SITE}/</link>
    <description>Notes on mathematics, problem-solving, and the occasional digression.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(OUT, xml);
console.log(`build-feed: wrote ${path.relative(ROOT, OUT)} (${posts.length} posts)`);
