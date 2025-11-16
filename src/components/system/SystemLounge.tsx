/* eslint-disable @typescript-eslint/no-explicit-any */
import { getThemeColor, safeRedirect } from "@/utils";
import { TransitionFormButton, TransitionLinkButton } from "../ui";
import {
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { Page } from "@/types";
// import Pagination from "../ui/Pagination";
import { getUser } from "@/lib";
import Link from "next/link";

function BackToPageButton({
  page,
  commentId,
}: {
  page: Page;
  commentId: string | null;
}) {
  return (
    <div className="flex items-center justify-start gap-2">
      {commentId && (
        <TransitionLinkButton
          href={`/wiki/${page.slug}/_lounge`}
          className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-4 text-white`}
        >
          <ChatBubbleBottomCenterTextIcon className="inline size-5" />
          Back to Lounge
        </TransitionLinkButton>
      )}
      <TransitionLinkButton
        href={`/wiki/${page.slug}`}
        className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-4 text-white`}
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
        className={`mt-4 scale-100 overflow-hidden rounded-xl border-2 transition-all hover:scale-[99%] ${!comment.rootCommentId ? `${getThemeColor().border.base}` : "border-gray-100 dark:border-gray-900"} shadow-xs`}
      >
        <div
          className={`px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor().bg.base} text-white` : "bg-gray-100 dark:bg-gray-900"} text-sm`}
        >
          {comment.author.username}

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
      </div>
    </Link>
  );
}

function Comment({ comment }: { comment: any }) {
  // This is a root comment
  return (
    <div
      id={comment.id}
      className={`mt-4 overflow-hidden rounded-xl border-2 ${!comment.rootCommentId ? getThemeColor().border.base : "border-gray-100 dark:border-gray-900"} shadow-xs`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 ${!comment.rootCommentId ? `${getThemeColor().bg.base} text-white` : "bg-gray-100 dark:bg-gray-900"} text-sm`}
      >
        <span>
          <Link
            className="no-underline hover:underline"
            href={`/wiki/User:${comment.author.username}`}
          >
            {comment.author.username}
          </Link>
          {` on ${new Date(comment.createdAt).toLocaleString()}`}
        </span>
        {comment.rootCommentId && (
          <Link href={`?replyTo=${comment.id}#writer`}>Reply</Link>
        )}
      </div>
      <div className="p-4">
        {!comment.rootCommentId && (
          <h4 className="text-lg font-semibold">{comment.title}</h4>
        )}
        {comment.parentId && comment.parentId !== comment.rootCommentId && (
          <Link
            href={`#${comment.parentId}`}
            className="line-clamp-1 inline-block text-sm text-blue-500 no-underline hover:underline"
          >
            Reply to @{comment.parent.author.username}: &quot;
            {comment.parent.content.slice(0, 30)}
            {comment.parent.content.length > 30 ? "..." : ""}&quot;
          </Link>
        )}
        <p>{comment.content}</p>
        <p className="text-xs opacity-50">ID: {comment.id}</p>
      </div>
    </div>
  );
}

export default async function SystemLounge({
  page,
  commentId,
  replyTo,
}: {
  page: Page;
  commentId: string | null;
  replyTo: string | string[] | undefined;
}) {
  const user = await getUser();

  async function fetchComments() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/${page.id}/${commentId}`,
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  }

  const comments = await fetchComments();

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
      `/wiki/${page.slug.join("/")}/_lounge/${commentId ? commentId : ""}`,
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
                <Comment key={comment.id} comment={comment} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2">No Lounge threads found.</p>
      )}
      {user && (
        <form action={createComment} id="writer">
          {commentId ? (
            <div className="mt-4">
              <p className="line-clamp-1">
                Replying to:{" "}
                {replyTo
                  ? replyTo === commentId
                    ? "(root comment)"
                    : `"${comments.find((c: any) => c.id === replyTo)?.content}" by ${comments.find((c: any) => c.id === replyTo)?.author.username || "Unknown"}` || replyTo
                  : "(root comment)"}
              </p>
              {replyTo && replyTo !== commentId && (
                <Link
                  href={`?replyTo=${commentId}#writer`}
                  className="text-sm text-blue-500 no-underline hover:underline"
                >
                  No Re-reply
                </Link>
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
                className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor().etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
              rows={3}
              className={`w-full rounded-xl bg-gray-100 p-4 focus:ring-2 ${getThemeColor().etc.focusRing} focus:outline-none dark:bg-gray-900`}
              required
            ></textarea>
          </div>
          <TransitionFormButton
            useButtonWithoutForm={true}
            className={`${getThemeColor().bg.base} text-white ${getThemeColor().bg.hover} mt-2 w-full`}
          >
            Submit
          </TransitionFormButton>
        </form>
      )}
      <BackToPageButton page={page} commentId={commentId} />
    </div>
  );
}
