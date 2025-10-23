import { getUser, signOutUser } from "@/lib/auth/functions";
import { WIKI_DISABLE_MEDIA, WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton, TransitionFormButton } from "@/components/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default async function Header() {
  const user = await getUser();

  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="p-4 rounded-2xl bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK} className="flex items-center gap-1">
            <Image
              src="/icon.svg"
              alt={`Logo of ${WIKI_NAME}`}
              width={24}
              height={24}
            />
            <span className="hover:text-violet-500 transition-colors duration-300">{WIKI_NAME}</span>
          </Link>
        </p>
        {user.username ? (
          <div className="flex items-center gap-2">
            <TransitionLinkButton
              href="/app/dashboard"
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              <UserCircleIcon className="inline size-5" />
              {user.username}
            </TransitionLinkButton>

            {WIKI_DISABLE_MEDIA ? null : (
              <TransitionLinkButton
                href="/app/upload"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Upload
              </TransitionLinkButton>
            )}
          </div>
        ) : (
          <TransitionLinkButton
            href="/app/signin"
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            <UserCircleIcon className="inline size-5" />
            Sign In
          </TransitionLinkButton>
        )}
      </div>
      <form action={search} className="flex w-full gap-2 mt-2 relative">
        <input
          type="text"
          name="search"
          className="w-full rounded-full bg-gray-100 px-4 py-1 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Search..."
          required
        />
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="bg-blue-500 text-white hover:bg-blue-600 absolute end-0"
        >
          <MagnifyingGlassIcon className="inline size-5" />
          Search
        </TransitionFormButton>
      </form>
      </header>
  );
}
