import { RevisionList, StableEditor, SystemPages } from "@/components";
import {
  RedirectedFrom,
  StableDate,
  StableMarkdown,
  TransitionLinkButton,
} from "@/components/ui";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import { Page } from "@/types/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

// Shared function to fetch page data
async function getPageData(joinedSlug: string, queryParams: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${joinedSlug}${queryParams}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { action, ver, redirectedFrom, preventRedirect, q } =
    await searchParams;
  const joinedSlug = slug ? slug.join("/") : "";

  const showEdit = action === "edit";
  const historyList = action === "history";
  const showHistoryList = historyList && !ver;
  const showHistoryVersion = historyList && ver;

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
    const queryParams = showHistoryVersion
      ? `?action=history&ver=${ver}`
      : showHistoryList
        ? `?action=history`
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
        {slug.map((s) => decodeURIComponent(s)).join("/")}
        {showHistoryVersion && <>{` (ver. ${ver})`}</>}
      </h1>
      {showEdit && (
        <div className="mt-2">
          <StableEditor page={page ? page : undefined} slug={slug} />
        </div>
      )}
      {showHistoryList && (
        <div>
          <RevisionList revisions={pageRevisions} slug={joinedSlug} />
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
      {!showEdit &&
        !historyList &&
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
      if (slug[0] === "System_Search") {
        return {
          title: `Search Results for "${q}" | ${WIKI_NAME}`,
          description: `Search results for "${q}" on ${WIKI_NAME}.`,
        };
      }
      return {
        title: `System Page: ${slug[0]} | ${WIKI_NAME}`,
        description: `System page titled "${slug[0]}".`,
      };
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
