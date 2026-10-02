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

import { WIKI_HOMEPAGE_LINK } from "@/config";
import { prisma } from "@/lib/prisma";
import { Page } from "@/types";
import {
  checkRedirect,
  handleHPage,
  getDecodedToken,
  slugify,
  isUsersPage,
  extractWikiLinkSlugs,
} from "@/utils";
import { hasErrorCode } from "@/utils/api/errorCodes";
import { resolveMediaPath } from "@/utils/api/media";
import { getPageEditDenial } from "@/utils/api/pagePermissions";
import { unlink } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const ver = searchParams.get("ver");
  const hPage = searchParams.get("hPage");

  // Handle history version requests
  if (action === "history" && ver) {
    try {
      const page = await prisma.page.findUnique({
        where: { slug: slug.join("/") },
        include: {
          revisions: {
            where: { version: Number(ver) },
            include: { author: { select: { id: true, username: true } } },
          },
        },
      });

      if (!page) {
        return Response.json({
          page: null,
        });
      }

      return Response.json({
        page: {
          id: page.id,
          title:
            page.revisions.length > 0 && page.revisions[0].title.length > 0
              ? page.revisions[0].title
              : page.title,
          content:
            page.revisions.length > 0
              ? page.revisions[0].content
              : page.content,
          slug: [page.slug],
          author:
            page.revisions.length > 0
              ? page.revisions[0].author
                ? {
                    id: page.revisions[0].author.id,
                    username: page.revisions[0].author.username,
                  }
                : null
              : null,
          createdAt: page.createdAt,
          accessLevel: page.accessLevel,
          updatedAt:
            page.revisions.length > 0
              ? page.revisions[0].createdAt
              : page.updatedAt,
          comments: [], // Comments can be fetched via a separate endpoint if needed
          backlinks: {
            general: [],
            user: [],
            redirects: [],
            media: [],
            categories: [],
          },
          loungeDisabled: page.loungeDisabled,
        } as Page,
      });
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Failed to fetch page" }, { status: 500 });
    }
    // Handle history list requests
  } else if (action === "history" && !ver && hPage) {
    try {
      const itemsPerPage = 10;
      const handledHPage = handleHPage(hPage) - 1;

      const revisionsCount = await prisma.revision.count({
        where: { page: { slug: slug.join("/") } },
      });

      const page = await prisma.page.findUnique({
        where: { slug: slug.join("/") },
        include: {
          revisions: {
            orderBy: [
              { version: "desc" },
              { createdAt: "desc" },
              { id: "desc" },
            ],
            skip: handledHPage * itemsPerPage,
            take: itemsPerPage,
            include: { author: { select: { id: true, username: true } } },
          },
        },
      });

      if (!page) {
        return Response.json({
          page: null,
        });
      }
      return Response.json({
        page: {
          isHistoryList: true,
          id: page.id,
          title: page.title,
          revisions: page.revisions.map((rev) => ({
            author: rev.author
              ? { id: rev.author.id, username: rev.author.username }
              : null,
            id: rev.id,
            title: page.title,
            version: rev.version,
            content: rev.content,
            createdAt: rev.createdAt,
            summary: rev.summary || "",
          })),
          slug: page.slug,
          isRedirect: page.isRedirect,
          itemsPerPage,
          totalPages: Math.ceil(revisionsCount / itemsPerPage),
        },
      });
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Failed to fetch page" }, { status: 500 });
    }
  }

  // Fetch latest page
  try {
    const page = await prisma.page.findUnique({
      where: { slug: slug.join("/") },
      include: {
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, username: true } },
          },
        },
        revisions: {
          orderBy: [{ version: "desc" }, { createdAt: "desc" }, { id: "desc" }], // secondary key
          take: 1,
          include: { author: { select: { id: true, username: true } } },
        },
      },
    });

    if (!page) {
      return Response.json({
        page: null,
      });
    }

    const backlinks = await prisma.wikiLink.findMany({
      where: { targetSlug: slug.join("/") },
      include: {
        sourcePage: true,
      },
      orderBy: {
        sourcePage: {
          title: "asc",
        },
      },
    });

    return Response.json({
      page: {
        id: page.id,
        title: page.title,
        content:
          page.revisions.length > 0 ? page.revisions[0].content : page.content,
        slug: [page.slug],
        author:
          page.revisions.length > 0
            ? page.revisions[0].author
              ? {
                  id: page.revisions[0].author.id,
                  username: page.revisions[0].author.username,
                }
              : null
            : null,
        createdAt: page.createdAt,
        updatedAt:
          page.revisions.length > 0
            ? page.revisions[0].createdAt
            : page.updatedAt,
        isRedirect: page.isRedirect,
        redirectTargetSlug:
          page.revisions.length > 0
            ? page.revisions[0].redirectTargetSlug
            : undefined,
        accessLevel: page.accessLevel,
        comments: page.comments.map((comment) => ({
          id: comment.id,
          title: comment.title,
          content: comment.content,
          createdAt: comment.createdAt,
          deleted: comment.deleted,
          author: comment.author
            ? {
                id: comment.author.id,
                username: comment.author.username,
              }
            : null,
        })),
        loungeDisabled: page.loungeDisabled,
        backlinks: {
          general: backlinks
            .filter(
              (l) =>
                !l.sourcePage.slug.startsWith("User:") &&
                !l.sourcePage.slug.startsWith("Media:") &&
                !l.sourcePage.slug.startsWith("Category:") &&
                !l.sourcePage.isRedirect,
            )
            .map((link) => ({
              title: link.sourcePage.title,
              slug: link.sourcePage.slug,
              isRedirect: link.sourcePage.isRedirect,
            })),
          user: backlinks
            .filter((l) => l.sourcePage.slug.startsWith("User:"))
            .map((link) => ({
              title: link.sourcePage.title,
              slug: link.sourcePage.slug,
              isRedirect: link.sourcePage.isRedirect,
            })),
          redirects: backlinks
            .filter((l) => l.sourcePage.isRedirect)
            .map((link) => ({
              title: link.sourcePage.title,
              slug: link.sourcePage.slug,
              isRedirect: link.sourcePage.isRedirect,
            })),
          media: backlinks
            .filter((l) => l.sourcePage.slug.startsWith("Media:"))
            .map((link) => ({
              title: link.sourcePage.title,
              slug: link.sourcePage.slug,
              isRedirect: link.sourcePage.isRedirect,
            })),
          categories: backlinks
            .filter((l) => l.sourcePage.slug.startsWith("Category:"))
            .map((link) => ({
              title: link.sourcePage.title,
              slug: link.sourcePage.slug,
              isRedirect: link.sourcePage.isRedirect,
            })),
        },
      } as Page,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const { title, content, summary, accessLevel } = await request.json();

  if (!title || !content) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (typeof title !== "string" || typeof content !== "string") {
    return Response.json({ error: "Invalid fields" }, { status: 400 });
  }

  if (title.split("/").some((p: string) => p.toLowerCase() === "_lounge")) {
    return Response.json(
      { error: 'Titles cannot contain "_lounge" segment' },
      { status: 400 },
    );
  }

  if (title.length > 255) {
    return Response.json(
      { error: "Title exceeds maximum length of 255 characters" },
      { status: 400 },
    );
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken?.username) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (decodedToken.status > 0) {
    return Response.json(
      { error: "Banned users cannot create nor modify pages" },
      { status: 403 },
    );
  }

  const currentPage = await prisma.page.findUnique({
    where: { slug: slug.join("/") },
    select: {
      id: true,
      title: true,
      slug: true,
      accessLevel: true,
      isMedia: true,
    },
  });

  if (!currentPage) {
    return Response.json({ error: "Page not found" }, { status: 400 });
  }

  const denial = getPageEditDenial({
    editor: decodedToken,
    currentPage,
    newTitle: title,
    homepageLink: WIKI_HOMEPAGE_LINK,
  });

  if (denial) {
    return Response.json({ error: denial.error }, { status: denial.status });
  }

  if (
    currentPage.accessLevel > 0 &&
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "EDITOR"
  ) {
    return Response.json(
      { error: "You do not have permission to modify this page" },
      { status: 403 },
    );
  }

  const newSlug = slugify(title);

  if (newSlug !== currentPage.slug) {
    const conflictingPage = await prisma.page.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    });

    if (conflictingPage) {
      return Response.json(
        { error: "A page with this title already exists" },
        { status: 409 },
      );
    }
  }

  // Only admins may change the edit level, and only to a known level
  const newAccessLevel =
    decodedToken.role === "ADMIN" &&
    Number.isInteger(accessLevel) &&
    accessLevel >= 0 &&
    accessLevel <= 9
      ? accessLevel
      : undefined;

  const redirection = checkRedirect(content, title);
  const targetSlugs = extractWikiLinkSlugs(content);

  try {
    const revision = await prisma.$transaction(async (tx) => {
      // Locking the page row gives concurrent edits consecutive versions
      await tx.$queryRaw`SELECT id FROM "Page" WHERE id = ${currentPage.id} FOR UPDATE`;

      const latest = await tx.revision.aggregate({
        where: { pageId: currentPage.id },
        _max: { version: true },
      });

      const newRevision = await tx.revision.create({
        data: {
          content,
          title,
          page: { connect: { id: currentPage.id } },
          author: { connect: { id: decodedToken.id as string } },
          version: (latest._max.version ?? 0) + 1,
          summary,
          isRedirect: redirection.isRedirect,
          redirectTargetSlug: redirection.targetSlug,
        },
      });

      await tx.page.update({
        where: { id: currentPage.id },
        data: {
          title: title,
          slug: newSlug,
          isRedirect: redirection.isRedirect,
          accessLevel: newAccessLevel,
        },
      });

      await tx.wikiLink.deleteMany({
        where: { sourceId: currentPage.id },
      });

      if (targetSlugs.length > 0) {
        await tx.wikiLink.createMany({
          data: targetSlugs.map((targetSlug) => ({
            sourceId: currentPage.id,
            targetSlug,
          })),
        });
      }

      return newRevision;
    });

    return Response.json(revision, { status: 201 });
  } catch (error) {
    console.error(error);

    if (hasErrorCode(error, "P2002")) {
      return Response.json(
        { error: "A page with this title already exists" },
        { status: 409 },
      );
    }
    return Response.json({ error: "Failed to edit page" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  // const isMediaPage = slug[0].split(":")[0].toLowerCase() === "media";

  const decodedToken = await getDecodedToken(request);

  if (!slug || slug.length === 0) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  if (!decodedToken || !decodedToken.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken?.username) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (decodedToken.status > 0) {
    return Response.json(
      { error: "Banned users cannot delete pages" },
      { status: 403 },
    );
  }

  if (
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "EDITOR" &&
    !isUsersPage(slug.join("/"), decodedToken.username, true)
  ) {
    return Response.json(
      {
        error:
          "Only admins and editors can delete pages, or the user page owner",
      },
      { status: 403 },
    );
  }

  if (
    "/wiki/" + slug.join("/") === WIKI_HOMEPAGE_LINK &&
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "EDITOR"
  ) {
    return Response.json(
      { error: "Only admins and editors can create or modify the homepage" },
      { status: 403 },
    );
  }

  try {
    const page = await prisma.page.delete({
      where: { slug: slug.join("/") },
    });

    if (page.isMedia) {
      const filePath = resolveMediaPath(page.title.replace(/^Media:/, ""));
      if (filePath) {
        try {
          await unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete media file: ${filePath}`, err);
        }
      }
    }
    return Response.json(page, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
