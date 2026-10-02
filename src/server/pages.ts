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

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Page, PageRevisionData } from "@/types";
import { checkRedirect } from "@/utils/api/checkRedirect";
import { handleHPage } from "@/utils/api/pagination";
import { extractWikiLinkSlugs } from "@/utils/api/wikiLinks";
import { slugify } from "@/utils/functions/slugify";
import { cache } from "react";
import { z } from "zod";
import type { SessionUser } from "./auth/session";
import {
  canDeletePage,
  canPurgePages,
  canReadPage,
  canRestorePages,
  getEditLevelDenial,
  getPageEditDenial,
  hasRole,
  isBanned,
} from "./authz";
import { ServiceError, hasErrorCode } from "./errors";
import { deleteMediaFile } from "./media";
import { reportError } from "./monitoring";
import { logSystemEvent } from "./systemLog";
import { parseInput } from "./validation";

type Viewer = SessionUser | null;

const HISTORY_PER_PAGE = 10;
const TRASH_PER_PAGE = 20;

// Trashed pages give up their slug (so the title can be reused right away)
// and keep it inside this marker so a restore can put it back.
const TRASH_MARKER = "~deleted~";

const authorFields = { select: { id: true, username: true } };

function latestRevisionArgs() {
  return {
    orderBy: [
      { version: "desc" as const },
      { createdAt: "desc" as const },
      { id: "desc" as const },
    ],
    take: 1,
    include: { author: authorFields },
  };
}

function emptyBacklinks(): Page["backlinks"] {
  return { general: [], user: [], redirects: [], media: [], categories: [] };
}

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isRedirect: boolean;
  accessLevel: number;
  loungeDisabled: boolean;
  deletedAt: Date | null;
}

interface RevisionRecord {
  content: string;
  createdAt: Date;
  redirectTargetSlug: string | null;
  author: { id: string; username: string } | null;
}

function toPageView(
  page: PageRecord,
  revision: RevisionRecord | undefined,
  extras: Partial<Pick<Page, "comments" | "backlinks">> = {},
): Page {
  return {
    id: page.id,
    title: page.title,
    content: revision ? revision.content : page.content,
    slug: [page.slug],
    author: revision?.author
      ? { id: revision.author.id, username: revision.author.username }
      : null,
    createdAt: page.createdAt,
    updatedAt: revision ? revision.createdAt : page.updatedAt,
    isRedirect: page.isRedirect,
    redirectTargetSlug: revision?.redirectTargetSlug ?? undefined,
    accessLevel: page.accessLevel,
    comments: extras.comments,
    backlinks: extras.backlinks ?? emptyBacklinks(),
    loungeDisabled: page.loungeDisabled,
    deletedAt: page.deletedAt,
  };
}

const pageInputSchema = z.object({
  title: z
    .string({ error: "Missing fields" })
    .trim()
    .min(1, "Missing fields")
    .max(255, "Title exceeds maximum length of 255 characters")
    .refine(
      (title) =>
        !title.split("/").some((part) => part.toLowerCase() === "_lounge"),
      'Titles cannot contain "_lounge" segment',
    ),
  content: z
    .string({ error: "Missing fields" })
    .min(1, "Missing fields")
    .max(1_000_000, "Content is too long"),
  summary: z.string().max(500, "Summary is too long").nullish(),
  // Only honored for admins, see editPage
  accessLevel: z.unknown().optional(),
});

// The latest version of a page, with its lounge preview and backlinks
export const getPage = cache(
  async (slug: string, viewer: Viewer): Promise<Page | null> => {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: { author: authorFields },
        },
        revisions: latestRevisionArgs(),
      },
    });

    if (!page || !canReadPage(viewer, page)) {
      return null;
    }

    const backlinks = await prisma.wikiLink.findMany({
      where: { targetSlug: slug, sourcePage: { deletedAt: null } },
      include: {
        sourcePage: { select: { title: true, slug: true, isRedirect: true } },
      },
      orderBy: { sourcePage: { title: "asc" } },
    });

    const sources = backlinks.map((link) => link.sourcePage);
    const inNamespace = (prefix: string) =>
      sources.filter((source) => source.slug.startsWith(prefix));

    return toPageView(page, page.revisions[0], {
      comments: page.comments.map((comment) => ({
        id: comment.id,
        title: comment.title,
        content: comment.content,
        createdAt: comment.createdAt,
        deleted: comment.deleted,
        author: comment.author,
      })),
      backlinks: {
        general: sources.filter(
          (source) =>
            !source.slug.startsWith("User:") &&
            !source.slug.startsWith("Media:") &&
            !source.slug.startsWith("Category:") &&
            !source.isRedirect,
        ),
        user: inNamespace("User:"),
        redirects: sources.filter((source) => source.isRedirect),
        media: inNamespace("Media:"),
        categories: inNamespace("Category:"),
      },
    });
  },
);

