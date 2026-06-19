import Link from "next/link";
import { siteConfig, withBase } from "@/config";

export function Header() {
  return (
    <header className="masthead">
      <Link href="/" className="wordmark">
        {siteConfig.title}
      </Link>
      <p className="tagline">{siteConfig.tagline}</p>
      <nav className="nav">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <a href={withBase("/rss.xml")}>RSS</a>
      </nav>
    </header>
  );
}
