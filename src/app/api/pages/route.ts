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

import { prisma } from "@/lib/prisma";
import { Page, PageRevisionData } from "@/types";
import {
  getDecodedToken,
  checkRedirect,
  handleHPage,
  extractWikiLinkSlugs,
} from "@/utils";
import { type NextRequest } from "next/server";
import { slugify } from "@/utils/";
import { WIKI_HOMEPAGE_LINK } from "@/config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const userPostByUsername = searchParams.get("userPostByUsername");
  const itemsPerPage = 10;
  const hPage = searchParams.get("hPage") || "1";
  const noAutomaticExactMatch = searchParams.get("noAutomaticExactMatch");
  const action = searchParams.get("action") || "";
  const username = searchParams.get("username") || "";
  const handledHPage = handleHPage(hPage) - 1;

  if (action === "revisions") {
    const pagesCount = await prisma.revision.count({
      where: {
        author: {
          username: username || undefined,
        },
      },
    });

    const revisions = await prisma.revision.findMany({
      where: {
        author: {
          username: username || undefined,
        },
      },
      include: {
        page: {
          select: {
            title: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: handledHPage * itemsPerPage,
      take: itemsPerPage,
    });
    return Response.json({
      totalPages: Math.ceil(pagesCount / itemsPerPage),
      revisions: revisions.map((rev) => ({
        id: rev.id,
        version: rev.version,
        title: rev.title,
        content: rev.content,
        createdAt: rev.createdAt.toISOString(),
        author: rev.author
          ? { id: rev.author.id, username: rev.author.username }
          : undefined,
        summary: rev.summary,
        page: rev.page ? { title: rev.page.title } : undefined,
      })),
    } as PageRevisionData);
  }

  try {
    const pagesCount = await prisma.page.count({
      where: {
        title: {
          contains: userPostByUsername ? `User:${userPostByUsername}/` : query,
          mode: userPostByUsername ? "default" : "insensitive",
        },
      },
    });

    if (
      !userPostByUsername &&
      handleHPage(hPage) === 1 &&
      !noAutomaticExactMatch
    ) {
      const exactMatch = await prisma.page.findFirst({
        where: {
          title: {
            equals: query.toLowerCase(),
            mode: "insensitive",
          },
        },
        include: {
          revisions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { author: { select: { id: true, username: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (exactMatch) {
        return Response.json({
          totalPaginationPages: Math.ceil(pagesCount / itemsPerPage),
          pages: [
            {
              id: exactMatch.id,
              title: exactMatch.title,
              content:
                exactMatch.revisions.length > 0
                  ? exactMatch.revisions[0].content
                  : exactMatch.content,
              slug: [exactMatch.slug],
              author:
                exactMatch.revisions.length > 0
                  ? exactMatch.revisions[0].author
                    ? {
                        id: exactMatch.revisions[0].author.id,
                        username: exactMatch.revisions[0].author.username,
                      }
                    : null
                  : null,
              createdAt: exactMatch.createdAt,
              updatedAt:
                exactMatch.revisions.length > 0
                  ? exactMatch.revisions[0].createdAt
                  : exactMatch.updatedAt,
              tags: [],
              isRedirect: exactMatch.isRedirect,
              accessLevel: exactMatch.accessLevel,
              redirectTargetSlug:
                exactMatch.revisions.length > 0
                  ? exactMatch.revisions[0].redirectTargetSlug
                  : undefined,
              backlinks: [],
            } as Page,
          ],
        });
      }
    }

    const pages = await prisma.page.findMany({
      where: {
        title: {
          contains: userPostByUsername ? `User:${userPostByUsername}/` : query,
          mode: userPostByUsername ? "default" : "insensitive",
        },
      },
      include: {
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: { select: { id: true, username: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: handledHPage * itemsPerPage,
      take: itemsPerPage,
    });

    return Response.json({
      totalPaginationPages: Math.ceil(pagesCount / itemsPerPage),
      pages: pages
        .sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const searchQuery = query.toLowerCase();

          // Exact match comes first
          if (aTitle === searchQuery) return -1;
          if (bTitle === searchQuery) return 1;

          return 0;
        })
        .map((page) => ({
          id: page.id,
          title: page.title,
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
          updatedAt:
            page.revisions.length > 0
              ? page.revisions[0].createdAt
              : page.updatedAt,
          tags: [],
          isRedirect: page.isRedirect,
          accessLevel: page.accessLevel,
          redirectTargetSlug:
            page.revisions.length > 0
              ? page.revisions[0].redirectTargetSlug
              : undefined,
          backlinks: [],
        })) as Page[],
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, summary } = await request.json();

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

  console.log({ decodedToken });
  console.log({ title, link: WIKI_HOMEPAGE_LINK.slice(6) });

  if (decodedToken.status > 0) {
    return Response.json({ error: "Banned user" }, { status: 403 });
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

  if (title.startsWith("Wiki:") || title.startsWith("wiki:")) {
    if (decodedToken.role !== "ADMIN" && decodedToken.role !== "EDITOR") {
      return Response.json(
        { error: "Only admins and editors can create Wiki namespace pages" },
        { status: 403 },
      );
    }
  }

  if (title.startsWith("User:") || title.startsWith("user:")) {
    if ((title as string).split("/")[0].slice(5) !== decodedToken.username) {
      return Response.json(
        { error: "You can only create a User page for your own username" },
        { status: 403 },
      );
    }
  }

  if (title.startsWith("Media:") || title.startsWith("media:")) {
    return Response.json(
      { error: "Media pages cannot be created via this endpoint" },
      { status: 403 },
    );
  }

  try {
    const targetSlugs = extractWikiLinkSlugs(content);

    const page = await prisma.page.create({
      data: {
        title,
        content: "",
        slug: slugify(title),
        author: { connect: { id: decodedToken.id as string } },
        revisions: {
          create: {
            content,
            author: { connect: { id: decodedToken.id as string } },
            summary,
            isRedirect: checkRedirect(content, title).isRedirect,
            redirectTargetSlug: checkRedirect(content, title).targetSlug,
            title,
          },
        },
        isRedirect: checkRedirect(content, title).isRedirect,
      },
    });

    await prisma.wikiLink.deleteMany({
      where: { sourceId: page.id },
    });

    if (targetSlugs.length > 0) {
      console.log("Creating wiki links:", targetSlugs);
      await prisma.wikiLink.createMany({
        data: targetSlugs.map((targetSlug) => ({
          sourceId: page.id,
          targetSlug,
        })),
      });
    }

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create page: " + error },
      { status: 500 },
    );
  }
}
