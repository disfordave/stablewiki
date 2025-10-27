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

import {
  DocumentTextIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import {
  MustSignInMessage,
  TransitionFormButton,
  TransitionLinkButton,
} from "../ui";
import StableDiffViewer from "./DiffViewer";
import { getUser } from "@/lib";
import { redirect } from "next/navigation";

export default async function StableRevert({
  currentContent,
  newTargetContent,
  slug,
  targetVersion,
}: {
  currentContent: string;
  newTargetContent: string;
  slug: string;
  targetVersion: string;
}) {
  const user = await getUser();

  if (!user.username) {
    return <MustSignInMessage />;
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
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: decodeURIComponent(slug),
          content,
          author: user,
          summary: `Reverted to version ${targetVersion}`,
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
  return (
    <>
      <StableDiffViewer
        oldContent={currentContent}
        newContent={newTargetContent}
        newVer={Number(targetVersion)}
      />
      <form className="flex flex-col gap-4" action={editPage}>
        <input type="hidden" name="content" value={newTargetContent} />
        <div className="mt-4 animate-pulse font-bold">
          You&apos;re about to revert to version {targetVersion}.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TransitionLinkButton
            href={`/wiki/${slug}?action=history`}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <DocumentTextIcon className="inline size-5" />
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
