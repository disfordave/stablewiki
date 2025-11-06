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

import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { TransitionLinkButton } from "../ui";
import Pagination from "../ui/Pagination";
import { PageRevisionData } from "@/types";

export default function RevisionList({
  data,
  slug,
  historyPage,
}: {
  data: PageRevisionData;
  slug: string;
  historyPage: number;
}) {
  const decodedSlug = decodeURIComponent(slug);

  function isLatestRevision(revVersion: number): boolean {
    return data.revisions[0].version === revVersion && historyPage === 1;
  }
  return (
    <>
      <ul className="mt-4 flex flex-col gap-4">
        {data.revisions.length > 0 ? (
          data.revisions.map(
            (rev: {
              id: string;
              version: number;
              content: string;
              createdAt: string;
              author: { id: string; username: string };
              summary: string;
            }) => (
              <li
                key={rev.id}
                className="flex flex-col items-start justify-between border-b border-gray-300 pb-2 dark:border-gray-700"
              >
                <Link
                  className="hover:underline"
                  href={`/wiki/${decodedSlug}?action=history&ver=${rev.version}`}
                >
                  <h2 className="font-bold">
                    Revision ver. {rev.version}
                    {isLatestRevision(rev.version) && <span> (Latest)</span>}
                  </h2>
                  <p className="border-s-4 border-gray-300 ps-2 text-sm dark:border-gray-700">
                    {rev.summary.length > 0 ? (
                      <span className="font-medium">{rev.summary}</span>
                    ) : (
                      <span className="text-gray-500 italic">
                        No summary provided.
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Edited by {rev.author.username} on{" "}
                    {new Date(rev.createdAt).toLocaleString()}
                  </p>
                </Link>
                {!isLatestRevision(rev.version) && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/wiki/${decodedSlug}?action=diff&ver=${rev.version}`}
                      className="inline-block text-sm text-blue-500 hover:underline"
                    >
                      Differences
                    </Link>
                    <Link
                      href={`/wiki/${decodedSlug}?action=revert&ver=${rev.version}`}
                      className="inline-block text-sm text-red-500 hover:underline"
                    >
                      Revert to ver. {rev.version}
                    </Link>
                  </div>
                )}
              </li>
            ),
          )
        ) : (
          <div>
            <p>It&apos;s quiet here...</p>
          </div>
        )}
      </ul>
      <div>
        <TransitionLinkButton
          href={`/wiki/${decodedSlug}`}
          className="mt-4 w-fit bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowUturnLeftIcon className="inline size-5" />
          Back to Page
        </TransitionLinkButton>
        <Pagination
          currentPage={historyPage}
          totalPages={data.totalPages}
          slug={decodedSlug + "?action=history&hPage="}
        />
      </div>
    </>
  );
}
