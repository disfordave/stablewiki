import { slugify } from "@/utils";

const WIKI_LINK_REGEX = /(!)?\[\[(.+?)(?:\s*\|\|\s*(.+?))?\]\]/g;

export function extractWikiLinkSlugs(content: string): string[] {
  const slugs = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const isMedia = !!match[1];
    const pageName = match[2]?.trim();
    if (!pageName) continue;

    const slug = pageName
      .split("/")
      .map((part) => slugify(part))
      .join("/");

    slugs.add(isMedia ? `Media:${slug}` : slug);
  }

  return Array.from(slugs);
}
