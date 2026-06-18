import { NextResponse, type NextRequest } from "next/server";
import { getPostById, updatePost, deletePost, uniqueSlug } from "@/lib/db";
import { deriveExcerpt } from "@/lib/markdown";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  const existing = getPostById(postId);
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "");
  if (!title) return NextResponse.json({ error: "A title is required." }, { status: 400 });

  const slug = uniqueSlug(slugify(String(body.slug ?? "") || title), postId);
  const tags = String(body.tags ?? "").trim();
  const published = body.published ? 1 : 0;

  const post = updatePost(postId, {
    slug,
    title,
    content,
    excerpt: deriveExcerpt(content),
    tags,
    published,
  });

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  deletePost(Number(id));
  return NextResponse.json({ ok: true });
}
