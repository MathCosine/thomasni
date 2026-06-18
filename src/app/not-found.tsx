import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1 className="article-title">Not found</h1>
      <p className="prose">
        That page does not exist — perhaps it was a draft, or the link has gone stale.
      </p>
      <p>
        <Link href="/" className="back-link">
          ← Back to all posts
        </Link>
      </p>
    </div>
  );
}
