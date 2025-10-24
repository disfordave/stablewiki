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
  // Replace [[Page]] and [[Page || Label]] with proper Markdown links
  const processed = content.replace(
    /\[\[([^[\]|]+)(?:\s*\|\|\s*([^[\]]+))?\]\]/g,
    (match, page, label) => {
      const pageName = page.trim();
      const linkLabel = label ? label.trim() : pageName;
      const slug = encodeURIComponent(pageName);
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
}: {
  content: string;
  showRaw?: boolean;
  oldVersion?: boolean;
  slug: string;
}) {
  return (
    <>
      {showRaw ? (
        <div>
          <pre className="my-4 overflow-x-auto sm:rounded-xl bg-gray-100 p-4 sm:mx-0 -mx-4 break-words whitespace-pre-wrap dark:bg-gray-900">
            {content}
          </pre>
        </div>
      ) : (
        <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 my-8 max-w-none">
          <WikiMarkdown content={content} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {oldVersion ? (
          <TransitionLinkButton
            href={`/wiki/${slug}`}
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
          href={`?raw=${showRaw ? "false" : "true"}`}
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
