import { NextResponse, type NextRequest } from "next/server";
import { getPostBySlug, toggleHeart } from "@/lib/db";
import { VISITOR_COOKIE, newVisitorId } from "@/lib/auth";
import { sameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!rateLimit(`heart:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Slow down." }, { status: 429 });
  }

  let slug = "";
  try {
    const body = await req.json();
    slug = String(body.slug ?? "");
  } catch {
    /* empty */
  }

  const post = getPostBySlug(slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let visitor = req.cookies.get(VISITOR_COOKIE)?.value ?? "";
  let setCookie = false;
  if (!visitor) {
    visitor = newVisitorId();
    setCookie = true;
  }

  const result = toggleHeart(post.id, visitor);
  const res = NextResponse.json(result);
  if (setCookie) {
    res.cookies.set(VISITOR_COOKIE, visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
