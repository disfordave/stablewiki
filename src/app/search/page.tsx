import { TransitionLinkButton } from "@/components/ui";
import WikiList from "@/components/WikiList";
import type { Page } from "@/lib/types";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = (await searchParams).q;

  const results = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(
      query as string,
    )}`,
  );

  if (!results.ok) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Search Results for {query}</h1>
        <p>Failed to fetch search results.</p>
      </div>
    );
  }

  const data = await results.json();

  return (
    <div>
      <h1 className="text-2xl font-bold">Search Results for {query}</h1>
      {/* Placeholder for search results */}
      {data.length === 0 ? (
        <>
          <p>No results found.</p>
          <TransitionLinkButton
            href={`/wiki/${query}/edit`}
            className="mt-2 bg-green-500 text-white hover:bg-green-600"
          >
            <PencilSquareIcon className="inline size-5" />
            Create Page &quot;{query}&quot;
          </TransitionLinkButton>
          
        </>
      ) : (
        <WikiList pages={data as Page[]} />
      )}
    </div>
  );
}
