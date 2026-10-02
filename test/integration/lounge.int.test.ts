import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/server/auth/session";
import {
  createComment,
  getThread,
  listRecentComments,
  toggleLike,
} from "@/server/lounge";
import { createPage, deletePage } from "@/server/pages";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, resetDatabase } from "./helpers";

let bob: SessionUser;
let pageId: string;

beforeEach(async () => {
  await resetDatabase();
  bob = await createUser("bob");
  pageId = (await createPage(bob, { title: "Topic", content: "x" })).id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("lounge", () => {
  it("numbers replies by their position in the thread", async () => {
    const root = await createComment(bob, {
      title: "Question",
      content: "Why?",
      pageId,
    });
    for (const content of ["first", "second"]) {
      await createComment(bob, {
        content,
        pageId,
        rootCommentId: root.id,
        parentId: root.id,
      });
    }

    const thread = await getThread(pageId, root.id, {});
    expect(
      thread?.data.map((comment) => [comment.index, comment.content]),
    ).toEqual([
      [0, "Why?"],
      [1, "first"],
      [2, "second"],
    ]);
  });

  it("refuses replies that point into another page's thread", async () => {
    const otherPageId = (
      await createPage(bob, { title: "Other", content: "x" })
    ).id;
    const foreignRoot = await createComment(bob, {
      title: "Elsewhere",
      content: "x",
      pageId: otherPageId,
    });

    await expect(
      createComment(bob, {
        content: "sneaky",
        pageId,
        rootCommentId: foreignRoot.id,
        parentId: foreignRoot.id,
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("toggles likes", async () => {
    const root = await createComment(bob, { title: "Q", content: "x", pageId });

    await toggleLike(bob, root.id);
    expect(await prisma.reaction.count({ where: { commentId: root.id } })).toBe(
      1,
    );
    await toggleLike(bob, root.id);
    expect(await prisma.reaction.count({ where: { commentId: root.id } })).toBe(
      0,
    );
  });

  it("hides the lounge of trashed pages and refuses new posts there", async () => {
    await createComment(bob, { title: "Q", content: "x", pageId });
    const editor = await createUser("eve", "EDITOR");
    await deletePage(editor, "Topic");

    expect((await listRecentComments({})).data).toEqual([]);
    await expect(
      createComment(bob, { title: "Late", content: "x", pageId }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("keeps banned users out", async () => {
    const banned = await createUser("mallory", "USER", { status: 1 });
    await expect(
      createComment(banned, { title: "Spam", content: "x", pageId }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
