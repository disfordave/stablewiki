import { describe, expect, it } from "vitest";
import { getPageEditDenial } from "@/utils/api/pagePermissions";

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
