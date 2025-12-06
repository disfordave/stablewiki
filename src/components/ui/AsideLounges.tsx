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

import { LoungeComment } from "@/types";
import { slugify } from "@/utils";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export async function AsideLounges() {
  async function fetchComments() {
    // Placeholder for fetching comments logic
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge?action=comments&onlyRoot=true&hPage=1&noDeletedLounges=true`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch comments");
      return [];
    }
  }
  const comments = await fetchComments();

  return (
    <section className="rounded-2xl bg-white p-4 dark:bg-zinc-800">
      <div className="font-bold">
        <ChatBubbleBottomCenterTextIcon className="me-1 mb-[2px] inline size-5" />
        <span className="text-lg">Latest on Lounge</span>
      </div>
      <p className="text-xs text-zinc-500">
        on{" "}
        {new Date().toLocaleDateString("en-GB", {
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
      <ul className="mt-2 flex flex-col gap-2">
        {comments.data.slice(0, 5).map((c: LoungeComment) => (
          <li key={c.id}>
            <Link
              href={`/wiki/${slugify(c.page.title)}/_lounge/${c.id}`}
              className="hover:underline"
            >
              <div className="flex flex-col text-sm">
                {
                  <>
                    <p className="me-2 line-clamp-1 font-semibold">{c.title}</p>
                    <p className="line-clamp-1 text-xs text-zinc-500">
                      from <span className="font-medium">{c.page.title}</span>{" "}
                      by{" "}
                      <span className="font-medium">
                        {c.author?.username || "Unknown"}
                      </span>
                    </p>
                  </>
                }
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/wiki/System:Comments"
        className="mt-2 block text-sm hover:underline"
      >
        View all comments →
      </Link>
    </section>
  );
}
