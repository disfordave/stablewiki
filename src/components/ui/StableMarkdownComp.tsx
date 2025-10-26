/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function WikiMarkdown({ content }: { content: string }) {
  let processed = content;

  // ---- 1. Media embeds ----
  processed = processed.replace(/!\[\[([^[\]]+)\]\]/g, (_, fileName) => {
    const clean = fileName.trim();
    const encoded = encodeURIComponent(clean);
    return `![${clean}](/media/${encoded})`;
  });

  // ---- 2. Wiki links ----
  processed = processed.replace(
    /\[\[([^[\]|]+?)(?:\s*\|\|\s*([^[\]]+))?\]\]/g,
    (_, page, label) => {
      const pageName = page.trim();
      const linkLabel = label ? label.trim() : pageName;
      const slug = encodeURIComponent(pageName);

      // Normalize: always display as [[Page||Label]]
      // const normalized =
      //   label && label.trim() !== pageName
      //     ? `[[${pageName}||${linkLabel}]]`
      //     : `[[${pageName}]]`;

      // You can store `normalized` if you want to rewrite the file consistently
      return `[${linkLabel}](/wiki/${slug})`;
    },
  );

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a(props) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { children, className, node, href, ...rest } = props;
          // Https or http links
          const externalLink = /^https?:\/\//.test(href || "");
          // Embedded YouTube links like [youtube](/yt:VIDEO_ID)
          const embeddedYouTube = /^\/yt:(.+)/.test(href || "");
          if (externalLink) {
            return (
              <a
                {...rest}
                className={
                  className +
                  " not-prose cursor-pointer text-green-600 after:ml-0.5 after:content-['↗'] hover:underline dark:text-green-500"
                }
                target={externalLink ? "_blank" : undefined}
                rel={externalLink ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          } else if (embeddedYouTube) {
            const videoId = href?.substring(4).trim();
            return (
              <iframe
                className="my-4 h-80 w-full overflow-auto rounded-xl"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            );
          } else {
            return (
              <a
                {...rest}
                className={
                  className +
                  " not-prose cursor-pointer text-blue-600 hover:underline dark:text-blue-500"
                }
              >
                {children}
              </a>
            );
          }
        },
      }}
    >
      {processed}
    </Markdown>
  );
}

export default function StableMarkdownComp({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 prose-img:rounded-xl prose-blue prose-a:no-underline prose-a:hover:underline prose-blockquote:not-italic prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none prose-a:font-semibold my-8 max-w-none">
      <WikiMarkdown content={content} />
    </div>
  );
}
