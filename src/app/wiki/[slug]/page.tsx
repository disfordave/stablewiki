import { MustSignInMessage, TransitionLinkButton } from "@/components/ui";
import { WIKI_NAME } from "@/config";
import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";

function WikiMarkdown({ content }: { content: string }) {
  const processed = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, p1) => `[${p1}](/wiki/${encodeURIComponent(p1.trim())})`,
  );

  return <Markdown>{processed}</Markdown>;
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
      title: `New Page: ${decodeURIComponent(slug)} | ${WIKI_NAME}`,
      description: `This page does not exist yet. Create the wiki page titled "${decodeURIComponent(slug)}".`,
    };
  }

  return {
    title: page.title + " | " + WIKI_NAME,
    description: `Wiki page titled "${page.title}" last edited by ${page.author.username}.`,
  };
}

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: Page | null = null;
  let errorMsg: string | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
    );
    if (!res.ok) {
      errorMsg = res.statusText;
      throw new Error("Failed to fetch page");
    }

    page = (await res.json()).page;
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢 ({errorMsg})</p>;
  }
  const user = await getUser();

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
        <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
      </h1>
      <p className="text-sm text-gray-500">
        Last edited by {page.author.username} on{" "}
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
      <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 my-8 max-w-none">
        <WikiMarkdown content={page.content} />
      </div>
      {user && (
        <div className="flex gap-2 flex-wrap items-center">
          <div className="">
            <TransitionLinkButton
              href={`/wiki/${page.slug}/edit`}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <PencilSquareIcon className="inline size-5" />
              Edit Page
            </TransitionLinkButton>
          </div>
          <div className="">
            <TransitionLinkButton
              href={`/wiki/${page.slug}/history`}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <DocumentTextIcon className="inline size-5" />
              History
            </TransitionLinkButton>
          </div>
        </div>
      )}
    </div>
  );
}
