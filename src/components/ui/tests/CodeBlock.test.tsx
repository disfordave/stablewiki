import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeBlock, resolveLanguage } from "../CodeBlock";

const render = (language: string, value: string) =>
  renderToStaticMarkup(<CodeBlock language={language} value={value} />);

describe("resolveLanguage", () => {
  it("reads the language off a fence class", () => {
    expect(resolveLanguage("language-ts")).toBe("ts");
    expect(resolveLanguage("language-C++")).toBe("c++");
  });

  it("ignores inline code and plain fences", () => {
    expect(resolveLanguage(undefined)).toBeUndefined();
    expect(resolveLanguage("some-other-class")).toBeUndefined();
  });
});

describe("CodeBlock", () => {
  it("marks up tokens for registered languages", () => {
    const html = render("ts", "const x: number = 1; // note");
    expect(html).toContain('class="token keyword"');
    expect(html).toContain('class="token comment"');
  });

  it("highlights through aliases", () => {
    const sample = 'x = "1"';
    const strip = (html: string) => html.replace(/language-[\w#+-]+/, "");
    const aliases = [
      ["js", "javascript"],
      ["ts", "typescript"],
      ["py", "python"],
      ["yml", "yaml"],
      ["sh", "bash"],
      ["zsh", "bash"],
      ["rs", "rust"],
      ["c++", "cpp"],
      ["dockerfile", "docker"],
    ];
    for (const [alias, canonical] of aliases) {
      expect([alias, strip(render(alias, sample))]).toEqual([
        alias,
        strip(render(canonical, sample)),
      ]);
    }
  });

  it("falls back to plain text for unknown languages", () => {
    const html = render("notalanguage", "hello world");
    expect(html).not.toContain('class="token');
    expect(html).toContain("hello world");
  });
});
