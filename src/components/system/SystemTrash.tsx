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
import { canPurgePages, canRestorePages } from "@/server/authz";
import { errorMessage } from "@/server/errors";
import { listTrash, purgePage, restorePage } from "@/server/pages";
import { handleHPage, safeRedirect } from "@/utils";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import {
  DisabledMessage,
  MustSignInMessage,
  TransitionFormButton,
} from "../ui";
import Pagination from "../ui/Pagination";

export default async function SystemTrash({
  hPage,
}: {
  hPage?: string | string[] | undefined;
}) {
  const user = await getUser();

  if (!user) {
    return <MustSignInMessage />;
  }

  if (!canRestorePages(user)) {
    return (
      <DisabledMessage message="Only admins and editors can view the trash." />
    );
  }

  async function restoreAction(formData: FormData) {
    "use server";
    let restoredSlug: string;
    try {
      const restored = await restorePage(
        await getUser(),
        String(formData.get("pageId")),
      );
      restoredSlug = restored.slug;
    } catch (error) {
      safeRedirect(`/wiki/System:Trash?error=${errorMessage(error)}`);
    }
    safeRedirect(`/wiki/${restoredSlug}?success=${"Page restored"}`);
  }

  async function purgeAction(formData: FormData) {
    "use server";
    try {
      await purgePage(await getUser(), String(formData.get("pageId")));
    } catch (error) {
      safeRedirect(`/wiki/System:Trash?error=${errorMessage(error)}`);
    }
    safeRedirect(`/wiki/System:Trash?success=${"Page permanently deleted"}`);
  }

  const currentPage = handleHPage(hPage);
  const { pages, totalPages } = await listTrash(user, currentPage);

  return (
    <div>
      <h1 className="text-3xl font-bold">Trash</h1>
      <p>
        Deleted pages stay here with their full history until an admin deletes
        them permanently. Restoring brings a page back under its old title.
      </p>
      {pages.length === 0 ? (
        <p className="mt-4">The trash is empty.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {pages.map((page) => (
            <li
              key={page.id}
              className="flex flex-col items-start gap-2 border-b border-zinc-300 pb-4 dark:border-zinc-700"
            >
              <Link href={`/wiki/${page.slug}`} className="hover:underline">
                <h2 className="font-bold">{page.title}</h2>
              </Link>
              <p className="text-sm text-zinc-500">
                Deleted by{" "}
                <span className="font-semibold">
                  {page.deletedBy?.username ?? "Unknown"}
                </span>{" "}
                on{" "}
                {page.deletedAt?.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <form action={restoreAction}>
                  <input type="hidden" name="pageId" value={page.id} />
                  <TransitionFormButton
                    useButtonWithoutForm
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <ArrowUturnLeftIcon className="inline size-5" />
                    Restore
                  </TransitionFormButton>
                </form>
                {canPurgePages(user) && (
                  <form action={purgeAction}>
                    <input type="hidden" name="pageId" value={page.id} />
                    <TransitionFormButton
                      useButtonWithoutForm
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <TrashIcon className="inline size-5" />
                      Delete Forever
                    </TransitionFormButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        slug={`System:Trash?hPage=`}
      />
    </div>
  );
}
