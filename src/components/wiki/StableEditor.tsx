/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { getUser } from "@/lib";
import {
  DisabledMessage,
  MustSignInMessage,
  TransitionFormButton,
  WikiEditor,
} from "../ui";
import { Page } from "@/types";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { getThemeColor, safeRedirect, slugify } from "@/utils";

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

    if (!user) {
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
        summary,
      }),
    });

    if (!res.ok) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${"Failed to create page: " + (await res.json()).error}`,
      );
    }

    const data = await res.json();
    safeRedirect(`/wiki/${data.slug}`);
  }

  async function editPage(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
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
          title,
          content,
          author: user,
          summary,
        }),
      },
    );

    if (!res.ok) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${"Failed to edit page: " + (await res.json()).error}`,
      );
    }

    const data = await res.json();
    console.log("Edit response data:", data);
    safeRedirect(`/wiki/${slugify(title)}`);
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
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${"Failed to delete page: " + (await res.json()).error}`,
      );
    }

    safeRedirect(`/`);
  }

  if (!user) {
    return <MustSignInMessage />;
  }

  if (
    (decodeURIComponent(slug).startsWith("User:") ||
      decodeURIComponent(slug).startsWith("user:")) &&
    user.username !== decodeURIComponent(slug).split("/")[0].slice(5) &&
    user.role !== "ADMIN"
  ) {
    return (
      <>
        <DisabledMessage message="You cannot edit this page" />
      </>
    );
  }

  if (
    page &&
    (page.title.startsWith("User:") || page.title.startsWith("user:")) &&
    user.username !== page.title.split("/")[0].slice(5) &&
    user.role !== "ADMIN"
  ) {
    return (
      <>
        <DisabledMessage message="You cannot edit this page" />
      </>
    );
  }

  if (user.status > 0) {
    return <DisabledMessage message="Your account has been banned" />;
  }

  if (!page?.id) {
    return (
      <form action={createPage} className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          defaultValue={decodeURIComponent(slug)}
          placeholder="Edit title"
          className={`w-full rounded-full bg-gray-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
          required
        />
        <WikiEditor />
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <PencilSquareIcon className="inline size-5" />
          Create Page
        </TransitionFormButton>
      </form>
    );
  } else {
    return (
      <>
        <form action={editPage} className="flex flex-col gap-3">
          <input
            type="text"
            name="title"
            defaultValue={page.title}
            placeholder="Edit title"
            className={`w-full rounded-full bg-gray-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
            required
          />
          <WikiEditor defaultValue={page.content} />
          <TransitionFormButton
            useButtonWithoutForm={true}
            className="bg-green-500 text-white hover:bg-green-600"
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
