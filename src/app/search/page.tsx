import { TransitionLinkButton } from "@/components/ui";
import WikiList from "@/components/WikiList";
import { WIKI_NAME } from "@/config";
import type { Page } from "@/lib/types";
import { PencilSquareIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = (await searchParams).q;

  const removeTrailingSpace = (str: string) => {
    return str.replace(/\s+$/, "");
  };

  const results = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(
      removeTrailingSpace(query as string),
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
        <>
          <TransitionLinkButton
            href={`/wiki/${query}`}
            className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <DocumentTextIcon className="inline size-5" />
            Go to &quot;{query}&quot;
          </TransitionLinkButton>
          <WikiList pages={data as Page[]} />
        </>
      )}
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  // read search params
  const { q } = await searchParams;

  return {
    title: `Search Results for "${q}" | ${WIKI_NAME}`,
    description: `Search results for "${q}".`,
  };
}
