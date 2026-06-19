import type { Metadata } from "next";
import Link from "next/link";
import { withBase } from "@/config";

export const metadata: Metadata = {
  title: "About",
  description: "About MathCosine.",
};

export default function AboutPage() {
  return (
    <div className="page">
      <Link href="/" className="back-link">
        ← All posts
      </Link>
      <h1 className="article-title">About</h1>
      <div className="prose">
        <p>
          <strong>MathCosine</strong> is a personal notebook kept in the open — a place for
          mathematics, problem-solving, and whatever happens to be on my mind. Posts range from
          one-line observations to longer essays, and everything is written in plain prose with
          LaTeX where the mathematics deserves it.
        </p>
        <p>
          The writing here is meant to be read slowly. If a post is useful, leave a reaction; if it
          is wrong, or could be said better, the comments are open — and you are welcome to write
          mathematics there too.
        </p>
        <p>
          You can subscribe via the <a href={withBase("/rss.xml")}>RSS feed</a>.
        </p>
      </div>
    </div>
  );
}
