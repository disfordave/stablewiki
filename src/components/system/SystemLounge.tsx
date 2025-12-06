/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) LoungeComment later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT LoungeComment WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { fetchComments, getThemeColor, safeRedirect } from "@/utils";
import {
  MarkdownComp,
  TransitionFormButton,
  TransitionLinkButton,
} from "../ui";
import {
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { LoungeComment, Page, User } from "@/types";
// import Pagination from "../ui/Pagination";
import { getUser } from "@/lib";
import Link from "next/link";
import Pagination from "../ui/Pagination";

function commentReactionButton({
  comment,
  user,
  hPage,
  sortBy,
  loungeDisabled,
}: {
  comment: LoungeComment;
  user: User | null;
  hPage: number;
  sortBy: "likes" | "createdAt";
  loungeDisabled: boolean;
}) {
  const isReacted = comment.reactions.some((r) => r.userId === user?.id);
  const isDisabled = !user || user.status > 0 || loungeDisabled;

  return (
    <TransitionFormButton
      action={async () => {
        "use server";
        const type = "1";

        if (loungeDisabled) {
          safeRedirect("/wiki/System:Lounge");
        }

        if (!user) {
          safeRedirect("/wiki/System:SignIn");
        }

        if (
          comment.reactions.some(
            (r) => r.userId === user?.id && r.type === 1,
          )
        ) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/reactions`,
            {
              method: "DELETE",
              body: JSON.stringify({
                reactionId: comment.reactions.find(
                  (r) => r.userId === user?.id && r.type === 1,
                )?.id || "",
              }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            },
          );

          if (!response.ok) {
            safeRedirect(
              `/wiki/${comment.page.slug}/_lounge/${
                comment.rootCommentId ? comment.rootCommentId : comment.id
              }?hPage=${hPage}&sortBy=${sortBy}&error=${await response.text()}`,
            );
          }
          // Optionally, you can handle success (e.g., redirect or show a message)
          safeRedirect(
            `/wiki/${comment.page.slug}/_lounge/${
              comment.rootCommentId ? comment.rootCommentId : comment.id
            }?hPage=${hPage}&sortBy=${sortBy}#${comment.id}`,
          );
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/reactions`,
          {
            method: "POST",
            body: JSON.stringify({
              commentId: comment.id,
              type,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          },
        );

        if (!response.ok) {
          safeRedirect(
            `/wiki/${comment.page.slug}/_lounge/${
              comment.rootCommentId ? comment.rootCommentId : comment.id
            }?hPage=${hPage}&sortBy=${sortBy}&error=${await response.text()}`,
          );
        }
        safeRedirect(
          `/wiki/${comment.page.slug}/_lounge/${
            comment.rootCommentId ? comment.rootCommentId : comment.id
          }?hPage=${hPage}&sortBy=${sortBy}#${comment.id}`,
        );
      }}
      className={`mt-4 shadow-xs ${
        isReacted
          ? isDisabled
            ? "bg-blue-500 text-white"
            : "bg-blue-500 text-white hover:bg-blue-600"
          : isDisabled
            ? "bg-zinc-100 dark:bg-zinc-900"
            : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-950"
      }`}
      disabled={isDisabled}
    >
      👍{" "}
      <span className="tabular-nums">
        {comment.reactions.filter((r) => r.type === 1).length}
      </span>
    </TransitionFormButton>
  );
}

function BackToPageButton({
  page,
  commentId,
}: {
  page: Page;
  commentId: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-start">
      {commentId && (
        <TransitionLinkButton
          href={`/wiki/${page.slug}/_lounge`}
          className={`${getThemeColor.bg.base} ${getThemeColor.bg.hover} me-2 mt-4 text-white`}
        >
          <ChatBubbleBottomCenterTextIcon className="inline size-5" />
          Back to Lounge
        </TransitionLinkButton>
      )}
      <TransitionLinkButton
        href={`/wiki/${page.slug}`}
        className={`${getThemeColor.bg.base} ${getThemeColor.bg.hover} mt-4 text-white`}
      >
        <DocumentTextIcon className="inline size-5" />
        Back to Page
      </TransitionLinkButton>
    </div>
  );
}

