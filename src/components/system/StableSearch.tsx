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

  if (results && results[0]?.title.toLowerCase() === query?.toString().toLowerCase()) {
    redirect(`/wiki/${results[0]?.title}`);
  }

  return (
    <div>
      {/* Placeholder for search results */}
      {results && results.length === 0 ? (
        <>
          <p>No results found.</p>
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
