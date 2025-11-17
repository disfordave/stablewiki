/* eslint-disable @typescript-eslint/no-explicit-any */
import { getThemeColor, safeRedirect } from "@/utils";
import {
  MarkdownComp,
  TransitionFormButton,
  TransitionLinkButton,
} from "../ui";
import {
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { Page, User } from "@/types";
// import Pagination from "../ui/Pagination";
import { getUser } from "@/lib";
import Link from "next/link";
import Pagination from "../ui/Pagination";

function commentReactionButton({
  comment,
  user,
}: {
  comment: any;
  user: User | null;
}) {
  return (
    <TransitionFormButton
      action={async () => {
        "use server";
        const type = "1";

        if (!user) {
          safeRedirect("/wiki/System:SignIn");
        }

        if (
          comment.reactions.some(
            (r: any) => r.userId === user?.id && r.type === 1,
          )
        ) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/reactions`,
            {
              method: "DELETE",
              body: JSON.stringify({
                reactionId: comment.reactions.find(
                  (r: any) => r.userId === user?.id && r.type === 1,
                ).id,
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
              }?error=${await response.text()}`,
            );
          }
          // Optionally, you can handle success (e.g., redirect or show a message)
          safeRedirect(
            `/wiki/${comment.page.slug}/_lounge/${
              comment.rootCommentId ? comment.rootCommentId : comment.id
            }#${comment.id}`,
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
            }?error=${await response.text()}`,
          );
        }
        safeRedirect(
          `/wiki/${comment.page.slug}/_lounge/${
            comment.rootCommentId ? comment.rootCommentId : comment.id
          }#${comment.id}`,
        );
      }}
      className={`mt-4 shadow-xs ${
        comment.reactions.some(
          (r: any) => r.userId === user?.id && r.type === 1,
        )
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
      }`}
    >
      👍{" "}
      <span className="tabular-nums">
        {comment.reactions.filter((r: any) => r.type === 1).length}
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

