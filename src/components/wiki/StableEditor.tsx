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
  canDeletePage,
  getPageEditDenial,
  getPageModifyDenial,
} from "@/server/authz";
import { errorMessage } from "@/server/errors";
import { createPage, deletePage, editPage } from "@/server/pages";
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
  isSystemNewPage = false,
}: {
  page?: Page;
  slug: string;
  isSystemNewPage?: boolean;
}) {
  const user = await getUser();
  // The page's stored slug (the URL segment may be percent-encoded)
  const pageSlug = page?.slug[0];

  async function createPageAction(formData: FormData) {
    "use server";
    let createdSlug: string;
    try {
      const created = await createPage(await getUser(), {
        title: formData.get("title"),
        content: formData.get("content"),
        summary: formData.get("summary"),
      });
      createdSlug = created.slug;
    } catch (error) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${errorMessage(error, "Failed to create page")}`,
      );
    }
    safeRedirect(`/wiki/${createdSlug}`);
  }

  async function editPageAction(formData: FormData) {
    "use server";
    if (!pageSlug) {
      throw new Error("Page not found");
    }
    let newTitle: string;
    try {
      const revision = await editPage(await getUser(), pageSlug, {
        title: formData.get("title"),
        content: formData.get("content"),
        summary: formData.get("summary"),
      });
      newTitle = revision.title;
    } catch (error) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${errorMessage(error, "Failed to edit page")}`,
      );
    }
    safeRedirect(`/wiki/${slugify(newTitle)}`);
  }

  async function deletePageAction() {
    "use server";
    if (!pageSlug) {
      throw new Error("Page not found");
    }
    try {
      await deletePage(await getUser(), pageSlug);
    } catch (error) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${errorMessage(error, "Failed to delete page")}`,
      );
    }
    safeRedirect(`/`);
  }

  if (!user) {
    return <MustSignInMessage />;
  }

  // Same rules the services enforce, so the form only appears when saving works
  const denial = page
    ? getPageModifyDenial(user, {
        title: page.title,
        slug: page.slug[0],
        isMedia: page.title.startsWith("Media:"),
        accessLevel: page.accessLevel,
      })
    : user.status > 0
      ? "Your account has been banned"
      : isSystemNewPage
        ? null
        : (getPageEditDenial({
            editor: user,
            newTitle: decodeURIComponent(slug),
          })?.error ?? null);

  if (denial) {
    return <DisabledMessage message={denial} />;
  }

  if (!page?.id) {
    return (
      <form action={createPageAction} className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          defaultValue={isSystemNewPage ? "" : decodeURIComponent(slug)}
          placeholder="Edit title"
          className={`w-full rounded-full bg-zinc-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
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
        <form action={editPageAction} className="flex flex-col gap-3">
          <input
            type="text"
            name="title"
            defaultValue={page.title}
            placeholder="Edit title"
            className={`w-full rounded-full bg-zinc-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
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
        {canDeletePage(user, page) && (
          <details className="mt-3">
            <summary className="cursor-pointer font-semibold text-red-500">
              Delete this page
            </summary>
            <p className="mt-2 font-bold">
              The page moves to the trash with its full history, where editors
              can restore it.
            </p>
            <TransitionFormButton
              action={deletePageAction}
              className="mt-4 bg-red-500 text-white hover:bg-red-600"
            >
              <TrashIcon className="inline size-5" />
              Delete Page
            </TransitionFormButton>
          </details>
        )}
      </>
    );
  }
}
