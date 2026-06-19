import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { heartCounts, commentCounts } from "@/lib/db";
import { formatDate, readingTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Home() {
  const posts = getPublishedPosts();
  const hearts = heartCounts();
  const comments = commentCounts();

  return (
    <div className="page">
      {posts.length === 0 ? (
        <p className="lede">No posts yet. The first one is being written.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => {
            const h = hearts[p.slug] ?? 0;
            const c = comments[p.slug] ?? 0;
            return (
              <li className="entry" key={p.slug}>
                <h2 className="entry-title">
                  <Link href={`/posts/${p.slug}`}>{p.title}</Link>
                </h2>
                <div className="meta">
                  <span>{formatDate(p.date)}</span>
                  <span className="dot">·</span>
                  <span>{readingTime(p.content)} min read</span>
                  {h > 0 && (
                    <>
                      <span className="dot">·</span>
                      <span>♥ {h}</span>
                    </>
                  )}
                  {c > 0 && (
                    <>
                      <span className="dot">·</span>
                      <span>
                        {c} comment{c === 1 ? "" : "s"}
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
