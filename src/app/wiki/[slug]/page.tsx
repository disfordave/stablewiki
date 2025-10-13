import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import Link from "next/link";
import Markdown from "react-markdown";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: Page | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`
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
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Create Page
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <p>You must be signed in to create a new page.</p>
            <Link href="/signin">Go to Sign In</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{page.title}</h1>
      <p className="text-sm text-gray-500">
        By {page.author.username} on{" "}
        {new Date(page.createdAt).toLocaleDateString()}
      </p>
      <div className="mt-4">
        <Markdown>{page.content}</Markdown>
      </div>
      {
        user && (
          <div className="mt-4">
            <Link href={`/wiki/${page.slug}/edit`}>
              <button className="px-4 py-2 bg-green-500 text-white rounded">
                Edit Page
              </button>
            </Link>
          </div>
        )
      }
    </div>
  );
}
