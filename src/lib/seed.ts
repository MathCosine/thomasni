import fs from "node:fs";
import path from "node:path";

interface SeedMeta {
  file: string;
  slug: string;
  title: string;
  tags: string;
  daysAgo: number;
}

const SEED: SeedMeta[] = [
  {
    file: "welcome.md",
    slug: "welcome-to-mathcosine",
    title: "Welcome to MathCosine",
    tags: "meta",
    daysAgo: 6,
  },
  {
    file: "cosine.md",
    slug: "a-cosine-identity-worth-keeping",
    title: "A cosine identity worth keeping",
    tags: "trigonometry, problem-solving",
    daysAgo: 2,
  },
];

export interface SeedPost extends SeedMeta {
  body: string;
  created: string;
}

/** Reads the bundled seed posts from /content/seed. Returns only posts whose
 *  markdown file could be read, so a missing file never breaks startup. */
export function loadSeedPosts(): SeedPost[] {
  const dir = path.join(process.cwd(), "content", "seed");
  return SEED.map((meta) => {
    let body = "";
    try {
      body = fs.readFileSync(path.join(dir, meta.file), "utf8");
    } catch {
      body = "";
    }
    const created = new Date(Date.now() - meta.daysAgo * 86_400_000).toISOString();
    return { ...meta, body, created };
  }).filter((post) => post.body.trim().length > 0);
}
