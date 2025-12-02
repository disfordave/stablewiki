/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { slugify } from "@/utils";

const WIKI_LINK_REGEX = /(!)?\[\[(.+?)(?:\s*\|\|\s*(.+?))?\]\]/g;

export function extractWikiLinkSlugs(content: string): string[] {
  const slugs = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const isMedia = !!match[1];
    const pageName = match[2]?.trim();
    if (!pageName) continue;

    const pageNameWithoutHash = pageName.split("#")[0].trim();

    const slug = pageNameWithoutHash
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
      categories.add(categoryName);
    }
  }

  return Array.from(categories);
}
