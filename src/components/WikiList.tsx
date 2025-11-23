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

import { Page } from "@/types";

export default async function WikiList({
  pages,
  isPostList = false,
}: {
  pages: Page[] | undefined;
  isPostList?: boolean;
}) {
  let pagesList: Page[] = [];
  if (pages) {
    pagesList = pages;
  }

  if (pagesList.length === 0) {
    return <p className="mt-4">No pages found.</p>;
  }

  const isUserPostPage = (page: Page) => {
    return (
      page.title.startsWith("User:") &&
      page.title.split("/")[1] &&
      page.title.split("/")[1].length > 0
    );
  };

  return (
    <>
      <ul className="mt-4 flex flex-col gap-4">
        {pagesList.map((page) => (
          <li key={page.id}>
            <a href={`/wiki/${page.slug}`} className="">
              <div className="rounded-xl bg-gray-100 p-4 transition-colors duration-300 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-950">
                <h2
                  className={`line-clamp-3 text-lg font-semibold break-words ${page.isRedirect ? "text-gray-500" : ""}`}
                >
                  {isPostList ? (
                    `${page.title.split("/")[1]} `
                  ) : isUserPostPage(page) ? (
                    <>
                      <span className="text-gray-500">
                        ({page.title.split("/")[0]})
                      </span>
                      {` ${page.title.split("/")[1]}`}
                    </>
                  ) : (
                    page.title
                  )}{" "}
                  {page.isRedirect && <span className="">[Redirect]</span>}
                </h2>
                <p className="text-sm text-gray-500">
                  By {page.author ? page.author.username : "Unknown"} on{" "}
                  {new Date(page.createdAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
