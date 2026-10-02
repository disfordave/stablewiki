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

// Every permission rule in the wiki. Services enforce these; pages use the
// same functions to decide what to show, so the UI and the API never disagree.

import "server-only";
import {
  WIKI_DISABLE_MEDIA,
  WIKI_HOMEPAGE_LINK,
  WIKI_MEDIA_ADMIN_ONLY,
} from "@/config";
import type { Role } from "@/generated/prisma/client";
import {
  ROLE_RANK,
  getEditLevelRequirement,
} from "@/utils/functions/editLevels";
import { isUsersPage } from "@/utils/functions/isUsersPage";
import { slugify } from "@/utils/functions/slugify";

interface Account {
  username: string;
  role: Role;
  status: number;
  createdAt: Date;
}

export interface PageEditDenial {
  status: 400 | 403;
  error: string;
}

export function hasRole(
  user: { role: Role } | null | undefined,
  minimum: Role,
): boolean {
  return !!user && ROLE_RANK[user.role] >= ROLE_RANK[minimum];
}

export function isBanned(user: { status: number }): boolean {
  return user.status > 0;
}

// Pages in the trash stay readable to editors, who decide whether to restore them
export function canReadPage(
  viewer: { role: Role } | null,
  page: { deletedAt: Date | null },
): boolean {
  return !page.deletedAt || hasRole(viewer, "EDITOR");
}

type Namespace = "user" | "wiki" | "media" | "system";

function getNamespace(title: string): Namespace | null {
  const match = /^(user|wiki|media|system):/i.exec(title.trim());
  return match ? (match[1].toLowerCase() as Namespace) : null;
}

function getUserPageOwner(title: string): string {
  return title.trim().slice("User:".length).split("/")[0].toLowerCase();
}

// Namespace rules for a create (no currentPage) or an edit. Edits can rename
// pages, so the rules apply to the page being edited *and* to its new title.
export function getPageEditDenial({
  editor,
  currentPage,
  newTitle,
  homepageLink = WIKI_HOMEPAGE_LINK,
}: {
  editor: { username: string; role: Role };
  currentPage?: { title: string; slug: string; isMedia?: boolean } | null;
  newTitle: string;
  homepageLink?: string;
}): PageEditDenial | null {
  const isAdmin = hasRole(editor, "ADMIN");
  const isEditor = hasRole(editor, "EDITOR");

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

// The page's edit level (Page.accessLevel), on top of the namespace rules
export function getEditLevelDenial(
  editor: Account,
  accessLevel: number,
  now = new Date(),
): string | null {
  const { role, minAccountAgeDays } = getEditLevelRequirement(accessLevel);

  if (!hasRole(editor, role)) {
    return "You do not have the required edit level to modify this page";
  }

  const accountAgeDays =
    (now.getTime() - new Date(editor.createdAt).getTime()) / 86_400_000;
  if (accountAgeDays < minAccountAgeDays && !hasRole(editor, "MODERATOR")) {
    return `Only accounts older than ${minAccountAgeDays} days can modify this page`;
  }

  return null;
}

// Everything that decides whether an existing page can be edited as-is
export function getPageModifyDenial(
  editor: Account,
  page: { title: string; slug: string; isMedia: boolean; accessLevel: number },
): string | null {
  if (isBanned(editor)) {
    return "Banned users cannot create nor modify pages";
  }
  return (
    getPageEditDenial({ editor, currentPage: page, newTitle: page.title })
      ?.error ?? getEditLevelDenial(editor, page.accessLevel)
  );
}

// Editors delete anything; users delete their own User: subpages (posts)
export function canDeletePage(
  user: { username: string; role: Role; status: number },
  page: { title: string },
): boolean {
  return (
    !isBanned(user) &&
    (hasRole(user, "EDITOR") || isUsersPage(page.title, user.username, true))
  );
}

export function canRestorePages(user: { role: Role } | null): boolean {
  return hasRole(user, "EDITOR");
}

export function canPurgePages(user: { role: Role } | null): boolean {
  return hasRole(user, "ADMIN");
}

export function getUploadDenial(
  user: { role: Role; status: number } | null,
): { status: 401 | 403; error: string } | null {
  if (WIKI_DISABLE_MEDIA) {
    return { status: 403, error: "Media uploads are disabled" };
  }
  if (WIKI_MEDIA_ADMIN_ONLY && !hasRole(user, "ADMIN")) {
    return { status: 403, error: "Only admins can upload media" };
  }
  if (!user) {
    return { status: 401, error: "Unauthorized" };
  }
  if (isBanned(user)) {
    return { status: 403, error: "Banned users cannot upload media" };
  }
  return null;
}

export function getLoungeDenial(
  user: { status: number },
  page: { loungeDisabled: boolean },
): string | null {
  if (isBanned(user)) {
    return "Banned user";
  }
  if (page.loungeDisabled) {
    return "Lounge is disabled for this page";
  }
  return null;
}
