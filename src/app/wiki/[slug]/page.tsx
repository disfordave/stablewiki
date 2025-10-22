import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import Link from "next/link";
import Markdown from "react-markdown";

function WikiMarkdown({ content }: { content: string }) {
  const processed = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, p1) => `[${p1}](/wiki/${encodeURIComponent(p1.trim())})`,
  );

  return <Markdown>{processed}</Markdown>;
}

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: Page | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
    );
    if (!res.ok) throw new Error("Failed to fetch page");

    page = (await res.json()).page;
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢</p>;
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
        <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
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
      <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 my-8 max-w-none">
        <WikiMarkdown content={page.content} />
      </div>
      {user && (
        <div className="flex gap-2">
          <div className="mt-4">
            <Link href={`/wiki/${page.slug}/edit`}>
              <button className="rounded bg-green-500 px-4 py-2 text-white">
                Edit Page
              </button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href={`/wiki/${page.slug}/history`}>
              <button className="rounded bg-blue-500 px-4 py-2 text-white">
                History
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
