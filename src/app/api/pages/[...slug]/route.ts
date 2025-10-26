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
import { Page } from "@/types/types";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";
import { checkRedirect } from "@/utils/api/checkRedirect";

export function normalizeSlug(raw: string[]): string {
  raw = raw.map((s) => {
    const decoded = decodeURIComponent(s);
    const trimmed = decoded.trim().replace(/\s+/g, " ");
    if (!trimmed) return trimmed;

    // Capitalize the first letter only, preserve the rest as-is
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  });
  return raw.join("/");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const ver = searchParams.get("ver");

  if (action === "history" && ver) {
    try {
      const page = await prisma.page.findUnique({
        where: { slug: encodeURIComponent(normalizeSlug(slug)) },
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
          tags: [], // Tags can be fetched via a separate endpoint if needed
        } as Page,
      });
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Failed to fetch page" }, { status: 500 });
    }
  } else if (action === "history") {
    try {
      const page = await prisma.page.findUnique({
        where: { slug: encodeURIComponent(normalizeSlug(slug)) },
        include: {
          revisions: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }], // secondary key
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
            author: { id: rev.author.id, username: rev.author.username },
            id: rev.id,
            version: rev.version,
            content: rev.content,
            createdAt: rev.createdAt,
            summary: rev.summary || "",
          })),
          slug: page.slug,
          isRedirect: page.isRedirect,
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
      where: { slug: encodeURIComponent(normalizeSlug(slug)) },
      include: {
        revisions: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }], // secondary key
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

    return Response.json({
      page: {
        id: page.id,
        title: page.title,
        content:
          page.revisions.length > 0 ? page.revisions[0].content : page.content,
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
        tags: [], // Tags can be fetched via a separate endpoint if needed
        isRedirect: page.isRedirect,
        redirectTargetSlug:
          page.revisions.length > 0
            ? page.revisions[0].redirectTargetSlug
            : undefined,
      } as Page,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, author, summary } = await request.json();

  if (!(await validAuthorizationWithJwt(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !content || !author) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const redirection = checkRedirect(content, title);

  try {
    const revisionsCount = await prisma.revision.count({
      where: { page: { slug: encodeURIComponent(title) } },
    });

    const page = await prisma.revision.create({
      data: {
        content,
        page: { connect: { slug: encodeURIComponent(title) } },
        author: { connect: { id: author.id } },
        version: revisionsCount + 1,
        summary,
        isRedirect: redirection.isRedirect,
        redirectTargetSlug: redirection.targetSlug,
      },
    });

    const updatedPage = await prisma.page.update({
      where: { slug: encodeURIComponent(title) },
      data: {
        isRedirect: redirection.isRedirect,
      },
    });

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

  try {
    const page = await prisma.page.delete({
      where: { slug: encodeURIComponent(normalizeSlug(slug)) },
    });
    return Response.json(page, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
