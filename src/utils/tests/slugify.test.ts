import { expect, test } from "vitest";
import { slugify } from "@/utils";

test("slugifies a string", () => {
  expect(slugify("Hello World")).toBe("Hello_World");
  expect(slugify("This is a test")).toBe("This_is_a_test");
  expect(slugify("Special characters!")).toBe("Special_characters!");
  expect(slugify("Multiple   spaces")).toBe("Multiple_spaces");
});
