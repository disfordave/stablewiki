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
import { unlink } from "fs/promises";
import path from "path";

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

  if (title.startsWith("System:") || title.startsWith("system:")) {
    return Response.json(
      { error: 'Titles cannot start with "System:" prefix' },
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

  if (
    "/wiki/" + title === WIKI_HOMEPAGE_LINK &&
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "EDITOR"
  ) {
    return Response.json(
      { error: "Only admins and editors can create or modify the homepage" },
      { status: 403 },
    );
  }

  if (decodedToken.status > 0) {
    return Response.json(
      { error: "Banned users cannot create nor modify pages" },
      { status: 403 },
    );
  }

  const redirection = checkRedirect(content, title);

  if (title.startsWith("Wiki:") || title.startsWith("wiki:")) {
    if (decodedToken.role !== "ADMIN" && decodedToken.role !== "EDITOR") {
      return Response.json(
        { error: "Only admins and editors can create Wiki namespace pages" },
        { status: 403 },
      );
    }
  }

  if (title.startsWith("User:") || title.startsWith("user:")) {
    if (
      (title as string).split("/")[0].slice(5) !== decodedToken?.username &&
      decodedToken.role !== "ADMIN"
    ) {
      return Response.json(
        { error: "You can only create a User page for your own username" },
        { status: 403 },
      );
    }
  }

  if (title.startsWith("Media:") || title.startsWith("media:")) {
    return Response.json(
      {
        error:
          "Media pages cannot be modified via this endpoint, deletion is only allowed through the media endpoint",
      },
      { status: 403 },
    );
  }

  const accessLevelOfPost = await prisma.page.findUnique({
    where: { slug: slug.join("/") },
    select: { accessLevel: true },
  });

  if (!accessLevelOfPost) {
    return Response.json({ error: "Page not found" }, { status: 400 });
  }

  if (
    accessLevelOfPost.accessLevel > 0 &&
    decodedToken.role !== "ADMIN" &&
    decodedToken.role !== "EDITOR"
  ) {
    return Response.json(
      { error: "You do not have permission to modify this page" },
      { status: 403 },
    );
  }

  try {
    const revisionsCount = await prisma.revision.count({
      where: { page: { slug: slug.join("/") } },
    });

    const page = await prisma.revision.create({
      data: {
        content,
        title,
        page: { connect: { slug: slug.join("/") } },
        author: { connect: { id: decodedToken.id as string } },
        version: revisionsCount + 1,
        summary,
        isRedirect: redirection.isRedirect,
        redirectTargetSlug: redirection.targetSlug,
      },
    });

    const targetSlugs = extractWikiLinkSlugs(content);

    const updatedPage = await prisma.page.update({
      where: { slug: slug.join("/") },
      data: {
        title: title,
        slug: slugify(title),
        isRedirect: redirection.isRedirect,
        accessLevel,
      },
    });

    await prisma.wikiLink.deleteMany({
      where: { sourceId: updatedPage.id },
    });

    if (targetSlugs.length > 0) {
      console.log("Creating wiki links:", targetSlugs);
      await prisma.wikiLink.createMany({
        data: targetSlugs.map((targetSlug) => ({
          sourceId: updatedPage.id,
          targetSlug,
        })),
      });
    }

    console.log("Updated page redirect status:", updatedPage);

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create page" }, { status: 500 });
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
      const titlePart = page.title.replace(/^Media:/, "");
      const uploadDir = path.join(process.cwd(), "public", "media");
      const filePath = path.join(uploadDir, titlePart);
      try {
        await unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete media file: ${filePath}`, err);
      }
    }
    return Response.json(page, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
