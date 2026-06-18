import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPostBySlug, getComments, countHearts, hasHearted } from "@/lib/db";
import { renderMarkdown, renderComment } from "@/lib/markdown";
import { formatDate, readingTime, parseTags } from "@/lib/format";
import { isAdmin, VISITOR_COOKIE } from "@/lib/auth";
import { HeartButton } from "@/components/HeartButton";
import { Comments } from "@/components/Comments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const admin = await isAdmin();
  if (!post || (!post.published && !admin)) notFound();

  const html = await renderMarkdown(post.content);

  const store = await cookies();
  const visitor = store.get(VISITOR_COOKIE)?.value ?? "";
  const heartCount = countHearts(post.id);
  const hearted = hasHearted(post.id, visitor);

  const comments = await Promise.all(
    getComments(post.id).map(async (c) => ({
      id: c.id,
      author: c.author,
      created_at: c.created_at,
      html: await renderComment(c.body),
    })),
  );

  const tags = parseTags(post.tags);

  return (
    <article className="page">
      <Link href="/" className="back-link">
        ← All posts
      </Link>

      <header className="article-header">
        {!post.published && (
          <p className="notice error">Draft — only you can see this while logged in.</p>
        )}
        <h1 className="article-title">{post.title}</h1>
        <div className="meta">
          <span>{formatDate(post.created_at)}</span>
          <span className="dot">·</span>
          <span>{readingTime(post.content)} min read</span>
          {tags.length > 0 && (
            <>
              <span className="dot">·</span>
              <span>{tags.join(", ")}</span>
            </>
          )}
        </div>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <HeartButton slug={post.slug} initialCount={heartCount} initialHearted={hearted} />

      <Comments slug={post.slug} initialComments={comments} isAdmin={admin} />
    </article>
  );
}
