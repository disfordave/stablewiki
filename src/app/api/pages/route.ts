/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { prisma } from "@/lib/prisma";
import { Page } from "@/types";
import { getDecodedToken, checkRedirect, handleHPage } from "@/utils";
import { type NextRequest } from "next/server";
import { slugify } from "@/utils/";
import { WIKI_HOMEPAGE_LINK } from "@/config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const userPostByUsername = searchParams.get("userPostByUsername");
  const itemsPerPage = 10;
  const hPage = searchParams.get("hPage") || "1";

  try {
    const handledHPage = handleHPage(hPage) - 1;

    const pagesCount = await prisma.page.count({
      where: {
        title: {
          contains: userPostByUsername ? `User:${userPostByUsername}/` : query,
          mode: userPostByUsername ? "default" : "insensitive",
        },
      },
    });

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
              ? {
                  id: page.revisions[0].author.id,
                  username: page.revisions[0].author.username,
                }
              : null,
          createdAt: page.createdAt,
          updatedAt:
            page.revisions.length > 0
              ? page.revisions[0].createdAt
              : page.updatedAt,
          tags: [],
          isRedirect: page.isRedirect,
          redirectTargetSlug:
            page.revisions.length > 0
              ? page.revisions[0].redirectTargetSlug
              : undefined,
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

  if (title.startsWith("User:") || title.startsWith("user:")) {
    if ((title as string).split("/")[0].slice(5) !== decodedToken.username) {
      return Response.json(
        { error: "You can only create a User page for your own username" },
        { status: 403 },
      );
    }
  }

  try {
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
          },
        },
        isRedirect: checkRedirect(content, title).isRedirect,
      },
    });

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create page: " + error },
      { status: 500 },
    );
  }
}
