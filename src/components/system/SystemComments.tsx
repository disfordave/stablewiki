/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { getThemeColor } from "@/utils";
import Link from "next/link";
import { MarkdownComp } from "../ui";
import Pagination from "../ui/Pagination";

export default async function SystemComments({
  hPage,
  username,
}: {
  hPage?: string | string[] | undefined;
  username?: string | string[] | undefined;
}) {
  async function fetchComments() {
    // Placeholder for fetching comments logic
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge${hPage ? `?hPage=${hPage}` : ""}${username ? `${hPage ? "&" : "?"}username=${username}` : ""}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch comments");
      return [];
    }
  }
  const comments = await fetchComments();

  if (comments && comments.length === 0) {
    return <div>No comments available.</div>;
  } else {
    return (
      <div>
        <h1 className="text-3xl font-bold">Comments History</h1>
        <p>
          The list below shows all latest comments
          {username ? (
            <>
              {" "}
              made by{" "}
              <Link
                href={`/wiki/User:${username}`}
                className="font-semibold hover:underline"
              >
                {username}
              </Link>
            </>
          ) : (
            ""
          )}
          .
        </p>
        {comments.data.map((comment: any) => (
          <div
            key={comment.id}
            id={comment.id}
            className={`mt-4 overflow-hidden rounded-xl border-2 ${!comment.rootCommentId ? getThemeColor.border.base : "border-gray-100 dark:border-gray-900"} shadow-xs`}
          >
            <Link
              href={`/wiki/${comment.page.slug}/_lounge/${comment.rootCommentId ? comment.rootCommentId : comment.id}`}
              className={`block w-full px-4 py-2 text-sm hover:underline`}
            >
              {comment.root ? (
                <>
                  <span className="font-semibold">
                    {comment.root.deleted ? "[Deleted]" : comment.root.title}
                  </span>{" "}
                  in <span className="font-semibold">{comment.page.title}</span>{" "}
                  <span className="font-normal text-gray-500">Lounge</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">{comment.page.title}</span>{" "}
                  <span className="font-normal text-gray-500">Lounge</span>
                </>
              )}{" "}
            </Link>

            <>
              <div
                className={`flex items-center justify-between gap-2 px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor.bg.base} text-white` : "bg-gray-100 dark:bg-gray-900"} text-sm`}
              >
                <div className="flex flex-col items-start">
                  <span>
                    <Link
                      className="font-semibold no-underline hover:underline"
                      href={`/wiki/User:${comment.author.username}`}
                    >
                      {comment.author.username}
                    </Link>
                    {` on ${new Date(comment.createdAt).toLocaleString()}`}
                  </span>
                  {comment.updatedAt &&
                    comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs opacity-75">
                        Edited on {new Date(comment.updatedAt).toLocaleString()}
                      </span>
                    )}
                </div>
              </div>
              {comment.deleted ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  [This {comment.rootCommentId ? "reply" : "lounge"} has been
                  deleted.]
                </div>
              ) : comment.isHidden ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  [This {comment.rootCommentId ? "reply" : "lounge"} is hidden.]
                </div>
              ) : (
                <div className="px-4 pt-0 pb-4">
                  {!comment.rootCommentId && (
                    <h4 className="mt-4 text-lg font-semibold">
                      {comment.title}
                    </h4>
                  )}
                  <MarkdownComp content={comment.content} isComment={true} />
                  <div
                    className={`mt-4 max-w-fit rounded-full bg-gray-100 px-2 py-1 shadow-xs dark:bg-gray-900`}
                  >
                    👍{" "}
                    <span className="tabular-nums">
                      {
                        comment.reactions.filter((r: any) => r.type === 1)
                          .length
                      }
                    </span>
                  </div>
                </div>
              )}
            </>
          </div>
        ))}
        <Pagination
          slug={`System:Comments?${username ? "username=" + username + "&" : ""}hPage=`}
          totalPages={comments.totalPaginationPages}
          currentPage={hPage ? parseInt(hPage as string, 10) : 1}
        />
      </div>
    );
  }
}
