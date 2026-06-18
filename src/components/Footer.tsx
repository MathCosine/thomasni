import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="inner">
        <span>© {year} MathCosine</span>
        {/* Quiet entrance to the writing desk — for the author only. */}
        <Link href="/admin" className="write-link">
          ✎ Write
        </Link>
      </div>
    </footer>
  );
}