// One specific revision of a page, or null if that version doesn't exist
export const getPageVersion = cache(
  async (slug: string, version: number, viewer: Viewer) => {
    if (!Number.isInteger(version)) {
      return null;
    }

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        revisions: { where: { version }, include: { author: authorFields } },
      },
    });

    const revision = page?.revisions[0];
    if (!page || !revision || !canReadPage(viewer, page)) {
      return null;
    }

    return {
      ...toPageView(page, revision, { comments: [] }),
      title: revision.title.length > 0 ? revision.title : page.title,
    };
  },
);

export async function getPageHistory(
  slug: string,
  hPage: number,
  viewer: Viewer,
) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      revisions: {
        orderBy: [{ version: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        skip: (handleHPage(String(hPage)) - 1) * HISTORY_PER_PAGE,
        take: HISTORY_PER_PAGE,
        include: { author: authorFields },
      },
    },
  });

  if (!page || !canReadPage(viewer, page)) {
    return null;
  }

  const revisionsCount = await prisma.revision.count({
    where: { pageId: page.id },
  });

  return {
    isHistoryList: true,
    id: page.id,
    title: page.title,
    revisions: page.revisions.map((revision) => ({
      author: revision.author,
      id: revision.id,
      title: page.title,
      version: revision.version,
      content: revision.content,
      createdAt: revision.createdAt,
      summary: revision.summary || "",
    })),
    slug: page.slug,
    isRedirect: page.isRedirect,
    itemsPerPage: HISTORY_PER_PAGE,
    totalPages: Math.ceil(revisionsCount / HISTORY_PER_PAGE),
  };
}

export interface ListPagesOptions {
  query?: string;
  // Lists the posts (User:<name>/... subpages) of this user instead
  userPostsOf?: string | null;
  hPage?: number;
  itemsPerPage?: number;
  sortBy?: "createdAt" | "updatedAt";
  // On the first page, a title that matches the query exactly is returned alone
  exactMatchFirst?: boolean;
  logSearch?: boolean;
}

// Between 1 and 25 results per page, 10 when unspecified or invalid
function clampItemsPerPage(requested: number) {
  return !Number.isFinite(requested) || requested <= 0
    ? 10
    : Math.min(Math.floor(requested), 25);
}

