import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TransitionLinkButton } from "./TransitionButton";
import {
  ArrowPathIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";

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

  return <Markdown remarkPlugins={[remarkGfm]}>{processed}</Markdown>;
}

export default function StableMarkdown({
  content,
  showRaw = false,
  oldVersion = false,
  slug = "",
  isRedirect = false,
}: {
  content: string;
  showRaw?: boolean;
  oldVersion?: boolean;
  slug: string;
  isRedirect?: boolean;
}) {
  return (
    <>
      {showRaw ? (
        <div>
          <pre className="-mx-4 my-4 overflow-x-auto bg-gray-100 p-4 break-words whitespace-pre-wrap sm:mx-0 sm:rounded-xl dark:bg-gray-900">
            {content}
          </pre>
        </div>
      ) : (
        <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 prose-img:rounded-xl my-8 max-w-none prose-blue prose-a:no-underline prose-a:hover:underline ">
          <WikiMarkdown content={content} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {oldVersion ? (
          <TransitionLinkButton
            href={`/wiki/${slug}${isRedirect ? "?preventRedirect=true" : ""}`}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <ArrowPathIcon className="inline size-5" />
            Latest Page
          </TransitionLinkButton>
        ) : (
          <TransitionLinkButton
            href={`/wiki/${slug}/edit`}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <PencilSquareIcon className="inline size-5" />
            Edit Page
          </TransitionLinkButton>
        )}

        <TransitionLinkButton
          href={`/wiki/${slug}/history`}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <DocumentTextIcon className="inline size-5" />
          History
        </TransitionLinkButton>
        <div className="flex-1"></div>
        <TransitionLinkButton
          href={`?raw=${showRaw ? "false" : "true"}${isRedirect ? "&preventRedirect=true" : ""}`}
          className="bg-gray-500 text-white hover:bg-gray-600"
        >
          {showRaw ? (
            <DocumentChartBarIcon className="inline size-5" />
          ) : (
            <CodeBracketIcon className="inline size-5" />
          )}
          {showRaw ? "View Rendered" : "View Raw Markdown"}
        </TransitionLinkButton>
      </div>
    </>
  );
}
