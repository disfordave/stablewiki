import { getUser } from "@/lib/auth/functions";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const user = await getUser();
  async function uploadMedia(formData: FormData) {
    "use server";

    if (!user) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const media = formData.get("media") as File;

    console.log({ title, slug, media });

    if (!title || !slug || !media) {
      throw new Error("Missing fields");
    }

    formData.append("user", JSON.stringify(user));

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/media`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload media");
    }

    redirect(`/wiki/MEDIA_PAGE_${encodeURIComponent(title)}`);
  }

  if (!user.username) {
    redirect(`/signin?error=${encodeURIComponent("You must be signed in to upload media")}`);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Upload Media</h1>
      <form action={uploadMedia} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            name="title"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">File</label>
          <input
            type="file"
            name="media"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
