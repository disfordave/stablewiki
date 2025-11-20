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

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/utils";
import rehypeSlug from "rehype-slug";
// import rehypeAutolinkHeadings from "rehype-autolink-headings";
import toc from "rehype-toc";
import Image from "next/image";

export function WikiMarkdown({
  content,
  isComment,
}: {
  content: string;
  isComment?: boolean;
}) {
  let processed = content;

  // ---- 1. Media embeds ----
  processed = processed.replace(/!\[\[([^[\]]+)\]\]/g, (_, fileName) => {
    const clean = fileName.trim();
    const encoded = encodeURIComponent(clean);
    return `[![${clean}](/api/media/${encoded})](/wiki/Media:${slugify(clean)})`;
  });

  // ---- 2. Wiki links ----
  processed = processed.replace(
    /\[\[(.+?)(?:\s*\|\|\s*(.+?))?\]\]/g,
    (_, page, label) => {
      const pageName = page.trim();
      const linkLabel = label ? label.trim() : pageName;
      const slug = pageName
        .split("/")
        .map((part: string) => slugify(part))
        .join("/");
      return `[${linkLabel}](/wiki/${slug})`;
    },
  );

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      // rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }], toc]}
      rehypePlugins={[rehypeSlug, toc]}
      components={{
        img(props) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { alt, className, node, src, height, width, ...rest } = props;
          return (
            <Image
              className={
                (className ? className + " " : "") +
                "my-[2em] w-full rounded-xl"
              }
              width={0}
              height={0}
              sizes="100vw"
              fetchPriority="high"
              loading="eager"
              src={
                typeof src === "string" ? src : "https://placehold.co/600x400"
              }
              alt={alt || ""}
              {...rest}
            />
          );
        },
        nav(props) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { children, className, node, ...rest } = props;
          if (className === "toc" && !isComment) {
            return (
              <details className="-mb-2 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
                <summary className="-m-4 p-4 font-bold select-none">
                  Contents
                </summary>
                <nav className={className + ""} {...rest}>
                  {children}
                </nav>
              </details>
            );
          }
          return (
            <nav className={className} {...rest}>
              {children}
            </nav>
          );
        },
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
                href={href}
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
                className={`my-4 h-80 w-full overflow-auto ${isComment ? "rounded-lg" : "rounded-xl"}`}
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
                href={href}
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

function MarkdownComp({
  content,
  isComment = false,
}: {
  content: string;
  isComment?: boolean;
}) {
  return (
    <div
      className={`prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 prose-blue prose-a:no-underline prose-a:hover:underline prose-blockquote:not-italic prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none prose-a:font-semibold my-8 mt-4 max-w-none ${isComment ? "prose-base mt-0 mb-0" : ""}`}
    >
      <WikiMarkdown content={content} isComment={isComment} />
    </div>
  );
}

export { MarkdownComp };
