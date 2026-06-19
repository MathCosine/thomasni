import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="inner">
        <span>© {year} MathCosine</span>
        <Link href="/rss.xml" className="write-link">
          RSS
        </Link>
      </div>
    </footer>
  );
}
