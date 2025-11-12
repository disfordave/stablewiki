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

import { TransitionLinkButton } from "@/components/ui";
import { WikiList } from "@/components";
import type { Page } from "@/types";
import { PencilSquareIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import Pagination from "../ui/Pagination";
import { safeRedirect } from "@/utils";

export default async function SystemSearch({
  query,
  hPage,
}: {
  query: string | string[] | undefined;
  hPage?: string | string[] | undefined;
}) {
  const removeTrailingSpace = (str: string) => {
    return str.replace(/\s+$/, "");
  };

  if (
    !query ||
    (Array.isArray(query) && query.length === 0) ||
    (typeof query === "string" && query.trim() === "")
  ) {
    return (
      <div>
        <p>No search query provided, Search Now!</p>
      </div>
    );
  }

  let results = null as Page[] | null;
  let totalPaginationPages = 0;
  try {
    const fetchResults = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(
        removeTrailingSpace(query as string),
      )}&hPage=${hPage ? encodeURIComponent(hPage as string) : "1"}`,
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

  if (
    results &&
    results.length > 0 &&
    results[0]?.title.toLowerCase() ===
      removeTrailingSpace(query as string).toLowerCase()
  ) {
    safeRedirect(`/wiki/${results[0].slug[0]}`);
  }

  return (
    <div className="mt-4">
      {/* Placeholder for search results */}
      {results && results.length === 0 ? (
        <>
          <p>No results found 😢</p>
          <TransitionLinkButton
            href={`/wiki/${query}?action=edit`}
            className="mt-2 bg-green-500 text-white hover:bg-green-600"
          >
            <PencilSquareIcon className="inline size-5" />
            Create Page &quot;{query}&quot;
          </TransitionLinkButton>
        </>
      ) : (
        <>
          <TransitionLinkButton
            href={`/wiki/${query}`}
            className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <DocumentTextIcon className="inline size-5" />
            Go to &quot;{query}&quot;
          </TransitionLinkButton>
          <WikiList pages={results as Page[]} />
        </>
      )}
      <Pagination
        currentPage={hPage ? parseInt(hPage as string, 10) : 1}
        totalPages={totalPaginationPages}
        slug={`System:Search?q=${query}&hPage=`}
      />
    </div>
  );
}
