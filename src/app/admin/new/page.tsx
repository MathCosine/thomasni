import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { Editor } from "@/components/Editor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin");
  return <Editor />;
}
