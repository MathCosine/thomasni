import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, createToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { rateLimit, sameOrigin, clientIp } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!rateLimit(`login:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    /* empty */
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
