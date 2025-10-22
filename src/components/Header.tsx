import { getUser, signOutUser } from "@/lib/auth/functions";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Header() {
  const user = await getUser();

  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <header className="flex justify-between">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK}>{WIKI_NAME}</Link>
        </p>
        {user.username ? (
          <div className="flex items-center gap-2">
            <p className="font-bold hover:underline">
              <Link href={`/app/dashboard`}>{user.username}</Link>
            </p>
            <p className="hover:underline">
              <Link className="hover:underline" href={"/app/upload"}>
                Upload
              </Link>
            </p>
            <form action={signOutUser}>
              <button type="submit" className="cursor-pointer hover:underline">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link className="hover:underline" href={"/app/signin"}>
            Sign In
          </Link>
        )}
      </header>
      <form action={search} className="my-2 flex w-full gap-2">
        <input
          type="text"
          name="search"
          className="interactiveElement w-full bg-white dark:bg-gray-800"
          placeholder="Search..."
        />
        <button
          type="submit"
          className="interactiveElement bg-blue-500 text-white"
        >
          Search
        </button>
      </form>
    </>
  );
}
