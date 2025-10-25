import { WIKI_HOMEPAGE_LINK } from "@/config";
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
  const showHistoryVersion = historyList && ver;
  const showHistoryList = historyList && !ver;

  if (!slug) {
    return redirect(WIKI_HOMEPAGE_LINK);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {slug.map((s) => decodeURIComponent(s)).join("/")}
        {showHistoryVersion && <>{` (ver. ${ver})`}</>}
      </h1>
      <p>Viewing page of the slug: {slug ? joinedSlug : "Homepage"}</p>
      {showEdit && <p>Editing mode enabled.</p>}
      {showHistoryList && (
        <p>
          Viewing history.{" "}
          <Link
            href={`/wiki/${joinedSlug}?action=history&ver=32`}
            className="text-blue-500"
          >
            View ver. 32
          </Link>
        </p>
      )}
      {showHistoryVersion && <p>Viewing version {ver} of the page.</p>}
      {!showEdit && !historyList && <p>Normal viewing mode.</p>}
    </div>
  );
}
