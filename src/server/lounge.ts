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
import { handleHPage } from "@/utils/api/pagination";
import { z } from "zod";
import type { SessionUser } from "./auth/session";
import { getLoungeDenial, isBanned } from "./authz";
import { ServiceError } from "./errors";
import { parseInput } from "./validation";

const COMMENTS_PER_PAGE = 10;

export type LoungeSort = "likes" | "createdAt";

function commentOrder(sortBy: LoungeSort, direction: "asc" | "desc") {
  return sortBy === "likes"
    ? [
        { reactions: { _count: "desc" as const } },
        { createdAt: "asc" as const },
      ]
    : { createdAt: direction };
}

function skipFor(hPage: number) {
  return (handleHPage(String(hPage)) - 1) * COMMENTS_PER_PAGE;
}

const threadCommentInclude = {
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
};

// Latest comments across the wiki, optionally by one user
export async function listRecentComments({
  username = null,
  onlyRoot = false,
  excludeDeleted = false,
  hPage = 1,
  sortBy = "createdAt",
}: {
  username?: string | null;
  onlyRoot?: boolean;
  excludeDeleted?: boolean;
  hPage?: number;
  sortBy?: LoungeSort;
}) {
  const where = {
    author: { username: username || undefined },
    parentId: onlyRoot ? null : undefined,
    deleted: excludeDeleted ? false : undefined,
    page: { deletedAt: null },
  };

  const [count, data] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: commentOrder(sortBy, "desc"),
      include: {
        author: { select: { username: true } },
        reactions: {
          where: { type: 1 },
          select: { id: true, userId: true, type: true },
        },
        page: { select: { slug: true, title: true } },
        root: { select: { id: true, title: true, deleted: true } },
      },
      skip: skipFor(hPage),
      take: COMMENTS_PER_PAGE,
    }),
  ]);

  return { data, totalPaginationPages: Math.ceil(count / COMMENTS_PER_PAGE) };
}

// The threads (root comments) of one page
export async function listThreads(
  pageId: string,
  { hPage = 1, sortBy = "createdAt" }: { hPage?: number; sortBy?: LoungeSort },
) {
  const where = { pageId, parentId: null, page: { deletedAt: null } };

  const [count, data] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: commentOrder(sortBy, "desc"),
      include: {
        author: { select: { username: true } },
        reactions: {
          where: { type: 1 },
          select: { id: true, userId: true },
        },
      },
      skip: skipFor(hPage),
      take: COMMENTS_PER_PAGE,
    }),
  ]);

  return { data, totalPaginationPages: Math.ceil(count / COMMENTS_PER_PAGE) };
}

export async function getComment(pageId: string, commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId, pageId, page: { deletedAt: null } },
    include: threadCommentInclude,
  });
}

// A thread: its root comment, then one page of replies, each numbered by
// its position in the thread so "reply to #3" links stay stable
export async function getThread(
  pageId: string,
  rootId: string,
  { hPage = 1, sortBy = "createdAt" }: { hPage?: number; sortBy?: LoungeSort },
) {
  const root = await getComment(pageId, rootId);
  if (!root) {
    return null;
  }

  const where = { rootCommentId: rootId, pageId };
  const [count, order, replies] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: commentOrder(sortBy, "asc"),
      select: { id: true },
    }),
    prisma.comment.findMany({
      where,
      orderBy: commentOrder(sortBy, "asc"),
      include: threadCommentInclude,
      skip: skipFor(hPage),
      take: COMMENTS_PER_PAGE,
    }),
  ]);

  const position = (id: string) =>
    order.findIndex((comment) => comment.id === id) + 1;

  return {
    data: [
      { index: 0, ...root },
      ...replies.map(({ parent, ...reply }) => ({
        index: position(reply.id),
        parent: parent ? { index: position(parent.id), ...parent } : null,
        ...reply,
      })),
    ],
    totalPaginationPages: Math.max(1, Math.ceil(count / COMMENTS_PER_PAGE)),
  };
}

const newCommentSchema = z.object({
  title: z
    .string()
    .max(255, "Title exceeds maximum length of 255 characters")
    .nullish(),
  content: z
    .string({ error: "Missing required fields" })
    .trim()
    .min(1, "Missing required fields")
    .max(20_000, "Comment is too long"),
  pageId: z.string({ error: "Missing required fields" }).min(1),
  parentId: z.string().nullish(),
  rootCommentId: z.string().nullish(),
});

function requireUser(user: SessionUser | null): SessionUser {
  if (!user) {
    throw new ServiceError(401, "Unauthorized");
  }
  return user;
}

async function findOpenPage(pageId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, loungeDisabled: true, deletedAt: true },
  });
  if (!page || page.deletedAt) {
    throw new ServiceError(404, "Page not found");
  }
  return page;
}

