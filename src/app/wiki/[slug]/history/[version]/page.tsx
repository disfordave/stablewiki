import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import Link from "next/link";
import Markdown from "react-markdown";

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
        <p>You must be signed in to view this page.</p>
        <Link href="/app/signin">Go to Sign In</Link>
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
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Create Page
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <p>You must be signed in to create a new page.</p>
            <Link href="/app/signin">Go to Sign In</Link>
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
        By {page.author.username} on{" "}
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
      <div className="my-8 prose dark:prose-invert max-w-none prose-hr:mt-8 prose-hr:mb-8">
        <Markdown>{page.content}</Markdown>
      </div>
      {user && (
        <div className="flex gap-2">
          <div className="mt-4">
            <Link href={`/wiki/${page.slug}`}>
              <button className="px-4 py-2 bg-green-500 text-white rounded">
                Latest Page
              </button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href={`/wiki/${page.slug}/history`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Back to History
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
