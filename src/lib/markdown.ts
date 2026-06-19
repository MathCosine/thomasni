import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// Allow the markup KaTeX produces (spans carrying class + inline sizing styles)
// to survive sanitisation, without opening the door to arbitrary HTML. Raw HTML
// in the source is never parsed, so only KaTeX-generated nodes use these.
const schema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "style", "ariaHidden"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "span", "svg", "path", "line", "g"],
};

// remark-math only treats `$$` as *display* math when the fences sit on their
// own lines. Authors naturally write a whole equation as `$$ … $$` on a single
// line and expect it centred, so rewrite that case into the fenced form before
// parsing. Code blocks are left untouched.
function normalizeDisplayMath(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inCode = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      out.push(line);
      continue;
    }
    if (!inCode) {
      const m = line.match(/^\s*\$\$(.+)\$\$\s*$/);
      if (m && !m[1].includes("$$")) {
        out.push("$$", m[1].trim(), "$$");
        continue;
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  // trust:false keeps \href, \includegraphics and friends inert.
  .use(rehypeKatex, { output: "html", strict: false, trust: false })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

/** Render markdown (with LaTeX) to sanitised HTML. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(normalizeDisplayMath(markdown ?? ""));
  return String(file);
}

/** Build a plain-text excerpt from markdown for list/preview views. */
export function deriveExcerpt(markdown: string, max = 240): string {
  const text = (markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}
