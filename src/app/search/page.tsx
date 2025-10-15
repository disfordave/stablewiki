import WikiList from "@/components/WikiList";
import type { Page } from "@/lib/types";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = (await searchParams).q;

  const results = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(
      query as string
    )}`
  );

  if (!results.ok) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Search Results for {query}</h1>
        <p>Failed to fetch search results.</p>
      </div>
    );
  }

  const data = await results.json();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Results for {query}</h1>
      {/* Placeholder for search results */}
      {data.length === 0 ? (
        <>
          <p>No results found.</p>
          <Link
            href={`/wiki/${query}/edit`}
            className="text-blue-500 hover:underline"
          >
            Create a new page
          </Link>
        </>
      ) : (
        <WikiList pages={data as Page[]} />
      )}
    </div>
  );
}
