import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate, readingTime } from "@/lib/format";

export default function Home() {
  const posts = getPublishedPosts();

  return (
    <div className="page">
      {posts.length === 0 ? (
        <p className="lede">No posts yet. The first one is being written.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => (
            <li className="entry" key={p.slug}>
              <h2 className="entry-title">
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h2>
              <div className="meta">
                <span>{formatDate(p.date)}</span>
                <span className="dot">·</span>
                <span>{readingTime(p.content)} min read</span>
                {p.tags.length > 0 && (
                  <>
                    <span className="dot">·</span>
                    <span>{p.tags.join(", ")}</span>
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