export async function listPages({
  query = "",
  userPostsOf = null,
  hPage = 1,
  itemsPerPage: requestedPerPage = 10,
  sortBy = "createdAt",
  exactMatchFirst = true,
  logSearch = true,
}: ListPagesOptions = {}) {
  const itemsPerPage = clampItemsPerPage(requestedPerPage);
  const page = handleHPage(String(hPage));

  const where = {
    deletedAt: null,
    title: userPostsOf
      ? { contains: `User:${userPostsOf}/`, mode: "default" as const }
      : { contains: query, mode: "insensitive" as const },
  };

  const pagesCount = await prisma.page.count({ where });
  const totalPaginationPages = Math.ceil(pagesCount / itemsPerPage);

  if (query.trim() !== "" && !userPostsOf && logSearch) {
    void logSystemEvent("PAGE_SEARCH", `Searched for: ${query}`);
  }

  if (!userPostsOf && page === 1 && exactMatchFirst) {
    const exactMatch = await prisma.page.findFirst({
      where: {
        deletedAt: null,
        title: { equals: query.toLowerCase(), mode: "insensitive" },
      },
      include: { revisions: latestRevisionArgs() },
      orderBy: { createdAt: "desc" },
    });
    if (exactMatch) {
      return {
        totalPaginationPages,
        pages: [toPageView(exactMatch, exactMatch.revisions[0])],
      };
    }
  }

  const pages = await prisma.page.findMany({
    where,
    include: { revisions: latestRevisionArgs() },
    orderBy:
      sortBy === "updatedAt" ? { updatedAt: "desc" } : { createdAt: "desc" },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const searchQuery = query.toLowerCase();
  return {
    totalPaginationPages,
    pages: pages
      .sort((a, b) => {
        // Exact match comes first
        if (a.title.toLowerCase() === searchQuery) return -1;
        if (b.title.toLowerCase() === searchQuery) return 1;
        return 0;
      })
      .map((record) => toPageView(record, record.revisions[0])),
  };
}

export async function listRecentRevisions({
  username,
  hPage = 1,
  itemsPerPage: requestedPerPage = 10,
}: {
  username?: string | null;
  hPage?: number;
  itemsPerPage?: number;
}): Promise<PageRevisionData> {
  const itemsPerPage = clampItemsPerPage(requestedPerPage);
  const where = {
    author: { username: username || undefined },
    page: { deletedAt: null },
  };

  const [revisionsCount, revisions] = await Promise.all([
    prisma.revision.count({ where }),
    prisma.revision.findMany({
      where,
      include: {
        page: { select: { title: true } },
        author: authorFields,
      },
      orderBy: { createdAt: "desc" },
      skip: (handleHPage(String(hPage)) - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
  ]);

  return {
    totalPages: Math.ceil(revisionsCount / itemsPerPage),
    revisions: revisions.map((revision) => ({
      id: revision.id,
      version: revision.version,
      title: revision.title,
      content: revision.content,
      createdAt: revision.createdAt.toISOString(),
      author: revision.author ?? undefined,
      summary: revision.summary ?? "",
      page: revision.page ? { title: revision.page.title } : undefined,
    })),
  };
}

function requireUser(user: Viewer): SessionUser {
  if (!user) {
    throw new ServiceError(401, "Unauthorized");
  }
  return user;
}

export async function createPage(viewer: Viewer, input: unknown) {
  const user = requireUser(viewer);
  const { title, content, summary } = parseInput(pageInputSchema, input);

  if (isBanned(user)) {
    throw new ServiceError(403, "Banned user");
  }

  const denial = getPageEditDenial({ editor: user, newTitle: title });
  if (denial) {
    throw new ServiceError(denial.status, denial.error);
  }

  const redirection = checkRedirect(content, title);
  const targetSlugs = extractWikiLinkSlugs(content);

  try {
    return await prisma.$transaction(async (tx) => {
      const page = await tx.page.create({
        data: {
          title,
          content,
          slug: slugify(title),
          author: { connect: { id: user.id } },
          revisions: {
            create: {
              content,
              author: { connect: { id: user.id } },
              summary,
              isRedirect: redirection.isRedirect,
              redirectTargetSlug: redirection.targetSlug,
              title,
            },
          },
          isRedirect: redirection.isRedirect,
        },
      });

      if (targetSlugs.length > 0) {
        await tx.wikiLink.createMany({
          data: targetSlugs.map((targetSlug) => ({
            sourceId: page.id,
            targetSlug,
          })),
        });
      }

      return page;
    });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      throw new ServiceError(409, "A page with this title already exists");
    }
    throw error;
  }
}

// Adds a revision; changing the title renames (moves) the page
export async function editPage(viewer: Viewer, slug: string, input: unknown) {
  const user = requireUser(viewer);
  const { title, content, summary, accessLevel } = parseInput(
    pageInputSchema,
    input,
  );

  if (isBanned(user)) {
    throw new ServiceError(403, "Banned users cannot create nor modify pages");
  }

  const currentPage = await prisma.page.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      accessLevel: true,
      isMedia: true,
      deletedAt: true,
    },
  });

  if (!currentPage || currentPage.deletedAt) {
    throw new ServiceError(404, "Page not found");
  }

  const denial = getPageEditDenial({
    editor: user,
    currentPage,
    newTitle: title,
  });
  if (denial) {
    throw new ServiceError(denial.status, denial.error);
  }

  const levelDenial = getEditLevelDenial(user, currentPage.accessLevel);
  if (levelDenial) {
    throw new ServiceError(403, levelDenial);
  }

  const newSlug = slugify(title);
  if (newSlug !== currentPage.slug) {
    const conflictingPage = await prisma.page.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    });
    if (conflictingPage) {
      throw new ServiceError(409, "A page with this title already exists");
    }
  }

  // Only admins may change the edit level, and only to a known level
  const newAccessLevel =
    hasRole(user, "ADMIN") &&
    typeof accessLevel === "number" &&
    Number.isInteger(accessLevel) &&
    accessLevel >= 0 &&
    accessLevel <= 9
      ? accessLevel
      : undefined;

  const redirection = checkRedirect(content, title);
  const targetSlugs = extractWikiLinkSlugs(content);

  try {
    return await prisma.$transaction(async (tx) => {
      // Locking the page row gives concurrent edits consecutive versions
      await tx.$queryRaw`SELECT id FROM "Page" WHERE id = ${currentPage.id} FOR UPDATE`;

      const latest = await tx.revision.aggregate({
        where: { pageId: currentPage.id },
        _max: { version: true },
      });

      const revision = await tx.revision.create({
        data: {
          content,
          title,
          page: { connect: { id: currentPage.id } },
          author: { connect: { id: user.id } },
          version: (latest._max.version ?? 0) + 1,
          summary,
          isRedirect: redirection.isRedirect,
          redirectTargetSlug: redirection.targetSlug,
        },
      });

      await tx.page.update({
        where: { id: currentPage.id },
        data: {
          title,
          slug: newSlug,
          content,
          isRedirect: redirection.isRedirect,
          accessLevel: newAccessLevel,
        },
      });

      await tx.wikiLink.deleteMany({ where: { sourceId: currentPage.id } });

      if (targetSlugs.length > 0) {
        await tx.wikiLink.createMany({
          data: targetSlugs.map((targetSlug) => ({
            sourceId: currentPage.id,
            targetSlug,
          })),
        });
      }

      return revision;
    });
  } catch (error) {
    // Only a rename can collide with another page; any other unique
    // violation (e.g. a duplicate version) is a bug and must surface as one
    if (hasErrorCode(error, "P2002") && newSlug !== currentPage.slug) {
      throw new ServiceError(409, "A page with this title already exists");
    }
    throw error;
  }
}

