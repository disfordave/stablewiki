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

import { TransitionLinkButton } from "@/components/ui";
import WikiList from "@/components/WikiList";
import type { Page } from "@/types/types";
import { PencilSquareIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { redirect } from "next/navigation";

export default async function StableSearch({
  query,
}: {
  query: string | string[] | undefined;
}) {
  const removeTrailingSpace = (str: string) => {
    return str.replace(/\s+$/, "");
  };

  let results = null as Page[] | null;

  try {
    const fetchResults = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(
        removeTrailingSpace(query as string),
      )}`,
    );

    if (!fetchResults.ok) {
      return (
        <div>
          <p>Failed to fetch search results.</p>
        </div>
      );
    }
    const data = await fetchResults.json();

    results = data || [];
  } catch {
    return (
      <div>
        <p>An error occurred while fetching search results.</p>
      </div>
    );
  }

  if (
    results &&
    results[0]?.title.toLowerCase() ===
      removeTrailingSpace(query as string).toLowerCase()
  ) {
    redirect(`/wiki/${results[0]?.title}`);
  }

  return (
    <div>
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
    </div>
  );
}
