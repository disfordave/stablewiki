import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/server/auth/session";
import {
  createPage,
  deletePage,
  editPage,
  getPage,
  listPages,
  listRecentRevisions,
  listTrash,
  purgePage,
  restorePage,
} from "@/server/pages";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, resetDatabase } from "./helpers";

let bob: SessionUser;
let eve: SessionUser;
let root: SessionUser;

beforeEach(async () => {
  await resetDatabase();
  bob = await createUser("bob");
  eve = await createUser("eve", "EDITOR");
  root = await createUser("root", "ADMIN");
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("editing", () => {
  it("records each edit as a new version and keeps Page.content current", async () => {
    await createPage(bob, {
      title: "JavaScript",
      content: "v1 [[TypeScript]]",
    });
    await editPage(bob, "JavaScript", {
      title: "JavaScript",
      content: "v2 [[Node.js]]",
      summary: "update",
    });

    const page = await prisma.page.findUniqueOrThrow({
      where: { slug: "JavaScript" },
      include: {
        revisions: { orderBy: { version: "asc" } },
        outboundLinks: true,
      },
    });
    expect(page.content).toBe("v2 [[Node.js]]");
    expect(page.revisions.map((revision) => revision.version)).toEqual([1, 2]);
    expect(page.outboundLinks.map((link) => link.targetSlug)).toEqual([
      "Node.js",
    ]);
  });

  it("gives concurrent edits consecutive, unique version numbers", async () => {
    await createPage(bob, { title: "Busy Page", content: "v1" });

    await Promise.all(
      [2, 3, 4, 5, 6].map((n) =>
        editPage(bob, "Busy_Page", { title: "Busy Page", content: `v${n}` }),
      ),
    );

    const versions = await prisma.revision.findMany({
      where: { page: { slug: "Busy_Page" } },
      orderBy: { version: "asc" },
      select: { version: true },
    });
    expect(versions.map((revision) => revision.version)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("renames pages, freeing the old title and refusing taken ones", async () => {
    await createPage(bob, { title: "Draft", content: "x" });
    await createPage(bob, { title: "Taken", content: "x" });

    await expect(
      editPage(bob, "Draft", { title: "Taken", content: "x" }),
    ).rejects.toMatchObject({ status: 409 });

    await editPage(bob, "Draft", { title: "Final", content: "x" });
    expect(await getPage("Draft", bob)).toBeNull();
    expect((await getPage("Final", bob))?.title).toBe("Final");
  });

  it("stops users from moving someone else's page out of their namespace", async () => {
    const alice = await createUser("alice");
    await createPage(alice, { title: "User:alice/Diary", content: "mine" });

    await expect(
      editPage(bob, "User:alice/Diary", { title: "Hijacked", content: "x" }),
    ).rejects.toMatchObject({ status: 403 });
    expect((await getPage("User:alice/Diary", null))?.content).toBe("mine");
  });
});

describe("trash", () => {
  it("hides deleted pages everywhere and frees their title", async () => {
    await createPage(bob, { title: "Target", content: "target" });
    await createPage(bob, { title: "Linker", content: "see [[Target]]" });
    await createPage(bob, { title: "Old", content: "links to [[Target]]" });

    await deletePage(eve, "Old");

    expect(await getPage("Old", bob)).toBeNull();
    expect((await getPage("Target", null))?.backlinks.general).toEqual([
      { title: "Linker", slug: "Linker", isRedirect: false },
    ]);
    const { pages } = await listPages({
      exactMatchFirst: false,
      logSearch: false,
    });
    expect(pages.map((page) => page.title).sort()).toEqual([
      "Linker",
      "Target",
    ]);
    const { revisions } = await listRecentRevisions({});
    expect(revisions.map((revision) => revision.title)).not.toContain("Old");

    // The title can be reused right away
    await createPage(bob, { title: "Old", content: "brand new" });
    expect((await getPage("Old", null))?.content).toBe("brand new");
  });

  it("lets editors see and restore trashed pages with their history", async () => {
    await createPage(bob, { title: "Notes", content: "v1" });
    await editPage(bob, "Notes", { title: "Notes", content: "v2" });
    const trashed = await deletePage(eve, "Notes");

    expect(await getPage(trashed.slug, bob)).toBeNull();
    expect((await getPage(trashed.slug, eve))?.deletedAt).toBeInstanceOf(Date);
    await expect(listTrash(bob)).rejects.toMatchObject({ status: 403 });
    expect((await listTrash(eve)).pages.map((page) => page.title)).toEqual([
      "Notes",
    ]);

    await restorePage(eve, trashed.id);
    const restored = await getPage("Notes", null);
    expect(restored?.content).toBe("v2");
    expect(await prisma.revision.count({ where: { pageId: trashed.id } })).toBe(
      2,
    );
  });

  it("refuses to restore over a page that took the title meanwhile", async () => {
    await createPage(bob, { title: "Notes", content: "old" });
    const trashed = await deletePage(eve, "Notes");
    await createPage(bob, { title: "Notes", content: "new" });

    await expect(restorePage(eve, trashed.id)).rejects.toMatchObject({
      status: 409,
    });
  });

  it("lets users trash their own posts but not other pages", async () => {
    await createPage(bob, { title: "User:bob/Post", content: "x" });
    await createPage(bob, { title: "Shared", content: "x" });

    await deletePage(bob, "User:bob/Post");
    await expect(deletePage(bob, "Shared")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("purges only from the trash, only as admin, removing the history", async () => {
    await createPage(bob, { title: "Gone", content: "x" });
    const live = await prisma.page.findUniqueOrThrow({
      where: { slug: "Gone" },
    });
    await expect(purgePage(root, live.id)).rejects.toMatchObject({
      status: 404,
    });

    const trashed = await deletePage(eve, "Gone");
    await expect(purgePage(eve, trashed.id)).rejects.toMatchObject({
      status: 403,
    });

    await purgePage(root, trashed.id);
    expect(await prisma.page.count({ where: { id: trashed.id } })).toBe(0);
    expect(await prisma.revision.count({ where: { pageId: trashed.id } })).toBe(
      0,
    );
  });
});
