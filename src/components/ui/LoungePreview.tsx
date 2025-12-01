/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export function LoungePreview({
  pageTitle,
  slug,
  comments = [],
}: {
  pageTitle: string;
  slug: string;
  comments?: any[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 overflow-auto rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
      <Link href={`/wiki/${slug}/_lounge`}>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 no-underline hover:underline">
          <div>
            <h2 className="font-bold">
              <ChatBubbleBottomCenterTextIcon className="me-1 mb-[2px] inline size-5" />
              <span>Latest on Lounge</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Join the conversation about the &apos;{pageTitle}&apos; article →
            </p>
          </div>
          {/* <div
            className={`${getThemeColor.bg.base} ${getThemeColor.bg.groupHover} flex aspect-square w-full max-w-fit cursor-pointer items-center justify-between rounded-full p-2 text-white transition-colors duration-300`}
          >
            <ArrowRightIcon className="inline size-5" />
          </div> */}
        </div>
      </Link>
      <ul className="flex flex-col gap-2">
        {comments.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-sm text-zinc-500 dark:bg-zinc-800">
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.slice(0, 2).map((comment: any) => (
          <li key={comment.id}>
            <Link href={`/wiki/${slug}/_lounge/${comment.id}`}>
              <div className="rounded-lg bg-white p-4 text-sm hover:underline dark:bg-zinc-800">
                {comment.deleted ? (
                  <p className="text-sm text-zinc-500">
                    Deleted Lounge by {comment.author.username}
                  </p>
                ) : (
                  <>
                    <p className="line-clamp-2 font-medium break-words">
                      {comment.title}
                    </p>
                    <p className="text-sm text-zinc-500">
                      By {comment.author.username} on{" "}
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
