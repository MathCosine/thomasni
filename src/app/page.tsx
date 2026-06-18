import Link from "next/link";
import { getPublishedPosts } from "@/lib/db";
import { formatDate, readingTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Home() {
  const posts = getPublishedPosts();

  return (
    <div className="page">
      {posts.length === 0 ? (
        <p className="lede">No posts yet. The first one is being written.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => (
            <li className="entry" key={p.id}>
              <h2 className="entry-title">
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h2>
              <div className="meta">
                <span>{formatDate(p.created_at)}</span>
                <span className="dot">·</span>
                <span>{readingTime(p.content)} min read</span>
                {p.heart_count > 0 && (
                  <>
                    <span className="dot">·</span>
                    <span>♥ {p.heart_count}</span>
                  </>
                )}
                {p.comment_count > 0 && (
                  <>
                    <span className="dot">·</span>
                    <span>
                      {p.comment_count} comment{p.comment_count === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </div>
              <p className="entry-excerpt">
                {p.excerpt}{" "}
                <Link className="read-more" href={`/posts/${p.slug}`}>
                  Read →
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
