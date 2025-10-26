/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
  RevisionList,
  StableDiffViewer,
  StableEditor,
  SystemPages,
} from "@/components";
import StableRevert from "@/components/system/StableRevert";
import {
  RedirectedFrom,
  StableDate,
  StableMarkdown,
  TransitionLinkButton,
} from "@/components/ui";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import { Page } from "@/types/types";
import { getPageData, getLatestPageRevision } from "@/utils/api/getPages";
import { handleHPage } from "@/utils/api/pagination";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { action, ver, redirectedFrom, preventRedirect, q, hPage } =
    await searchParams;
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

  // Redirect to homepage if no slug is provided
  if (!slug) {
    return redirect(WIKI_HOMEPAGE_LINK);
  }

  // Handle special System_ pages
  if (slug[0].startsWith("System_")) {
    return <SystemPages slug={slug} q={q} />;
  }

  // Fetch the page data from the API
  let page: Page | null = null;
  let pageRevisions: {
    id: string;
    version: number;
    content: string;
    createdAt: string;
    author: { id: string; username: string };
    summary: string;
  }[] = [];
  try {
    const queryParams =
      showHistoryVersion || showRevert || showDiff
        ? `?action=history&ver=${ver}`
        : showHistoryList
          ? `?action=history&hPage=${handledHPage}`
          : "";

    const data = await getPageData(joinedSlug, queryParams);

    if (showHistoryList) {
      pageRevisions = data.page.revisions || [];
    } else {
      page = data.page;
    }
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢</p>;
  }

  if (page && page.isRedirect && !preventRedirect && !showEdit) {
    redirect(
      `/wiki/${page.redirectTargetSlug || ""}?redirectedFrom=${page.slug}`,
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {showEdit ? "Editing " : ""}
        {showHistoryList ? "History of " : ""}
        {showRevert ? "Reverting " : ""}
        {showDiff ? "Differences of " : ""}
        {slug.map((s) => decodeURIComponent(s)).join("/")}
        {showHistoryList && handledHPage && ` (Page ${handledHPage})`}
        {showHistoryVersion && <>{` (ver. ${ver})`}</>}
        {showRevert && <>{` to (ver. ${ver})`}</>}
        {showDiff && <>{` from (ver. ${ver})`}</>}
      </h1>
      {showEdit && (
        <div className="mt-2">
          <StableEditor page={page ? page : undefined} slug={joinedSlug} />
        </div>
      )}
      {showHistoryList && (
        <div>
          <RevisionList
            revisions={pageRevisions}
            slug={joinedSlug}
            historyPage={Number(hPage ?? "1")}
          />
        </div>
      )}
      {showHistoryVersion &&
        (page ? (
          <div>
            <StableDate page={page} isOld={true} />
            <StableMarkdown
              oldVersion
              slug={joinedSlug}
              content={page.content}
            />
          </div>
        ) : (
          <p>Page not found.</p>
        ))}
      {showDiff && page && (
        <div>
          <StableDate page={page} isOld={false} />
          <StableDiffViewer
            oldContent={page.content}
            newContent={(await getLatestPageRevision(joinedSlug)).page.content}
          />
          <TransitionLinkButton
            href={`/wiki/${slug}?action=history`}
            className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          >
            <DocumentTextIcon className="inline size-5" />
            History
          </TransitionLinkButton>
        </div>
      )}
      {showRevert && page && (
        <div>
          <StableDate page={page} isOld={false} />
          <StableRevert
            currentContent={
              (await getLatestPageRevision(joinedSlug)).page.content
            }
            newTargetContent={page.content}
            slug={slug.join("/")}
            targetVersion={ver as string}
          />
        </div>
      )}
      {!showEdit &&
        !historyList &&
        !showDiff &&
        !showRevert &&
        (page ? (
          <div>
            <StableDate page={page} isOld={false} />
            {redirectedFrom && <RedirectedFrom from={redirectedFrom} />}
            <StableMarkdown slug={joinedSlug} content={page.content} />
          </div>
        ) : (
          <div>
            <p>Page not found.</p>
            <TransitionLinkButton
              href={`/wiki/${slug.join("/")}?action=edit`}
              className="mt-3 bg-blue-500 text-white hover:bg-blue-600"
            >
              Go to Edit Page
            </TransitionLinkButton>
          </div>
        ))}
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
  const { slug } = await params;
  const { action, ver, q } = await searchParams;
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

  try {
    const queryParams = showHistoryVersion
      ? `?action=history&ver=${ver}`
      : showHistoryList
        ? `?action=history`
        : "";

    const data = await getPageData(joinedSlug, queryParams);
    const page = showHistoryList ? null : data.page;

    if (slug[0].startsWith("System_")) {
      switch (slug[0]) {
        case "System_Search":
          return {
            title: `Search Results for "${q}" | ${WIKI_NAME}`,
            description: `Search results for "${q}" on ${WIKI_NAME}.`,
          };
        case "System_Dashboard":
          return {
            title: `Dashboard | ${WIKI_NAME}`,
            description: `User dashboard for ${WIKI_NAME}.`,
          };
        case "System_SignIn":
          return {
            title: `Sign In | ${WIKI_NAME}`,
            description: `Sign in to your account on ${WIKI_NAME}.`,
          };
        case "System_SignUp":
          return {
            title: `Sign Up | ${WIKI_NAME}`,
            description: `Create a new account on ${WIKI_NAME}.`,
          };
        default:
          return {
            title: `System Page: ${slug[0]} | ${WIKI_NAME}`,
            description: `System page titled "${slug[0]}".`,
          };
      }
    }
    if (showEdit) {
      return {
        title: `Edit Page: ${decodeURIComponent(joinedSlug)} | ${WIKI_NAME}`,
        description: `Editing the wiki page titled "${decodeURIComponent(joinedSlug)}".`,
      };
    }

    if (!page) {
      return {
        title: `New Page: ${decodeURIComponent(joinedSlug)} | ${WIKI_NAME}`,
        description: `This page does not exist yet. Create the wiki page titled "${decodeURIComponent(joinedSlug)}".`,
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
