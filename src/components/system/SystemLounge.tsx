import { getThemeColor, safeRedirect } from "@/utils";
import { TransitionLinkButton } from "../ui";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { Page } from "@/types";
import Pagination from "../ui/Pagination";
import { getUser } from "@/lib";

function BackToPageButton({ page }: { page: Page }) {
  return (
    <TransitionLinkButton
      href={`/wiki/${page.slug}`}
      className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-2 text-white`}
    >
      <DocumentTextIcon className="inline size-5" />
      Back to Page
    </TransitionLinkButton>
  );
}

export default async function SystemLounge({ page, commentId }: { page: Page, commentId: string | null }) {
  const user = await getUser();
  

  async function fetchComments() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/${page.id}/${commentId}`,
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  }

  const particularComment = await fetchComments();

  async function createComment(formData: FormData) {
    "use server";
    const { title, content } = Object.fromEntries(formData);

    if (!user) {
      throw new Error("User not found");
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge`,
      {
        method: "POST",
        body: JSON.stringify({ title, content, pageId: page.id }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    if (!response.ok) {
      safeRedirect(`/wiki/${page.slug}/_lounge?error=failed_to_create_post`);
    }
    // Optionally, you can handle success (e.g., redirect or show a message)
    const result = await response.json();
    console.log("Lounge post created:", result);
    safeRedirect(`/wiki/${page.slug}/_lounge/${result.id}`);
  }

  return (
    <div>
      <p className="mt-2">{`This is a placeholder for the System Page "Lounge for ${page.title}"`}</p>
      {/* {particularComment && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Comment Details</h3>
          <h4 className="mt-2 font-semibold">{particularComment.title}</h4>
          <p className="mt-2">{particularComment.content}</p>
        </div>
      )} */}

      <pre>
        {JSON.stringify(particularComment, null, 2)}
      </pre>
      {/* <Pagination currentPage={1} totalPages={1} slug={"/"} /> */}
      <BackToPageButton page={page} />
      <form action={createComment}>
        <input type="hidden" name="pageId" value={page.id} />
        <div className="mt-4">
          <label htmlFor="title" className="block font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mt-1 w-full rounded border-gray-300 shadow-sm"
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="content" className="block font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="mt-1 w-full rounded border-gray-300 shadow-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-4 rounded px-4 py-2 text-white`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
