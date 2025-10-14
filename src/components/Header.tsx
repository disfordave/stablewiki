import { getUser, signOutUser } from "@/lib/auth/functions";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/lib/config";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Header() {
  const user = await getUser();

    async function search(formData: FormData) {
      "use server"
      const query = formData.get("search")?.toString() || "";
      // Go to search page
      redirect(`/wiki/${encodeURIComponent(query)}`);
    }
  

  return (
    <>
      <header className="flex justify-between">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK}>{WIKI_NAME}</Link>
        </p>
        {user.username ? (
          <div className="flex gap-2 items-center">
            <p className="font-bold hover:underline"><Link href={`/dashboard`}>{user.username}</Link></p>
            <form action={signOutUser}>
              <button type="submit" className="cursor-pointer hover:underline">Sign Out</button>
            </form>
          </div>
        ) : (
          <Link className="hover:underline" href={"/signin"}>Sign In</Link>
        )}
      </header>
      <form action={search} className="flex gap-2 w-full my-2">
        <input type="text" name="search" className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full w-full" placeholder="Search..." />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full">Search</button>
      </form>
    </>
  );
}