function RootCommentForList({ comment, slug }: { comment: any; slug: string }) {
  return (
    <Link href={`/wiki/${slug}/_lounge/${comment.id}`} className="">
      <div
        className={`mt-4 scale-100 overflow-hidden rounded-xl border-2 transition-all hover:scale-[99%] ${!comment.rootCommentId ? `${getThemeColor.border.base}` : "border-gray-100 dark:border-gray-900"} shadow-xs`}
      >
        {comment.deleted ? (
          <div className="p-4 text-center text-sm text-gray-500">
            [This lounge has been deleted.]
          </div>
        ) : comment.isHidden ? (
          <div className="p-4 text-center text-sm text-gray-500">
            [This lounge is hidden.]
          </div>
        ) : (
          <>
            <div
              className={`px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor.bg.base} text-white` : "bg-gray-100 dark:bg-gray-900"} text-sm`}
            >
              <span className="font-semibold">{comment.author.username}</span>

              {` on ${new Date(comment.createdAt).toLocaleString()}`}
            </div>
            <div className="p-4">
              {!comment.rootCommentId && (
                <h4 className="line-clamp-2 text-lg font-semibold">
                  {comment.title}
                </h4>
              )}
              <p className="line-clamp-2">{comment.content}</p>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

function Comment({ comment, user, hPage }: { comment: any; user: User | null; hPage: number }) {
  // This is a root comment
  return (
    <div
      id={comment.id}
      className={`mt-4 overflow-hidden rounded-xl border-2 ${!comment.rootCommentId ? getThemeColor.border.base : "border-gray-100 dark:border-gray-900"} shadow-xs`}
    >
      {comment.deleted ? (
        <div className="p-4 text-center text-sm text-gray-500">
          [This {comment.rootCommentId ? "reply" : "lounge"} has been deleted.]
        </div>
      ) : comment.isHidden ? (
        <div className="p-4 text-center text-sm text-gray-500">
          [This {comment.rootCommentId ? "reply" : "lounge"} is hidden.]
        </div>
      ) : (
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
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="text-xs opacity-75">
                  Edited on {new Date(comment.updatedAt).toLocaleString()}
                </span>
              )}
            </div>

            <span className="flex gap-2">
              {user && comment.rootCommentId && (
                <Link
                  href={`?hPage=${hPage}&replyTo=${comment.id}#writer`}
                  className="hover:underline"
                >
                  Reply
                </Link>
              )}
              {user && comment.authorId === user.id && (
                <Link
                  href={`?hPage=${hPage}&targetLoungeCommentId=${comment.id}#writer`}
                  className="hover:underline"
                >
                  Edit
                </Link>
              )}
            </span>
          </div>
          <div className="px-4 pt-0 pb-4">
            {!comment.rootCommentId && (
              <h4 className="mt-4 text-lg font-semibold">{comment.title}</h4>
            )}
            {comment.parentId && comment.parentId !== comment.rootCommentId && (
              <p className="mt-4 mb-1 line-clamp-1 max-w-md">
                <Link
                  href={`#${comment.parentId}`}
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
            <div>{commentReactionButton({ comment, user })}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default async function SystemLounge({
  page,
  commentId,
  replyTo,
  targetLoungeCommentId,
  hPage,
}: {
  page: Page;
  commentId: string | null;
  replyTo: string | string[] | undefined;
  targetLoungeCommentId?: string | string[] | undefined;
  hPage: number;
}) {
  const user = await getUser();

  async function fetchComments() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/${page.id}/${commentId}?hPage=${hPage}`,
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  }

  const data = await fetchComments();
  const comments = data ? data.data : [];
  const totalPaginationPages = data ? data.totalPaginationPages : 0;

  async function createComment(formData: FormData) {
    "use server";
    const { title, content } = Object.fromEntries(formData);

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
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=${await response.text()}`,
      );
    }
    // Optionally, you can handle success (e.g., redirect or show a message)
    const result = await response.json();
    console.log("Lounge post created:", result);
    safeRedirect(
      `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}#${result.id}`,
    );
  }

  async function editComment(formData: FormData) {
    "use server";
    const { content, title } = Object.fromEntries(formData);

    if (!user) {
      safeRedirect("/login");
    }

    if (!targetLoungeCommentId || typeof targetLoungeCommentId !== "string") {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=Invalid targetLoungeCommentId`,
      );
    }

    if (
      user.id !==
      comments.find((c: any) => c.id === targetLoungeCommentId)?.authorId
    ) {
      safeRedirect(
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=Unauthorized to edit this comment`,
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
        `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?error=${await response.text()}`,
      );
    }
    // Optionally, you can handle success (e.g., redirect or show a message)
    const result = await response.json();
    console.log("Lounge post edited:", result);
    safeRedirect(
      `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}#${result.id}`,
    );
  }

  return (
    <div>
      {comments && comments.length > 0 && !comments[0].rootCommentId ? (
        <div className="mt-4">
          {comments.map((comment: any) => (
            <div key={comment.id}>
              {!commentId ? (
                <RootCommentForList
                  key={comment.id}
                  comment={comment}
                  slug={page.slug.join("/")}
                />
              ) : (
                <Comment key={comment.id} comment={comment} user={user} hPage={hPage} />
              )}
            </div>
          ))}
          <Pagination
            currentPage={hPage}
            totalPages={totalPaginationPages}
            slug={`/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}?hPage=`}
          />
        </div>
      ) : (
        <p className="mt-2">No Lounge threads found.</p>
      )}
      {user && (
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
                      : `"${comments.find((c: any) => c.id === targetLoungeCommentId)?.content}" by ${comments.find((c: any) => c.id === targetLoungeCommentId)?.author.username || "Unknown"}` ||
                        targetLoungeCommentId}
                  </p>
                  <Link
                    href={`?hPage=${hPage}#writer`}
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
                        className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
                        defaultValue={
                          comments.find(
                            (c: any) => c.id === targetLoungeCommentId,
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
                        : `"${comments.find((c: any) => c.id === replyTo)?.content}" by ${comments.find((c: any) => c.id === replyTo)?.author.username || "Unknown"}` ||
                          replyTo
                      : "(root comment)"}
                  </p>
                  {replyTo && replyTo !== commentId && (
                    <Link
                      href={`?hPage=${hPage}#writer`}
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
                className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
              className={`w-full rounded-xl bg-gray-100 p-4 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
              required
              defaultValue={
                targetLoungeCommentId
                  ? comments.find((c: any) => c.id === targetLoungeCommentId)
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
      {user && targetLoungeCommentId && (
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
              comments.find((c: any) => c.id === targetLoungeCommentId)
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
