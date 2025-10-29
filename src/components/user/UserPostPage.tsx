import { redirect } from "next/navigation";
import { Breadcrumbs, TransitionFormButton } from "../ui";
import { Page } from "@/types";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import WikiList from "../WikiList";

export default async function UserPostPage({ username }: { username: string }) {
  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    redirect(
      `/wiki/User:${username}/post/${encodeURIComponent(title)}?action=edit`,
    );
    // Handle post creation logic here
  }

  let results = null as Page[] | null;
  try {
    const fetchResults = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?userPostByUsername=${encodeURIComponent(username)}`,
    );

    if (!fetchResults.ok) {
      return (
        <div>
          <p>Failed to fetch search results.</p>
        </div>
      );
    }
    const data = await fetchResults.json();

    results = data || [];
  } catch {
    return (
      <div>
        <p>An error occurred while fetching search results.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold">Posts by User:{username}</h1>
      <Breadcrumbs
        slug={[`User:${username}`, "post"]}
        titles={[`User:${username}`, "post"]}
      />
      <form action={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Create a title for your new post (You can edit it later)"
          className="mt-2 w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
        />
        <TransitionFormButton
          useButtonWithoutForm
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <PencilSquareIcon className="inline size-5" />
          Create New Post
        </TransitionFormButton>
      </form>
      {results && <WikiList isPostList pages={results} />}
    </>
  );
}
