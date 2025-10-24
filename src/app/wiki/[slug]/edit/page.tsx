import {
  TransitionFormButton,
  WikiEditor,
  MustSignInMessage,
} from "@/components/ui";
import { WIKI_NAME } from "@/config";
import { getUser } from "@/lib/auth/functions";
import { Page } from "@/lib/types";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    title: `Edit Page: ${page.title} | ${WIKI_NAME}`,
    description: `Edit the wiki page titled "${page.title}".`,
  };
}

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
            <p className="mb-2">
              Creating as <span className="font-bold">{user.username}</span>
            </p>
            <form action={createPage}>
              <WikiEditor />
              <TransitionFormButton
                useButtonWithoutForm={true}
                className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                <PencilSquareIcon className="inline size-5" />
                Create Page
              </TransitionFormButton>
            </form>
          </div>
        ) : (
          <MustSignInMessage />
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
        Last edited by {page.author.username} on{" "}
        {new Date(page.createdAt).toLocaleDateString()}
      </p>
      {user.username && (
        <div className="">
          <p className="mb-2">
            Editing as <span className="font-bold">{user.username}</span>
          </p>
          <form action={editPage}>
            <WikiEditor defaultValue={page.content} />
            <TransitionFormButton
              useButtonWithoutForm={true}
              className="mt-3 bg-green-500 text-white hover:bg-green-600"
            >
              <PencilSquareIcon className="inline size-5" />
              Save Changes
            </TransitionFormButton>
          </form>
          {user.role === "ADMIN" && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-red-500">
                Delete this page
              </summary>
              <p className="mt-2 animate-pulse font-bold">
                Warning: This action is irreversible. All page history will be
                lost.
              </p>
              <TransitionFormButton
                action={deletePage}
                className="mt-4 bg-red-500 text-white hover:bg-red-600"
              >
                <TrashIcon className="inline size-5" />
                Delete Page
              </TransitionFormButton>
            </details>
          )}
        </div>
      )}
      {!user.username && <MustSignInMessage />}
    </div>
  );
}
