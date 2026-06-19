"use client";

import { useEffect, useRef } from "react";
import { siteConfig, giscusConfigured } from "@/config";

// Loads the Giscus widget (GitHub Discussions): comments plus a reaction bar
// (the ❤️ "hearts"). No server needed, so it works on a static GitHub Pages site.
export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !giscusConfigured || el.querySelector("iframe")) return;

    const g = siteConfig.giscus;
    const attrs: Record<string, string> = {
      "data-repo": g.repo,
      "data-repo-id": g.repoId,
      "data-category": g.category,
      "data-category-id": g.categoryId,
      "data-mapping": "pathname",
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": "light",
      "data-lang": "en",
      "data-loading": "lazy",
    };

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);
    el.appendChild(script);
  }, []);

  return (
    <section className="comments" id="comments">
      <h2 className="section-label">Comments &amp; reactions</h2>
      {giscusConfigured ? (
        <div className="giscus" ref={ref} />
      ) : (
        <p className="comment-empty">
          Comments aren’t set up yet — add your Giscus settings in <code>src/config.ts</code>.
        </p>
      )}
    </section>
  );
}
