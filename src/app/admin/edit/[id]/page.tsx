import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/db";
import { Editor } from "@/components/Editor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) notFound();

  return (
    <Editor
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        tags: post.tags,
        published: post.published,
      }}
    />
  );
}
