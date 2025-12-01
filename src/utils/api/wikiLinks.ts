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

export function extractWikiCategorySlugs(content: string): string[] {
  const categories = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const isMedia = !!match[1];
    const pageName = match[2]?.trim();
    if (!pageName) continue;

    if (pageName.startsWith("Category:") && !isMedia) {
      const categoryName = pageName.slice("Category:".length).trim();
      const slug = categoryName
        .split("/")
        .map((part) => slugify(part))
        .join("/");
      categories.add(slug);
    }
  }

  return Array.from(categories);
}
