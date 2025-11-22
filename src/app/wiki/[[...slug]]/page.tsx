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

import { SystemPages } from "@/components/system";
import SystemLounge from "@/components/system/SystemLounge";
import {
  Breadcrumbs,
  LoungePreview,
  // LoungePreview,
  PageDate,
  RedirectedFromMessage,
  TransitionLinkButton,
} from "@/components/ui";
import { UserPostPage } from "@/components/user";
import PublicUserInfo from "@/components/user/PublicUserInfo";
import {
  DiffViewer,
  MarkdownPage,
  RevertPage,
  RevisionList,
  StableEditor,
} from "@/components/wiki";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import { Page, PageRevisionData } from "@/types";
import {
  handleHPage,
  slugify,
  getPageData,
  getLatestPageRevision,
  safeRedirect,
  getThemeColor,
  fetchComments,
  getAccessEditLevelString,
} from "@/utils";
import { ClockIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import Link from "next/link";

function Chip({ text }: { text: string }) {
  return (
    <p
      className={`me-2 mb-2 max-w-fit rounded-full px-3 py-1 text-sm font-medium ${getThemeColor.bg.base} inline-block text-white`}
    >
      {text}
    </p>
  );
}

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug: baseSlug } = await params;
  const {
    action,
    ver,
    redirectedFrom,
    preventRedirect,
    q,
    hPage,
    replyTo,
    targetLoungeCommentId,
    sortBy,
    username,
  } = await searchParams;
  // Determine if viewing lounge
  const loungeIndex = baseSlug?.findIndex(
    (p) => p === "_lounge" || p === encodeURIComponent("_lounge"),
  );
  // Extract the actual slug without lounge part
  const slug =
    loungeIndex !== undefined && loungeIndex !== -1
      ? baseSlug?.slice(0, loungeIndex)
      : baseSlug;

  const joinedSlug = slug ? slug.join("/") : "";

  const handledHPage = handleHPage(hPage);

  const showEdit = action === "edit";
  const revertAction = action === "revert";
  const diffAction = action === "diff";
  const historyList = action === "history";
  const showHistoryList = historyList && !ver;
  const showHistoryVersion = historyList && ver;
  const showRevert = revertAction && ver;
  const showDiff = diffAction && ver;

  const handledSortBy = sortBy === "likes" ? "likes" : "createdAt";

  // Determine if viewing lounge
  const isLoungeView =
    (baseSlug &&
      baseSlug.length > 0 &&
      baseSlug.includes(encodeURIComponent("_lounge"))) ??
    false;

  // Extract loungeId if present (take the last parts after _lounge)
  const loungeId =
    isLoungeView && baseSlug
      ? baseSlug
          .slice(baseSlug.indexOf(encodeURIComponent("_lounge")) + 1)
          .join("/")
      : null;

  // Redirect to homepage if no slug is provided
  if (!slug) {
    return safeRedirect(WIKI_HOMEPAGE_LINK);
  }

  // Handle special System: pages
  if (slug[0].startsWith(encodeURIComponent("System:"))) {
    return <SystemPages slug={slug} q={q} hPage={hPage} username={username} />;
  }

  const isUserPage =
    slug && slug.length > 0 && slug[0].startsWith(encodeURIComponent("User:"));

  const pageOwner =
    isUserPage && decodeURIComponent(slug[0]).split(":").length > 1
      ? decodeURIComponent(slug[0]).split(":")[1]
      : null;

  // Fetch the page data from the API
  let page: Page | null = null;
  const pageRevisions: PageRevisionData = { totalPages: 0, revisions: [] };
  try {
    const queryParams =
      showHistoryVersion || showRevert || showDiff
        ? `?action=history&ver=${ver}`
        : showHistoryList
          ? `?action=history&hPage=${handledHPage}`
          : "";

    const data = await getPageData(joinedSlug, queryParams);

    if (showHistoryList) {
      pageRevisions.revisions = data.page.revisions || [];
      pageRevisions.totalPages = data.page.totalPages || 0;
    } else {
      page = data.page;
    }
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢</p>;
  }

  if (page && page.isRedirect && !preventRedirect && !showEdit) {
    safeRedirect(
      `/wiki/${slugify(page.redirectTargetSlug || "")}?redirectedFrom=${page.title}`,
    );
  }

  // if (isUserPage && slug[1] === "post" && slug.length === 2) {
  //   return (
  //     <UserPostPage
  //       username={decodeURIComponent(slug[0]).split(":")[1]}
  //       hPage={hPage}
  //     />
  //   );
  // }

  const isUserPagePostPage = isUserPage && slug.length >= 2;
  const isMediaPage =
    (page && page.title.startsWith("Media:")) ||
    (pageRevisions.revisions.length > 0 &&
      pageRevisions.revisions[0].title.startsWith("Media:"));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-start">
        {isLoungeView && <Chip text="Lounge" />}
        {((page && isUserPagePostPage) ||
          (pageRevisions.revisions.length > 0 && isUserPagePostPage)) && (
          <Chip text="User Post" />
        )}
        {isMediaPage && <Chip text="Media" />}
      </div>
      <h1 className="text-3xl font-bold wrap-break-word">
        {showEdit ? (page && page.title ? "Edit: " : "Creating ") : ""}
        {showHistoryList ? "History of " : ""}
        {showRevert ? "Reverting " : ""}
        {showDiff ? "Differences of " : ""}
        {page ? (
          isUserPagePostPage ? (
            <Link
              href={`/wiki/${page.slug.join("/")}`}
              className="hover:underline"
              title="View Post"
            >
              {`${page.title.split("/")[1]} `}
            </Link>
          ) : (
            <Link
              href={`/wiki/${page.slug.join("/")}`}
              className="hover:underline"
              title={"View Page: " + page.title}
            >
              {page.title}
            </Link>
          )
        ) : pageRevisions.revisions.length > 0 ? (
          isUserPagePostPage ? (
            <>{`${pageRevisions.revisions[0].title.split("/")[1]} `}</>
          ) : (
            pageRevisions.revisions[0].title
          )
        ) : (
          "New Page"
        )}
        {showHistoryList && handledHPage && ` (Page ${handledHPage})`}
        {showHistoryVersion && <>{` (ver. ${ver})`}</>}
        {showRevert && <>{` to (ver. ${ver})`}</>}
      </h1>
      {showHistoryVersion && page && (
        <p className="my-2 text-gray-600">
          {`Page title was "${page.title}" at version ${ver}.`}
        </p>
      )}
      {showEdit && (
        <div className="mt-2">
          <StableEditor page={page ? page : undefined} slug={joinedSlug} />
        </div>
      )}
      {showHistoryList && (
        <div>
          <RevisionList
            data={pageRevisions}
            slug={joinedSlug}
            historyPage={Number(hPage ?? "1")}
          />
        </div>
      )}
      {showHistoryVersion &&
        (page ? (
          <div>
            <PageDate page={page} isOld={true} />
            <MarkdownPage oldVersion slug={joinedSlug} content={page.content} />
          </div>
        ) : (
          <p>Page not found.</p>
        ))}
      {showDiff && page && (
        <div>
          <PageDate page={page} isOld={true} />
          <DiffViewer
            oldContent={page.content}
            newContent={
              (
                await getPageData(
                  joinedSlug,
                  `?action=history&ver=${Number(ver) + 1}`,
                )
              ).page.content || page.content
            }
            oldVer={Number(ver)}
            newVer={
              (
                await getPageData(
                  joinedSlug,
                  `?action=history&ver=${Number(ver) + 1}`,
                )
              ).page.content
                ? Number(ver) + 1
                : "latest"
            }
          />
          <TransitionLinkButton
            href={`/wiki/${decodeURIComponent(joinedSlug)}?action=history`}
            className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          >
            <ClockIcon className="inline size-5" />
            History
          </TransitionLinkButton>
        </div>
      )}
      {showRevert && page && (
        <div>
          <PageDate page={page} isOld={false} />
          <RevertPage
            currentContent={
              (await getLatestPageRevision(joinedSlug)).page.content
            }
            newTargetContent={page.content}
            slug={slug.join("/")}
            targetVersion={ver as string}
            page={page}
          />
        </div>
      )}
      {!showEdit &&
        !historyList &&
        !showDiff &&
        !showRevert &&
        (page ? (
          <div>
            <PageDate page={page} isOld={false} />
            <Breadcrumbs
              slug={slug}
              titles={page.title.split("/")}
              isLoungeView={isLoungeView}
            />
            {redirectedFrom && <RedirectedFromMessage from={redirectedFrom} />}
            {isLoungeView ? (
              <>
                <SystemLounge
                  page={page}
                  commentId={loungeId}
                  replyTo={replyTo}
                  targetLoungeCommentId={targetLoungeCommentId}
                  hPage={hPage ? parseInt(hPage as string, 10) : 1}
                  sortBy={handledSortBy}
                />
              </>
            ) : (
              <>
                {isUserPage && (
                  <>{pageOwner && <PublicUserInfo username={pageOwner} />}</>
                )}
                {isMediaPage && (
                  <div className="mt-3 rounded-xl bg-gray-100 p-4 text-sm font-medium dark:bg-gray-900">
                    <p>
                      Media pages are used to store and display media files such
                      as images, videos, and audio. Media pages are not under
                      the same license as regular wiki pages. You can embed this
                      media file in other wiki pages using{" "}
                      <code className="select-all">
                        ![[{page.title.replace("Media:", "")}]]
                      </code>
                      .
                    </p>
                  </div>
                )}
                <MarkdownPage
                  slug={decodeURIComponent(slug.join("/"))}
                  content={page.content}
                />
                <div className="mt-4 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
                  <p className="text-xs">
                    Access/Edit Level of &apos;{page.title}&apos;{" "}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {getAccessEditLevelString(page.accessLevel, page.title)}
                  </p>
                </div>
                {!showHistoryVersion && (
                  <LoungePreview
                    pageTitle={page.title}
                    slug={page.slug.join("/")}
                    comments={page.comments}
                  />
                )}
              </>
            )}
            {/* <LoungePreview pageTitle={page.title} slug={page.slug.join("/")} /> */}
          </div>
        ) : (
          <div>
            <p className="mt-2">Page not found.</p>
            <TransitionLinkButton
              href={`/wiki/${decodeURIComponent(slug.join("/"))}?action=edit`}
              className="mt-3 bg-blue-500 text-white hover:bg-blue-600"
            >
              Go to Edit Page
            </TransitionLinkButton>
          </div>
        ))}
      {isUserPage &&
        slug.length === 1 &&
        !showHistoryList &&
        !showEdit &&
        !showDiff &&
        !showRevert &&
        !isLoungeView && (
          <div id="posts" className="mt-8">
            <div className="mb-4 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-900"></div>
            <UserPostPage
              username={decodeURIComponent(slug[0]).split(":")[1]}
              hPage={hPage}
            />
          </div>
        )}
      {isUserPage && (
        <p className="mt-4 rounded-xl bg-gray-100 p-4 text-sm font-medium dark:bg-gray-900">
          Text content on User: pages and its subpages is not licensed under the
          same terms as regular wiki pages. All rights reserved.
        </p>
      )}
      {/* {!showEdit &&
        !historyList &&
        !showDiff &&
        !showRevert &&
        !showHistoryVersion && (
          <div className="my-8 h-px w-full bg-gray-200 dark:bg-gray-700">
            Comments Section Coming Soon!
            <pre>{JSON.stringify(page?.comments, null, 2)}</pre>
          </div>
        )} */}
    </div>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug: baseSlug } = await params;
  const { action, ver, q } = await searchParams;

  const loungeIndex = baseSlug?.findIndex(
    (p) => p === "_lounge" || p === encodeURIComponent("_lounge"),
  );

  const isLoungeView =
    (baseSlug &&
      baseSlug.length > 0 &&
      baseSlug.includes(encodeURIComponent("_lounge"))) ??
    false;

  const slug =
    loungeIndex !== undefined && loungeIndex !== -1
      ? baseSlug?.slice(0, loungeIndex)
      : baseSlug;

  const joinedSlug = slug ? slug.join("/") : "";

  if (!slug) {
    return {
      title: WIKI_NAME,
      description: `Welcome to ${WIKI_NAME}, the collaborative wiki platform.`,
    };
  }

  const showEdit = action === "edit";
  const historyList = action === "history";
  const showHistoryList = historyList && !ver;
  const showHistoryVersion = historyList && ver;

  const loungeId =
    isLoungeView && baseSlug
      ? baseSlug
          .slice(baseSlug.indexOf(encodeURIComponent("_lounge")) + 1)
          .join("/")
      : null;

  try {
    const queryParams = showHistoryVersion
      ? `?action=history&ver=${ver}`
      : showHistoryList
        ? `?action=history`
        : "";

    const data = await getPageData(joinedSlug, queryParams);
    const page = showHistoryList ? data.page : data.page;
    const systemPage = slug[0].replace(encodeURIComponent("System:"), "");
    if (slug[0].startsWith(encodeURIComponent("System:"))) {
      switch (systemPage) {
        case "Search":
          return {
            title: `Search Results for "${
              q === undefined ? "" : q
            }" | ${WIKI_NAME}`,
            description: `Search results for "${q === undefined ? "" : q}" on ${WIKI_NAME}.`,
          };
        case "Dashboard":
          return {
            title: `Dashboard | ${WIKI_NAME}`,
            description: `User dashboard for ${WIKI_NAME}.`,
          };
        case "SignIn":
          return {
            title: `Sign In | ${WIKI_NAME}`,
            description: `Sign in to your account on ${WIKI_NAME}.`,
          };
        case "SignUp":
          return {
            title: `Sign Up | ${WIKI_NAME}`,
            description: `Create a new account on ${WIKI_NAME}.`,
          };
        case "Upload":
          return {
            title: `Upload Media | ${WIKI_NAME}`,
            description: `Upload media files to ${WIKI_NAME}.`,
          };
        case "CreatePage":
          return {
            title: `Create New Page | ${WIKI_NAME}`,
            description: `Create a new wiki page on ${WIKI_NAME}.`,
          };
        case "Revisions":
          return {
            title: `Revision History | ${WIKI_NAME}`,
            description: `View recent revisions on ${WIKI_NAME}.`,
          };
        case "Comments":
          return {
            title: `Comments System | ${WIKI_NAME}`,
            description: `View and manage comments on ${WIKI_NAME}.`,
          };
        default:
          return {
            title: `System Page: ${slug[0]} | ${WIKI_NAME}`,
            description: `System page titled "${slug[0]}".`,
          };
      }
    }
    const isUserPage =
      slug &&
      slug.length > 0 &&
      slug[0].startsWith(encodeURIComponent("User:"));
    const isUserPagePostPage = isUserPage && slug.length >= 2;
    if (showEdit) {
      if (page && page.title) {
        if (isUserPagePostPage) {
          return {
            title: `Edit Post: ${page.title.split("/")[1]} | ${WIKI_NAME}`,
            description: `Editing the user post titled "${page.title.split("/")[2]}".`,
          };
        }
        return {
          title: `Edit Page: ${page.title} | ${WIKI_NAME}`,
          description: `Editing the wiki page titled "${page.title}".`,
        };
      }
      return {
        title: `New Page | ${WIKI_NAME}`,
        description: `This page does not exist yet. Create the wiki page!`,
      };
    }

    if (!page) {
      return {
        title: `New Page | ${WIKI_NAME}`,
        description: `This page does not exist yet. Create the wiki page!`,
      };
    }

    if (showHistoryVersion) {
      return {
        title: `History of ${page.title} (ver. ${ver}) | ${WIKI_NAME}`,
        description: `Viewing version ${ver} of the wiki page titled "${page.title}".`,
      };
    }

    if (showHistoryList) {
      return {
        title: `History of ${page.title} | ${WIKI_NAME}`,
        description: `Viewing the revision history of the wiki page titled "${page.title}".`,
      };
    }

    if (isUserPagePostPage) {
      return {
        title: `${page.title.split("/")[1]} by ${page.author.username} | ${WIKI_NAME}`,
        description: `User post titled "${page.title.split("/")[2]}".`,
      };
    }

    if (isLoungeView) {
      const commentId = loungeId;

      if (commentId) {
        const comments = await fetchComments({
          pageId: page.id,
          commentId: commentId,
          hPage: 1,
          sortBy: "createdAt",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const comment = comments?.data.find((c: any) => c.id === commentId);
        return {
          title: `${comment ? comment.title : "Unknown"} on ${page.title} Lounge | ${WIKI_NAME}`,
          description: `Discussion lounge comment on the wiki page titled "${page.title}".`,
        };
      }

      return {
        title: `Lounge for ${page.title} | ${WIKI_NAME}`,
        description: `Discussion lounge for the wiki page titled "${page.title}".`,
      };
    }

    return {
      title: `${page.title} | ${WIKI_NAME}`,
      description: `Wiki page titled "${page.title}".`,
    };
  } catch (err) {
    console.error(err);
    return {
      title: `Error | ${WIKI_NAME}`,
      description: `Failed to load page.`,
    };
  }
}
