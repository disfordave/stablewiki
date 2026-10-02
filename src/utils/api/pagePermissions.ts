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

import type { Role } from "@/generated/prisma/client";
import { slugify } from "@/utils/functions/slugify";

export interface PageEditDenial {
  status: 400 | 403;
  error: string;
}

type Namespace = "user" | "wiki" | "media" | "system";

function getNamespace(title: string): Namespace | null {
  const match = /^(user|wiki|media|system):/i.exec(title.trim());
  return match ? (match[1].toLowerCase() as Namespace) : null;
}

function getUserPageOwner(title: string): string {
  return title.trim().slice("User:".length).split("/")[0].toLowerCase();
}

// Checks a create (no currentPage) or an edit. Edits can rename pages, so the
// namespace rules apply to the page being edited *and* to its new title.
export function getPageEditDenial({
  editor,
  currentPage,
  newTitle,
  homepageLink,
}: {
  editor: { username: string; role: Role };
  currentPage?: { title: string; slug: string; isMedia?: boolean } | null;
  newTitle: string;
  homepageLink: string;
}): PageEditDenial | null {
  const isAdmin = editor.role === "ADMIN";
  const isEditor = isAdmin || editor.role === "EDITOR";

  if (getNamespace(newTitle) === "system") {
    return { status: 400, error: 'Titles cannot start with "System:" prefix' };
  }

  if (currentPage?.isMedia) {
    return {
      status: 403,
      error:
        "Media pages cannot be modified via this endpoint, deletion is only allowed through the media endpoint",
    };
  }

  const homepageSlug = slugify(homepageLink.replace(/^\/wiki\//, ""));
  const slugs = [slugify(newTitle), ...(currentPage ? [currentPage.slug] : [])];
  if (!isEditor && slugs.includes(homepageSlug)) {
    return {
      status: 403,
      error: "Only admins and editors can create or modify the homepage",
    };
  }

  const titles = [newTitle, ...(currentPage ? [currentPage.title] : [])];
  for (const title of titles) {
    const namespace = getNamespace(title);

    if (namespace === "media") {
      return {
        status: 403,
        error: "Media pages cannot be created or modified via this endpoint",
      };
    }

    if (namespace === "wiki" && !isEditor) {
      return {
        status: 403,
        error:
          "Only admins and editors can create or modify Wiki namespace pages",
      };
    }

    if (
      namespace === "user" &&
      !isAdmin &&
      getUserPageOwner(title) !== editor.username.toLowerCase()
    ) {
      return {
        status: 403,
        error: "You can only create or modify pages under your own User page",
      };
    }
  }

  return null;
}
