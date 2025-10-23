import { TransitionFormButton } from "@/components/ui";
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

  async function createPage(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    const summary = formData.get("summary") as string;

    if (!user.username) {
      throw new Error("User not found");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        title: decodeURIComponent(slug),
        content,
        author: user,
        summary,
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
    const summary = formData.get("summary") as string;

    if (!user) {
      throw new Error("User not found");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: decodeURIComponent(slug),
          content,
          author: user,
          summary,
        }),
      },
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
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
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
                className="h-[60vh] w-full rounded border border-gray-300 p-2 dark:border-gray-700"
                required
              ></textarea>
              <input
                type="text"
                name="summary"
                placeholder="Edit summary (optional)"
                className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-700"
              />
              <TransitionFormButton
                useButtonWithoutForm={true}
                className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                Create Page
              </TransitionFormButton>
            </form>
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
              className="h-[60vh] w-full rounded border border-gray-300 p-2 dark:border-gray-700"
              required
            ></textarea>
            <input
              type="text"
              name="summary"
              placeholder="Edit summary (optional)"
              className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-700"
            />
            <TransitionFormButton
              useButtonWithoutForm={true}
              className="mt-2 bg-green-500 text-white hover:bg-green-600"
            >
              Save Changes
            </TransitionFormButton>
          </form>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-500">
              Delete this page
            </summary>
            <p className="mt-2">
              Warning: This action is irreversible. All page history will be
              lost.
            </p>
            <TransitionFormButton
              action={deletePage}
              className="mt-4 bg-red-500 text-white hover:bg-red-600"
            >
              Delete Page
            </TransitionFormButton>
          </details>
        </div>
      )}
      {!user.username && (
        <div className="mt-4">
          <p>You must be signed in to edit this page.</p>
          <Link href="/app/signin">Go to Sign In</Link>
        </div>
      )}
    </div>
  );
}
