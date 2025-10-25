import StableEditor from "@/components/StableEditor";
import { TransitionLinkButton } from "@/components/ui";
import StableMarkdown from "@/components/ui/StableMarkdown";
import { WIKI_HOMEPAGE_LINK } from "@/config";
import { Page } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

function StableDate({ page, isOld }: { page: Page; isOld: boolean }) {
  return (
    <p className="text-sm text-gray-500">
      {isOld ? "Edited by " : "Last edited by "}{" "}
      <span className="font-semibold">
        {page.author ? page.author.username : "Unknown"}
      </span>{" "}
      on{" "}
      <span className="font-semibold">
        {new Date(page.updatedAt).toLocaleDateString("en-GB", {
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
          <ul className="mt-4 flex flex-col gap-4">
            {pageRevisions.map(
              (rev: {
                id: string;
                version: number;
                content: string;
                createdAt: string;
                author: { id: string; username: string };
                summary: string;
              }) => (
                <li key={rev.id} className="rounded hover:underline">
                  <Link
                    href={`/wiki/${slug}?action=history&ver=${rev.version}`}
                  >
                    <h2 className="text-lg font-semibold">
                      Revision ID: {rev.version}
                    </h2>
                    <p className="border-s-4 border-gray-300 ps-2 dark:border-gray-700">
                      {rev.summary || "No summary provided."}
                    </p>
                    <p className="text-sm text-gray-500">
                      Edited by {rev.author.username} on{" "}
                      {new Date(rev.createdAt).toLocaleString()}
                    </p>
                  </Link>
                </li>
              ),
            )}
          </ul>
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
            {redirectedFrom && (
              <div className="mt-1 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
                <p className="">
                  You were redirected here from{" "}
                  <Link
                    href={`/wiki/${redirectedFrom}?preventRedirect=true`}
                    className="underline"
                  >
                    {Array.isArray(redirectedFrom)
                      ? redirectedFrom
                          .map((s) => decodeURIComponent(s))
                          .join("/")
                      : decodeURIComponent(redirectedFrom)}
                  </Link>
                  .
                </p>
              </div>
            )}
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
