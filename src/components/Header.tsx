import Link from "next/link";

export function Header() {
  return (
    <header className="masthead">
      <Link href="/" className="wordmark">
        MathCosine
      </Link>
      <p className="tagline">Notes on mathematics &amp; problem-solving</p>
      <nav className="nav">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/rss.xml">RSS</Link>
      </nav>
    </header>
  );
}
