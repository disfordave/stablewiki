import { getUser } from "@/lib/auth/functions";
import Link from "next/link";

export default async function WikiHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getUser();

  if (!user.username) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          History for: {decodeURIComponent(slug)}
        </h1>
        <p>You must be signed in to view this page.</p>
        <Link href="/app/signin">Go to Sign In</Link>
      </div>
    );
  }

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}/history`,
    {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => data.page || []);

  const revisions = data.revisions || [];

  if (revisions.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          History for: {decodeURIComponent(slug)}
        </h1>
        <p>No data found for this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        History for: {decodeURIComponent(slug)}
      </h1>
      <ul className="mt-4 flex flex-col gap-4">
        {revisions.map(
          (rev: {
            id: string;
            version: number;
            content: string;
            createdAt: string;
            author: { id: string; username: string };
            summary: string;
          }) => (
            <li key={rev.id} className="rounded">
              <Link href={`/wiki/${slug}/history/${rev.version}`}>
                <h2 className="text-xl font-semibold">
                  Revision ID: {rev.version}
                </h2>
                <p className="text-sm text-gray-500">
                  By {rev.author.username} on{" "}
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
                <p>Summary: {rev.summary || "No summary provided."}</p>
              </Link>
            </li>
          ),
        )}
      </ul>
      <Link href={`/wiki/${slug}`}>
        <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
          Back to Page
        </button>
      </Link>
    </div>
  );
}
