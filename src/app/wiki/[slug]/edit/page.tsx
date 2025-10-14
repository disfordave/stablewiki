import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WikiEditPage({
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

  async function createPage(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;

    if (!user) {
      throw new Error("User not found");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: slug,
        content,
        slug,
        author: user,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create page");
    }

    const data = await res.json();
    redirect(`/wiki/${data.slug}`);
  }

  async function editPage(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;

    if (!user) {
      throw new Error("User not found");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: slug,
          content,
          slug,
          author: user,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create page");
    }

    const data = await res.json();
    console.log("Edit response data:", data);
    redirect(`/wiki/${slug}`);
  }

  async function deletePage() {
    "use server";
    
    if (!user) {
      throw new Error("User not found");
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete page");
    }

    redirect(`/`);
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
            <p>Creating as {user.username}</p>
            <form action={createPage}>
              <textarea
                name="content"
                placeholder="Page content in Markdown"
                className="w-full h-[60vh] border border-gray-300 dark:border-gray-700 rounded p-2"
                required
              ></textarea>
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Create Page
              </button>
            </form>
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
      <h1 className="text-3xl font-bold">
        <Link href={`/wiki/${page.slug}`}>Edit Page: {page.title}</Link>
      </h1>
      <p className="text-sm text-gray-500">
        By {page.author.username} on{" "}
        {new Date(page.createdAt).toLocaleDateString()}
      </p>
      {user.username && (
        <div className="mt-4">
          <form action={editPage}>
            <textarea
              name="content"
              defaultValue={page.content}
              className="w-full h-[60vh] border border-gray-300 dark:border-gray-700 rounded p-2"
              required
            ></textarea>
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Save Changes
            </button>
          </form>
          <form action={deletePage}>
              <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                Delete Page
              </button>
            </form>
        </div>
      )}
      {!user.username && (
        <div className="mt-4">
          <p>You must be signed in to edit this page.</p>
          <Link href="/signin">Go to Sign In</Link>
        </div>
      )}
    </div>
  );
}
