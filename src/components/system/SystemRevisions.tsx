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
              className="flex flex-col items-start justify-between border-b border-zinc-300 pb-2 dark:border-zinc-700"
            >
              <Link
                className="hover:underline"
                href={`/wiki/${slugify(rev.title || rev.page?.title || "")}?action=history&ver=${rev.version}`}
              >
                <h2 className="font-bold">
                  {rev.title || rev.page?.title || "Untitled Page"}{" "}
                  <span className="text-zinc-500">(ver. {rev.version})</span>
                </h2>
                <p className="border-s-4 border-zinc-300 ps-2 text-sm dark:border-zinc-700">
                  {rev.summary && rev.summary.length > 0 ? (
                    <span className="font-medium">{rev.summary}</span>
                  ) : (
                    <span className="text-zinc-500 italic">
                      No summary provided.
                    </span>
                  )}
                </p>
              </Link>
              <p className="text-sm text-zinc-500">
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
                on{" "}
                {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                  timeZone: "UTC",
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/wiki/${slugify(rev.title || rev.page?.title || "")}?action=diff&ver=${rev.version}`}
                  className="inline-block text-sm text-blue-500 hover:underline"
                >
                  Differences
                </Link>
                <Link
                  href={`/wiki/${slugify(rev.title || rev.page?.title || "")}?action=revert&ver=${rev.version}`}
                  className="inline-block text-sm text-red-500 hover:underline"
                >
                  Revert to ver. {rev.version}
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
