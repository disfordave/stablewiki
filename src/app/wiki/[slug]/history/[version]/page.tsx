import { MustSignInMessage, TransitionLinkButton } from "@/components/ui";
import StableMarkdown from "@/components/ui/StableMarkdown";
import { WIKI_NAME } from "@/config";
import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import { ArrowPathIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import Link from "next/link";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const user = await getUser();

  if (!user.username) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          History for: {decodeURIComponent(slug)} (ver. {version})
        </h1>
        <MustSignInMessage />
      </div>
    );
  }

  let page: Page | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}/${version}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch page");

    page = (await res.json()).page;
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢</p>;
  }

  if (!page) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          New Page: {decodeURIComponent(slug)}
        </h1>
        <p>This page does not exist yet. You can create it!</p>

        {user.username ? (
          <div>
            <Link href={`/wiki/${slug}/edit`}>
              <button className="rounded bg-blue-500 px-4 py-2 text-white">
                Create Page
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <MustSignInMessage />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        <Link href={`/wiki/${page.slug}/history/${version}`}>
          {page.title} (ver. {version})
        </Link>
      </h1>
      <p className="text-sm text-gray-500">
        Edited by {page.author.username} on{" "}
        {new Date(page.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
          timeZone: "UTC",
        })}
      </p>
      <StableMarkdown content={page.content} />
      <div className="flex gap-2 flex-wrap items-center">
        <TransitionLinkButton
          href={`/wiki/${page.slug}`}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <ArrowPathIcon className="inline size-5" />
          Latest Page
        </TransitionLinkButton>
        <TransitionLinkButton
          href={`/wiki/${page.slug}/history`}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowUturnLeftIcon className="inline size-5" />
          Back to History
        </TransitionLinkButton>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}): Promise<Metadata> {
  // read route params
  const { slug, version } = await params;

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
    title: `History: ${page.title} (ver. ${version}) | ${WIKI_NAME}`,
    description: `View the edit history for ${page.title}.`,
  };
}