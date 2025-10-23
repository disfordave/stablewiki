import { getUser } from "@/lib/auth/functions";
import { WIKI_DISABLE_MEDIA, WIKI_NAME } from "@/config";
import { redirect } from "next/navigation";
import {
  DisabledMessage,
  MustSignInMessage,
  TransitionFormButton,
} from "@/components/ui";
import { PhotoIcon } from "@heroicons/react/24/solid";

export const metadata = {
  title: "Upload Media | " + WIKI_NAME,
  description: "Upload media files to " + WIKI_NAME + ".",
};

export default async function UploadPage() {
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
      throw new Error(errorData.error || "Failed to upload media");
    }

    redirect(`/wiki/${encodeURIComponent("Media:" + title)}`);
  }

  if (!user.username) {
    return <MustSignInMessage />;
  }

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
            accept="image/*"
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
            required
          />
        </div>
        <p>Allowed file types: images (max size: 1MB).</p>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <PhotoIcon className="inline size-5" />
          Upload Media
        </TransitionFormButton>
      </form>
    </div>
  );
}
