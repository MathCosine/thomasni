import { NextResponse, type NextRequest } from "next/server";
import { createPost, uniqueSlug } from "@/lib/db";
import { deriveExcerpt } from "@/lib/markdown";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "");
  if (!title) return NextResponse.json({ error: "A title is required." }, { status: 400 });

  const slug = uniqueSlug(slugify(String(body.slug ?? "") || title));
  const tags = String(body.tags ?? "").trim();
  const published = body.published ? 1 : 0;

  const post = createPost({
    slug,
    title,
    content,
    excerpt: deriveExcerpt(content),
    tags,
    published,
  });

  return NextResponse.json({ ok: true, post });
}
