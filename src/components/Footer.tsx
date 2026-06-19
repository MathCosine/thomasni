import { siteConfig, withBase } from "@/config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="inner">
        <span>
          © {year} {siteConfig.title}
        </span>
        <a href={withBase("/rss.xml")} className="write-link">
          RSS
        </a>
      </div>
    </footer>
  );
}
