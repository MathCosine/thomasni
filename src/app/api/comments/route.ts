import { NextResponse, type NextRequest } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import { addComment } from "@/lib/db";
import { renderComment } from "@/lib/markdown";
import { sameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!rateLimit(`comment:${clientIp(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "You are commenting too quickly." }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const honeypot = String(body.website ?? "").trim();
  const author = String(body.author ?? "").trim().slice(0, 80);
  const text = String(body.body ?? "").trim().slice(0, 5000);
  const slug = String(body.slug ?? "");

  if (!author || !text) {
    return NextResponse.json({ error: "Name and comment are both required." }, { status: 400 });
  }

  const post = getPostBySlug(slug);
  if (!post || post.draft) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  // A filled honeypot means a bot — accept quietly without storing anything.
  if (honeypot) return NextResponse.json({ ok: true, comment: null });

  const created = addComment(post.slug, author, text);
  const html = await renderComment(created.body);
  return NextResponse.json({
    ok: true,
    comment: { id: created.id, author: created.author, created_at: created.created_at, html },
  });
}
