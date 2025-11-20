import { PageRevisionData, Revision } from "@/types";
import Pagination from "../ui/Pagination";
import Link from "next/link";
import { slugify } from "@/utils";

export default async function SystemRevisions({
  hPage,
  username,
}: {
  hPage?: string | string[] | undefined;
  username?: string | string[] | undefined;
}) {
  async function fetchRevisions() {
    "use server";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?action=revisions&hPage=${hPage || "1"}&username=${username || ""}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch revisions");
      return [];
    }

    const data = await response.json();
    return data || [];
  }

  const revisionsData = (await fetchRevisions()) as PageRevisionData;

  return (
    <div>
      <h1 className="text-3xl font-bold">Revision History</h1>
      <p>
        The list below shows all latest revisions
        {username ? (
          <>
            {" "}
            made by{" "}
            <Link
              href={`/wiki/User:${username}`}
              className="font-semibold hover:underline"
            >
              {username}
            </Link>
          </>
        ) : (
          ""
        )}
        .
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {revisionsData.revisions.length > 0 ? (
          revisionsData.revisions.map((rev: Revision) => (
            <li
              key={rev.id}
              className="flex flex-col items-start justify-between border-b border-gray-300 pb-2 dark:border-gray-700"
            >
              <Link
                className="hover:underline"
                href={`/wiki/${slugify(rev.title || rev.page?.title || "")}?action=history&ver=${rev.version}`}
              >
                <h2 className="font-bold">
                  {rev.title || rev.page?.title || "Untitled Page"}{" "}
                  <span className="text-gray-500">(ver. {rev.version})</span>
                </h2>
                <p className="border-s-4 border-gray-300 ps-2 text-sm dark:border-gray-700">
                  {rev.summary && rev.summary.length > 0 ? (
                    <span className="font-medium">{rev.summary}</span>
                  ) : (
                    <span className="text-gray-500 italic">
                      No summary provided.
                    </span>
                  )}
                </p>
              </Link>
              <p className="text-sm text-gray-500">
                Edited by{" "}
                {rev.author?.username ? (
                  <>
                    <Link
                      href={`/wiki/User:${encodeURIComponent(rev.author.username)}`}
                      className="font-semibold hover:underline"
                    >
                      {rev.author.username}
                    </Link>
                  </>
                ) : (
                  <>Unknown (No User)</>
                )}{" "}
                on {new Date(rev.createdAt).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/wiki/${slugify(rev.title || rev.page?.title || "")}?action=diff&ver=${rev.version}`}
                  className="inline-block text-sm text-blue-500 hover:underline"
                >
                  Differences
                </Link>
              </div>
            </li>
          ))
        ) : (
          <div>
            <p>It&apos;s quiet here...</p>
          </div>
        )}
      </ul>
      {/* <pre>{JSON.stringify(revisionsData, null, 2)}</pre> */}
      <Pagination
        currentPage={hPage ? parseInt(hPage as string, 10) : 1}
        totalPages={revisionsData.totalPages || 1}
        slug={`System:Revisions?${username ? `username=${username}&` : ""}hPage=`}
      />
    </div>
  );
}
