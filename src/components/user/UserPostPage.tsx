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

import { TransitionFormButton } from "../ui";
import { Page } from "@/types";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import WikiList from "../WikiList";
import { getUser } from "@/lib";
import Pagination from "../ui/Pagination";
import { getThemeColor, safeRedirect } from "@/utils";

export default async function UserPostPage({
  username,
  hPage,
}: {
  username: string;
  hPage: string | string[] | undefined;
}) {
  const user = await getUser();
  const postOwner = username === user?.username;

  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    safeRedirect(`/wiki/User:${username}/${title}?action=edit`);
    // Handle post creation logic here
  }

  let results = null as Page[] | null;
  let totalPaginationPages = 0;
  try {
    const fetchResults = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?userPostByUsername=${username}&hPage=${hPage ? hPage : "1"}`,
    );

    if (!fetchResults.ok) {
      return (
        <div>
          <p>Failed to fetch search results.</p>
        </div>
      );
    }
    const data = await fetchResults.json();

    results = data.pages || [];
    totalPaginationPages = data.totalPaginationPages || 0;
  } catch {
    return (
      <div>
        <p>An error occurred while fetching search results.</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="mb-2 text-2xl font-bold">Posts by User:{username}</h3>
      {postOwner && (
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            type="text"
            name="title"
            placeholder="Create a title for your new post (You can edit it later)"
            className={`w-full rounded-full bg-zinc-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
          />
          <TransitionFormButton
            useButtonWithoutForm
            className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
          >
            <PencilSquareIcon className="inline size-5" />
            Create New Post
          </TransitionFormButton>
        </form>
      )}

      {results && <WikiList isPostList pages={results} />}
      <Pagination
        currentPage={hPage ? parseInt(hPage as string, 10) : 1}
        totalPages={totalPaginationPages}
        slug={`User:${username}/?hPage=`}
        trailingHash={"#posts"}
      />
      {/* <TransitionLinkButton
        href={`/wiki/User:${username}`}
        className="mt-4 bg-violet-500 text-white hover:bg-violet-600"
      >
        <UserIcon className="inline size-5" />
        Back to User Page
      </TransitionLinkButton> */}
    </>
  );
}
