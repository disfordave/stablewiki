import { expect, test } from "vitest";
import { isUsersPage } from "@/utils";

test("identifies user pages correctly", () => {
  expect(isUsersPage("User:johndoe/New post", "johndoe", true)).toBe(true);
  expect(isUsersPage("User:janedoe/Another post", "johndoe", true)).toBe(false);
  expect(isUsersPage("User:johndoe", "johndoe", false)).toBe(true);
});

test("identifies non-user pages correctly", () => {
  expect(isUsersPage("Article:Some article", "johndoe", true)).toBe(false);
  expect(isUsersPage("User:johndoe/New post", "johndoe", false)).toBe(true);
});

test("handles edge cases", () => {
  expect(isUsersPage("User:johndoe/New post", "JOHNDOE", true)).toBe(true);
  expect(isUsersPage("User:johndoe/New post", "john_doe", true)).toBe(false);
  expect(isUsersPage("User:johndoe/New post", "johndoe", false)).toBe(true);
});
