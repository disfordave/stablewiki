import { MustSignInMessage, TransitionLinkButton } from "@/components/ui";
import { WIKI_NAME } from "@/config";
import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
        <MustSignInMessage />
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
  const page = data;

  if (page && page.slug !== slug) {
    redirect(`/wiki/${page.slug}/history/`);
  }

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
        href={`/wiki/${slug}${data.isRedirect ? "?preventRedirect=true" : ""}`}
        className="mt-4 w-fit bg-blue-500 text-white hover:bg-blue-600"
      >
        <ArrowUturnLeftIcon className="inline size-5" />
        Back to Page
      </TransitionLinkButton>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // read route params
  const { slug } = await params;

  // fetch data
  let page: Page | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch page");
    }

    page = (await res.json()).page;
  } catch (err) {
    console.error(err);
  }

  if (!page) {
    return {
      title: `History: New Page: ${decodeURIComponent(slug)} | ${WIKI_NAME}`,
      description: `This page does not exist yet. Create the wiki page titled "${decodeURIComponent(slug)}".`,
    };
  }

  return {
    title: `History: ${page.title} | ${WIKI_NAME}`,
    description: `Revision histories for wiki page titled "${page.title}".`,
  };
}
