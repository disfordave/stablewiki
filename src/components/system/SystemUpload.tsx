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
import { WIKI_DISABLE_MEDIA, WIKI_NAME } from "@/config";
import {
  DisabledMessage,
  MustSignInMessage,
  TransitionFormButton,
} from "@/components/ui";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { safeRedirect } from "@/utils";

export const metadata = {
  title: "Upload Media | " + WIKI_NAME,
  description: "Upload media files to " + WIKI_NAME + ".",
};

export default async function StableUpload() {
  if (WIKI_DISABLE_MEDIA) {
    return <DisabledMessage message="Media uploads are disabled." />;
  }

  const user = await getUser();
  async function uploadMedia(formData: FormData) {
    "use server";

    if (!user) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const media = formData.get("media") as File;

    console.log({ title, media });

    if (!title || !media) {
      throw new Error("Missing fields");
    }

    formData.append("user", JSON.stringify(user));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/media`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Response not ok:", errorData);
      const errorMsg = errorData.error || "Failed to upload media";
      safeRedirect(`/wiki/System:Upload?error=${errorMsg}`);
    }

    const data = await response.json();
    console.log("Upload successful:", data);

    safeRedirect(`/wiki/${data.slug}`);
  }

  if (!user || !user.username) {
    return <MustSignInMessage />;
  }
  //   const error = searchParams.error as string | undefined;
  return (
    <div>
      <h1 className="text-3xl font-bold">Upload Media</h1>
      <form action={uploadMedia} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="mb-2 block font-medium">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title of image"
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">File</label>
          <input
            type="file"
            name="media"
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
            required
          />
        </div>
        <p>
          Allowed file types: PNG, JPG, JPEG, SVG, WEBP, GIF (max size: 1MB).
        </p>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <PhotoIcon className="inline size-5" />
          Upload Media
        </TransitionFormButton>
      </form>
      {/* {error && (
        <p className="mt-4 text-red-500">
          Error: Failed to upload media ({error})
        </p>
      )} */}
    </div>
  );
}
