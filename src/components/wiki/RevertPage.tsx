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

import { ClockIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import {
  DisabledMessage,
  MustSignInMessage,
  TransitionFormButton,
  TransitionLinkButton,
} from "../ui";
import StableDiffViewer from "./DiffViewer";
import { getUser } from "@/lib";
import { getPageModifyDenial } from "@/server/authz";
import { errorMessage } from "@/server/errors";
import { editPage } from "@/server/pages";
import { safeRedirect, slugify } from "@/utils";
import { Page } from "@/types";

export default async function StableRevert({
  currentContent,
  newTargetContent,
  slug,
  targetVersion,
  page,
}: {
  currentContent: string;
  newTargetContent: string;
  slug: string;
  targetVersion: string;
  page: Page;
}) {
  const user = await getUser();

  if (!user) {
    return <MustSignInMessage />;
  }

  // The page's stored slug (the URL segment may be percent-encoded)
  const pageSlug = page.slug[0];
  const pageTitle = page.title;

  async function revertAction(formData: FormData) {
    "use server";
    let newTitle: string;
    try {
      const revision = await editPage(await getUser(), pageSlug, {
        title: pageTitle,
        content: formData.get("content"),
        summary: `Reverted to version ${targetVersion}`,
      });
      newTitle = revision.title;
    } catch (error) {
      safeRedirect(
        `/wiki/${slug}?action=edit&error=${errorMessage(error, "Failed to edit page")}`,
      );
    }
    safeRedirect(`/wiki/${slugify(newTitle)}`);
  }

  const denial = getPageModifyDenial(user, {
    title: page.title,
    slug: page.slug[0],
    isMedia: page.title.startsWith("Media:"),
    accessLevel: page.accessLevel,
  });
  if (denial) {
    return <DisabledMessage message={denial} />;
  }

  return (
    <>
      <StableDiffViewer
        oldContent={currentContent}
        newContent={newTargetContent}
        oldVer={"latest"}
        newVer={Number(targetVersion)}
      />
      <form className="flex flex-col gap-4" action={revertAction}>
        <input type="hidden" name="content" value={newTargetContent} />
        <div className="mt-4 animate-pulse font-bold">
          You&apos;re about to revert to version {targetVersion}. (Reverting
          will also change the title if it was changed in that version.)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TransitionLinkButton
            href={`/wiki/${decodeURIComponent(slug)}?action=history`}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <ClockIcon className="inline size-5" />
            History
          </TransitionLinkButton>
          <TransitionFormButton
            useButtonWithoutForm={true}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <ArrowUturnLeftIcon className="inline size-5" />
            Revert to ver. {targetVersion}
          </TransitionFormButton>
        </div>
      </form>
    </>
  );
}
