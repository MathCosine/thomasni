import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPostBySlug } from "@/lib/posts";
import { getComments, countHearts, hasHearted } from "@/lib/db";
import { renderMarkdown, renderComment } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/format";
import { VISITOR_COOKIE } from "@/lib/visitor";
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
  if (!post) notFound();
  // Drafts are previewable locally but hidden in production.
  if (post.draft && process.env.NODE_ENV === "production") notFound();

  const html = await renderMarkdown(post.content);

  const store = await cookies();
  const visitor = store.get(VISITOR_COOKIE)?.value ?? "";
  const heartCount = countHearts(post.slug);
  const hearted = hasHearted(post.slug, visitor);

  const comments = await Promise.all(
    getComments(post.slug).map(async (c) => ({
      id: c.id,
      author: c.author,
      created_at: c.created_at,
      html: await renderComment(c.body),
    })),
  );

  return (
    <article className="page">
      <Link href="/" className="back-link">
        ← All posts
      </Link>

      <header className="article-header">
        {post.draft && <p className="notice error">Draft — hidden from the site in production.</p>}
        <h1 className="article-title">{post.title}</h1>
        <div className="meta">
          <span>{formatDate(post.date)}</span>
          <span className="dot">·</span>
          <span>{readingTime(post.content)} min read</span>
          {post.tags.length > 0 && (
            <>
              <span className="dot">·</span>
              <span>{post.tags.join(", ")}</span>
            </>
          )}
        </div>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <HeartButton slug={post.slug} initialCount={heartCount} initialHearted={hearted} />

      <Comments slug={post.slug} initialComments={comments} />
    </article>
  );
}
