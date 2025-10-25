import StableMarkdown from "@/components/ui/StableMarkdown";
import { WIKI_HOMEPAGE_LINK } from "@/config";
import { Page } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { action, ver } = await searchParams;
  const joinedSlug = slug ? slug.join("/") : "";

  const showEdit = action === "edit";
  const historyList = action === "history";
  const showHistoryList = historyList && !ver;
  const showHistoryVersion = historyList && ver;

  if (!slug) {
    return redirect(WIKI_HOMEPAGE_LINK);
  }

  let page: Page | null = null;
  let errorMsg: string | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${joinedSlug}${showHistoryVersion ? `?action=history&ver=${ver}` : ""}`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) {
      errorMsg = res.statusText;
      throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    }

    page = (await res.json()).page;
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢 ({errorMsg})</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {slug.map((s) => decodeURIComponent(s)).join("/")}
        {showHistoryVersion && <>{` (ver. ${ver})`}</>}
      </h1>
      <p>Viewing page of the slug: {slug ? joinedSlug : "Homepage"}</p>
      {showEdit && <p>Editing page.</p>}
      {showHistoryList && (
        <p>
          Viewing history.{" "}
          <Link
            href={`/wiki/${joinedSlug}?action=history&ver=1`}
            className="text-blue-500"
          >
            View ver. 1
          </Link>
        </p>
      )}
      {showHistoryVersion &&
        (page ? (
          <div>
            <StableMarkdown slug={joinedSlug} content={page.content} />
          </div>
        ) : (
          <p>Page not found.</p>
        ))}
      {!showEdit &&
        !historyList &&
        (page ? (
          <div>
            <StableMarkdown slug={joinedSlug} content={page.content} />
          </div>
        ) : (
          <p>Page not found.</p>
        ))}
    </div>
  );
}
