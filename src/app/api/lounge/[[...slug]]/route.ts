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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDecodedToken } from "@/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const hPage = searchParams.get("hPage") || "1";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const validSortBy = sortBy === "likes" ? "likes" : "createdAt";
  const onlyRoot = searchParams.get("onlyRoot") === "true";
  const noDeletedLounges = searchParams.get("noDeletedLounges") === "true";
  const itemsPerPage = 10;
  const username = searchParams.get("username") || null;

  if (!slug || slug.length === 0) {
    const count = await prisma.comment.count({
      where: {
        author: { username: username || undefined },
        parentId: onlyRoot ? null : undefined,
        deleted: noDeletedLounges ? false : undefined,
      },
    });
    const allComments = await prisma.comment.findMany({
      where: {
        author: { username: username || undefined },
        parentId: onlyRoot ? null : undefined,
        deleted: noDeletedLounges ? false : undefined,
      },
      orderBy:
        validSortBy === "likes"
          ? [{ reactions: { _count: "desc" } }, { createdAt: "asc" }]
          : { createdAt: "desc" },
      include: {
        author: { select: { username: true } },
        reactions: {
          where: { type: 1 },
          select: { id: true, userId: true, type: true },
        },
        page: { select: { slug: true, title: true } },
        root: { select: { id: true, title: true, deleted: true } },
      },
      skip: (Number(hPage) - 1) * itemsPerPage,
      take: itemsPerPage,
    });
    return NextResponse.json({
      data: allComments,
      totalPaginationPages: Math.ceil(count / itemsPerPage),
    });
  }

  if (slug.length === 1) {
    const count = await prisma.comment.count({
      where: {
        pageId: slug[0],
        parentId: null,
      },
    });
    const allComments = await prisma.comment.findMany({
      where: {
        pageId: slug[0],
        parentId: null,
      },
      orderBy:
        validSortBy === "likes"
          ? [{ reactions: { _count: "desc" } }, { createdAt: "asc" }]
          : { createdAt: "desc" },
      include: {
        author: { select: { username: true } },
        reactions: {
          where: { type: 1 },
          select: { id: true, userId: true },
        },
      },
      skip: (Number(hPage) - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return NextResponse.json({
      data: allComments,
      totalPaginationPages: Math.ceil(count / itemsPerPage),
    });
  }

  const findFirstComment = await prisma.comment.findUnique({
    where: { id: slug[1], pageId: slug[0] },
    include: {
      author: { select: { username: true } },
      reactions: true,
      page: { select: { slug: true } },
      parent: {
        select: {
          id: true,
          author: { select: { username: true } },
          content: true,
          deleted: true,
          isHidden: true,
        },
      },
    },
  });

  const count = await prisma.comment.count({
    where: {
      rootCommentId: slug[1],
      pageId: slug[0],
    },
  });

  if (!findFirstComment) {
    return new Response("Comment not found", { status: 404 });
  }

  const commentsForIndexFinder = await prisma.comment.findMany({
    where: {
      rootCommentId: slug[1],
      pageId: slug[0],
    },
    orderBy:
      validSortBy === "likes"
        ? [{ reactions: { _count: "desc" } }, { createdAt: "asc" }]
        : { createdAt: "asc" },
    select: { id: true },
  });

  const findParticularComment = await prisma.comment.findMany({
    where: {
      rootCommentId: slug[1],
      pageId: slug[0],
    },
    orderBy:
      validSortBy === "likes"
        ? [{ reactions: { _count: "desc" } }, { createdAt: "asc" }]
        : { createdAt: "asc" },
    include: {
      author: { select: { username: true } },
      reactions: true,
      page: { select: { slug: true } },
      parent: {
        select: {
          id: true,
          author: { select: { username: true } },
          content: true,
          deleted: true,
          isHidden: true,
        },
      },
    },
    skip: (Number(hPage) - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  if (!findParticularComment) {
    return new Response("Comment not found", { status: 404 });
  }

  return NextResponse.json({
    data: [
      {
        index: 0,
        ...findFirstComment,
      },
      ...findParticularComment.map((c) => {
        const { parent, ...rest } = c;
        return {
          index: commentsForIndexFinder.findIndex((ci) => ci.id === c.id) + 1,
          parent: parent
            ? {
                index:
                  commentsForIndexFinder.findIndex(
                    (ci) => ci.id === parent.id,
                  ) + 1,
                ...parent,
              }
            : null,
          ...rest,
        };
      }),
    ],
    // data: [findFirstComment, ...findParticularComment],
    totalPaginationPages:
      Math.ceil(count / itemsPerPage) <= 0
        ? 1
        : Math.ceil(count / itemsPerPage),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (slug && slug[0] === "reactions") {
    // Handle reactions separately
    const { commentId, type: baseType } = await request.json();

    // Validate input
    if (!commentId || !baseType) {
      return new Response("Missing required fields", { status: 400 });
    }

    const type = Number(baseType);

    const decodedToken = await getDecodedToken(request);

    if (!decodedToken || !decodedToken.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (decodedToken.status > 0) {
      return Response.json({ error: "Banned user" }, { status: 403 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return new Response("Comment not found", { status: 404 });
    }

    const page = await prisma.page.findUnique({
      where: { id: comment.pageId },
    });

    if (!page) {
      return new Response("Page not found", { status: 404 });
    }

    if (page.loungeDisabled) {
      return new Response("Lounge is disabled for this page", { status: 403 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        commentId,
        userId: decodedToken.id as string,
      },
    });

    if (existingReaction) {
      // Update existing reaction
      const updatedReaction = await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      });

      return NextResponse.json({ id: updatedReaction.id }, { status: 200 });
    } else {
      // Create new reaction
      const newReaction = await prisma.reaction.create({
        data: {
          commentId,
          userId: decodedToken.id as string,
          type,
        },
      });

      return NextResponse.json({ id: newReaction.id }, { status: 201 });
    }
  }

  const { title, content, pageId, parentId, rootCommentId } =
    await request.json();

  // Validate input
  if (!title || !content || !pageId) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (parentId && !rootCommentId) {
    return new Response("Missing rootCommentId for threaded comments", {
      status: 400,
    });
  }

  if (rootCommentId && !parentId) {
    return new Response("Missing parentId for threaded comments", {
      status: 400,
    });
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (decodedToken.status > 0) {
    return Response.json({ error: "Banned user" }, { status: 403 });
  }

  if (title.length > 255) {
    return new Response("Title exceeds maximum length of 255 characters", {
      status: 400,
    });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return new Response("Page not found", { status: 404 });
  }

  if (page.loungeDisabled) {
    return new Response("Lounge is disabled for this page", { status: 403 });
  }

  // Create new lounge post
  const newLoungePost = await prisma.comment.create({
    data: {
      title,
      content,
      pageId,
      authorId: decodedToken.id as string,
      parentId: parentId || null,
      rootCommentId: rootCommentId || null,
    },
  });

  return NextResponse.json({ id: newLoungePost.id }, { status: 201 });

  // Handle the creation of a new lounge post
}

export async function PUT(request: Request) {
  const { id, title, content } = await request.json();

  // Validate input
  if (!id || !title || !content) {
    return new Response("Missing required fields", { status: 400 });
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (decodedToken.status > 0) {
    return Response.json({ error: "Banned user" }, { status: 403 });
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!existingComment) {
    return new Response("Comment not found", { status: 404 });
  }

  if (existingComment.authorId !== decodedToken.id) {
    return new Response("Forbidden", { status: 403 });
  }

  if (title.length > 255) {
    return new Response("Title exceeds maximum length of 255 characters", {
      status: 400,
    });
  }

  const page = await prisma.page.findUnique({
    where: { id: existingComment.pageId },
  });

  if (!page) {
    return new Response("Page not found", { status: 404 });
  }

  if (page.loungeDisabled) {
    return new Response("Lounge is disabled for this page", { status: 403 });
  }

  // Update lounge post
  const updatedComment = await prisma.comment.update({
    where: { id },
    data: {
      title,
      content,
    },
  });

  return NextResponse.json({ id: updatedComment.id }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (slug && slug[0] === "reactions") {
    // Handle deletion of reactions separately
    const { reactionId } = await request.json();

    // Validate input
    if (!reactionId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const decodedToken = await getDecodedToken(request);

    if (!decodedToken || !decodedToken.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (decodedToken.status > 0) {
      return Response.json({ error: "Banned user" }, { status: 403 });
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: { id: reactionId },
    });

    if (!existingReaction) {
      return new Response("Reaction not found", { status: 404 });
    }

    if (existingReaction.userId !== decodedToken.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Delete reaction
    await prisma.reaction.delete({
      where: { id: reactionId },
    });

    return new Response("Reaction deleted successfully", { status: 200 });
  }

  const { id } = await request.json();

  // Validate input
  if (!id) {
    return new Response("Missing required fields", { status: 400 });
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!existingComment) {
    return new Response("Comment not found", { status: 404 });
  }

  if (existingComment.authorId !== decodedToken.id) {
    return new Response("Forbidden", { status: 403 });
  }

  // Delete lounge post
  await prisma.comment.update({
    where: { id },
    data: {
      deleted: true,
    },
  });

  return new Response("Comment deleted successfully", { status: 200 });
}
