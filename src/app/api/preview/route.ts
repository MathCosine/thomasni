import { NextResponse, type NextRequest } from "next/server";
import { renderMarkdown } from "@/lib/markdown";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  let markdown = "";
  try {
    const body = await req.json();
    markdown = String(body.markdown ?? "");
  } catch {
    /* empty */
  }

  const html = await renderMarkdown(markdown);
  return NextResponse.json({ html });
}
