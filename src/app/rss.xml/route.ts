import { getPublishedPosts } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export async function GET() {
  const site = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const posts = getPublishedPosts();

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${site}/posts/${p.slug}</link>
      <guid isPermaLink="true">${site}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MathCosine</title>
    <link>${site}</link>
    <description>Notes on mathematics, problem-solving, and the occasional digression.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
