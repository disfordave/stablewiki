/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
  slug: string;
}) {
  const user = await getUser();

  async function createPage(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
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
        title,
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

    if (!page || !page.id || !page.slug) {
      throw new Error("Page not found");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${page.slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: page.title,
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

    if (!page || !page.id || !page.slug) {
      throw new Error("Page not found");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${page.slug}`,
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
        <input
          type="text"
          name="title"
          defaultValue={decodeURIComponent(slug)}
          placeholder="Edit title"
          className="mb-3 w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
          required
        />
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
