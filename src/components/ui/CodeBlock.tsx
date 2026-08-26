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

// Imported from the deep path rather than the package index: the index also
// re-exports the full Prism and highlight.js builds, which would register
// every language on the shared refractor instance and bloat the bundle.
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
// Type-only, erased at runtime: it pulls in the ambient module declarations
// that @types/react-syntax-highlighter provides for the deep paths below.
import type {} from "react-syntax-highlighter";

import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import elixir from "react-syntax-highlighter/dist/esm/languages/prism/elixir";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import graphql from "react-syntax-highlighter/dist/esm/languages/prism/graphql";
import haskell from "react-syntax-highlighter/dist/esm/languages/prism/haskell";
import http from "react-syntax-highlighter/dist/esm/languages/prism/http";
import ini from "react-syntax-highlighter/dist/esm/languages/prism/ini";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import latex from "react-syntax-highlighter/dist/esm/languages/prism/latex";
import lua from "react-syntax-highlighter/dist/esm/languages/prism/lua";
import makefile from "react-syntax-highlighter/dist/esm/languages/prism/makefile";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import nginx from "react-syntax-highlighter/dist/esm/languages/prism/nginx";
import perl from "react-syntax-highlighter/dist/esm/languages/prism/perl";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import powershell from "react-syntax-highlighter/dist/esm/languages/prism/powershell";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import r from "react-syntax-highlighter/dist/esm/languages/prism/r";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import toml from "react-syntax-highlighter/dist/esm/languages/prism/toml";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

// Languages bundled for fenced code blocks. Prism pulls in its own
// dependencies (php -> markup-templating, tsx -> jsx + typescript, ...),
// so only the top-level languages need listing here.
const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  docker,
  elixir,
  go,
  graphql,
  haskell,
  http,
  ini,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  latex,
  lua,
  makefile,
  markdown,
  markup,
  nginx,
  perl,
  php,
  powershell,
  python,
  r,
  ruby,
  rust,
  scss,
  sql,
  swift,
  toml,
  tsx,
  typescript,
  yaml,
};

// Aliases Prism does not ship itself, matching what people actually type
// in a fence (```zsh, ```c++, ```make, ...). Prism's own aliases (sh, js, ts,
// py, yml, html, dockerfile, ...) are registered along with each language.
const ALIASES: Record<string, string[]> = {
  bash: ["zsh", "console", "shell-session"],
  cpp: ["c++"],
  csharp: ["c#"],
  ini: ["cfg", "conf", "editorconfig"],
  javascript: ["mjs", "cjs"],
  makefile: ["make"],
  powershell: ["ps1", "pwsh"],
  python: ["python3"],
  rust: ["rs"],
};

for (const [name, language] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, language);
}
for (const [name, aliases] of Object.entries(ALIASES)) {
  SyntaxHighlighter.alias(name, aliases);
}

/**
 * Pulls the language out of the class react-markdown puts on a fenced block
 * (`language-ts`), normalised to lowercase. Returns undefined for inline code
 * and for plain fences; an unknown language falls through to Prism, which
 * renders it as plain text.
 */
export function resolveLanguage(className?: string) {
  const match = /\blanguage-([\w#+-]+)/.exec(className || "");
  return match ? match[1].toLowerCase() : undefined;
}

export function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      // Token colours come from globals.css so light/dark follow the theme
      // class instead of being baked into inline styles at render time.
      useInlineStyles={false}
      PreTag="div"
      className="contents"
      codeTagProps={{ className: `language-${language}` }}
    >
      {value}
    </SyntaxHighlighter>
  );
}