// Moves a page to the trash, where editors can restore it
export async function deletePage(viewer: Viewer, slug: string) {
  const user = requireUser(viewer);

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || page.deletedAt) {
    throw new ServiceError(404, "Page not found");
  }

  if (isBanned(user)) {
    throw new ServiceError(403, "Banned users cannot delete pages");
  }

  if (!canDeletePage(user, page)) {
    throw new ServiceError(
      403,
      "Only admins and editors can delete pages, or the user page owner",
    );
  }

  return prisma.page.update({
    where: { id: page.id },
    data: {
      deletedAt: new Date(),
      deletedById: user.id,
      slug: `${page.slug}${TRASH_MARKER}${page.id}`,
    },
  });
}

export async function listTrash(viewer: Viewer, hPage = 1) {
  if (!canRestorePages(viewer)) {
    throw new ServiceError(403, "Only admins and editors can view the trash");
  }

  const where = { deletedAt: { not: null } };
  const [count, pages] = await Promise.all([
    prisma.page.count({ where }),
    prisma.page.findMany({
      where,
      orderBy: { deletedAt: "desc" },
      skip: (handleHPage(String(hPage)) - 1) * TRASH_PER_PAGE,
      take: TRASH_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        isMedia: true,
        deletedAt: true,
        deletedBy: { select: { username: true } },
      },
    }),
  ]);

  return { totalPages: Math.max(1, Math.ceil(count / TRASH_PER_PAGE)), pages };
}

async function findTrashedPage(pageId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page?.deletedAt) {
    throw new ServiceError(404, "Page not found in the trash");
  }
  return page;
}

export async function restorePage(viewer: Viewer, pageId: string) {
  if (!canRestorePages(viewer)) {
    throw new ServiceError(403, "Only admins and editors can restore pages");
  }

  const page = await findTrashedPage(pageId);
  const markerIndex = page.slug.lastIndexOf(TRASH_MARKER);
  const slug =
    markerIndex > 0 ? page.slug.slice(0, markerIndex) : slugify(page.title);

  const conflictingPage = await prisma.page.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (conflictingPage) {
    throw new ServiceError(
      409,
      "Another page now uses this title. Rename or delete it, then restore this one.",
    );
  }

  try {
    return await prisma.page.update({
      where: { id: page.id },
      data: { deletedAt: null, deletedById: null, slug },
    });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      throw new ServiceError(
        409,
        "Another page now uses this title. Rename or delete it, then restore this one.",
      );
    }
    throw error;
  }
}

// Permanently deletes a trashed page with its history, lounge and media file
export async function purgePage(viewer: Viewer, pageId: string) {
  if (!canPurgePages(viewer)) {
    throw new ServiceError(403, "Only admins can permanently delete pages");
  }

  const page = await findTrashedPage(pageId);
  await prisma.page.delete({ where: { id: page.id } });

  if (page.isMedia) {
    const fileName = page.title.replace(/^Media:/, "");
    await deleteMediaFile(fileName).catch((error) =>
      reportError(error, { fileName }),
    );
  }
}