function RootCommentForList({
  comment,
  slug,
  user,
}: {
  comment: LoungeComment;
  slug: string;
  user: User | null;
}) {
  return (
    <Link href={`/wiki/${slug}/_lounge/${comment.id}`} className="">
      <div
        className={`mt-4 scale-100 overflow-hidden rounded-xl border-2 transition-all hover:scale-[99%] ${!comment.rootCommentId ? `${getThemeColor.border.base}` : "border-zinc-100 dark:border-zinc-900"} shadow-xs`}
      >
        <>
          <div
            className={`px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor.bg.base} text-white` : "bg-zinc-100 dark:bg-zinc-900"} text-sm`}
          >
            <span className="font-semibold">{comment.author.username}</span>

            {` on ${new Date(comment.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
              timeZone: "UTC",
            })}`}
          </div>
          {comment.deleted ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              [This lounge has been deleted.]
            </div>
          ) : comment.isHidden ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              [This lounge is hidden.]
            </div>
          ) : (
            <div className="p-4">
              {!comment.rootCommentId && (
                <h4 className="line-clamp-2 text-lg font-semibold">
                  {comment.title}
                </h4>
              )}
              <p className="line-clamp-2">{comment.content}</p>
              <div
                className={`mt-4 max-w-fit rounded-full px-2 py-1 shadow-xs ${
                  comment.reactions.some((r) => r.userId === user?.id)
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-900"
                }`}
              >
                👍{" "}
                <span className="tabular-nums">{comment.reactions.length}</span>
              </div>
            </div>
          )}
        </>
      </div>
    </Link>
  );
}

export function Comment({
  loungeDisabled,
  comment,
  user,
  hPage,
  sortBy,
}: {
  loungeDisabled: boolean;
  comment: LoungeComment;
  user: User | null;
  hPage: number;
  sortBy: "likes" | "createdAt";
}) {
  // This is a root comment
  return (
    <div
      id={comment.id}
      className={`mt-4 overflow-hidden rounded-xl border-2 ${!comment.rootCommentId ? getThemeColor.border.base : "border-zinc-100 dark:border-zinc-900"} shadow-xs`}
    >
      <>
        <div
          className={`flex items-center justify-between gap-2 px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor.bg.base} text-white` : "bg-zinc-100 dark:bg-zinc-900"} text-sm`}
        >
          <div className="flex flex-col items-start">
            <span>
              <Link
                className="font-semibold no-underline hover:underline"
                href={`/wiki/User:${comment.author.username}`}
              >
                {comment.author.username}
              </Link>
              {` on ${new Date(comment.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
                timeZone: "UTC",
              })}`}
              {comment.rootCommentId && ` (#${comment.index})`}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="text-xs opacity-75">
                Edited on{" "}
                {new Date(comment.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                  timeZone: "UTC",
                })}
              </span>
            )}
          </div>
          {!comment.deleted && (
            <span className="flex gap-2">
              {user &&
                user.status === 0 &&
                comment.rootCommentId &&
                !loungeDisabled && (
                  <Link
                    href={`?hPage=${hPage}&sortBy=${sortBy}&replyTo=${comment.id}#writer`}
                    className="hover:underline"
                  >
                    Reply
                  </Link>
                )}
              {user &&
                user.status === 0 &&
                comment.authorId === user.id &&
                !loungeDisabled && (
                  <Link
                    href={`?hPage=${hPage}&sortBy=${sortBy}&targetLoungeCommentId=${comment.id}#writer`}
                    className="hover:underline"
                  >
                    Edit
                  </Link>
                )}
            </span>
          )}
        </div>
        {comment.deleted ? (
          <div className="p-4 text-center text-sm text-zinc-500">
            [This {comment.rootCommentId ? "reply" : "lounge"} has been
            deleted.]
          </div>
        ) : comment.isHidden ? (
          <div className="p-4 text-center text-sm text-zinc-500">
            [This {comment.rootCommentId ? "reply" : "lounge"} is hidden.]
          </div>
        ) : (
          <div className="px-4 pt-0 pb-4">
            {!comment.rootCommentId && (
              <h4 className="mt-4 text-lg font-semibold">{comment.title}</h4>
            )}
            {comment.parentId && comment.parent && comment.parentId !== comment.rootCommentId && (
              <p className="mt-4 mb-1 line-clamp-1 max-w-md">
                <Link
                  href={`?hPage=${Math.ceil(comment.parent.index / 10)}&sortBy=${sortBy}#${comment.parent.id}`}
                  className="line-clamp-1 text-blue-500 no-underline hover:underline"
                >
                  {comment.parent.deleted
                    ? `Reply to @${comment.parent.author.username}: [Deleted]`
                    : `Reply to @${comment.parent.author.username}: 
              "${comment.parent.content}"`}
                </Link>
              </p>
            )}
            <MarkdownComp content={comment.content} isComment={true} />
            <div>
              {commentReactionButton({
                comment,
                user,
                hPage,
                sortBy,
                loungeDisabled,
              })}
            </div>
          </div>
        )}
      </>
    </div>
  );
}

