import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDecodedToken } from "@/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  if (slug.length === 1) {
    const allComments = await prisma.comment.findMany({
      where: {
        pageId: slug[0],
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true } },
      },
    });

    return NextResponse.json(allComments);
  }

  const findParticularComment = await prisma.comment.findMany({
    where: {
      OR: [
        { id: slug[1], pageId: slug[0] },
        { rootCommentId: slug[1], pageId: slug[0] },
      ],
    },
    orderBy: { createdAt: "asc" },
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

  if (!findParticularComment) {
    return new Response("Comment not found", { status: 404 });
  }

  return NextResponse.json(findParticularComment);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug?: string[] | undefined }> }) {

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

  if (title.length > 255) {
    return new Response("Title exceeds maximum length of 255 characters", {
      status: 400,
    });
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

export async function DELETE(request: Request, { params }: { params: Promise<{ slug?: string[] | undefined }> }) {
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
