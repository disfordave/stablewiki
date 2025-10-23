import { TransitionLinkButton } from "@/components/ui";
import { getUser } from "@/lib/auth/functions";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
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
        <TransitionLinkButton
          href="/app/signin"
          className="bg-violet-500 text-white hover:bg-violet-600"
        >
          <ArrowLeftEndOnRectangleIcon className="inline size-5" />
          Sign In
        </TransitionLinkButton>
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
            <li key={rev.id} className="rounded hover:underline">
              <Link href={`/wiki/${slug}/history/${rev.version}`}>
                <h2 className="text-lg font-semibold">
                  Revision ID: {rev.version}
                </h2>
                <p className="border-s-4 border-gray-300 ps-2 dark:border-gray-700">
                  {rev.summary || "No summary provided."}
                </p>
                <p className="text-sm text-gray-500">
                  Edited by {rev.author.username} on{" "}
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ),
        )}
      </ul>
      <TransitionLinkButton
        href={`/wiki/${slug}`}
        className="mt-4 w-fit bg-blue-500 text-white hover:bg-blue-600"
      >
        <ArrowUturnLeftIcon className="inline size-5" />
        Back to Page
      </TransitionLinkButton>
    </div>
  );
}