export default async function SystemLounge({
  page,
  commentId,
  replyTo,
  targetLoungeCommentId,
  hPage,
  sortBy,
}: {
  page: Page;
  commentId: string | null;
  replyTo: string | string[] | undefined;
  targetLoungeCommentId?: string | string[] | undefined;
  hPage: number;
  sortBy: "likes" | "createdAt";
}) {
  const user = await getUser();

  const data = await fetchComments({
    pageId: page.id,
    commentId: commentId ? commentId : "",
    hPage,
    sortBy,
  });
  const comments = data ? data.data : [];
  const totalPaginationPages = data ? data.totalPaginationPages : 0;

  async function createComment(formData: FormData) {
    "use server";
    const { title, content } = Object.fromEntries(formData);

    if (page.loungeDisabled) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=Lounge is disabled for this page`,
      );
    }

    if (!user) {
      throw new Error("User not found");
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge`,
      {
        method: "POST",
        body: JSON.stringify({
          title: title || "No Title",
          content,
          pageId: page.id,
          rootCommentId: commentId,
          parentId: replyTo || commentId || null,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    if (!response.ok) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=${await response.text()}`,
      );
    }
    // Optionally, you can handle success (e.g., redirect or show a message)
    const result = await response.json();
    console.log("Lounge post created:", result);
    safeRedirect(
      `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${totalPaginationPages === 0 ? 1 : totalPaginationPages}&sortBy=${sortBy}#${result.id}`,
    );
  }

  async function editComment(formData: FormData) {
    "use server";
    const { content, title } = Object.fromEntries(formData);

    if (page.loungeDisabled) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=Lounge is disabled for this page`,
      );
    }

    if (!user) {
      safeRedirect("/login");
    }

    if (!targetLoungeCommentId || typeof targetLoungeCommentId !== "string") {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=Invalid targetLoungeCommentId`,
      );
    }

    if (
      user.id !==
      comments.find((c: LoungeComment) => c.id === targetLoungeCommentId)?.authorId
    ) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=Unauthorized to edit this comment`,
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge`,
      {
        method: "PUT",
        body: JSON.stringify({
          content,
          title: title || "No Title",
          id: targetLoungeCommentId,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );

    if (!response.ok) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${hPage}&sortBy=${sortBy}&error=${await response.text()}`,
      );
    }
    // Optionally, you can handle success (e.g., redirect or show a message)
    const result = await response.json();
    console.log("Lounge post edited:", result);
    safeRedirect(
      `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=${totalPaginationPages}&sortBy=${sortBy}#${result.id}`,
    );
  }

  return (
    <div>
      <div className="mt-1">
        <Link
          href={`?hPage=${hPage}&sortBy=createdAt`}
          className={`${sortBy === "createdAt" ? "underline" : "hover:underline"}`}
        >
          Sort by Date
        </Link>
        {" | "}
        <Link
          href={`?hPage=${hPage}&sortBy=likes`}
          className={`${sortBy === "likes" ? "underline" : "hover:underline"}`}
        >
          Sort by Likes
        </Link>
      </div>
      {comments && comments.length > 0 && !comments[0].rootCommentId ? (
        <div className="mt-4">
          {comments.map((comment: LoungeComment) => (
            <div key={comment.id}>
              {!commentId ? (
                <RootCommentForList
                  key={comment.id}
                  comment={comment}
                  slug={page.slug.join("/")}
                  user={user}
                />
              ) : (
                <>
                  <Comment
                    loungeDisabled={page.loungeDisabled}
                    key={comment.id}
                    comment={comment}
                    user={user}
                    hPage={hPage}
                    sortBy={sortBy}
                  />
                </>
              )}
            </div>
          ))}
          <Pagination
            currentPage={hPage}
            totalPages={totalPaginationPages}
            slug={`/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?sortBy=${sortBy}&hPage=`}
          />
        </div>
      ) : (
        <p className="mt-2">No Lounge threads found.</p>
      )}
      {user && user.status === 0 && !page.loungeDisabled && (
        <form
          action={targetLoungeCommentId ? editComment : createComment}
          id="writer"
        >
          {commentId ? (
            <div className="mt-4">
              {targetLoungeCommentId ? (
                <>
                  <p className="line-clamp-1">
                    Editing comment:{" "}
                    {targetLoungeCommentId === commentId
                      ? "(root comment)"
                      : `"${comments.find((c: LoungeComment) => c.id === targetLoungeCommentId)?.content}" by ${comments.find((c: LoungeComment) => c.id === targetLoungeCommentId)?.author.username || "Unknown"}` ||
                        targetLoungeCommentId}
                  </p>
                  <Link
                    href={`?hPage=${hPage}&sortBy=${sortBy}#writer`}
                    className="text-sm text-blue-500 no-underline hover:underline"
                  >
                    No Edit
                  </Link>
                  {targetLoungeCommentId === commentId && (
                    <div className="mt-4">
                      <label htmlFor="title" className="block font-medium">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                        defaultValue={
                          comments.find(
                            (c: LoungeComment) => c.id === targetLoungeCommentId,
                          )?.title
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="line-clamp-1">
                    Replying to:{" "}
                    {replyTo
                      ? replyTo === commentId
                        ? "(root comment)"
                        : `"${comments.find((c: LoungeComment) => c.id === replyTo)?.content}" by ${comments.find((c: LoungeComment) => c.id === replyTo)?.author.username || "Unknown"}` ||
                          replyTo
                      : "(root comment)"}
                  </p>
                  {replyTo && replyTo !== commentId && (
                    <Link
                      href={`?hPage=${hPage}&sortBy=${sortBy}#writer`}
                      className="text-sm text-blue-500 no-underline hover:underline"
                    >
                      No Re-reply
                    </Link>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <label htmlFor="title" className="block font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
              />
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="content" className="block font-medium">
              Comment
            </label>
            <textarea
              id="content"
              name="content"
              rows={5}
              className={`w-full rounded-xl bg-zinc-100 p-4 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
              required
              defaultValue={
                targetLoungeCommentId
                  ? comments.find((c: LoungeComment) => c.id === targetLoungeCommentId)
                      ?.content
                  : ""
              }
            ></textarea>
          </div>
          <TransitionFormButton
            useButtonWithoutForm={true}
            className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover} mt-2 w-full`}
          >
            Submit
          </TransitionFormButton>
        </form>
      )}
      {user && targetLoungeCommentId && user.status === 0 && (
        <button
          onClick={async () => {
            "use server";

            if (
              !targetLoungeCommentId ||
              typeof targetLoungeCommentId !== "string"
            ) {
              safeRedirect(
                `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=Invalid targetLoungeCommentId`,
              );
            }

            if (!user) {
              safeRedirect("/login");
            }

            if (
              user.id !==
              comments.find((c: LoungeComment) => c.id === targetLoungeCommentId)
                ?.authorId
            ) {
              safeRedirect(
                `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=Unauthorized to delete this comment`,
              );
            }

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge`,
              {
                method: "DELETE",
                body: JSON.stringify({ id: targetLoungeCommentId }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
              },
            );

            if (!response.ok) {
              safeRedirect(
                `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=${await response.text()}`,
              );
            }

            safeRedirect(
              `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}`,
            );
          }}
          className="mt-4 text-red-500 hover:underline"
        >
          Delete Comment
        </button>
      )}
      <BackToPageButton page={page} commentId={commentId} />
    </div>
  );
}
