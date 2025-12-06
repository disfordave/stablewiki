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

import { LoungePreviewComment } from "@/types";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export function LoungePreview({
  pageTitle,
  slug,
  comments = [],
}: {
  pageTitle: string;
  slug: string;
  comments?: LoungePreviewComment[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 overflow-auto rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
      <Link href={`/wiki/${slug}/_lounge`}>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 no-underline hover:underline">
          <div>
            <h2 className="font-bold">
              <ChatBubbleBottomCenterTextIcon className="me-1 mb-0.5 inline size-4" />
              <span>Latest on Lounge</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Join the conversation about the &apos;{pageTitle}&apos; article →
            </p>
          </div>
        </div>
      </Link>
      <ul className="flex flex-col gap-2">
        {comments.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-sm text-zinc-500 dark:bg-zinc-800">
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.slice(0, 2).map((comment: LoungePreviewComment) => (
          <li key={comment.id}>
            <Link href={`/wiki/${slug}/_lounge/${comment.id}`}>
              <div className="rounded-lg bg-white p-4 text-sm hover:underline dark:bg-zinc-800">
                {comment.deleted ? (
                  <p className="text-sm text-zinc-500">
                    Deleted Lounge by {comment.author?.username || "Unknown"}
                  </p>
                ) : (
                  <>
                    <p className="line-clamp-2 font-medium wrap-break-word">
                      {comment.title}
                    </p>
                    <p className="text-sm text-zinc-500">
                      By {comment.author?.username || "Unknown"} on{" "}
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
