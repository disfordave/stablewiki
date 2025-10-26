import { getUser } from "@/lib/auth/functions";
import { redirect } from "next/navigation";
import { MustSignInMessage, TransitionFormButton, WikiEditor } from "../ui";
import { Page } from "@/types/types";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/solid";

export default async function StableEditor({
  page,
  slug,
}: {
  page?: Page;
  slug: string[];
}) {
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
        title: slug.map((part) => decodeURIComponent(part)).join("/"),
        content,
        author: user,
        summary,
      }),
    });

    if (!res.ok) {
      redirect(
        `/wiki/${slug}?action=edit&error=${encodeURIComponent("Failed to create page")}`,
      );
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
          title: slug.map((part) => decodeURIComponent(part)).join("/"),
          content,
          author: user,
          summary,
        }),
      },
    );

    if (!res.ok) {
      redirect(
        `/wiki/${slug}?action=edit&error=${encodeURIComponent("Failed to edit page")}`,
      );
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
      redirect(
        `/wiki/${slug}?action=edit&error=${encodeURIComponent("Failed to delete page")}`,
      );
    }

    redirect(`/`);
  }

  if (!user.username) {
    return <MustSignInMessage />;
  }

  if (!page?.id) {
    return (
      <form action={createPage}>
        <WikiEditor />
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="mt-3 bg-blue-500 text-white hover:bg-blue-600"
        >
          <PencilSquareIcon className="inline size-5" />
          Create Page
        </TransitionFormButton>
      </form>
    );
  } else {
    return (
      <>
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
        <details className="mt-3">
          <summary className="cursor-pointer font-semibold text-red-500">
            Delete this page
          </summary>
          <p className="mt-2 animate-pulse font-bold">
            Warning: This action is irreversible. All page history will be lost.
          </p>
          <TransitionFormButton
            action={deletePage}
            className="mt-4 bg-red-500 text-white hover:bg-red-600"
          >
            <TrashIcon className="inline size-5" />
            Delete Page
          </TransitionFormButton>
        </details>
      </>
    );
  }
}
