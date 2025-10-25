import { RevisionList, StableEditor } from "@/components";
import {
  RedirectedFrom,
  StableDate,
  StableMarkdown,
  TransitionLinkButton,
} from "@/components/ui";
import { WIKI_HOMEPAGE_LINK } from "@/config";
import { Page } from "@/types/types";
import { redirect } from "next/navigation";

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { action, ver, redirectedFrom, preventRedirect } = await searchParams;
  const joinedSlug = slug ? slug.join("/") : "";

  const showEdit = action === "edit";
  const historyList = action === "history";
  const showHistoryList = historyList && !ver;
  const showHistoryVersion = historyList && ver;

  if (!slug) {
    return redirect(WIKI_HOMEPAGE_LINK);
  }

  let page: Page | null = null;
  let pageRevisions: {
    id: string;
    version: number;
    content: string;
    createdAt: string;
    author: { id: string; username: string };
    summary: string;
  }[] = [];
  let errorMsg: string | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${joinedSlug}${showHistoryVersion ? `?action=history&ver=${ver}` : showHistoryList ? `?action=history` : ""}`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) {
      errorMsg = res.statusText;
      throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (showHistoryList) {
      pageRevisions = data.page.revisions || [];
    } else {
      page = data.page;
    }
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢 ({errorMsg})</p>;
  }

  if (page && page.isRedirect && !preventRedirect) {
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
