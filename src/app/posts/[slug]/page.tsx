import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/format";
import { Giscus } from "@/components/Giscus";

// Pre-render one page per published post at build time (static export).
export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

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

  const html = await renderMarkdown(post.content);

  return (
    <article className="page">
      <Link href="/" className="back-link">
        ← All posts
      </Link>

      <header className="article-header">
        {post.draft && <p className="notice error">Draft — hidden from the published site.</p>}
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

      <Giscus />
    </article>
  );
}
