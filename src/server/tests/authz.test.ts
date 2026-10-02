import { describe, expect, it } from "vitest";
import {
  canDeletePage,
  canReadPage,
  getEditLevelDenial,
  getPageEditDenial,
} from "@/server/authz";
import { getAccessEditLevelString } from "@/utils/functions/getEditLevelString";

type Editor = Parameters<typeof getPageEditDenial>[0]["editor"];

const HOMEPAGE = "/wiki/Welcome_Page";

const user = (username: string, role: Editor["role"] = "USER"): Editor => ({
  username,
  role,
});

const page = (title: string) => ({
  title,
  slug: title.trim().replace(/\s+/g, "_"),
});

const edit = (editor: Editor, currentTitle: string | null, newTitle: string) =>
  getPageEditDenial({
    editor,
    currentPage: currentTitle === null ? null : page(currentTitle),
    newTitle,
    homepageLink: HOMEPAGE,
  });

describe("getPageEditDenial", () => {
  it("lets users edit ordinary pages and their own User pages", () => {
    expect(edit(user("bob"), "JavaScript", "JavaScript")).toBeNull();
    expect(edit(user("bob"), "JavaScript", "JavaScript (language)")).toBeNull();
    expect(edit(user("bob"), "User:bob/Diary", "User:bob/Diary 2")).toBeNull();
    expect(edit(user("bob"), null, "User:Bob/New post")).toBeNull();
  });

  it("stops users from moving someone else's User page out of their namespace", () => {
    expect(edit(user("bob"), "User:alice/Diary", "Hijacked")?.status).toBe(403);
    expect(edit(user("bob"), "User:alice", "Normal page")?.status).toBe(403);
  });

  it("stops users from creating pages in someone else's namespace, whatever the casing or spacing", () => {
    const titles = [
      "User:alice/Post",
      "USER:alice/Post",
      "user:Alice/Post",
      "  User:alice/Post",
    ];
    for (const title of titles) {
      expect([title, edit(user("bob"), null, title)?.status]).toEqual([
        title,
        403,
      ]);
    }
  });

  it("protects the homepage and Wiki: pages from non-editors, including renames", () => {
    expect(edit(user("bob"), "Welcome Page", "Something else")?.status).toBe(
      403,
    );
    expect(edit(user("bob"), "JavaScript", "Welcome Page")?.status).toBe(403);
    expect(edit(user("bob"), "Wiki:Rules", "Rules")?.status).toBe(403);
    expect(edit(user("bob"), null, "wiki:Rules")?.status).toBe(403);
    expect(edit(user("eve", "EDITOR"), "Wiki:Rules", "Rules")).toBeNull();
    expect(
      edit(user("eve", "EDITOR"), "Welcome Page", "Welcome Page"),
    ).toBeNull();
  });

  it("only lets admins touch other users' pages", () => {
    expect(
      edit(user("eve", "EDITOR"), "User:alice/Diary", "Moved")?.status,
    ).toBe(403);
    expect(edit(user("root", "ADMIN"), "User:alice/Diary", "Moved")).toBeNull();
  });

  it("never allows System: titles or editing media pages here", () => {
    const admin = user("root", "ADMIN");
    expect(edit(admin, null, "System:Dashboard")?.status).toBe(400);
    expect(edit(admin, "Media:logo.png", "Media:logo.png")?.status).toBe(403);
    expect(edit(admin, "JavaScript", "media:logo.png")?.status).toBe(403);
    expect(
      getPageEditDenial({
        editor: admin,
        currentPage: { ...page("Logo"), isMedia: true },
        newTitle: "Logo",
        homepageLink: HOMEPAGE,
      })?.status,
    ).toBe(403);
  });
});

describe("edit levels", () => {
  const account = (role: Editor["role"], ageDays = 365) => ({
    username: "someone",
    role,
    status: 0,
    createdAt: new Date(Date.now() - ageDays * 86_400_000),
  });

  it("enforces exactly what each level's label promises", () => {
    for (let level = 0; level <= 9; level++) {
      const label = getAccessEditLevelString(level);
      const allowed = (
        ["USER", "MODERATOR", "EDITOR", "ADMIN"] as const
      ).filter((role) => getEditLevelDenial(account(role), level) === null);
      const expected: Record<string, string[]> = {
        "Signed In Users": ["USER", "MODERATOR", "EDITOR", "ADMIN"],
        "Signed In Users after 14 days": [
          "USER",
          "MODERATOR",
          "EDITOR",
          "ADMIN",
        ],
        "Moderators and above": ["MODERATOR", "EDITOR", "ADMIN"],
        "Editors and above": ["EDITOR", "ADMIN"],
        "Admin Only": ["ADMIN"],
      };
      expect([level, label, allowed]).toEqual([level, label, expected[label]]);
    }
  });

  it("holds new accounts back from level 2 pages", () => {
    expect(getEditLevelDenial(account("USER", 3), 2)).toMatch(/14 days/);
    expect(getEditLevelDenial(account("USER", 30), 2)).toBeNull();
    expect(getEditLevelDenial(account("MODERATOR", 3), 2)).toBeNull();
  });
});

describe("trash permissions", () => {
  it("lets only editors see trashed pages", () => {
    const trashed = { deletedAt: new Date() };
    expect(canReadPage(null, trashed)).toBe(false);
    expect(canReadPage({ role: "USER" }, trashed)).toBe(false);
    expect(canReadPage({ role: "EDITOR" }, trashed)).toBe(true);
    expect(canReadPage(null, { deletedAt: null })).toBe(true);
  });

  it("lets users delete only their own posts, and never while banned", () => {
    const bob = { username: "bob", role: "USER" as const, status: 0 };
    expect(canDeletePage(bob, { title: "User:bob/Diary" })).toBe(true);
    expect(canDeletePage(bob, { title: "User:bob" })).toBe(false);
    expect(canDeletePage(bob, { title: "User:alice/Diary" })).toBe(false);
    expect(canDeletePage(bob, { title: "JavaScript" })).toBe(false);
    expect(
      canDeletePage({ ...bob, status: 1 }, { title: "User:bob/Diary" }),
    ).toBe(false);
    expect(
      canDeletePage({ ...bob, role: "EDITOR" }, { title: "JavaScript" }),
    ).toBe(true);
  });
});
