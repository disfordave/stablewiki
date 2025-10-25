import StableMarkdownComp from "../ui/StableMarkdownComp";
import { TransitionLinkButton } from "../ui/TransitionButton";
import {
  ArrowPathIcon,
  PencilSquareIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

function StableMarkdown({
  content,
  oldVersion = false,
  slug = "",
  isRedirect = false,
}: {
  content: string;
  oldVersion?: boolean;
  slug: string;
  isRedirect?: boolean;
}) {
  return (
    <>
      <StableMarkdownComp content={content} />
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
            href={`/wiki/${slug}?action=edit`}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <PencilSquareIcon className="inline size-5" />
            Edit Page
          </TransitionLinkButton>
        )}

        <TransitionLinkButton
          href={`/wiki/${slug}?action=history`}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <DocumentTextIcon className="inline size-5" />
          History
        </TransitionLinkButton>
        <div className="flex-1"></div>
      </div>
    </>
  );
}

export { StableMarkdown };