export async function createComment(
  viewer: SessionUser | null,
  input: unknown,
) {
  const user = requireUser(viewer);
  const { title, content, pageId, parentId, rootCommentId } = parseInput(
    newCommentSchema,
    input,
  );

  if (parentId && !rootCommentId) {
    throw new ServiceError(400, "Missing rootCommentId for threaded comments");
  }
  if (rootCommentId && !parentId) {
    throw new ServiceError(400, "Missing parentId for threaded comments");
  }

  const page = await findOpenPage(pageId);
  const denial = getLoungeDenial(user, page);
  if (denial) {
    throw new ServiceError(403, denial);
  }

  // Replies must stay inside one thread on one page
  if (rootCommentId && parentId) {
    const [root, parent] = await Promise.all([
      prisma.comment.findUnique({ where: { id: rootCommentId } }),
      prisma.comment.findUnique({ where: { id: parentId } }),
    ]);
    const validThread =
      root?.pageId === pageId &&
      root.rootCommentId === null &&
      parent?.pageId === pageId &&
      (parent.id === root.id || parent.rootCommentId === root.id);
    if (!validThread) {
      throw new ServiceError(400, "Invalid thread reference");
    }
  }

  return prisma.comment.create({
    data: {
      title: title || "No Title",
      content,
      pageId,
      authorId: user.id,
      parentId: parentId || null,
      rootCommentId: rootCommentId || null,
    },
    select: { id: true },
  });
}

const editCommentSchema = z.object({
  id: z.string({ error: "Missing required fields" }).min(1),
  title: z
    .string()
    .max(255, "Title exceeds maximum length of 255 characters")
    .nullish(),
  content: z
    .string({ error: "Missing required fields" })
    .trim()
    .min(1, "Missing required fields")
    .max(20_000, "Comment is too long"),
});

async function findOwnComment(user: SessionUser, id: string) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    throw new ServiceError(404, "Comment not found");
  }
  if (comment.authorId !== user.id) {
    throw new ServiceError(403, "Forbidden");
  }
  return comment;
}

export async function editComment(viewer: SessionUser | null, input: unknown) {
  const user = requireUser(viewer);
  const { id, title, content } = parseInput(editCommentSchema, input);

  if (isBanned(user)) {
    throw new ServiceError(403, "Banned user");
  }

  const comment = await findOwnComment(user, id);
  const page = await findOpenPage(comment.pageId);
  const denial = getLoungeDenial(user, page);
  if (denial) {
    throw new ServiceError(403, denial);
  }

  return prisma.comment.update({
    where: { id },
    data: { title: title || comment.title, content },
    select: { id: true },
  });
}

// Comments are blanked rather than removed so threads keep their shape
export async function deleteComment(viewer: SessionUser | null, id: unknown) {
  const user = requireUser(viewer);
  if (typeof id !== "string" || !id) {
    throw new ServiceError(400, "Missing required fields");
  }

  await findOwnComment(user, id);
  await prisma.comment.update({ where: { id }, data: { deleted: true } });
}

const reactionSchema = z.object({
  commentId: z.string({ error: "Missing required fields" }).min(1),
  type: z.coerce
    .number({ error: "Missing required fields" })
    .int()
    .min(1, "Invalid reaction type")
    .max(10, "Invalid reaction type"),
});

async function findReactableComment(user: SessionUser, commentId: string) {
  if (isBanned(user)) {
    throw new ServiceError(403, "Banned user");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, pageId: true },
  });
  if (!comment) {
    throw new ServiceError(404, "Comment not found");
  }

  const page = await findOpenPage(comment.pageId);
  if (page.loungeDisabled) {
    throw new ServiceError(403, "Lounge is disabled for this page");
  }
  return comment;
}

// Sets the user's reaction on a comment (one reaction per user and comment)
export async function addReaction(viewer: SessionUser | null, input: unknown) {
  const user = requireUser(viewer);
  const { commentId, type } = parseInput(reactionSchema, input);
  await findReactableComment(user, commentId);

  const existing = await prisma.reaction.findFirst({
    where: { commentId, userId: user.id },
  });

  if (existing) {
    const updated = await prisma.reaction.update({
      where: { id: existing.id },
      data: { type },
    });
    return { id: updated.id, created: false };
  }

  const created = await prisma.reaction.create({
    data: { commentId, userId: user.id, type },
  });
  return { id: created.id, created: true };
}

export async function removeReaction(
  viewer: SessionUser | null,
  reactionId: unknown,
) {
  const user = requireUser(viewer);
  if (typeof reactionId !== "string" || !reactionId) {
    throw new ServiceError(400, "Missing required fields");
  }
  if (isBanned(user)) {
    throw new ServiceError(403, "Banned user");
  }

  const reaction = await prisma.reaction.findUnique({
    where: { id: reactionId },
  });
  if (!reaction) {
    throw new ServiceError(404, "Reaction not found");
  }
  if (reaction.userId !== user.id) {
    throw new ServiceError(403, "Forbidden");
  }

  await prisma.reaction.delete({ where: { id: reactionId } });
}

// The 👍 button: removes the user's like if present, otherwise adds it
export async function toggleLike(
  viewer: SessionUser | null,
  commentId: string,
) {
  const user = requireUser(viewer);
  await findReactableComment(user, commentId);

  const existing = await prisma.reaction.findFirst({
    where: { commentId, userId: user.id, type: 1 },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await addReaction(user, { commentId, type: 1 });
  }
}
