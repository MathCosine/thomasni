// Site-wide configuration. Safe to import from both server and client components.

// On GitHub Pages project sites the app is served under "/<repo>". The deploy
// workflow injects this; locally it is empty.
export const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH !== "/"
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : "";

/** Prefix a root-relative URL (for raw <a>/asset links to files in /public). */
export function withBase(p: string): string {
  return `${basePath}${p.startsWith("/") ? p : `/${p}`}`;
}

export const siteConfig = {
  title: "MathCosine",
  tagline: "Notes on mathematics & problem-solving",
  description: "Notes on mathematics, problem-solving, and the occasional digression.",

  // Comments + ❤️ reactions via Giscus (https://giscus.app).
  // Paste your values below, or set the matching NEXT_PUBLIC_GISCUS_* env vars
  // (or repository Variables of the same name) in the deploy workflow.
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "", // "owner/repo"
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements",
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
  },
};

export const giscusConfigured = Boolean(
  siteConfig.giscus.repo && siteConfig.giscus.repoId && siteConfig.giscus.categoryId,
);
